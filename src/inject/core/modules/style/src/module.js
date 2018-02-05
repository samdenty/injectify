/**
 * Create a style element (instead of an embed)
 */
var style = document.createElement('style')
var id = +new Date
var css = Module.params

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