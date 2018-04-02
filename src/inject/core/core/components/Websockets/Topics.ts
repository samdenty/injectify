import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify

export function Listen(topic: string, callback, once: boolean = false) {
  injectify.global.listeners.websocket[topic] = {
    callback: data => {
      callback(data)
    },
    raw: callback,
    once: once
  }
}

export function Unlisten(topic: string, callback?: any) {
  /**
   * If the listener is missing, return false
   */
  if (!injectify.global.listeners.websocket[topic] ||
    !injectify.global.listeners.websocket[topic].callback ||
    !injectify.global.listeners.websocket[topic].raw ||
    (
      callback &&
      callback.toString() !== injectify.global.listeners.websocket[topic].raw.toString()
    )
  ) return false
  return delete injectify.global.listeners.websocket[topic]
}
