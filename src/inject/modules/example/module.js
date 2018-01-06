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
 * SYNChronously returns a value to the module's callback
 */
module.return('returned value')

/**
 * ASYNChronously returns a value to the module's callback
 * 
 * You NEED to set `module.config.async = true` if the moduleis async,
 * or else the callback will return undefined
 */
module.callback('returned value')

/**
 * Load another module
 */
injectify.module('mymodule')

/**
 * Ping the server
 */
injectify.ping(time => {
    console.log(time)
})