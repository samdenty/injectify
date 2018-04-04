declare var global: any

import Logger from '../logger'
import Modules from './LoadModules'
import Websockets from './Websockets'

const fs = require('fs')
const UglifyJS = require('uglify-es')
const WebSocket = require('ws')
const production_bundle = fs.readFileSync(
  `${__dirname}/core/bundle.min.js`,
  'utf8'
)
const development_bundle = fs.readFileSync(
  `${__dirname}/core/bundle.js`,
  'utf8'
)

export default class {
  db: any
  server: any // SockJS server
  Websockets
  state = {
    core: {
      production: {
        bundle: <string>production_bundle,
        hash: <string>require('crypto')
          .createHash('md5')
          .update(production_bundle)
          .digest('hex')
      },
      development: {
        bundle: <string>development_bundle,
        hash: <string>require('crypto')
          .createHash('md5')
          .update(development_bundle)
          .digest('hex')
      }
    },
    modules: [],
    clients: [],
    watchers: [],
    authenticate: {}
  }

  constructor(express: any, mongodb: any) {
    this.db = mongodb
    this.server = new WebSocket.Server({ noServer: true })

    this.server.broadcast = (data) => {
      this.server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data)
        }
      })
    }

    this.server.execute = (project, client, session, script) => {
      this.server.clients.forEach((client) => {
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
    modules.load
      .then(({ modules, count }) => {
        this.setState({
          modules
        })
        Logger(['core', 'modules'], 'log', {
          count: count
        })
      })
      .catch(({ title, error }) => {
        Logger(['core', 'modules'], 'error', { title, error })
      })
  }

  connectionHandler(ws, req) {
    ws.on('error', () => {})
    this.Websockets.initiate(ws, req)
  }

  setState(newState: any) {
    Object.keys(newState).forEach((state) => {
      this.state[state] = newState[state]
    })
  }
}
