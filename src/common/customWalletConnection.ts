import * as nearAPI from 'near-api-js';
import { serialize } from 'borsh';

const LOGIN_WALLET_URL_SUFFIX = '/login/';
const PENDING_ACCESS_KEY_PREFIX = 'pending_key'; // browser storage key for a pending access key (i.e. key has been generated but we are not sure it was added yet)

export class CustomWalletConnection extends nearAPI.WalletConnection {
  async requestSignIn(contractId: string, title: string, successUrl?: string, failureUrl?: string) {
    if (this.getAccountId() || await this._keyStore.getKey(this._networkId, this.getAccountId())) {
      return Promise.resolve();
    }

    const currentUrl = new URL(window.location.href);
    const newUrl = new URL(this._walletBaseUrl + LOGIN_WALLET_URL_SUFFIX);
    newUrl.searchParams.set('title', title);
    newUrl.searchParams.set('contract_id', contractId);
    newUrl.searchParams.set('success_url', successUrl || currentUrl.href);
    newUrl.searchParams.set('failure_url', failureUrl || currentUrl.href);
    newUrl.searchParams.set('app_url', currentUrl.origin);
    const accessKey = nearAPI.KeyPair.fromRandom('ed25519');
    newUrl.searchParams.set('public_key', accessKey.getPublicKey().toString());
    await this._keyStore.setKey(this._networkId, PENDING_ACCESS_KEY_PREFIX + accessKey.getPublicKey(), accessKey);
    chrome.tabs.create({ url: newUrl.toString() });
  }

  async requestSignTransactions(transactions: nearAPI.transactions.Transaction[], callbackUrl?: string) {
    const currentUrl = new URL(window.location.href);
    const newUrl = new URL('sign', this._walletBaseUrl);

    newUrl.searchParams.set('transactions', transactions
      .map(transaction => serialize(nearAPI.transactions.SCHEMA, transaction))
      .map(serialized => Buffer.from(serialized).toString('base64'))
      .join(','));
    newUrl.searchParams.set('callbackUrl', callbackUrl || currentUrl.href);

    chrome.tabs.create({ url: newUrl.toString() });
  }

  async completeSignIn(accountId, publicKey, allKeys) {
    this._authData = {
      accountId,
      allKeys
    };
    window.localStorage.setItem(this._authDataKey, JSON.stringify(this._authData));
    await this._moveKeyFromTempToPermanent(accountId, publicKey);
  }
}