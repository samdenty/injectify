/**
 * Create a new script element
 */
var script = document.createElement('script')

/**
 * Set the src attribute of the script element
 */
if (typeof module.params == 'object') {
    if (module.params.url) script.src = module.params.url
} else {
    script.src = module.params
}

/**
 * Append the script element to the DOM
 */
document.body.appendChild(script)

/**
 * Callback the module
 */
script.onload = function() {
    module.return(true)
}

script.onerror = function() {
    module.return(false)
}