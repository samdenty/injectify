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
						reject(Error("Failed to parse GitHub user API response"))
					}
					if (!error && response.statusCode == 200 && user.login) {
						socket.emit('auth:github', {
							success: true,
							token: token,
							user: user
						})
						resolve(user)
					} else {
						reject(Error("Failed to authenticate user with token"))
					}
				})
			});
		}

		var addUser = (user, token) => {
			return new Promise((resolve, reject) => {
				let users = db.collection("users")
				db.collection('users', (err, collection) => {
					if (err) throw err
					collection.findOne({id: user.id}).then(doc => {
						if(doc !== null) {
							//console.log(doc)
						} else {
							users.insertOne({
								username: user.login,
								id: user.id,
								token: token,
								created_at: Math.round(new Date().getTime() / 1000),
								github: user,
								slots : {
									1: {
										name: "Slot 1",
										domains: ['http://example.com', 'http://example2.com'],
										entries: {
											127891273: {
												ip: "192.168.1.1",
												user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.40 Safari/537.36",
												username: "test",
												password: "mypassword"
											}
										}
									}
								}
							}, (err, res) => {
								console.log(chalk.greenBright("[database] ") + chalk.yellowBright("added user '" + user.id + "' (" + user.login + ")"));
							});
						}
					})
				})
			});
		}

		socket.on('auth:github', (data) => {
			if (config.debug) console.log(chalk.greenBright("[websocket] ") + chalk.yellowBright("client => github:auth "), data);
			if (data.code) {
				// Convert the code into a user-token
				getToken(data.code).then(token => {
					if (config.debug) console.log(chalk.greenBright("[GitHub] ") + chalk.yellowBright("retrieved token "), token);
					// Convert the token into a user object
					getUser(token).then(user => {
						if (config.debug) console.log(chalk.greenBright("[websocket] ") + chalk.yellowBright("client <= github:auth "), user);
						// Add the user to the database if they don't exist
						addUser(user, token).then(() => {
							if (config.debug) console.log(chalk.greenBright("[database] ") + chalk.yellowBright("added user "), user.login);
						}).catch(error => {
							console.log(chalk.redBright("[database] "), error);
							socket.emit('database:registration', {
								success: false,
								message: error.toString()
							})
						})
					}).catch(error => {
						console.log(chalk.redBright("[GitHub] "), error);
						socket.emit('auth:github', {
							success: false,
							message: error.toString()
						})
					})
				}).catch(error => {
					console.log(chalk.redBright("[GitHub] "), error);
					socket.emit('auth:github', {
						success: false,
						message: error.toString()
					})
				})
			}
		});

		socket.on('auth:github/token', data => {
			// Convert the token into a user object
			getUser(data).then(user => {
				if (config.debug) console.log(chalk.greenBright("[websocket] ") + chalk.yellowBright("client <= github:auth "), user);
				// Add the user to the database if they don't exist
				addUser(user, data).then(() => {
					if (config.debug) console.log(chalk.greenBright("[database] ") + chalk.yellowBright("added user "), user.login);
				}).catch(error => {
					console.log(chalk.redBright("[database] "), error);
					socket.emit('database:registration', {
						success: false,
						message: error.toString()
					})
				})
			}).catch(error => {
				// Signal the user to re-authenticate their GitHub account
				console.log(chalk.redBright("[GitHub] "), error);
				socket.emit('auth:github/stale', {
					success: false,
					message: error.toString()
				})
			})
		});
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