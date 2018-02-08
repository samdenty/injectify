declare var global: any
import chalk from 'chalk'

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
            js = `${data.params ? `Module.params=${JSON.stringify(data.params)};` : ``}${js}`
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
      if (data && ((data.type === 'return' && data.message instanceof Object && typeof data.message.type === 'string') || (data.message instanceof Array && (data.type === 'info' || data.type === 'warn' || data.type === 'error' || data.type === 'table')))) {
        if (global.inject.clients[this.project.id][this.token] && global.inject.clients[this.project.id][this.token].watchers) {
          global.inject.clients[this.project.id][this.token].watchers.forEach(watcher => {
            watcher.emit('inject:log', {
              type: data.type,
              message: data.message,
              timestamp: +new Date()
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
            message: data.message
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