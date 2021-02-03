import { browser } from "webextension-polyfill-ts";
import { Core } from './core';

const core = new Core({
  ENS_ADDRESS: 'redirector.dapplet-base.eth',
  NETWORK: 'rinkeby',
  JSON_RPC_PROVIDER_URL: 'https://rinkeby.infura.io/v3/2053d123f95049c29b19db6f7960136c'
});

browser.tabs.onActivated.addListener(({ tabId }) => core.checkTab(tabId));
browser.tabs.onUpdated.addListener((tabId, changeInfo) => core.checkTab(tabId, changeInfo.status === 'loading'));

browser.omnibox.onInputChanged.addListener((text, suggest) => {
  if (text.toLowerCase().indexOf('trump') !== -1) {
    setTimeout(() => {
      suggest([
        {
          content: 'https://twitter.com/realDonaldTrump',
          description: 'Donald Trump on Twitter'
        },
        {
          content: 'https://www.facebook.com/DonaldTrump',
          description: 'Donald Trump on Facebook'
        },
        {
          content: 'https://instagram.com/realDonaldTrump',
          description: 'Donald Trump on Instagram'
        },
        {
          content: 'https://www.youtube.com/channel/UCAql2DyGU2un1Ei2nMYsqOA',
          description: 'Donald Trump on YouTube'
        }
      ])
    }, 500);
  }
})

Object.assign(window, { core });