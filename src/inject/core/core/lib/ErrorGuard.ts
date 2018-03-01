import { Injectify } from '../../definitions/core'
declare const injectify: typeof Injectify
import Promise from './Promise'

function ErrorGuarder(ErrorGuarded: Function, reject?: Function) {
  if ((<any>window).ws && (<any>window).ws.url.includes('$')) {
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
