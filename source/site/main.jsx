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
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table'
import Timestamp from 'react-timestamp'

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
				name: project
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
			if(JSON.stringify(this.state.project) != JSON.stringify(project)) {
				this.setState({
					project: project
				})
			}
		})
		socket.on(`err`, error => {
			console.error("%c[websocket] " + "%cerr =>", "color: #ef5350", "color:  #FF9800", error)
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
						<tr><td>
							{this.state.user.avatar_url ? (
								<img src={this.state.user.avatar_url} />
							) : (
								<span></span>
							)}
						</td></tr>
						<tr><td>{this.state.user.name}</td></tr>
						<tr><td>{this.state.user.login}</td></tr>
						<tr><td>{this.state.user.bio}</td></tr>
					</tbody>
				</table>
				<Projects projects={this.state.projects} projectData={this.state.project} />
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

class Records extends Component {
	state = {
		open: false,
	}

	scrollToBottom = (hide) => {
		const node = ReactDOM.findDOMNode(this.scrollContainer)
		if (node) {
			setTimeout(() =>{
				try {
					node.scrollTo({
						'behavior': 'smooth',
						'left': 0,
						'top': node.scrollHeight
					});
				} catch(e) {
					node.scrollTop = node.scrollHeight
				}
			}, 0)
		}
	}

	componentWillUpdate() {
		this.scrollToBottom()
	}

	componentDidUpdate() {
		if (this.props.projectData) this.scrollToBottom()
	}

	handleClickOpen = (a) => {
		socket.emit("project:read", {
			name: this.props.record
		})
		this.setState({ open: true });
	};

	handleRequestClose = () => {
		socket.emit("project:close", {
			name: this.props.record
		})
		this.setState({ open: false });
	}

	viewJSON = () => {
		window.open("/api/" + encodeURIComponent(token) + "/" + encodeURIComponent(this.props.projectData.name) /*+ "&download=true"*/)
		console.log(token)
	}

	render() {
		let id = 0;
		function createData(name, calories, fat, carbs, protein) {
			id += 1;
			return { id, name, calories, fat, carbs, protein };
		}	  
		return (
			<div>
				<Button onClick={this.handleClickOpen}>{this.props.record}</Button>
				{this.props.projectData && this.props.projectData.name == this.props.record ? (
					<Dialog open={this.state.open} onRequestClose={this.handleRequestClose}>
						<DialogTitle>
							<span>{`Project ${this.props.projectData.name}`}</span>
						</DialogTitle>
						<DialogContent ref={(el) => { this.scrollContainer = el }}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell width="400">Time</TableCell>
										<TableCell>Username</TableCell>
										<TableCell>Password</TableCell>
										<TableCell>Details</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{this.props.projectData.records.map((record, i) => {
										return (
											<TableRow key={i}>
												<TableCell className="time"><Timestamp time={record.timestamp} format='ago'/></TableCell>
												<TableCell numeric>{record.username}</TableCell>
												<TableCell numeric>{record.password}</TableCell>
												<TableCell numeric>
													<Button color="primary">
														More
													</Button>
												</TableCell>
											</TableRow>
										);
									})}
									<tr ref={el => this.tableEnd = el} className="tableEnd"></tr>
								</TableBody>
							</Table>
						</DialogContent>
						<DialogActions>
							<Button onClick={this.handleRequestClose} color="primary">
								Close
							</Button>
							<Button onClick={this.viewJSON} color="primary" autoFocus>
								View JSON
							</Button>
						</DialogActions>
					</Dialog>
				) : null}
			</div>
		);
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