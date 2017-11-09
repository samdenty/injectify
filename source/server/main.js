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

io.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });

	socket.on('auth:github', function (data) {
		if (config.debug) console.log(chalk.greenBright("[websocket] ") + chalk.yellowBright("client => github:auth "), data);
		if (data.code) {
			// Retrieve the users token from the Github API
			request({
				url: 'https://github.com/login/oauth/access_token',
				method: 'POST',
				headers: {
					'Accept': 'application/json'
				},
				qs: {
					'client_id': config.github.client_id,
					'client_secret': config.github.client_secret,
					'code': data.code
				}
			}, function (error, response, github) {
				try {
					github = JSON.parse(github)
					if (config.debug) console.log(chalk.greenBright("[GitHub] ") + chalk.yellowBright("retrieved token "), github);
				} catch(e) {
					console.log(chalk.redBright("[websocket] ") + chalk.yellowBright("failed to retrieve token "), github);
					console.log(e)
					socket.emit('auth:github', {
						success: false,
						error: 'Server side Github authentication error'
					})
					return
				}
				if (!error && response.statusCode == 200 && github.access_token) {
					request({
						url: 'https://api.github.com/user?access_token=' + github.access_token,
						method: 'GET',
						headers: {
							'Accept': 'application/json',
							'User-Agent': 'Injectify'
						}
					}, function (error, response, user) {
						try {
							user = JSON.parse(user)
							if (config.debug) console.log(chalk.greenBright("[GitHub] ") + chalk.yellowBright("retrieved user API "));
						} catch(e) {
							console.log(chalk.redBright("[websocket] ") + chalk.yellowBright("failed to retrieve user API "), user);
							console.log(e)
							socket.emit('auth:github', {
								success: false,
								error: 'Server side Github user authentication error'
							})
							return
						}
						if (!error && response.statusCode == 200 && user.login) {
							socket.emit('auth:github', {
								success: true,
								user: user
							})
							if (config.debug) console.log(chalk.greenBright("[websocket] ") + chalk.yellowBright("client <= github:auth "), user);
						}
					})
				} else {
					socket.emit('auth:github', {
						success: false,
						error: 'Could not authenticate account on Github'
					})
				}
			})
		}
	});
});


// Enable EJS
//server.set('view engine', 'ejs')

server.get('/auth/github', function (req, res) {
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
	server.use('/*', function (req, res) {
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



MongoClient.connect(config.mongodb, function(err, db) {
	if (err) throw err;
	console.log("Database created!");
	db.close();
});