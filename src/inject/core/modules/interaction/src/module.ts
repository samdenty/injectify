import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify } : ModuleTypings

let mouse = true
let keyboard = true

/**
 * Parse the parameters
 */
if (typeof Module.params === 'object') {
    if (Module.params.mouse == false) mouse = false
    if (Module.params.keyboard == false) keyboard = false
}

/**
 * Handle click events
 */
let blocker: any = document.createElement('div')
if (mouse) {
    blocker.style = 'height: 200vh !important; width: 200vw !important; position: fixed !important; top: 0 !important; left: 0 !important; z-index: 99999999 !important'
    document.body.appendChild(blocker)
    blocker.onclick = blocker.onmousedown = function() {
        document.body.removeChild(blocker)
        if (keyboard) {
            document.body.onkeydown = null
            document.onkeydown = null
        }
        Module.resolve('mouse')
    }
}

/**
 * Handle keyboard events
 */
if (keyboard) {
    // @ts-ignore
    document.body.onkeydown = document.onkeydown = function () {
        if (mouse && document.body.contains(blocker)) {
            document.body.removeChild(blocker)
        }
        document.body.onkeydown = null
        document.onkeydown = null
        Module.resolve('keyboard')
    }
}