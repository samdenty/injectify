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
  $: {
    /**
     * Performs an expression / function on the server and returns the value. Type checking is disabled
     *
     * This is ran server-side, invisible to the client.
     *
     * @example
     * $._(2 > 1) // true
     * $._({ a: 'b' }) // {"a":"b"}
     * $._([1,2,3]) // [1,2,3]
     * $._('test') // "test"
     * $._(() => { return 'func value'})) // "func value"
     */
    _(data: Function | String | Object | Number | Boolean | any): any

    /**
     * Executes shell commands on the server and returns output
     *
     * This is ran server-side, invisible to the client.
     * @example
     * $.SHELL("echo Hello world")
     * // Compiles to
     * "Hello world"
     * @returns {string} stdout of the command
     */
    SHELL(commands: String): String

    /**
     * Runs a NodeJS code snippet on the server
     *
     * This is ran server-side, invisible to the client.
     *
     * @example
     * $.FUNCTION(() => {
     *  const os = require('os')
     *  return os.uptime()
     * })
     * // Compiles to
     * 4523
     * @example
     * // Pass as a string to prevent Typescript errors
     * $.FUNCTION(`
     *  const os = require('os')
     *  return os.uptime()
     * `)
     * // Compiles to
     * 4523
     * @returns {any} The return value of the function
     */
    FUNCTION(script: String | Function): any

    /**
     * Returns a javascript object populated with server-processed keys
     * Type-checking - If the result is not an object, the module won't execute
     *
     * This is ran server-side, invisible to the client.
     *
     * @example
     * $.OBJECT({
     *   uptime: process.uptime()
     * })
     * // Compiles to
     * {"uptime":4523}
     * @example
     * // Pass as a string to prevent Typescript errors
     * $.OBJECT(`{
     *   uptime: process.uptime()
     * }`)
     * // Compiles to
     * {"uptime":4523}
     */
    OBJECT(data: String | Object): {[key: string]: any}

    /**
     * Returns a number evaluated from an expression
     * Type-checking - If the result is not a number, the module won't execute
     *
     * This is ran server-side, invisible to the client.
     *
     * @example
     * $.NUMBER(+new Date())
     * // Compiles to
     * 1519876291276
     * @example
     * // Pass as a string to prevent Typescript errors
     * $.NUMBER(`+new Date() / process.uptime()`)
     * // Compiles to
     * 1519876291276
     */
    NUMBER(data: Number | String): Number

    /**
     * Returns a string evaluated from an expression
     * Type-checking - If the result is not a string, the module won't execute
     *
     * This is ran server-side, invisible to the client.
     *
     * @example
     * $.STRING(`The Date is ${new Date()}`)
     * // Compiles to
     * "The Date is Thu Mar 01 2018"
     * @example
     * $.STRING("`The Date is ${new Date()}`")
     * // Compiles to
     * "The Date is Thu Mar 01 2018"
     */
    STRING(data: String): String

    /**
     * Returns a array evaluated from an expression.
     * Type-checking - If the result is not an array, the module won't execute
     *
     * This is ran server-side, invisible to the client.
     *
     * @example
     * $.ARRAY([+new Date(), 1+2])
     * // Compiles to
     * [1519876291276, 3]
     * @example
     * $.ARRAY("[+new Date(), 1+2]")
     * // Compiles to
     * [1519876291276, 3]
     */
    ARRAY(data: any[] | string): any[]

    /**
     * Returns a boolean evaluated from an expression.
     * Type-checking - If the result is not an array, the module won't execute
     *
     * This is ran server-side, invisible to the client.
     *
     * @example
     * $.BOOLEAN(2 > 1)
     * // Compiles to
     * true
     * @example
     * $.BOOLEAN(`2 > 1`)
     * // Compiles to
     * true
     */
    BOOLEAN(data: boolean | string): boolean

    /**
     * Writes data to the servers filesystem
     *
     * This is ran server-side, invisible to the client.
     *
     * @example
     * $.WRITE(`client-log-${injectify.info.ip.query}`, injectify.info)
     * // No output
     */
    WRITE(filename: string, data: string): void
  }
}