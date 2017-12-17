import ReactDOM, { render } from 'react-dom'
import React, { Component } from "react"
import queryString from "query-string"
import io from "socket.io-client"
import PropTypes from 'prop-types'
import TextField from 'material-ui/TextField'
import url from 'url'
import { withStyles } from 'material-ui/styles'
import Snackbar from 'material-ui/Snackbar';
import CloseIcon from 'material-ui-icons/Close';
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
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles'

const theme = createMuiTheme({
  palette: {
    //type: 'dark',
  },
})

const development = process.env.NODE_ENV == 'development' ? true : false
if (window.location.host == 'not.legal') {
	var socket = io('https://uder.ml')
} else {
	var socket = io(window.location.origin)
}
let token
let last_commit
let loc = queryString.parse(location.search)

console.log("%c  _____        _           _   _  __       \n  \\_   \\_ __  (_) ___  ___| |_(_)/ _|_   _ \n   / /\\/ '_ \\ | |/ _ \\/ __| __| | |_| | | |\n/\\/ /_ | | | || |  __/ (__| |_| |  _| |_| |\n\\____/ |_| |_|/ |\\___|\\___|\\__|_|_|  \\__, |\n            |__/  " + "%chttps://samdd.me" + "%c   |___/ " + "\n", "color: #ef5350; font-weight: bold", "color: #FF9800", "color: #ef5350", {
	environment: process.env.NODE_ENV
})

class Injectify extends Component {
	state = {
		tab: 0,
		user: {},
		open: false,
		acceptOpen: false,
		width: '0',
		height: '0',
		notify: false,
		notifyOpen: false,
	}

	constructor(props) {
		super(props);
		this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
	}

