import { browser, Runtime } from "webextension-polyfill-ts";
import * as ethers from 'ethers';
import csvtojson from 'csvtojson';

const ENS_ADDRESS = 'redirector.dapplet-base.eth';
const NETWORK = 'rinkeby';
const JSON_RPC_PROVIDER_URL = 'https://rinkeby.infura.io/v3/294b39b36bac4fa6a1da130b450ba0b5';

async function getState() {
  const provider = new ethers.providers.JsonRpcProvider(JSON_RPC_PROVIDER_URL, NETWORK);
  const resolver = await provider.getResolver(ENS_ADDRESS);
  const notice = await resolver.getText('notice');
  const url = await resolver.getText('url');

  const response = await fetch(url);
  const csv = await response.text();
  const json = await csvtojson().fromString(csv);

  return {
    notice: notice,
    redirects: json
  };
}

const state = getState();

const pending = {};

const handler = async (tabId) => {
  if (pending[tabId]) return;

  try {
    pending[tabId] = true;
    const tab = await browser.tabs.get(tabId);
    const { url } = tab;

    if (!url) return;

    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(url));
    if (localStorage[hash] === 'ignore') return;
    const currentState = await state;
    const redirection = currentState.redirects.find(x => x.from_hash === hash);

    if (redirection) {
      const newUrl = redirection.to_url;
      const popupUrl = browser.extension.getURL('popup.html') + '?type=window';

      const currentWindow = await browser.windows.getCurrent();

      const popupWindow = await browser.windows.create({
        url: popupUrl,
        height: 300,
        width: 400,
        focused: true,
        type: 'popup',
        left: currentWindow.left + currentWindow.width / 2 - 200,
        top: currentWindow.top + 75
      });

      const popupTabId = popupWindow.tabs[0].id;

      const popupReadinessPromise = new Promise<void>((res, rej) => {
        const h = (message: any, sender: Runtime.MessageSender) => {
          if (sender.tab.id === popupTabId && sender.url === popupUrl) {
            if (message === 'ready') {
              browser.runtime.onMessage.removeListener(h);
              res();
            }
          }
        }

        browser.runtime.onMessage.addListener(h);
      });

      await popupReadinessPromise;

      const data = {
        from: url,
        to: newUrl,
        message: redirection.message,
        notice: currentState.notice
      }

      const result = await browser.tabs.sendMessage(popupWindow.tabs[0].id, data);

      switch (result) {
        case 'redirect':
          await browser.tabs.update(tabId, { url: newUrl });
          localStorage[hash] = 'redirect';
          break;

        case 'ignore':
          localStorage[hash] = 'ignore';
          break;

        case undefined: // when popup is closed
          break;

        default:
          return;
      }

    }
  } catch (err) {
    console.error(err);
  } finally {
    pending[tabId] = false;
  }
}

browser.tabs.onActivated.addListener(({ tabId }) => handler(tabId));
browser.tabs.onUpdated.addListener(handler);