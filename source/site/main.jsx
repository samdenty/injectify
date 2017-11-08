import ReactDOM, { render } from 'react-dom'
import React, { Component } from "react"
import queryString from "query-string"
import io from "socket.io-client"

console.log("%c  _____        _           _   _  __       \n  \\_   \\_ __  (_) ___  ___| |_(_)/ _|_   _ \n   / /\\/ '_ \\ | |/ _ \\/ __| __| | |_| | | |\n/\\/ /_ | | | || |  __/ (__| |_| |  _| |_| |\n\\____/ |_| |_|/ |\\___|\\___|\\__|_|_|  \\__, |\n            |__/  " + "%chttps://samdd.me" + "%c   |___/ " + "\n", "color: #ef5350; font-weight: bold", "color: #FF9800", "color: #ef5350", {
	VERSION: git.last_commit.long_sha
})

class Root extends Component {

	render() {
		return (
			<div className="main">
				<LoginWithGithub />
			</div>
		)
	}
}

class LoginWithGithub extends Component {
	render() {
		return (
			<button onClick={this.auth.bind(this)}>
				Login with GitHub
			</button>
		)
	}
	auth() {
		window.open(`https://github.com/login/oauth/authorize?client_id=95dfa766d1ceda2d163d`, "popup", "height=600,width=500")
	}
}

render(
  <Root />,
  document.getElementsByTagName("main")[0]
)