	componentDidMount() {
		this.updateWindowDimensions()
		window.addEventListener('resize', this.updateWindowDimensions)
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
				let accounts = localStorage.getItem("accounts")
				if (!accounts) {
					accounts = [
						{
							token: data.token,
							user : {
								login: data.user.login,
								id: data.user.id,
							}
						}
					]
				} else {
					try {
						accounts = JSON.parse(accounts)
					} catch(e) {
						accounts = [
							{
								token: data.token,
								user : {
									login: data.user.login,
									id	 : data.user.id,
								}
							}
						]
					}
					let shouldAdd = true
					accounts.forEach((account) => {
						if (account.token == data.token) shouldAdd = false
					})
					if (shouldAdd) {
						accounts.push({
							token: data.token,
							user : {
								login: data.user.login,
								id: data.user.id,
							}
						})
					}
				}
				localStorage.setItem("accounts", JSON.stringify(accounts))
				token = data.token
				this.setState({
					agreeOpen: true
				})
			}
			if (window.location.pathname.toLowerCase().slice(0, 10) == "/projects/") {
				let project = window.location.pathname.slice(10).split("/")[0]
				let type = 'passwords'
				if (window.location.href.slice(-10) == "/keylogger") type = 'keylogger'
				if (window.location.href.slice(-7 ) == "/inject") type = 'inject'
				if (window.location.href.slice(-7 ) == "/config") type = 'config'
				if (project) {
					if (type !== 'config') {
						socket.emit("project:read", {
							name: decodeURIComponent(project),
							type: 'overview'
						})
					}
					socket.emit("project:read", {
						name: decodeURIComponent(project),
						type: type
					})
				}
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
		socket.on(`project:read`, collection => {
			console.log("%c[websocket] " + "%cproject:read =>", "color: #ef5350", "color:  #FF9800", collection)
			if (collection.type == 'overview' || collection.type == 'config') {
				this.setState({
					project: {
						...this.state.project,
						...collection.doc
					}
				})
				document.getElementsByTagName('title')[0].innerHTML =
					collection.doc.name +
					' - Injectify'
					.replace('<','&lt;')
					.replace('>','&gt;')
					.replace(' & ',' &amp; ')
			} else {
				this.setState({
					project: {
						...this.state.project,
						[collection.type]: collection.doc
					}
				})
			}
			let tab = 0
			if (collection.type == 'keylogger') tab = 1
			if (collection.type == 'inject') tab = 2
			if (collection.type == 'config') tab = 3
			this.setState({
				tab: tab
			})
		})
		socket.on(`project:switch`, data => {
			console.log("%c[websocket] " + "%cproject:switch =>", "color: #ef5350", "color:  #FF9800", data)
			let type = ''
			if (window.location.href.slice(-10) == "/passwords") type += "passwords"
			if (window.location.href.slice(-10) == "/keylogger") type += "keylogger"
			if (window.location.href.slice(-7 ) ==    "/config") type += "config"

			window.history.pushState('', data.project + ' - Injectify', '/projects/' + encodeURIComponent(data.project) + '/' + type)
			if (!type) type = 'overview'
			socket.emit("project:read", {
				name: data.project,
				type: type
			})
		})
		socket.on(`err`, error => {
			console.error("%c[websocket] " + "%cerr =>", "color: #ef5350", "color:  #FF9800", error)
			this.setState({
				notify: error,
				notifyOpen: true
			})
		})
		socket.on(`notify`, message => {
			console.log("%c[websocket] " + "%cnotify =>", "color: #ef5350", "color:  #FF9800", message)
			this.notify(message)
		})
		socket.on(`disconnect`, () => {
			console.error("%c[websocket] " + "%cdisconnected =>", "color: #ef5350", "color:  #FF9800", "abruptly disconnected")
			this.setState({
				notify: {
					title	: "Connectivity issues",
					message	: "Disconnected from server",
					id		: "reconnect"
				},
				notifyOpen: true
			})
		})
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateWindowDimensions);
	}
	
	updateWindowDimensions() {
		this.setState({ width: window.innerWidth, height: window.innerHeight });
	}

	handleClickOpen = () => {
		this.setState({ open: true });
	}

	handleRequestClose = () => {
		this.setState({ open: false });
	}

	notify = message => {
		this.setState({
			notify: message,
			notifyOpen: true
		})
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

	handleNotifyClose = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		this.setState({ notifyOpen: false })
	}

	handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			this.handleRequestNewProject()
		}
	}

	signIn() {
		if (this.sessionAuth()) return
		window.location = "https://github.com/login/oauth/authorize?client_id=95dfa766d1ceda2d163d&state=" + encodeURIComponent(window.location.href.split("?")[0].split("#")[0]) //+ "&scope=user%20gist&redirect_url="
	}

	signOut() {
		localStorage.removeItem("token")
		token = ''
		this.setState({
			user: {},
			projects: {}
		})
		socket.emit("auth:signout")
	}

	sessionAuth() {
		if (localStorage.getItem("token")) {
			socket.emit("auth:github/token", localStorage.getItem("token"))
			token = localStorage.getItem("token")
			return true
		}
	}

	render() {
		return (
			<MuiThemeProvider theme={theme}>
				<app className="main">
					<PersistentDrawer
					  parentState={this.state}
					  signIn={this.signIn.bind(this)}
					  signOut={this.signOut.bind(this)}
					  socket={socket}
					  emit={(a, b) => socket.emit(a, b)}
					  token={token}
					  newProject={this.handleClickOpen.bind(this)}
					  notify={this.notify.bind(this)}
					  ref={instance => { this.main = instance }}
					  setTab={tab => this.setState({ tab: tab })}
					>
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
								This software is still in development! Please login to continue
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
								inputProps={{
									autoCorrect: false,
									spellCheck: false,
									maxLength: 50,
								}}
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
					<Snackbar
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'left',
						}}
						open={this.state.notifyOpen}
						autoHideDuration={this.state.notify.id ? 100000 : 6000}
						onRequestClose={this.handleNotifyClose}
						SnackbarContentProps={{
							'aria-describedby': 'message-id',
						}}
						message={<span id="message-id"><b>{this.state.notify.title}</b><br/>{this.state.notify.message}</span>}
						action={[
							this.state.notify.id == "reconnect" ? (
								<Button key="reconnect" color="accent" dense onClick={() => { location.reload() }}>
									Reconnect
								</Button>
							) : null,
							this.state.notify.id == "upgrade" ? (
								<Button key="reconnect" color="accent" dense onClick={() => { location.reload() }}>
									Upgrade
								</Button>
							) : null,
							<IconButton
								key="close"
								aria-label="Close"
								color="inherit"
								onClick={this.handleNotifyClose}
							>
							<CloseIcon />
							</IconButton>,
						]}
						/>
				</app>
			</MuiThemeProvider>
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