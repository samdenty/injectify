import ReactDOM, { render } from 'react-dom'
import React, { Component } from "react"
import queryString from "query-string"
import io from "socket.io-client"
import url from "url"
import PropTypes from 'prop-types'
import TextField from 'material-ui/TextField'
import { withStyles } from 'material-ui/styles'
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import MenuIcon from 'material-ui-icons/Menu'
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';

const development = process.env.NODE_ENV == 'development' ? true : false
let socket, token
if (development) {
	socket = io('ws://localhost:3000')
} else {
	socket = io(window.location.origin)
}

console.log("%c  _____        _           _   _  __       \n  \\_   \\_ __  (_) ___  ___| |_(_)/ _|_   _ \n   / /\\/ '_ \\ | |/ _ \\/ __| __| | |_| | | |\n/\\/ /_ | | | || |  __/ (__| |_| |  _| |_| |\n\\____/ |_| |_|/ |\\___|\\___|\\__|_|_|  \\__, |\n            |__/  " + "%chttps://samdd.me" + "%c   |___/ " + "\n", "color: #ef5350; font-weight: bold", "color: #FF9800", "color: #ef5350", {
	sha: git.last_commit.long_sha,
	environment: process.env.NODE_ENV
})

class Injectify extends Component {
	state = {
		user: {},
		open: false
	}

	handleClickOpen = () => {
		this.setState({ open: true });
	}

	handleRequestClose = () => {
		this.setState({ open: false });
	}

	handleRequestNewProject = () => {
		let project = document.getElementById("newProject").value
		if (project) {
			socket.emit("project:create", {
				name: project,
				token: token
			})
			this.handleRequestClose()
		}
	}

	componentDidMount() {
		this.sessionAuth()    
		socket.on(`auth:github`, data => {
			this.setState(data)
			if (data.success && data.token) {
				localStorage.setItem("token", data.token)
				token = data.token
			}
			console.log(data)
		})
		socket.on(`auth:github/stale`, data => {
			console.log(data)
			localStorage.removeItem("token")
		})
		socket.on(`user:projects`, data => {
			console.log(data)
			this.setState({
				projects: data
			})
		})
		socket.on(`err`, error => {
			console.error(error)
		})
	}

	signIn() {
		if (this.sessionAuth()) return
		global.oauth = window.open(`https://github.com/login/oauth/authorize?client_id=95dfa766d1ceda2d163d${process.env.NODE_ENV == 'development' ? `&state=localhost` : `&state=` + new Date().getTime()}&scope=user%20gist`, "popup", "height=600,width=500")
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

	sessionAuth() {
		if (localStorage.getItem("token")) {
			socket.emit("auth:github/token", localStorage.getItem("token"))
			token = localStorage.getItem("token")
			return true
		}
	}

	signOut() {
		localStorage.removeItem("token")
		token = ''
		this.setState({
			user: {},
			projects: {}
		})
	}
	
	render() {
		return (
			<app className="main">
				<AppBar position="static">
					<Toolbar>
						<IconButton className="menuButton" color="contrast" aria-label="Menu">
							<MenuIcon />
						</IconButton>
						<Typography type="title" color="inherit" className="flex">
							Injectify
						</Typography>
						{this.state.user.login ? (
							<Button color="contrast" onClick={this.signOut.bind(this)}>
								{this.state.user.login}
							</Button>
						) : (
							<Button color="contrast" onClick={this.signIn.bind(this)}>
								Login with GitHub
							</Button>
						)}
					</Toolbar>
				</AppBar>
				<table>
					<tbody>
						<tr><td>{this.state.user.avatar_url ? (
							<img src={this.state.user.avatar_url} />
						) : (
							<span></span>
						)}</td></tr>
						<tr><td>{this.state.user.name}</td></tr>
						<tr><td>{this.state.user.login}</td></tr>
						<tr><td>{this.state.user.bio}</td></tr>
					</tbody>
				</table>
				<Projects projects={this.state.projects} />
				<Button onClick={this.handleClickOpen}>New project</Button>
				<Dialog open={this.state.open} onRequestClose={this.handleRequestClose}>
					<DialogTitle>New project</DialogTitle>
					<DialogContent>
						<DialogContentText>
							To subscribe to this website, please enter your email address here. We will send
							updates occationally.
						</DialogContentText>
						<TextField
							autoFocus
							margin="dense"
							id="newProject"
							label="Project name"
							type="text"
							fullWidth
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
			</app>
		)
	}
}

class Projects extends Component {
	render () {
		if (this.props.projects && this.props.projects[0]) {
			return (
				<div>
					{this.props.projects.map((project, i) =>
					<Button raised color="primary" key={i}>
						{project.name}
					</Button>
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