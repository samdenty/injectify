import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify

export default function SessionInfo() {
  const { global } = injectify

  if (global.listeners.timed.active) return
  global.listeners.timed.active = true

  function sessionInfo() {
    clearTimeout(global.listeners.timed.timer)
    injectify.session.send()
    global.listeners.timed.timer = setTimeout(sessionInfo, 1000)
  }
  sessionInfo()
}
