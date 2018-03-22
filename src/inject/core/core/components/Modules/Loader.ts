import { Injectify } from '../../../definitions/core'
import Core from '../../../definitions/module'
declare const injectify: typeof Injectify
import ErrorGuard from '../../lib/ErrorGuard'
import * as time from 'pretty-ms'

export default class {
  constructor(data: Core['ServerResponse']) {
    /**
     * Create the module object
     */
    const call = injectify.global.modules.calls[data.token]
    var Module: Core['Module'] = {
      name: data.name,
      token: data.token,
      params: call.params,
      time: data.time || null,
      resolve: (data?: any) => {
        Module.resolved = true
        if (call) {
          call.resolve(data)
        } else {
          injectify.debugLog(
            'module',
            'error',
            `Failed to find injectify.global.modules.calls[${
              Module.token
            }], could not resolve Promise`
          )
        }
      },
      reject: (data?: any) => {
        Module.resolved = true
        if (call) {
          call.reject(data)
        } else {
          injectify.debugLog(
            'module',
            'error',
            `Failed to find injectify.global.modules.calls[${
              Module.token
            }], could not reject Promise`
          )
        }
      },
      resolved: false,
      setState: (newState) => {
        injectify.setState({
          modules: {
            ...injectify.global.modules,
            states: {
              ...injectify.global.modules.states,
              [data.name]: newState
            }
          }
        })
      },
      get state() {
        return injectify.global.modules.states[data.name]
      }
    }

    if (!data.error) {
      /**
       * Evaluate the script
       */
      ErrorGuard(() => {
        eval(data.script)
      })

      /**
       * Display verbose output
       */
      injectify.debugLog(
        'module',
        'warn',
        `Executed module "${Module.name}" ${
          Module.time ? `- ${time(Module.time)} ` : ''
        }`,
        Module
      )
    } else {
      if (data.error.message)
        injectify.error(`📦 ${data.error.message}`, Module)
      Module.reject(data.error.message)
    }
  }
}
