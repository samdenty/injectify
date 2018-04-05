import { Module, injectify } from '../../../definitions/module'

/**
 * Create a new script element
 */
let script = document.createElement('script')

/**
 * Set the src attribute of the script element
 */
if (typeof Module.params == 'object') {
    if (Module.params.url) script.src = Module.params.url
} else {
    script.src = Module.params
}

/**
 * Append the script element to the DOM
 */
document.body.appendChild(script)

/**
 * Callback the module
 */
script.onload = function() {
    Module.resolve(true)
}

script.onerror = function() {
    Module.reject(false)
}
