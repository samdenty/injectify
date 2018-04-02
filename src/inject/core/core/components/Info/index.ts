import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify
import { ws } from '../../components/Websockets'
declare const __client, __server: any

export { default as SessionInfo } from './Session'

export function Info(): Injectify.info {
  /**
   * Read the project name from the URL
   */
  let project = ws.url.split('?')[1]
  /// #if DEBUG
  project = project.substring(1)
  /// #endif
  /**
   * Parse the server URL from the websocket url
   */
  let url = ws.url.split('/')
  let protocol = `http${url[0] === 'wss:' ? 's' : ''}://`
  let server = protocol + url[2]

  return {
    project: atob(project),
    server: {
      websocket: ws.url,
      url: server,
      ...__server
    },
    duration: injectify.duration,
    debug: injectify.debug,
    ...__client
  }
}
