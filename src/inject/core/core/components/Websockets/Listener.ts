import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify
const ws: WebSocket = (<any>window).ws || (<any>window).i‍// <- invisible space
const pako = require('pako')

export default function(callback: Function) {
  ws.onmessage = message => {
    let raw = message.data
    if (raw.charAt(0) === '#') {
      raw = pako.inflate(message.data.substr(1), { to: 'string' })
    }
    let data = JSON.parse(raw)
    if (data.t && injectify.global.listeners.websocket[data.t]) {
      /**
       * Pre-process some topic's data
       */
      if (data.t == 'pong') {
        data.d = +new Date - data.d
      }
      /**
       * Callback the listeners
       */
      injectify.global.listeners.websocket[data.t].callback(data.d)
      if (injectify.global.listeners.websocket[data.t].once) delete injectify.global.listeners.websocket[data.t]
    } else {
      callback(data.d, data.t)
    }
  }
  ws.addEventListener('close', () => {
    injectify.debugLog('websockets', 'error', 'Lost connection to the server! reconnecting...')
  })
}
