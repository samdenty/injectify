/**
 * Call the embed module with the YouTube embed
 */
var autoplay = ''
if (module.params !== false) autoplay = '?autoplay=true'
injectify.module('embed', 'https://www.youtube.com/embed/dQw4w9WgXcQ' + autoplay)
module.return(true)