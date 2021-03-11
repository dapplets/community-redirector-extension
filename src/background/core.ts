import { browser } from "webextension-polyfill-ts";
import * as ethers from 'ethers';
import csvtojson from 'csvtojson';
import * as nearAPI from 'near-api-js';
import { CustomWalletConnection } from "../common/customWalletConnection";
import { PopupType, Redirection } from '../common/types';

enum LocalStorageKeys {
    DISABLED_URLS = 'disabled_urls'
};

export class Core {
    private _externalData: { notice: string, redirections: Redirection[] } = null;
    private _pendingTabs = {};

    constructor(
        private _config: {
            JSON_RPC_PROVIDER_URL: string,
            NETWORK: string,
            ENS_ADDRESS: string,
            NEAR_NETWORK_ID: string,
            NEAR_NODE_URL: string,
            NEAR_WALLET_URL: string,
            NEAR_HELPER_URL: string
        }
    ) { }

    public async checkTab(tabId: number, force: boolean = false) {
        const tab = await browser.tabs.get(tabId);
        const { url } = tab;

        if (this._pendingTabs[tabId] === url && force === false) return;
        this._pendingTabs[tabId] = url;

        try {
            if (!url) return;
            if (this._isDisabled(url)) return;

            const redirections = await this._getRedirections(url);

            if (redirections.length > 0) {
                const popup = await this._waitPopup();

                // close the popup when a user closed the tab
                const closedHandler = (_tabId) => {
                    if (_tabId !== tabId) return;
                    popup.close();
                    browser.tabs.onRemoved.removeListener(closedHandler);
                }
                browser.tabs.onRemoved.addListener(closedHandler);

                // close the popup when a user moved to another URL
                const updatedHandler = async (_tabId) => {
                    if (_tabId !== tabId) return;
                    const _tab = await browser.tabs.get(_tabId);
                    if (_tab.url !== url) {
                        popup.close();
                        browser.tabs.onUpdated.removeListener(updatedHandler);
                    }
                }
                browser.tabs.onUpdated.addListener(updatedHandler);

                await popup.wait();
                browser.tabs.onRemoved.removeListener(closedHandler);
                browser.tabs.onUpdated.removeListener(updatedHandler);
            }
        } catch (err) {
            console.error(err);
        }
    }

    public async getCurrentTabState() {
        const tabs = await browser.tabs.query({ active: true });
        const tab = tabs[0];
        const tabId = tab.id;
        const url = tab.url;

        const redirections = await this._getRedirections(url);
        const notice = await this._getExternalData().then(x => x.notice);
        const disabled = this._isDisabled(url);

        return {
            url,
            tabId,
            disabled,
            redirections,
            notice
        };
    }

    public disableRedirections(url: string) {
        const list = JSON.parse(localStorage[LocalStorageKeys.DISABLED_URLS] ?? '[]');
        if (!!list.find(x => x === url)) return;
        list.push(url);
        localStorage[LocalStorageKeys.DISABLED_URLS] = JSON.stringify(list);
    }

    public enableRedirections(url: string) {
        let list = JSON.parse(localStorage[LocalStorageKeys.DISABLED_URLS] ?? '[]');
        list = list.filter(x => x !== url);
        localStorage[LocalStorageKeys.DISABLED_URLS] = JSON.stringify(list);
    }

    public async redirect(tabId: number, urlTo: string) {
        return browser.tabs.update(tabId, { url: urlTo });
    }

    public async createRedirection(fromUrl: string, toUrl: string) {
        const near = await this._getNear();
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(fromUrl));
        const contract = near.contract as any;
        const redirections = await contract.get({ key: hash });

