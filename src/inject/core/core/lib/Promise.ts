import { Injectify } from '../../definitions/core'
declare const injectify: typeof Injectify
import * as Promise from 'promise-polyfill'

Promise._unhandledRejectionFn = (e) => {
  if (injectify) {
    injectify.error(e.stack)
  }
}

export default Promise
