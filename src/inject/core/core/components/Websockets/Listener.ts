import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify
import { ws } from '../../components/Websockets'
import * as pako from 'pako'

export default function(callback: Function) {
  ws.onmessage = ({ data: raw }) => {
    // Decompress message
    if (raw.charAt(0) === '#') {
      try {
        raw = pako.inflate(raw.substr(1), { to: 'string' })
      } catch(e) {
        /// #if DEBUG
        injectify.debugLog('websockets', 'error', 'Failed to inflate compressed websocket message')
        /// #endif
        return
      }
    }

    // Parse message
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
      /// #if DEBUG
      injectify.debugLog('websockets', 'error', 'Failed to parse websocket message')
      /// #endif
      return
    }

    // Take action upon message
    if (topic && injectify.global.listeners.websocket[topic]) {
      // Callback the listeners
      injectify.global.listeners.websocket[topic].callback(data)
      if (injectify.global.listeners.websocket[topic].once) delete injectify.global.listeners.websocket[topic]
    } else {
      callback(data, topic)
    }
  }
  ws.addEventListener('close', () => {
    /// #if DEBUG
    injectify.debugLog('websockets', 'error', 'Lost connection to the server! reconnecting...')
    /// #endif
  })
}
