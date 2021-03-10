import { browser } from "webextension-polyfill-ts";
import { Core } from './core';
import * as nearAPI from 'near-api-js';
import { CustomWalletConnection } from "../common/customWalletConnection";

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
});

/**
 * NEAR Protocol
 */
(async function () {


  // Initializing connection to the NEAR TestNet
  const near = await nearAPI.connect({
    networkId: 'default',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    deps: {
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore()
    }
  });

  // Needed to access wallet
  const walletConnection = new CustomWalletConnection(near, null);

  // Load in account data
  let currentUser;
  if (walletConnection.getAccountId()) {
    currentUser = {
      accountId: walletConnection.getAccountId(),
      balance: (await walletConnection.account().state()).amount
    };
  }

  // Initializing our contract APIs by contract name and configuration
  const contract = await new nearAPI.Contract(
    walletConnection.account(),
    CONTRACT_NAME, // This global variable is injected by webpack. More details in webpack.common.js file.
    {
      // View methods are read-only – they don't modify the state, but usually return some value
      viewMethods: ['getMessages'],
      // Change methods can modify the state, but you don't receive the returned value when called
      changeMethods: ['addMessage'],
      // Sender is the account ID to initialize transactions.
      // getAccountId() will return empty string if user is still unauthorized
      //sender: walletConnection.getAccountId()
    }
  );

  walletConnection.requestSignIn(
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
        walletConnection.completeSignIn(accountId, publicKey, allKeys);
        await new Promise((res, rej) => setTimeout(res, 1000));
        await browser.tabs.remove(tabId);
      }

      isPairing = false;
    }
  });

  console.log({
    currentUser,
    contract,
    walletConnection
  });
})();

Object.assign(window, { core });