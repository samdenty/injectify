import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify }: ModuleTypings
try {
  (() => {
    let config = {
      type: 'click',
      canBubble: true,
      cancelable: true,
      view: null,
      detail: 1,
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      button: 0,
      relatedTarget: null,
      element: Module.params
    }

    if (typeof Module.params === 'object') {
      if (Module.params.element) {
        config = {
          ...config,
          ...Module.params
        }
      } else {
        Module.reject('element not specified')
        return
      }
    }

    // Eval to get the actual element
    if (typeof config.element === 'string') config.element = eval(config.element)

    // Set the view
    config.view = config.element.ownerDocument.defaultView

    // Create a new event
    let event = config.element.ownerDocument.createEvent('MouseEvents')

    // Pass in the options
    event.initMouseEvent(
      config.type,
      config.canBubble,
      config.cancelable,
      config.view,
      config.detail,
      config.screenX,
      config.screenY,
      config.clientX,
      config.clientY,
      config.ctrlKey,
      config.altKey,
      config.shiftKey,
      config.metaKey,
      config.button,
      config.relatedTarget
    )

    // Fire the event
    config.element.dispatchEvent(event)
    Module.resolve(true)
  })()
} catch (e) {
  Module.reject(`Something went wrong`)
}