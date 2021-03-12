import { browser } from "webextension-polyfill-ts";
import { Core } from './core';
import { debounce } from '../common/helpers';

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

browser.omnibox.onInputChanged.addListener(debounce(async (text, suggest) => {
  const [tab] = await browser.tabs.query({ active: true });
  if (!tab || !tab.url) return;

  const searchRedirections = await core.getRedirections(text);

  suggest(searchRedirections.map(r => ({
    content: JSON.stringify({ method: 'redirect', args: [tab.id, r.to_url] }),
    description: `Redirect available to "${r.to_url}"${(r.message && r.message.length > 0) ? `<dim> - ${r.message}</dim>` : ''}`
  })));

  const currentRedirections = await core.getRedirections(tab.url);

  suggest(currentRedirections.map(r => ({
    content: JSON.stringify({ method: 'redirect', args: [tab.id, r.to_url] }),
    description: `Redirect available to "${r.to_url}"${(r.message && r.message.length > 0) ? `<dim> - ${r.message}</dim>` : ''}`
  })));

  if (!currentRedirections.find(x => x === text)) {
    suggest([{
      content: JSON.stringify({ method: 'createRedirection', args: [tab.url, text] }),
      description: `Create redirect to <match>${text}</match> from ${tab.url}`
    }]);
  }

  
}, 250));

browser.omnibox.onInputEntered.addListener(async (jsonCall) => {
  try {
    const call = JSON.parse(jsonCall);
    if (!call.method) return;

    switch (call.method) {
      case "createRedirection": {
        const message = prompt('Enter your message (will show up on redirect)');
        if (message !== null) {
          await core.createRedirection(call.args[0], call.args[1]);
          alert(`The redirect is created.\nFrom: ${call.args[0]}\nTo: ${call.args[1]}`);
        }
        break;
      }

      case "redirect": {
        await core.redirect(call.args[0], call.args[1]);
        break;
      }

      default:
        break;
    }

  } catch (_) { }  
});

Object.assign(window, { core });