import { Injectify } from '../../definitions/core'
declare const injectify: typeof Injectify
import * as PromisePolyfill from 'promise-polyfill'
import * as Guid from 'guid'

PromisePolyfill._unhandledRejectionFn = (e) => {
  if (injectify) {
    injectify.error(e.stack)
  }
}

export default PromisePolyfill

/**
 * Promise-like replacement that allows the handler to check
 * whether it's being observed (eg. has .then() or .catch())
 */
interface Result extends Promise<any> {
  id: string
}
type Vowed = (
  Observed: boolean,
  Listen: () => Result,
  resolve: () => any,
  reject: () => any
) => void

export class Vow {
  __Vow__: true
  private callbacks = null
  private serverHandler() {
    const id = Guid.create().value
    const promise = new PromisePolyfill((resolve, reject) => {
      injectify.global.vows[id] = {
        resolve,
        reject
      }
    })
    promise.id = id
    return promise
  }

  constructor(handler: Vowed) {
    this.__Vow__ = true
    const callbacks = (this.callbacks = {
      resolve: null,
      reject: null
    })
    setTimeout(() => {
      const Observed = !!(callbacks.resolve || callbacks.reject)
      handler(
        Observed,
        this.serverHandler,
        (...args) => {
          if (typeof callbacks.resolve === 'function')
            callbacks.resolve.apply(this, args)
        },
        (...args) => {
          if (typeof callbacks.reject === 'function')
            callbacks.reject.apply(this, args)
        }
      )
    })
  }

  public then(callback: Function) {
    this.callbacks.resolve = callback
    return this
  }

  public catch(callback: Function) {
    this.callbacks.reject = callback
    return this
  }
}
