/**
 * Import the Typescript typings
 */
import { Module, injectify, ServerExecution } from '../../../definitions/module'
declare const $: ServerExecution

/**
 * Place the Javascript here you want your module to execute
 * Make sure to add loads of comments!
 *
 * You can also utilise the Injectify API. Some examples
 */

/**
 * Gets details about the current module
 */
console.log(Module)

/**
 * Execute server-side code
 */

console.log(`Here's some info about the server:`, $.FUNCTION(`
  return {
    platform: process.platform,
    uptime: process.uptime(),
  }
`))

console.log('Lodash example', $.FUNCTION(`
  const _ = require('lodash')
  return _.find([
    { 'user': 'barney',  'age': 36, 'active': true },
    { 'user': 'fred',    'age': 40, 'active': false },
    { 'user': 'pebbles', 'age': 1,  'active': true }
  ], 'active')
`))


/**
 * Resolve the modules promise
 */
Module.resolve('returned value')

/**
 * Reject the modules promise
 */
// Module.reject('error message')

/**
 * Load another module
 */
// injectify.module('test')

/**
 * Ping the server
 */
injectify.ping(time => {
  console.log(time)
})
