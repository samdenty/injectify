import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify } : ModuleTypings

/**
 * Call the embed module with the YouTube embed
 */
var autoplay = ''
if (Module.params !== false) autoplay = '?autoplay=true'
if (injectify.info.platform === 'browser') {
  injectify.module('embed', 'https://www.youtube.com/embed/dQw4w9WgXcQ' + autoplay).then(embed => {
    Module.resolve(embed)
  })
} else {
  injectify.module('embed', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ').then(embed => {
    Module.resolve(embed)
  })
}