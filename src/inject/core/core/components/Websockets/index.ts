import { Injectify } from '../../../definitions/core'
import Decycle from '../../lib/JSON-Decycle'
import Listener from './Listener'
import Topics from './Topics'
declare const injectify: typeof Injectify
declare const ws: WebSocket
const pako = require('pako')

export default class {
  static send(topic: string, data?: any) {
    /**
     * If the websocket is dead, return
     */
    if (ws.readyState !== ws.OPEN) return
    try {
      let json = JSON.stringify(
        new Decycle({
          t: topic,
          d: data,
        })
      )
      if (injectify.info.compression) {
        json = '#' + pako.deflate(json, {to: 'string'})
      }
      ws.send(json)
    } catch (e) {
      if (injectify.debug) console.error(e)
      injectify.error(e.stack)
    }
  }

  static ping(callback?: any) {
    this.send('ping', + new Date())
    if (callback) injectify.listen('pong', callback, true)
  }

  static listener = Listener

  static topics = Topics
}