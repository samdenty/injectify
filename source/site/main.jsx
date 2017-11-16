import ReactDOM, { render } from 'react-dom'
import React, { Component } from "react"
import queryString from "query-string"
import io from "socket.io-client"
import PropTypes from 'prop-types'
import TextField from 'material-ui/TextField'
import url from 'url'
import { withStyles } from 'material-ui/styles'
import Dialog, {
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from 'material-ui/Dialog'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import Tooltip from 'material-ui/Tooltip'
import PersistentDrawer from "./sidebar.jsx"

const development = process.env.NODE_ENV == 'development' ? true : false
let socket = io(window.location.origin),
	token,
	last_commit,
	loc = queryString.parse(location.search)

if (git) last_commit = git.last_commit.long_sha

console.log("%c  _____        _           _   _  __       \n  \\_   \\_ __  (_) ___  ___| |_(_)/ _|_   _ \n   / /\\/ '_ \\ | |/ _ \\/ __| __| | |_| | | |\n/\\/ /_ | | | || |  __/ (__| |_| |  _| |_| |\n\\____/ |_| |_|/ |\\___|\\___|\\__|_|_|  \\__, |\n            |__/  " + "%chttps://samdd.me" + "%c   |___/ " + "\n", "color: #ef5350; font-weight: bold", "color: #FF9800", "color: #ef5350", {
	sha: last_commit,
	environment: process.env.NODE_ENV
})

class Injectify extends Component {
	state = {
		user: {},
		open: false,
		acceptOpen: false
	}

	componentDidMount() {
		if (loc.token) {
			localStorage.setItem("token", loc.token)
			window.history.pushState("","", "./")
		}
		if (loc.code && loc.state) {
			if (url.parse(loc.state).hostname && window.location.hostname !== url.parse(loc.state).hostname) {
				window.location = window.location.href.replace(window.location.origin, url.parse(loc.state).protocol + "//" + url.parse(loc.state).host)
			} else {
				socket.emit("auth:github", loc)
				window.history.pushState("","", "./")
			}
		}
		this.sessionAuth()
		socket.on(`auth:github`, data => {
			this.setState(data)
			if (data.success && data.token) {
				localStorage.setItem("token", data.token)
				token = data.token
				this.setState({
					agreeOpen: true
				})
			}
			console.log("%c[websocket] " + "%cauth:github =>", "color: #ef5350", "color:  #FF9800", data)
		})
		socket.on(`auth:github/stale`, data => {
			console.log("%c[websocket] " + "%cauth:github/stale =>", "color: #ef5350", "color:  #FF9800", data)
			localStorage.removeItem("token")
		})
		socket.on(`user:projects`, data => {
			console.log("%c[websocket] " + "%cuser:projects =>", "color: #ef5350", "color:  #FF9800", data)
			this.setState({
				projects: data
			})
		})
		socket.on(`project:read`, project => {
			console.log("%c[websocket] " + "%cproject:read =>", "color: #ef5350", "color:  #FF9800", project)
			this.setState({
				project: project
			})
		})
		socket.on(`err`, error => {
			console.error("%c[websocket] " + "%cerr =>", "color: #ef5350", "color:  #FF9800", error)
		})
	}
	
	handleClickOpen = () => {
		this.setState({ open: true });
	}

	handleRequestClose = () => {
		this.setState({ open: false });
	}

	handleRequestNewProject = () => {
		let project = document.getElementById("newProject").value
		if(project.length !== 0) {
			if (project) {
				socket.emit("project:create", {
					name: project
				})
				this.handleRequestClose()
			}
		}
	}

	signIn() {
		if (this.sessionAuth()) return
		window.location = "https://github.com/login/oauth/authorize?client_id=95dfa766d1ceda2d163d&state=" + encodeURIComponent(window.location.href.split("?")[0].split("#")[0]) + "&scope=user%20gist&redirect_url="
	}

	signOut() {
		localStorage.removeItem("token")
		token = ''
		this.setState({
			user: {},
			projects: {}
		})
	}

	sessionAuth() {
		if (localStorage.getItem("token")) {
			socket.emit("auth:github/token", localStorage.getItem("token"))
			token = localStorage.getItem("token")
			return true
		}
	}

	handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			this.handleRequestNewProject()
		}
	}

	render() {
		return (
			<app className="main">
				<PersistentDrawer parentState={this.state} signIn={this.signIn.bind(this)} signOut={this.signOut.bind(this)} emit={(a, b) => socket.emit(a, b)} token={token} newProject={this.handleClickOpen.bind(this)}>
					{this.state.user.login ? (
						<div>
							<table>
								<tbody>
									<tr><td>{this.state.user.name}</td></tr>
									<tr><td>{this.state.user.login}</td></tr>
									<tr><td>{this.state.user.bio}</td></tr>
								</tbody>
							</table>
							<Button onClick={this.handleClickOpen}>New project</Button>
						</div>
					) : (
						<div>
							Please login to continue
						</div>
					)}
				</PersistentDrawer>
				<Dialog open={this.state.open} onRequestClose={this.handleRequestClose}>
					<DialogTitle>New project</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Choose a new project ID ~ nothing identifying as it could be intercepted by a third-party
						</DialogContentText>
						<TextField
							autoFocus
							margin="dense"
							id="newProject"
							label="Project name"
							type="text"
							fullWidth
							onKeyPress={this.handleKeyPress}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleRequestClose} color="primary">
							Cancel
						</Button>
						<Button onClick={this.handleRequestNewProject} color="primary">
							Create
						</Button>
					</DialogActions>
				</Dialog>
				<Agree open={this.state.agreeOpen} />
			</app>
		)
	}
}

class Agree extends Component {
	state = {
		open: this.props.open
	}

	handleAgree = () => {
		this.setState({ open: false })
		localStorage.setItem("agree", true)
	}

	handleDisagree = () => {
		this.setState({ open: false })
		localStorage.removeItem("token")
		window.location.reload()
	}
	render() {
		if (localStorage.getItem("agree") != "true") {
			return (
				<Dialog open={this.props.open}>
					<DialogTitle>{"Terms and Conditions"}</DialogTitle>
					<DialogContent>
						<DialogContentText>
							You will only use injectify and it's associated payloads on your own devices, for whitehat purposes only. Failure to comply will result in your account being terminated.
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleDisagree} color="primary">
							Disagree
						</Button>
						<Button onClick={this.handleAgree} color="primary" autoFocus>
							Agree
						</Button>
					</DialogActions>
				</Dialog>
			)
		} else {
			return null
		}
	}
}

class Projects extends Component {
	render() {
		if (this.props.projects && this.props.projects[0]) {
			return (
				<div>
					{this.props.projects.map((project, i) =>
						<Records raised color="primary" key={i} record={project.name} projectData={this.props.projectData}></Records>
					)}
				</div>
			)
		} else {
			return null
		}
	}
}



render(
	<Injectify />,
	document.getElementsByTagName("react")[0]
)