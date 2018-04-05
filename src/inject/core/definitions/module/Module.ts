export interface Module {
  /**
   * The name the module was called as
   */
  name: string
  /**
   * The parameters passed to the module
   */
  params: any
  /**
   * A unique token generated every time a module is called
   */
  token: string
  /**
   * Time in milliseconds it took for the server to handle the request.
   * Only available if the client is in debug mode
   */
  time?: number
  /**
   * Resolve the modules calling Promise
   */
  resolve(data?: any): void
  /**
   * Reject the modules calling Promise
   */
  reject(data?: any): void
  /**
   * Whether or not the modules callback has been resolved
   */
  resolved: boolean
  /**
   * Modules global state, persistent until the page is reloaded
   */
  state: any
  /**
   * Updates the module's global state
   * @param newState An object containing the new state
   */
  setState: Function
}
