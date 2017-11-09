import ReactDOM, { render } from 'react-dom'
import React, { Component } from "react"
import queryString from "query-string"
import io from "socket.io-client"
import url from "url"
const development = process.env.NODE_ENV == 'development' ? true : false
if (development) {
	const socket = io('http://localhost:2053')
 } else {
	const socket = io('https://injectify.samdd.me:2053')
 }

console.log("%c  _____        _           _   _  __       \n  \\_   \\_ __  (_) ___  ___| |_(_)/ _|_   _ \n   / /\\/ '_ \\ | |/ _ \\/ __| __| | |_| | | |\n/\\/ /_ | | | || |  __/ (__| |_| |  _| |_| |\n\\____/ |_| |_|/ |\\___|\\___|\\__|_|_|  \\__, |\n            |__/  " + "%chttps://samdd.me" + "%c   |___/ " + "\n", "color: #ef5350; font-weight: bold", "color: #FF9800", "color: #ef5350", {
	sha: git.last_commit.long_sha,
	environment: process.env.NODE_ENV
})

class Injectify extends Component {
	state = { data: {} }

	componentDidMount() {    
		socket.on(`server:event`, data => {
			this.setState({ data })
		})
	}
	
	sendMessage = message => {
		socket.emit(`client:sendMessage`, message)
	}
	
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
		global.oauth = window.open(`https://github.com/login/oauth/authorize?client_id=95dfa766d1ceda2d163d${process.env.NODE_ENV == 'development' ? `&state=localhost` : ``}`, "popup", "height=600,width=500")
		window.addEventListener("message", data => {
			if (data.origin == "http://localhost:3000" || data.origin == "https://injectify.samdd.me") {
				if (typeof oauth !== "undefined" && typeof data.data == "string") {
					oauth.close()
					let urlParsed = url.parse(data.data)
					let urlData = queryString.parse(urlParsed.query)
					console.log(urlData)

					if (urlData.code) {
						socket.emit("auth:github", urlData)
						localStorage.setItem("token", urlData.code)
						//this.setState({ chat: 4, loginPopup: false })
					}
				}
			}
		})
	}
}

render(
  <Injectify />,
  document.getElementsByTagName("main")[0]
)