/**
 * Import the Typescript typings
 */
import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify } : ModuleTypings

/**
 * Place the Javascript here you want your module to execute
 * Make sure to add loads of comments!
 *
 * You can also utilise the Injectify API. Some examples
 */

/**
 * Gets details about the current module
 */
console.log(module)

/**
 * Reject the modules promise
 */
Module.reject('error message')

/**
 * Resolve the modules promise
 */
Module.resolve('returned value')

/**
 * Load another module
 */
injectify.module('example')

/**
 * Ping the server
 */
injectify.ping(time => {
  console.log(time)
})