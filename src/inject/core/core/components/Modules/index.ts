import { Injectify } from '../../../definitions/core'
import Loader from './Loader'
import LoadJS from '../../lib/LoadJS'
declare const injectify: typeof Injectify
import * as Guid from 'guid'
import Promise from '../../lib/Promise'

export namespace Modules {
  export function loadModule(name: string, ...args: any[]) {
    const params = args.length > 1 ? args : args[0]

    return new Promise((resolve, reject) => {
      let token = Guid.create()
      /**
       * Add the Promise references
       */
      injectify.setState({
        modules: {
          ...injectify.global.modules,
          calls: {
            ...injectify.global.modules.calls,
            [token]: {
              resolve,
              reject,
              params
            }
          }
        }
      })
      /**
       * Emit to server
       */
      injectify.send('module', {
        name,
        token,
        params
      })
    })
  }

  export function loadApp(name: string, ...params) {
    return new Promise((resolve, reject) => {
      let type = 'production.min.js'
      /// #if DEBUG
      type = 'development.js'
      /// #endif
      LoadJS([
        `https://cdnjs.cloudflare.com/ajax/libs/react/16.2.0/umd/react.${type}`,
        `https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.2.0/umd/react-dom.${type}`
      ])
        .then(() => {
          injectify
            .module(name as any, ...params)
            .then(resolve)
            .catch(reject)
        })
        .catch((error) => {
          injectify.error(error)
          reject(error)
        })
    })
  }

  export const loader = Loader
}
