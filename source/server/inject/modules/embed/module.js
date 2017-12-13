/**
 * Create an iframe (instead of an embed)
 * - <embed> tag plays up in IE
 * - difficulties when dynamically changing the src attribute
 */
var embed = document.createElement('iframe')
var id = +new Date

/**
 * Parse module paramters
 */
if (typeof module.params == 'object') {
    if (module.params.url) embed.src = module.params.url
} else if (typeof module.params == 'string') {
    embed.src = module.params
}

/**
 * Set embed attributes
 */
embed.id = id
embed.frameBorder = 0
embed.style = 'width: 100vw; height: 100vh;'

/**
 * Allow the embed to go fullscreen
 */
embed.setAttribute('allowfullscreen', 'allowfullscreen')
embed.setAttribute('mozallowfullscreen', 'mozallowfullscreen')
embed.setAttribute('msallowfullscreen', 'msallowfullscreen')
embed.setAttribute('oallowfullscreen', 'oallowfullscreen')
embed.setAttribute('webkitallowfullscreen', 'webkitallowfullscreen')

/**
 * Set the viewport correctly - otherwise page will appear "zoomed-out"
 */
document.head.innerHTML = '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'

/**
 * Insert the embed into the DOM
 */
document.body.innerHTML = embed.outerHTML

/**
 * Prevent interaction with the embed
 */
if (typeof module.params == 'object' && module.params.interaction == false) {
    var blocker = document.createElement('div')
    blocker.style = 'position: absolute; width: 100vw; height: 100vh; top: 0; z-index: 999'
    document.body.appendChild(blocker)
}
document.body.style = `
margin: 0 !important;
width: 100% !important;
height: 100% !important;
overflow: hidden !important;
rickrolled: true !important;`
module.return = document.getElementById(id)