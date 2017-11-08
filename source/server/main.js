// Include libraries
const MongoClient = require('mongodb').MongoClient
const express = require('express')
const server = express()
const path = require('path')
const request = require('request');
const execSync = require('child_process').execSync
const chalk = require('chalk')

// Configuration
const config = {
	mongodb : "mongodb://localhost:19000/injectify",
	express : 3000,
	dev		: process.env.NODE_ENV.toUpperCase() != 'PRODUCTION'
}

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


server.listen(config.express, () => console.log(chalk.greenBright('[express] ') + chalk.whiteBright('server started on port ' + config.express)))



MongoClient.connect(config.mongodb, function(err, db) {
	if (err) throw err;
	console.log("Database created!");
	db.close();
});