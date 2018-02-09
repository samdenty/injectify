import { Injectify } from '../../definitions/core'
declare const injectify: typeof Injectify

export default class {
  constructor(data) {
    /**
     * Create the module object
     */
    var Module = {
      name: data.name,
      token: data.token,
      resolve: (data?: any) => {
        Module.resolved = true
        if (injectify.global.modules.callbacks[Module.token]) {
          injectify.global.modules.callbacks[Module.token].resolve(data)
        } else {
          injectify.debugLog('module', 'error', `Failed to find injectify.global.modules.callbacks[${Module.token}], could not resolve Promise`)
        }
      },
      reject: (data?: any) => {
        Module.resolved = true
        if (injectify.global.modules.callbacks[Module.token]) {
          injectify.global.modules.callbacks[Module.token].reject(data)
        } else {
          injectify.debugLog('module', 'error', `Failed to find injectify.global.modules.callbacks[${Module.token}], could not reject Promise`)
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
      eval(data.script)

      /**
       * Display verbose output
       */
      injectify.debugLog('module', 'warn', `Executed module "${Module.name}"`, Module)
    } else {
      if (data.error.message) injectify.error(`📦 ${data.error.message}`, Module)
      Module.reject(data.error.message)
    }
  }
}