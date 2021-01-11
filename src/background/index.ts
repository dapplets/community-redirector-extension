import { browser } from "webextension-polyfill-ts";
import * as ethers from 'ethers';
import csvtojson from 'csvtojson';

const ENS_ADDRESS = 'redirector.dapplet-base.eth';
const NETWORK = 'rinkeby';


async function getState() {
  const resolver = await ethers.providers.getDefaultProvider(NETWORK).getResolver(ENS_ADDRESS);
  const notice = await resolver.getText('notice');
  const url = await resolver.getText('url');

  const response = await fetch(url);
  const csv = await response.text();
  const json = await csvtojson().fromString(csv);

  console.log(`State loaded. Global message: "${notice}"`);

  return {
    notice: notice,
    redirects: json
  };
}

const state = getState();

const handler = async (tabId) => {
  const tab = await browser.tabs.get(tabId);
  const { url } = tab;

  if (!url) return;

  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(url));
  const currentState = await state;
  const redirection = currentState.redirects.find(x => x.from_hash === hash);

  if (redirection) {
    const newUrl = redirection.to_url;
    await browser.tabs.update(tabId, { url: newUrl });
    console.log(`Redirected from "${url}" to "${newUrl}" with message "${redirection.message}"`);
  }
}

browser.tabs.onActivated.addListener(({ tabId }) => handler(tabId));
browser.tabs.onUpdated.addListener(handler);