import ReactDOM, { render } from 'react-dom'
import React, { Component } from "react"
import queryString from "query-string"
import io from "socket.io-client"
import url from "url"

const development = process.env.NODE_ENV == 'development' ? true : false
let socket
if (development) {
	socket = io('ws://localhost:2053')
} else {
	socket = io(window.location.origin + ':2053')
}

console.log("%c  _____        _           _   _  __       \n  \\_   \\_ __  (_) ___  ___| |_(_)/ _|_   _ \n   / /\\/ '_ \\ | |/ _ \\/ __| __| | |_| | | |\n/\\/ /_ | | | || |  __/ (__| |_| |  _| |_| |\n\\____/ |_| |_|/ |\\___|\\___|\\__|_|_|  \\__, |\n            |__/  " + "%chttps://samdd.me" + "%c   |___/ " + "\n", "color: #ef5350; font-weight: bold", "color: #FF9800", "color: #ef5350", {
	sha: git.last_commit.long_sha,
	environment: process.env.NODE_ENV
})

class Injectify extends Component {
	state = { data: {} }

	componentDidMount() {    
		socket.on(`auth:github`, data => {
			this.setState({ success: data.success.toString()})
			if (data.success && data.token) {
				localStorage.setItem("token", data.token)
			} else {

			}
			console.log(data)
		})
		socket.on(`auth:github/stale`, data => {
			localStorage.removeItem("token")
			this.auth()
		})
	}

	auth() {
		if (localStorage.getItem("token")) {
			socket.emit("auth:github/token", localStorage.getItem("token"))
			return
		}
		global.oauth = window.open(`https://github.com/login/oauth/authorize?client_id=95dfa766d1ceda2d163d${process.env.NODE_ENV == 'development' ? `&state=localhost` : ``}&scope=user%20gist`, "popup", "height=600,width=500")
		window.addEventListener("message", data => {
			if (data.origin == "http://localhost:3000" || data.origin == "https://injectify.samdd.me") {
				if (typeof oauth !== "undefined" && typeof data.data == "string") {
					oauth.close()
					let urlParsed = url.parse(data.data)
					let urlData = queryString.parse(urlParsed.query)
					if (urlData.code) {
						socket.emit("auth:github", urlData)
					}
				}
			}
		})
	}
	
	render() {
		return (
			<div className="main">
				<div>
					{this.state.code}
				</div>
				<button onClick={this.auth.bind(this)}>
					Login with GitHub
				</button>
			</div>
		)
	}
}

render(
  <Injectify />,
  document.getElementsByTagName("main")[0]
)