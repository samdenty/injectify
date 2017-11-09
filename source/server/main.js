// Include libraries
const MongoClient 	= require('mongodb').MongoClient
const express 		= require('express')
const server 		= express()
const socketServer 	= require('http').Server(server)
const io 			= require('socket.io')(socketServer)
const path 			= require('path')
const request 		= require('request')
const chalk 		= require('chalk')

// Configuration
const config = {
	debug 	: true,
	mongodb : 'mongodb://localhost:19000/injectify',
	express : 3000,
	dev		: process.env.NODE_ENV.toUpperCase() == 'DEVELOPMENT',
	github  : {
		client_id: '95dfa766d1ceda2d163d',
		client_secret: '1809473ac6467f85f483c33c1098d4dadf8be9e8'
	}
}

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

	socket.on('auth:github', (data) => {
		if (config.debug) console.log(chalk.greenBright("[websocket] ") + chalk.yellowBright("client => github:auth "), data);
		if (data.code) {
			getToken(data.code).then(token => {
				if (config.debug) console.log(chalk.greenBright("[GitHub] ") + chalk.yellowBright("retrieved token "), token);
				getUser(token).then(user => {
					if (config.debug) console.log(chalk.greenBright("[websocket] ") + chalk.yellowBright("client <= github:auth "), user);
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
		getUser(data).then(user => {
			if (config.debug) console.log(chalk.greenBright("[websocket] ") + chalk.yellowBright("client <= github:auth "), user);
		}).catch(error => {
			console.log(chalk.redBright("[GitHub] "), error);
			socket.emit('auth:github/stale', {
				success: false,
				message: error.toString()
			})
		})
	});
});


// Enable EJS
//server.set('view engine', 'ejs')

server.get('/auth/github', (req, res) => {
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
	server.use('/*', (req, res) => {
		request("http://localhost:8080" + req.originalUrl).pipe(res);
	})
} else {
	server.use(express.static(path.join(__dirname, '../../output/site')))
}


server.listen(config.express, () => console.log(
	chalk.greenBright('[express] ') + 
	chalk.whiteBright('server started on port ' + config.express))
)
socketServer.listen(2053)



MongoClient.connect(config.mongodb, (err, db) => {
	if (err) throw err;
	console.log("Database created!");
	db.close();
});