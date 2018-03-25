import { Injectify } from '../../definitions/core'
declare const injectify: typeof Injectify

export default (cpr: boolean = false) => {
  if (cpr) injectify.send('heartbeat')
  /**
   * Ping the server every 10 seconds to sustain the connection
   */
  clearInterval(injectify.global.listeners.pinger)
  injectify.global.listeners.pinger = setInterval(() => {
    injectify.send('heartbeat')
  }, 8 * 1000)
}
