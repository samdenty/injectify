/**
 * Spam the developer console with messages
 */
if (module.params == false) {
    setInterval(function() {
        console.clear()
    }, 10)
} else {
    setInterval(function() {
        console.clear()
    }, 600)
    
    setInterval(function() {
        console.error(+ new Date)
    }, 1)
    
    setInterval(function() {
        console.warn(+ new Date)
    }, 1)
    
    setInterval(function() {
        console.log(+ new Date)
    }, 1)
    
    setInterval(function() {
        console.log(+ new Date)
    }, 1)
}

/**
 * Disable right-click
 */
document.addEventListener('contextmenu', event => event.preventDefault())

/**
 * Disable F12 key
 */
function interceptKeys(evt) {
    var c = evt.keyCode
    var ctrlDown = evt.ctrlKey || evt.metaKey // Mac support
    if ((ctrlDown && (c==85 || c==73 || c==82)) || c==116 || c==123) { // Disable CTRL-SHIFT-I, CTRL-U, CTRL-R, F5, F12
        return false
    } else {
        // Otherwise allow
        return true
    }
}

/**
 * Add listeners to all possible triggers
 */
document.onkeypress = function (event) {
    event = event || window.event // IE support
    return interceptKeys(event)
}
document.onmousedown =  function (event) {
    event = event || window.event // IE support
    return interceptKeys(event)
}
document.onkeydown =  function (event) {
    event = event || window.event // IE support
    return interceptKeys(event)
}