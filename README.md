<p align="center">
	<a href="https://injectify.samdd.me/?ref=logo">
		<img src="https://github.com/samdenty99/injectify/raw/master/assets/injectify.png" width="100">
	</a>
  <h3 align="center">Injectify</h3>
  <p align="center">
    Perform advanced MiTM attacks on websites with ease.
  </p>
</p>
<p align="center">
	<b>
		<a href="https://injectify.samdd.me/?ref=website">
			Website
		</a>&nbsp;|
		<a href="https://samdenty99.github.io/r?https://trello.com/b/UdrfNufx">
			Trello
    </a>&nbsp;|
		<a href="https://samdenty99.github.io/r?https://discord.gg/Nsz5AeD">
			Discord
		</a>&nbsp;|
		<a href="https://samdenty99.github.io/r?https://github.com/samdenty99/injectify/wiki">
			Browse the docs
		</a>
	</b>
	<br><br>
	<a href="https://samdenty99.github.io/r?https://travis-ci.org/samdenty99/injectify">
		<img src="https://img.shields.io/travis/samdenty99/injectify.svg?style=flat">
	</a>
  <a href="https://samdenty99.github.io/r?http://www.somsubhra.com/github-release-stats/?username=samdenty99&repository=Wi-PWN">
		<img src="https://img.shields.io/github/package-json/v/samdenty99/injectify.svg?style=flat">
	</a>
	<a href="https://samdenty99.github.io/r?https://discord.gg/yN2x7sp">
		<img src="https://img.shields.io/discord/335836376031428618.svg?colorB=1081C1&style=flat">
	</a>
</p>
<h2></h2>


![Screenshot of the Injectify UI](https://samdd.me/images/projects/injectify.png)
A modern BeEF inspired framework for the 21st century.

## Getting started
1. Clone this repo
2. [Download & install MongoDB](https://www.mongodb.com/download-center#community)
>
> If using Windows, make sure `C:\Program Files\MongoDB\Server\3.4\bin\mongod.exe` is in your path environment variable
3. [Create a new GitHub application](https://github.com/settings/applications/new)<br><br>
![GitHub Applications page](https://i.imgur.com/oiuiMhR.png)
4. Copy `server.config.example.js` to `server.config.js` and replace the GitHub client ID and secret.<br><br>
![GitHub client ID & secret](https://i.imgur.com/JId0Wyk.png)
![server.config.js](https://i.imgur.com/cRcES59.png)
5. Making sure NodeJS and NPM are installed, and run the following in a terminal:
```bash
# install Yarn package manager
sudo npm i -g yarn

# make sure you're in the root of the Injectify repo
yarn run install-all

# this will start the MongoDB database & the webpack dev server
yarn run dev

# MAKE SURE to run this in a new terminal in the Injectify directory
yarn run server
```
6. Injectify is now available over at [`http://localhost:3000`](http://localhost:3000)

[![Analytics](https://ga-beacon.appspot.com/UA-85426772-5/Injectify/?pixel)](https://github.com/igrigorik/ga-beacon)