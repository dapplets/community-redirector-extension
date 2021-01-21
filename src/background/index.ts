import { browser } from "webextension-polyfill-ts";
import { Core } from './core';

const core = new Core({
  ENS_ADDRESS: 'redirector.dapplet-base.eth',
  NETWORK: 'rinkeby',
  JSON_RPC_PROVIDER_URL: 'https://rinkeby.infura.io/v3/2053d123f95049c29b19db6f7960136c'
});

browser.tabs.onActivated.addListener(({ tabId }) => core.checkTab(tabId));
browser.tabs.onUpdated.addListener((tabId, changeInfo) => core.checkTab(tabId, changeInfo.status === 'loading'));

Object.assign(window, { core });