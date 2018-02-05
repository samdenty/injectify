import { Injectify } from './core'

export default class {
  Module: {
    /**
     * The name the module was called as
     */
    name: string
    /**
     * A unique token generated every time a module is called
     */
    token: string
    /**
     * The callback passed to the module
     */
    callback: Function
    /**
     * The data the module returned
     */
    returned: any
    /**
     * The module configuration
     */
    config: {
      /**
       * If set to true, the module's callback won't be called until the module async calls it
       */
      async: boolean
    }
    /**
     * The parameters passed to the module
     */
    params: any
    /**
     * Synchronously return module data
     */
    return(any): Function
  }
  injectify: typeof Injectify
}