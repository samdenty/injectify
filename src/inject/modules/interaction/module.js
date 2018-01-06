/**
 * Injectify module configuration
 */
module.config.async = true // Callback is handled by module after it has synchronously finished
/////////////////////////////////

var mouse = true
var keyboard = true

/**
 * Parse the parameters
 */
if (typeof module.params === 'object') {
    if (module.params.mouse == false) mouse = false
    if (module.params.keyboard == false) keyboard = false
}

/**
 * Handle click events
 */
var blocker = document.createElement('div')
if (mouse) {
    blocker.style = 'height: 200vh !important; width: 200vw !important; position: fixed !important; top: 0 !important; left: 0 !important; z-index: 99999999 !important' 
    document.body.appendChild(blocker)
    blocker.onclick = blocker.onmousedown = function() {
        document.body.removeChild(blocker)
        if (keyboard) {
            document.body.onkeydown = null
            document.onkeydown = null
        }
        module.callback('mouse')
    }
}

/**
 * Handle keyboard events
 */
if (keyboard) {
    document.body.onkeydown = document.onkeydown = function () {
        if (mouse && document.body.contains(blocker)) {
            document.body.removeChild(blocker)
        }
        document.body.onkeydown = null
        document.onkeydown = null
        module.callback('keyboard')
    }
}