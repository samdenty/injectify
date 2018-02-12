import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify
declare const ws: WebSocket
declare const client: any

export { default as SessionInfo } from './Session'

export function Info(): Injectify.info {
  /**
   * Read the project name from the URL
   */
  let project = ws.url.split('?')[1]
  if (injectify.debug) project = project.substring(1)
  /**
   * Parse the server URL from the websocket url
   */
  let url = ws.url.split('/')
  let protocol = 'https://'
  if (url[0] === 'ws:') protocol = 'http://'
  let server = protocol + url[2]

  return {
    'project': atob(project),
    'server': {
      'websocket': ws.url,
      'url': server
    },
    'id': client.id,
    'platform': client.platform,
    'duration': injectify.duration,
    'debug': injectify.debug,
    'os': client.os,
    'ip': client.ip,
    'headers': client.headers,
    'user-agent': client.agent
  }
}