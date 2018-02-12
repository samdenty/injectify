import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify
declare const ws: WebSocket

export default function(callback: Function) {
  ws.onmessage = message => {
    try {
      let data = JSON.parse(message.data)
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
    } catch (e) {
      if (this.debug) console.error(e)
      injectify.error(e.stack)
    }
  }
}