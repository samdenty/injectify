import { Injectify } from '../../definitions/core'
declare const injectify: typeof Injectify
const ws: WebSocket = (<any>window).ws || (<any>window).i‍// <- invisible space
import Promise from './Promise'

function ErrorGuarder(ErrorGuarded: Function, reject?: Function) {
  if (ws.url.indexOf('$') !== -1) {
    // Escape any parent try catch statements
    setTimeout(() => {
      ErrorGuarded()
    })
  } else {
    try {
      ErrorGuarded()
    } catch (e) {
      if (reject) reject(e)
      // injectify.error(e.stack)
      // console.error(e.stack)
    }
  }
}

/**
 * Error guards code and sends errors to the server
 */
export default (code: Function, toplevel?: boolean) => {
  if (!toplevel) {
    return new Promise((resolve, reject) => {
      ErrorGuarder(code, reject)
    })
  } else {
    ErrorGuarder(code)
  }
}
