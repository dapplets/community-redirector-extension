import { browser } from "webextension-polyfill-ts";
import { Core } from './core';
import * as nearAPI from 'near-api-js';
import { CustomWalletConnection } from "../common/customWalletConnection";

const core = new Core({
  ENS_ADDRESS: 'redirector.dapplet-base.eth',
  NETWORK: 'rinkeby',
  JSON_RPC_PROVIDER_URL: 'https://rinkeby.infura.io/v3/2053d123f95049c29b19db6f7960136c',
  NEAR_NETWORK_ID: 'default',
  NEAR_NODE_URL: 'https://rpc.testnet.near.org',
  NEAR_WALLET_URL: 'https://wallet.testnet.near.org',
  NEAR_HELPER_URL: 'https://helper.testnet.near.org'
});

browser.tabs.onActivated.addListener(({ tabId }) => core.checkTab(tabId));
browser.tabs.onUpdated.addListener((tabId, changeInfo) => core.checkTab(tabId, changeInfo.status === 'loading'));

browser.omnibox.onInputChanged.addListener((text, suggest) => {
  if (text.toLowerCase().indexOf('buidl') !== -1) {
    setTimeout(() => {
      suggest([
        {
          content: 'https://twitter.com/realDonaldTrump',
          description: 'Add redirection from "buidl.near" to this webpage'
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
});

Object.assign(window, { core });