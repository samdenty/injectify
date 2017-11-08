// Include libraries
const MongoClient = require('mongodb').MongoClient
const express = require('express')
const server = express()
const ps = require('ps-node')
const execSync = require('child_process').execSync
const chalk = require('chalk')

// Configuration
const config = {
	mongodb : "mongodb://localhost:19000/injectify",
	express : 3000
}
// Indicate whether MongoDB is running
ps.lookup({
	command: 'mongoda',
	psargs: '-l'
	}, function(err, resultList ) {
	if (err) {
		throw new Error( err );
	} else if (!resultList) {
		console.log(chalk.yellowBright('[mongodb] ') + chalk.whiteBright('couldn\'t find MongoDB process!'))
		execSync('npm run mongo-background')
	} else {
		console.log(chalk.greenBright('[mongodb] ') + chalk.whiteBright('found MongoDB process, no action necessary'))
	}
});



// Enable EJS
server.set('view engine', 'ejs')

server.get('/', (req, res) => res.send('Hello World!'))
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

server.listen(config.express, () => console.log(chalk.greenBright('[express] ') + chalk.whiteBright('server started on port ' + config.express)))



MongoClient.connect(config.mongodb, function(err, db) {
	if (err) throw err;
	console.log("Database created!");
	db.close();
});