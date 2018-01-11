declare var global: any

import chalk from 'chalk'
import Modules from './LoadModules'
import Websockets from './Websockets'

const fs = require('fs')
const UglifyJS = require('uglify-es')
const sockjs = require('sockjs')
const core = fs.readFileSync(`${__dirname}/core/core.js`, 'utf8')

export default class {
  db: any
  server: any // SockJS server
  state = {
    core: <string> UglifyJS.minify(core).code,
    debugCore: <string> core,
    modules: {},
    debugModules: {},
    clients: [],
    watchers: [],
    authenticate: {}
  }

  constructor(express: any, mongodb: any) {
    this.db = mongodb

    this.server = sockjs.createServer({ log: (severity, message) => {
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
      } else if (global.config.verbose) {
        console.log(
          chalk.greenBright('[SockJS] ') +
          chalk.yellowBright(message)
        )
      }
    }})

    let websocket = new Websockets(this.db)
    this.server.on('connection', socket => websocket.initiate(socket))

    let modules = new Modules()
    modules.load.then(({ modules, debugModules, count }) => {
      this.setState({
        modules: modules,
        debugModules: debugModules
      })
      console.log(
        chalk.greenBright('[inject:modules] ') +
        chalk.yellowBright(`successfully loaded ${chalk.magentaBright(count.toString())} modules into memory`)
      )
      this.server.installHandlers(express, { prefix: '/i' })
    }).catch(({ title, error }) => {
      console.error(title, error)
    })
  }

  setState(newState: any) {
    Object.keys(newState).forEach(state => {
      this.state[state] = newState[state]
    })
  }
}
