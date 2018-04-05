import { Module, injectify, ServerExecution } from '../../../definitions/module'
declare const $: ServerExecution

/**
 * Call the embed module with the YouTube embed
 */
let autoplay = ''
if (Module.params !== false) autoplay = '?autoplay=true'
if (injectify.info.platform === 'browser') {
  injectify
    .module('embed', 'https://www.youtube.com/embed/dQw4w9WgXcQ' + autoplay)
    .then((embed) => {
      Module.resolve(embed)
    })
} else {
  injectify
    .module('embed', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    .then((embed) => {
      Module.resolve(embed)
    })
}
