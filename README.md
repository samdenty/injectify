<p align="center">
  <a href="https://injectify.samdd.me/?ref=logo">
    <img src="https://github.com/samdenty99/injectify/raw/master/assets/injectify.png" width="100">
  </a>
  <h3 align="center">Injectify</h3>
  <p align="center">
    Perform advanced MiTM attacks on websites with ease.<br>
    ✨ Support development on <a href="https://patreon.com/samdd">Patreon</a> or one-time via <a href="https://paypal.me/thesamdd">Paypal</a>
  </p>
</p>
<p align="center">
  <b>
    <a href="https://injectify.samdd.me/?test-it-out">
      Test it out
    </a>&nbsp;|
    <a href="https://injectify.js.org/getting-started/installation/mongodb/">
      Installation
    </a>&nbsp;|
    <a href="https://injectify.js.org/?docs">
      Docs
    </a>&nbsp;|
    <a href="https://samdenty99.github.io/r?https://trello.com/b/UdrfNufx">
      Trello
    </a>&nbsp;|
    <a href="https://samdenty99.github.io/r?https://discord.gg/Nsz5AeD">
      Discord
    </a>
  </b>
  <br><br>
  <a href="https://samdenty99.github.io/r?https://circleci.com/gh/samdenty99/injectify/">
    <img src="https://img.shields.io/circleci/project/github/samdenty99/injectify.svg?style=flat">
  </a>
  <a href="https://samdenty99.github.io/r?https://github.com/samdenty99/injectify/blob/master/package.json">
    <img src="https://img.shields.io/github/package-json/v/samdenty99/injectify.svg?style=flat">
  </a>
  <a href="https://samdenty99.github.io/r?https://discord.gg/yN2x7sp">
    <img src="https://img.shields.io/discord/335836376031428618.svg?colorB=1081C1&style=flat">
  </a>
</p>
<h2></h2>

## Upcoming version-2 rewrite
- View what's on the victims screen
  - Ability to interact and click buttons
  - Scrolling is synced two-way
- Data recording
  - Database api for recording & storing data
- New module API
  - Modules can now run server-side code

<br>

![Version 2 preview](https://i.imgur.com/MMc1qOD.png)

---

![Screenshot of the Injectify UI](https://i.imgur.com/kBpDyJa.png)

Injectify is a modern web based MiTM tool, similiar to BeEF (although completely unrelated in terms of source code). It features cross-platform clients (Web, Desktop, Browser extension).

## What can it do?

* :zap: Create a reverse Javascript shell between the victim and the attacker.
* :keyboard: Records keystrokes and logs them to a database.
* :closed_lock_with_key: Extract and log [saved passwords](https://twitter.com/thesamdd/status/947251299262836741) from the browser.

## [Documentation](https://injectify.js.org/)
- [Getting started](https://injectify.js.org/getting-started/installation/mongodb/)
  - [Installation ](https://injectify.js.org/getting-started/installation/mongodb/)
    - [Creating a MongoDB database](https://injectify.js.org/getting-started/installation/mongodb/)
    - [Creating a GitHub application](https://injectify.js.org/getting-started/installation/github/)
    - [Configuration](https://injectify.js.org/getting-started/installation/configuration/)
    - [Setting up the server](https://injectify.js.org/getting-started/installation/setting-up/)
  - [Using it](https://injectify.js.org/usage/payload-generator/)
     - [Generating JS payloads](https://injectify.js.org/usage/payload-generator/)
     - [Hooking browsers](https://injectify.js.org/usage/inject/)
     - [Password extractor](https://injectify.js.org/usage/passwords/)
     - [Keylogger](https://injectify.js.org/usage/keylogger/)
     - [Project configuration](https://injectify.js.org/usage/project-config/roles/)
        - [Managing users & roles](https://injectify.js.org/usage/project-config/roles/)
        - [Managing domain filters](https://injectify.js.org/usage/project-config/filters/)
        - [Project API](https://injectify.js.org/usage/project-config/api/)
- Development
  - [Setting up the dev-server](https://github.com/samdenty99/injectify/wiki/Development-server)
- Builds and deployment
  - [CircleCI](https://github.com/samdenty99/injectify/wiki/Builds-and-deployment%3A-CircleCI)
  - [TravisCI](https://github.com/samdenty99/injectify/wiki/Builds-and-deployment%3A-TravisCI)

## Demos
See more at the [official documentation site](https://injectify.js.org/demos/interface/)

### Tabs
![](https://i.imgur.com/P9Cgksy.gif)

### Live updates
![](https://i.imgur.com/XY4qrfR.gif)

### Console replication
![](https://i.imgur.com/dAnXFSq.gif)

### Console data types
![](https://i.imgur.com/pp5Bys4.gif)

### Module intellisense
![](https://i.imgur.com/565xR4a.gifv)

### Editor intellisense
![](https://i.imgur.com/X0h9A1N.gif)


[![Analytics](https://ga-beacon.appspot.com/UA-85426772-5/Injectify/?pixel)](https://github.com/igrigorik/ga-beacon)
