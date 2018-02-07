import { Injectify } from './core'

export default class {
  Module: {
    /**
     * The name the module was called as
     */
    name: string
    /**
     * The parameters passed to the module
     */
    params: any
    /**
     * Modules global state, persistent until the page is reloaded
     */
    state: any
    /**
     * Updates the module's global state
     * @param newState An object containing the new state
     */
    setState: Function
    /**
     * A unique token generated every time a module is called
     */
    token: string
    /**
     * Resolve the modules calling Promise
     */
    resolve(data?: any): Function
    /**
     * Reject the modules calling Promise
     */
    reject(data?: any): Function
    /**
     * Whether or not the modules callback has been resolved
     */
    resolved: boolean
  }
  injectify: typeof Injectify
}