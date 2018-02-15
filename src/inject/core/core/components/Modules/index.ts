import { Injectify } from '../../../definitions/core'
import Loader from './Loader'
import LoadJS from '../../lib/LoadJS'
declare const injectify: typeof Injectify
const Guid = require('guid')

export default class {
  static loadModule(name: string, params?: any) {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      let token = Guid.create()
      /**
       * Add the Promise references
       */
      injectify.setState({
        modules: {
          ...injectify.global.modules,
          callbacks: {
            ...injectify.global.modules.callbacks,
            [token]: {
              resolve: resolve,
              reject: reject
            }
          }
        }
      })
      /**
       * Emit to server
       */
      injectify.send('module', {
        name: name,
        token: token,
        params: params
      })
    })
  }

  static loadApp(name: string, params?: any) {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      let type = 'production.min.js'
      if (injectify.debug) type = 'development.js'
      LoadJS([
        `https://cdnjs.cloudflare.com/ajax/libs/react/16.2.0/umd/react.${type}`,
        `https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.2.0/umd/react-dom.${type}`
      ]).then(() => {
        injectify.module(<any>name, params).then(resolve).catch(reject)
      }).catch(error => {
        injectify.error(error)
        reject(error)
      })
    })
  }

  static loader = Loader
}