        if (!redirections.find(x => x === toUrl)) {
            await contract.add({ key: hash, path: toUrl });
        }
    }

    public async getRedirections(fromUrl: string) {
        const near = await this._getNear();
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(fromUrl));
        const contract = near.contract as any;
        const redirections = await contract.get({ key: hash });
        return redirections;
    }

    public async signIn() {
        return new Promise<void>(async (res, rej) => {
            const near = await this._getNear();
            await near.wallet.requestSignIn(
                CONTRACT_NAME, // This global variable is injected by webpack. More details in webpack.common.js file.
                'Community Redirector Extension',
                chrome.extension.getURL('pairing.html'),
                chrome.extension.getURL('pairing.html')
            );

            let isPairing = false;

            browser.tabs.onUpdated.addListener(async (tabId) => {
                const tab = await browser.tabs.get(tabId);
                const { url } = tab;
                if (url.indexOf(chrome.extension.getURL('pairing.html')) === 0) {
                    if (isPairing) return;

                    isPairing = true;

                    const urlObject = new URL(url);
                    const accountId = urlObject.searchParams.get('account_id');
                    const publicKey = urlObject.searchParams.get('public_key');
                    const allKeys = urlObject.searchParams.get('all_keys');

                    // TODO: Handle situation when access key is not added
                    if (accountId && publicKey) {
                        near.wallet.completeSignIn(accountId, publicKey, allKeys);
                        await new Promise((res, rej) => setTimeout(res, 1000));
                        await browser.tabs.remove(tabId);
                        res();
                    }

                    isPairing = false;
                }
            });
        });
    }

    public async signOut() {
        const near = await this._getNear();
        near.wallet.signOut();
    }

    public async getCurrentAccount() {
        const near = await this._getNear();
        return near.currentUser;
    }

    private async _getRedirections(url: string) {
        const externalData = await this._getExternalData();
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(url));
        const redirections = externalData.redirections.filter(x => x.from_hash === hash);
        return redirections;
    }

    private _isDisabled(url: string) {
        const list = JSON.parse(localStorage[LocalStorageKeys.DISABLED_URLS] ?? '[]');
        const isDisabled = !!list.find(x => x === url);
        return isDisabled;
    }

    private async _getExternalData() {
        if (!this._externalData) {

            const provider = new ethers.providers.JsonRpcProvider(this._config.JSON_RPC_PROVIDER_URL, this._config.NETWORK);
            const resolver = await provider.getResolver(this._config.ENS_ADDRESS);
            const notice = await resolver.getText('notice');
            const url = await resolver.getText('url');

            const response = await fetch(url, { cache: 'no-store' });
            const csv = await response.text();
            const json: Redirection[] = await csvtojson().fromString(csv);

            const data = {
                notice: notice,
                redirections: json
            };

            this._externalData = data;
        }

        return this._externalData;
    }

    private async _waitPopup() {
        const popupUrl = browser.extension.getURL('popup.html') + '?type=' + PopupType.WINDOW;

        const currentWindow = await browser.windows.getCurrent();

        const popupWindow = await browser.windows.create({
            url: popupUrl,
            height: 350,
            width: 400,
            focused: true,
            type: 'popup',
            left: currentWindow.left + currentWindow.width / 2 - 200,
            top: currentWindow.top + 75
        });

        const waitingPromise = new Promise<void>((res, rej) => {
            const removingHandler = (windowId: number) => {
                if (popupWindow.id === windowId) {
                    res();
                    browser.windows.onRemoved.removeListener(removingHandler);
                }
            };

            browser.windows.onRemoved.addListener(removingHandler);
        });

        return {
            wait: () => waitingPromise,
            close: () => browser.windows.remove(popupWindow.id)
        }
    }

    private async _getNear() {
        const near = await nearAPI.connect({
            networkId: this._config.NEAR_NETWORK_ID,
            nodeUrl: this._config.NEAR_NODE_URL,
            walletUrl: this._config.NEAR_WALLET_URL,
            helperUrl: this._config.NEAR_HELPER_URL,
            deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() }
        });

        const wallet = new CustomWalletConnection(near, null);

        let currentUser: { accountId: string, balance: string } | null = null;
        if (wallet.getAccountId()) {
            currentUser = {
                accountId: wallet.getAccountId(),
                balance: (await wallet.account().state()).amount
            };
        }

        const contract = await new nearAPI.Contract(
            wallet.account(),
            CONTRACT_NAME, // This global variable is injected by webpack. More details in webpack.common.js file.
            {
                viewMethods: ['get'],
                changeMethods: ['add']
            }
        );

        return { contract, currentUser, wallet };
    }
}