// Configuration
const config = {
	debug 	: false,
	mongodb : 'mongodb://localhost:19000/injectify',
	express : 3000,
	dev		: process.env.NODE_ENV.toUpperCase() == 'DEVELOPMENT',
	github  : {
		client_id: '95dfa766d1ceda2d163d',
		client_secret: '1809473ac6467f85f483c33c1098d4dadf8be9e8'
	}
}

// Include libraries
const MongoClient 	= require('mongodb').MongoClient
const express 		= require('express')
const app 	 		= express()
const server 		= app.listen(config.express)
const io 			= require('socket.io').listen(server)
const path 			= require('path')
const request 		= require('request')
const chalk 		= require('chalk')

console.log(chalk.greenBright("[Injectify] ") + "listening on port " + config.express)

MongoClient.connect(config.mongodb, function(err, db) {
	if (err) throw err
	io.on('connection', socket => {
		var getToken = code => {
			return new Promise((resolve, reject) => {
				request({
						url: 'https://github.com/login/oauth/access_token',
						method: 'POST',
						headers: {
							'Accept': 'application/json'
						},
						qs: {
							'client_id': config.github.client_id,
							'client_secret': config.github.client_secret,
							'code': code
						}
					}, (error, response, github) => {
						try {
							github = JSON.parse(github)
						} catch(e) {
							console.log(chalk.redBright("[websocket] ") + chalk.yellowBright("failed to retrieve token "), github);
							console.error(e)
							reject(Error("Failed to parse GitHub response"))
						}
						if (!error && response.statusCode == 200 && github.access_token) {
							resolve(github.access_token)
						} else {
							reject(Error("Failed to authenticate account, invalid code"))
						}
					}
				)
			});
		}
		var getUser = token => {
			return new Promise((resolve, reject) => {
				request({
					url: 'https://api.github.com/user?access_token=' + token,
					method: 'GET',
					headers: {
						'Accept': 'application/json',
						'User-Agent': 'Injectify'
					}
				}, (error, response, user) => {
					try {
						user = JSON.parse(user)
					} catch(e) {
						console.log(chalk.redBright("[websocket] ") + chalk.yellowBright("failed to retrieve user API "), user);
						console.error(e)
						reject({
							title	: "Could not authenticate you",
							message	: "Failed to parse the GitHub user API response"
						})
					}
					if (!error && response.statusCode == 200 && user.login) {
						resolve(user)
					} else {
						reject({
							title	: "Could not authenticate you",
							message	: "GitHub API rejected token!"
						})
					}
				})
			});
		}
		var returnUser = (user, token) => {
			return new Promise((resolve, reject) => {
				db.collection('users', (err, users) => {
					if (err) throw err
					users.findOne({id: user.id}).then(doc => {
						if(doc !== null) {
							// User exists in database
							//console.log(doc)
							users.updateOne({
								id: user.id
							},
							{
								$set: {
									github: user
								}
							})
						} else {
							// User doesn't exist in database
							users.insertOne({
								username: user.login,
								id			: user.id,
								token		: token,
								created_at	: Math.round(new Date().getTime() / 1000),
								github		: user
							}, (err, res) => {
								if (err) {
									throw err
								} else {
									console.log(
										chalk.greenBright("[database] ") + 
										chalk.yellowBright("added user ") + 
										chalk.magentaBright(user.id) + 
										chalk.cyanBright(" (" + user.login + ")")
									)
								}
							});
						}
					})
				})
			});
		}
		var newProject = (project, user) => {
			return new Promise((resolve, reject) => {
				db.collection('projects', (err, projects) => {
					if (err) throw err
					projects.findOne({name: project}).then(doc => {
						if(doc == null) {
							// Project doesn't exist in database
							projects.insertOne({
								name		: project,
								permissions : {
									owner	: user.id,
									admin	: [],
									readonly: []
								},
								config		: {
									domains		: [],
									created_at	: Math.round(new Date().getTime() / 1000)
								},
								records		: {}
							}, (err, res) => {
								if (err) {
									throw err
								} else {
									console.log(
										chalk.greenBright("[database] ") + 
										chalk.magentaBright(user.id) + 
										chalk.cyanBright(" (" + user.login + ") ") + 
										chalk.yellowBright("added project ") + 
										chalk.magentaBright(project)
									)
								}
							});
						} else {
							// Project already exists
							console.log(
								chalk.redBright("[database] ") + 
								chalk.yellowBright("project ") +
								chalk.magentaBright(project) +
								chalk.yellowBright(" already exists ")
							)
							reject({
								title	: "Project name already taken",
								message	: "Please choose another name"
							})
						}
					})
				})
			});
		}

		socket.on('auth:github', data => {
			if (data.code) {
				if (config.debug) console.log(chalk.greenBright("[websocket] ") + chalk.yellowBright("client => github:auth "), data);
				// Convert the code into a user-token
				getToken(data.code).then(token => {
					if (config.debug) console.log(chalk.greenBright("[GitHub] ") + chalk.yellowBright("retrieved token "), token);
					// Convert the token into a user object
					getUser(token).then(user => {
						socket.emit('auth:github', {
							success: true,
							token: token,
							user: user
						})
						if (config.debug) console.log(chalk.greenBright("[websocket] ") + chalk.yellowBright("client <= github:auth "), user);
						// Add the user to the database if they don't exist
						returnUser(user, token).then(() => {
							if (config.debug) console.log(chalk.greenBright("[database] ") + chalk.yellowBright("added user "), user.login);
						}).catch(error => {
							console.log(chalk.redBright("[database] "), error);
							socket.emit('database:registration', {
								success: false,
								message: error.toString()
							})
						})
					}).catch(error => {
						console.log(chalk.redBright("[auth:github] "), error.message);
						socket.emit('err', {
							title	: error.title.toString(),
							message	: error.message.toString()
						})
					})
				}).catch(error => {
					console.log(chalk.redBright("[auth:github] "), error.message);
					socket.emit('err', {
						title	: error.title.toString(),
						message	: error.message.toString()
					})
				})
			}
		});

		socket.on('auth:github/token', token => {
			if (token) {
				// Convert the token into a user object
				getUser(token).then(user => {
					socket.emit('auth:github', {
						success: true,
						token: token,
						user: user
					})
					if (config.debug) console.log(chalk.greenBright("[websocket] ") + chalk.yellowBright("client <= github:auth "), user);
					// Add the user to the database if they don't exist
					returnUser(user, token).then(() => {
						
					}).catch(error => {
						console.log(chalk.redBright("[database] "), error);
						socket.emit('database:registration', {
							success: false,
							message: error.toString()
						})
					})
				}).catch(error => {
					// Signal the user to re-authenticate their GitHub account
					console.log(chalk.redBright("[auth:github/token] "), error.message)
					socket.emit('auth:github/stale', {
						title	: error.title.toString(),
						message	: error.message.toString()
					})
				})
			}
		});

		socket.on('project:create', project => {
			if (project.name && project.token) {
				getUser(project.token).then(user => {
					newProject(project.name, user).then(value => {
						socket.emit('project:create', {
							success	: true,
							project : project.name
						})
					}).catch(e => {
						socket.emit('err', {
							title	: e.title,
							message	: e.message
						})
					})
				}).catch(error => {
					// Failed to authenticate user with token
					console.log(chalk.redBright("[project:create] "), error.message);
					socket.emit('err', {
						title	: error.title.toString(),
						message	: error.message.toString()
					})
				})
			}
		})
	});


	// Enable EJS
	//app.set('view engine', 'ejs')

	app.get('/auth/github', (req, res) => {
		if (req.query.code) {
			res.sendFile(__dirname + '/www/auth.html')
		} else {
			res.set('Content-Type', 'application/json')
			res.send(JSON.stringify({
				success: false,
				message: "No authorization token specified in request"
			}))
		}
	})
	// Proxy through to webpack-dev-server
	if (config.dev) {
		app.use('/*', (req, res) => {
			request("http://localhost:8080" + req.originalUrl).pipe(res);
		})
	} else {
		app.use(express.static(path.join(__dirname, '../../output/site')))
	}
})