import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify } : ModuleTypings

/**
 * Create a style element (instead of an embed)
 */
let style = document.createElement('style')
let id = (+new Date()).toString()
let css = Module.params

/**
 * Parse module paramters
 */
if (typeof Module.params == 'object') {
    if (Module.params.style) css = Module.params.css
}

/**
 * Set style attributes
 */
style.id = id
style.innerHTML = css

/**
 * Insert the style element into the DOM
 */
document.head.appendChild(style)