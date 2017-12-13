/**
 * Create a new script element
 */
var script = document.createElement('script')

/**
 * Set the src attribute of the script element
 */
script.src = module.params

/**
 * Append the script element to the DOM
 */
document.body.appendChild(script)