import { inject } from "./C:/Users/samde/AppData/Local/Microsoft/TypeScript/2.6/node_modules/@types/async";

/**
 * Call the embed module with the YouTube embed
 */
var autoplay = ''
if (module.params !== false) autoplay = '?autoplay=true'
if (injectify.info.platform === 'browser') {
  injectify.module('embed', 'https://www.youtube.com/embed/dQw4w9WgXcQ' + autoplay)
} else {
  injectify.module('embed', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
}
module.return(true)