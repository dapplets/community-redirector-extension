# Redirector Browser Extension

Redirector is an extension suggesting possible forwards for user-generated resources. It is like HTTP 301/302 (Redirect) but initiated by extension, not by the server. It allows creating a redirect for some URL even if the hoster doesn’t provide this functionality.
 
In the MVP the list of redirects is stored on [GitHub](https://github.com/dapplets/community-redirector-registry). Please create a pull request to add more redirects. In the next versions of the Redirector, the list of redirects will be decentralized and community-driven.

### Building

1.  Clone repo
2.  `npm install`
3.  `npm start` to run the dev task in watch mode or `npm run dev` to compile once or `npm run build` to build a production (minified) version

## Authors

* **Dmitry Palchun** - *Initial work* - [ethernian](https://github.com/ethernian)
* **Alexander Sakhaev** - *Initial work* - [alsakhaev](https://github.com/alsakhaev)