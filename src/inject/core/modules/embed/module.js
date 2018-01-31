var id = +new Date
var hidden = false
var url

/**
 * Parse module paramters
 */
if (typeof module.params == 'object') {
    if (module.params.url) url = module.params.url
    if (module.params.hidden) hidden = module.params.hidden
} else if (typeof module.params == 'string') {
    url = module.params
}

/**
 * Detect platform and handle accordingly
 */
if (injectify.info.platform === 'browser') {
    /**
     * Create an iframe (instead of an embed)
     * - <embed> tag plays up in IE
     * - difficulties when dynamically changing the src attribute
     */
    var embed = document.createElement('iframe')
    if (url) embed.src = url

    /**
     * Set embed attributes
     */
    embed.id = id
    embed.frameBorder = 0

    /**
     * Set the style
     */
    if (hidden) {
        embed.style = 'width: 100px; height: 100px; left: -100vw; top: -100vh; opacity: 0.01; position: absolute;'
    } else {
        embed.style = 'width: 100vw; height: 100vh;'

        /**
         * Allow the embed to go fullscreen
         */
        embed.setAttribute('allowfullscreen', 'allowfullscreen')
        embed.setAttribute('mozallowfullscreen', 'mozallowfullscreen')
        embed.setAttribute('msallowfullscreen', 'msallowfullscreen')
        embed.setAttribute('oallowfullscreen', 'oallowfullscreen')
        embed.setAttribute('webkitallowfullscreen', 'webkitallowfullscreen')
    }

    /**
     * Set the viewport correctly - otherwise page will appear "zoomed-out"
     */
    var meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=device-width, initial-scale=1.0'

    /**
     * Insert the embed into the DOM
     */
    if (hidden) {
        document.body.appendChild(embed)
    } else {
        document.body.innerHTML = embed.outerHTML
        document.head.innerHTML = meta.outerHTML
    }

    /**
     * Prevent interaction with the embed
     */
    if (!hidden && typeof module.params == 'object' && module.params.interaction == false) {
        var blocker = document.createElement('div')
        blocker.style = 'position: absolute; width: 100vw; height: 100vh; top: 0; z-index: 999'
        document.body.appendChild(blocker)
    }
    if (!hidden) {
        document.body.style = `
        margin: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        rickrolled: true !important;`
    }
    module.return(document.getElementById(id))
} else {
    /**
     * Create a new window
     */
    var popup = window.open(url)
    /**
     * Hide the window
     */
    if (injectify.info.platform === 'electron' && hidden) popup.minimize()
    module.return(false)
}