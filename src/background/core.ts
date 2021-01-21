import { browser } from "webextension-polyfill-ts";
import * as ethers from 'ethers';
import csvtojson from 'csvtojson';
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
            ENS_ADDRESS: string
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

            const response = await fetch(url);
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
}