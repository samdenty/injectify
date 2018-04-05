import { Module, injectify } from '../../../definitions/module'

let id = (+new Date()).toString()
let hidden = false
let url

/**
 * Parse module paramters
 */
if (typeof Module.params == 'object') {
    if (Module.params.url) url = Module.params.url
    if (Module.params.hidden) hidden = Module.params.hidden
} else if (typeof Module.params == 'string') {
    url = Module.params
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
    let embed = document.createElement('iframe')
    if (url) embed.src = url

    /**
     * Set embed attributes
     */
    embed.id = id
    embed.frameBorder = '0'

    /**
     * Set the style
     */
    if (hidden) {
        embed.setAttribute('style', 'width: 100px; height: 100px; left: -100vw; top: -100vh; opacity: 0.01; position: absolute;')
    } else {
        embed.setAttribute('style', 'width: 100vw; height: 100vh;')

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
    let meta = document.createElement('meta')
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
    if (!hidden && typeof Module.params == 'object' && Module.params.interaction == false) {
        let blocker = document.createElement('div')
        embed.setAttribute('style', 'position: absolute; width: 100vw; height: 100vh; top: 0; z-index: 999')
        document.body.appendChild(blocker)
    }
    if (!hidden) {
        embed.setAttribute('style', `
        margin: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        rickrolled: true !important;`)
    }
    Module.resolve(document.getElementById(id))
} else {
    /**
     * Create a new window
     */
    let popup: any = window.open(url)
    /**
     * Hide the window
     */
    if (injectify.info.platform === 'electron' && hidden) popup.minimize()
    Module.resolve()
}
