var embed = document.createElement('embed')
/**
 * Make the embed 100% of the viewport
 */
embed.style = 'width: 100vw; height: 100vh;'
embed.src = module.params

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
document.body.style = `
margin: 0 !important;
width: 100% !important;
height: 100% !important;
overflow: hidden !important;
rickrolled: true !important;`