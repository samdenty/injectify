declare var global: any

import chalk from 'chalk'
import Modules from './LoadModules'
import Websockets from './Websockets'

const fs = require('fs')
const UglifyJS = require('uglify-es')
const WebSocket = require('ws')
const minifiedCore = fs.readFileSync(`${__dirname}/core/bundle.min.js`, 'utf8')
const unminifiedCore = fs.readFileSync(`${__dirname}/core/bundle.js`, 'utf8')

export default class {
  db: any
  server: any // SockJS server
  Websockets
  state = {
    core: <string> minifiedCore,
    debugCore: <string> unminifiedCore,
    modules: {},
    debugModules: {},
    clients: [],
    watchers: [],
    authenticate: {}
  }

  constructor(express: any, mongodb: any) {
    this.db = mongodb
    this.server = new WebSocket.Server({ noServer: true })

    this.server.broadcast = (data) => {
      this.server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data)
        }
      })
    }

    this.server.execute = (project, client, session, script) => {
      this.server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(script)
        }
      })
    }

    this.Websockets = new Websockets(this.db, this.server)
    this.server.on('connection', (ws, req) => {
      this.connectionHandler(ws, req)
    })

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
    }).catch(({ title, error }) => {
      console.error(title, error)
    })
  }

  connectionHandler(ws, req) {
    ws.on('error', () => {})
    this.Websockets.initiate(ws, req)
  }

  setState(newState: any) {
    Object.keys(newState).forEach(state => {
      this.state[state] = newState[state]
    })
  }
}
