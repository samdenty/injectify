import { Injectify } from '../../../definitions/core'
import Loader from './Loader'
import LoadJS from '../../lib/LoadJS'
declare const injectify: typeof Injectify
const Guid = require('guid')
import Promise from '../../lib/Promise'

export default class {
  static loadModule(name: string, params?: any) {
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

  static loadApp(name: string, params?: any) {
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