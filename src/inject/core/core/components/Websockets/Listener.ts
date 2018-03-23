import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify
const ws: WebSocket = (<any>window).ws || (<any>window).i‍// <- invisible space
const pako = require('pako')

export default function(callback: Function) {
  ws.onmessage = ({ data: raw }) => {
    /**
     * Decompress message
     */
    if (raw.charAt(0) === '#') {
      try {
        raw = pako.inflate(raw.substr(1), { to: 'string' })
      } catch(e) {
        return injectify.debugLog('websockets', 'error', 'Failed to inflate compressed websocket message')
      }
    }

    /**
     * Parse message
     */
    let topic: string
    let data: any
    try {
      const separator = raw.indexOf(':')
      if (separator > -1) {
        topic = raw.substring(0, separator)
        data = JSON.parse(raw.substring(separator + 1))
      } else {
        topic = raw
      }
    } catch (e) {
      return injectify.debugLog('websockets', 'error', 'Failed to parse websocket message')
    }

    /**
     * Take action upon message
     */
    if (topic && injectify.global.listeners.websocket[topic]) {
      /**
       * Pre-process some topic's data
       */
      if (topic == 'pong') {
        data = +new Date() - data
      }
      /**
       * Callback the listeners
       */
      injectify.global.listeners.websocket[topic].callback(data)
      if (injectify.global.listeners.websocket[topic].once) delete injectify.global.listeners.websocket[topic]
    } else {
      callback(data, topic)
    }
  }
  ws.addEventListener('close', () => {
    injectify.debugLog('websockets', 'error', 'Lost connection to the server! reconnecting...')
  })
}
