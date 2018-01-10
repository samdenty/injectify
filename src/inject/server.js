const fs = require('fs')
const chalk = require('chalk')
const UglifyJS = require('uglify-es')
const sockjs = require('sockjs')
const config = require('../../server.config.js').injectify

const websockets = require('./websockets.js')
const loadModules = require('./loadModules.js')
const core = fs.readFileSync(`${__dirname}/core/core.js`, 'utf8')

module.exports = (express, db) => {
  let state = {
    core: UglifyJS.minify(core).code,
    debugCore: core,
    modules: {},
    debugModules: {},
    clients: [],
    watchers: [],
    authenticate: {}
  }

  let server = sockjs.createServer({ log: (severity, message) => {
    if (severity === 'debug') {
      console.log(
        chalk.greenBright('[SockJS] ') +
        chalk.yellowBright(message)
      )
    } else if (severity === 'error') {
      console.log(
        chalk.redBright('[SockJS] ') +
        chalk.yellowBright(message)
      )
    } else if (config.verbose) {
      console.log(
        chalk.greenBright('[SockJS] ') +
        chalk.yellowBright(message)
      )
    }
  }})

  server.on('connection', (socket, t) => {
    websockets(db, state, socket)
  })

  loadModules((modules, debugModules, count) => {
    state.modules = modules
    state.debugModules = debugModules
    console.log(
      chalk.greenBright('[inject:modules] ') +
      chalk.yellowBright('successfully loaded ') +
      chalk.magentaBright(count) +
      chalk.yellowBright(' modules into memory')
    )
    server.installHandlers(express, { prefix: '/i' })
  })
  return state
}
