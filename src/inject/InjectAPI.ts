declare var global: any
import chalk from 'chalk'
const uuidv4 = require('uuid/v4')
const minify = require('html-minifier').minify

import { SocketSession } from './definitions/session'

export default class {
  socket: any
  session: SocketSession.session
  send: any
  token: string
  project: SocketSession.project
  client: any

  constructor(that: any) {
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
    module: data => {
      try {
        if (!data.name) return
        let js = global.inject.modules[data.name]
        if (this.session.debug) js = global.inject.debugModules[data.name]
        if (js) {
          try {
            if (!/^undefined|number|boolean$/.test(typeof data.params) && data.params !== null) {
              data.params = JSON.stringify(data.params)
            }
            js = `Module.params=${data.params};${js}`
            this.send('module', {
              name: data.name,
              token: data.token,
              script: js
            })
          } catch (error) {
            this.send('module', {
              name: data.name,
              token: data.token,
              error: {
                code: 'server-error',
                message: `Encountered a server-side error whilst loading module "${data.name}"`
              }
            })
          }
        } else {
          this.send('module', {
            name: data.name,
            token: data.token,
            error: {
              code: 'not-installed',
              message: `Module "${data.name}" not installed on server`
            }
          })
        }
      } catch (error) {
        console.error(
          chalk.redBright('[inject] ') +
          chalk.yellowBright(error)
        )
      }
    },

    /**
     * PageGhost
     */
    p: data => {
      if (data && data instanceof Object) {
        if (global.inject.clients[this.project.id][this.token] && global.inject.clients[this.project.id][this.token].watchers) {
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
                useShortDoctype: true,
              })
              data.dom = minfied
            } catch(e) {

            }
          }
          global.inject.clients[this.project.id][this.token].watchers.forEach(watcher => {
            watcher.emit('inject:pageghost', {
              timestamp: +new Date(),
              id: uuidv4(),
              sender: this.client.session,
              data: data
            })
          })
        }
      }
    },

    /**
     * Client info logger
     */
    i: data => {
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
            this.client.session.window.title = title.substring(0, maxStringLength)
          }
          if (typeof url === 'string') {
            this.client.session.window.url = url.substring(0, maxUrlLength)
            this.client.session.window.favicon = `https://plus.google.com/_/favicon?domain_url=${encodeURIComponent(this.client.session.window.url)}`
          }
          if (typeof active === 'boolean') {
            this.client.session.window.active = active
          }
        }
        if (typeof data.devtools === 'object') {
          let { open, orientation } = data.devtools
          if (orientation === 'vertical' || orientation === null || orientation === 'horizontal') {
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
      if (global.inject.clients[this.project.id][this.token] && global.inject.clients[this.project.id][this.token].watchers) {
        global.inject.clients[this.project.id][this.token].watchers.forEach(watcher => {
          watcher.emit('inject:client', global.inject.clients[this.project.id][this.token])
        })
      }
    },

    /**
     * Data logger
     */
    l: data => {
      if (data && data.message instanceof Array && /^warn|info|error|table|return$/.test(data.type)) {
        if (global.inject.clients[this.project.id][this.token] && global.inject.clients[this.project.id][this.token].watchers) {
          global.inject.clients[this.project.id][this.token].watchers.forEach(watcher => {
            watcher.emit('inject:log', {
              type: data.type,
              message: data.message,
              timestamp: +new Date(),
              id: uuidv4(),
              sender: this.client.session
            })
          })
        }
      }
    },

    /**
     * Error logger
     */
    e: data => {
      this.send('error', data)
      if (global.inject.clients[this.project.id][this.token] && global.inject.clients[this.project.id][this.token].watchers) {
        global.inject.clients[this.project.id][this.token].watchers.forEach(watcher => {
          watcher.emit('inject:log', {
            type: 'error',
            message: [{
              type: 'string',
              message: data
            }]
          })
        })
      }
    },

    /**
     * Get server ping time
     */
    ping: pingTime => {
      this.send('pong', pingTime)
    },

    /**
     * Get server ping time
     */
    heartbeat: data => {
      this.send('stay-alive')
    },

    /**
     * For testing execute's from the client side
     */
    execute: data => {
      this.send('execute', data)
    }
  }
}