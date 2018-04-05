export interface ServerResponse {
  /**
   * The name the module was called as
   */
  name: string
  /**
   * A unique token associated with the request
   */
  token: string
  /**
   * Time in milliseconds it took for the server to handle the request.
   * Only available if the client is in debug mode
   */
  time?: number
  /**
   * The response JS string
   */
  script?: string
  /**
   * If any errors occured whilst handling the request
   */
  error?: {
    /**
     * A fixed error-code identifying what went wrong
     */
    code: string
    /**
     * A description of the error
     */
    message: string
  }
}
