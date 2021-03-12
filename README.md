# Redirector Browser Extension

## Concept

Redirector is an extension suggesting possible forwards for user-generated resources. It is like HTTP 301/302 (Redirect) but initiated by extension, not by the server. It allows creating a redirect for some URL even if the hoster doesn’t provide this functionality.
 
In the MVP the list of redirects is stored on [GitHub](https://github.com/dapplets/community-redirector-registry). Please create a pull request to add more redirects. In the next versions of the Redirector, the list of redirects will be decentralized and community-driven.

## Getting Started

### Installation

1.  Clone this repo
2.  Run `yarn install` (or `npm install`)
3.  Run `yarn dev` (or `npm run dev`)
4.  Run `yarn test` (or `npm run test`)

### How to use?

1. Open the popup

![](https://github.com/dapplets/community-redirector-extension/blob/master/docs/images/popup-no-account.png?raw=true)

2. Sign in to your NEAR account

![](https://github.com/dapplets/community-redirector-extension/blob/master/docs/images/popup-signed-in.png?raw=true)

3. Create new redirect. 

3.1. Open a web page, which you want to redirect from. 

3.2. Type to the search bar (omnibox) `redirect` and press `tab`.

3.3. Paste a URL of target web page, where you want to be redirected.

3.4. Select the suggestion `Create redirection to <url> from <url>`

![](https://github.com/dapplets/community-redirector-extension/blob/master/docs/images/omnibox-create-redirect.png?raw=true)

3.5. Type a message for a user, who will be redirected.

![](https://github.com/dapplets/community-redirector-extension/blob/master/docs/images/omnibox-prompt-message.png?raw=true)

3.6. After successfull redirect creation an alert will be shown.

![](https://github.com/dapplets/community-redirector-extension/blob/master/docs/images/omnibox-success-alert.png?raw=true)

4. Test your redirect.

4.1. Open a web page, which you want to redirect from. The redirect window will be shown, click "Redirect".

![](https://github.com/dapplets/community-redirector-extension/blob/master/docs/images/window-redirect.png?raw=true)


## Authors

* **Dmitry Palchun** - *Initial work* - [ethernian](https://github.com/ethernian)
* **Alexander Sakhaev** - *Initial work* - [alsakhaev](https://github.com/alsakhaev)
