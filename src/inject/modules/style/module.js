/**
 * Create a style element (instead of an embed)
 */
var style = document.createElement('style')
var id = +new Date
var css = module.params

/**
 * Parse module paramters
 */
if (typeof module.params == 'object') {
    if (module.params.style) css = module.params.css
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