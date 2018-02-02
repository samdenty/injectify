declare var global: any

import chalk from 'chalk'
import Modules from './LoadModules'
import Websockets from './Websockets'

const fs = require('fs')
const UglifyJS = require('uglify-es')
const WebSocket = require('ws')
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

    this.server = new WebSocket.Server({ server: express })

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

    let websocket = new Websockets(this.db, this.server)
    this.server.on('connection', (ws, req) => {
      ws.on('error', () => {})
      if (req.url.startsWith('/i')) {
        websocket.initiate(ws, req)
      } else {
        ws.close()
      }
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

  setState(newState: any) {
    Object.keys(newState).forEach(state => {
      this.state[state] = newState[state]
    })
  }
}
