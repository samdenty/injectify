import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify
import * as pako from 'pako'
import * as CircularJSON from 'circular-json'
import { Vow } from '../../lib/Promise'

/**
 * The global websocket provided by the payload
 */
export const ws: WebSocket = (<any>window).ws || (<any>window).i‍ // <- invisible space

/**
 * Send data to the server
 * @param topic The associated name for the action you want to perform
 * @param data The data to send to the server
 */
export function Send(topic: string, data?: any) {
  // If the websocket is dead, return
  if (ws.readyState !== ws.OPEN) return

  return new Vow((Observed, Listen, resolve, reject) => {
    if (Observed) {
      const listener = Listen()
      listener.then(resolve).catch(reject)
      data = [topic, listener.id, data]
      topic = 'v'
    }

    const json = CircularJSON.stringify(data)
    const transport = `${topic}${json ? ':' + json : ''}`

    ws.send(
      injectify.info.server.compression
        ? `#${pako.deflate(transport, { to: 'string' })}`
        : transport
    )
  })
}

/**
 * Ping the server
 * @param callback Callback once the ping is complete
 */
export function Ping(callback?: Function) {
  const start = +new Date()
  Send('ping').then(() => {
    callback(+new Date() - start)
  })
  injectify
}

export * from './Topics'
export { default as Vow } from './Vow'
export { default as Listener } from './Listener'
