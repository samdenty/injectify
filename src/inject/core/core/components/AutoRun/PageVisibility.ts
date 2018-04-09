import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify

export default function PageVisibility() {
  const { global } = injectify
  if (injectify.info.platform === 'browser') {
    // Make sure it's not already listening
    if (global.listeners.visibility) return

    // Set a global variable to prevent listener from being called multiple times
    global.listeners.visibility = true

    let listener
    let focusChange = () => injectify.session.send()

    // Get the correct hidden listener
    if ('hidden' in document) {
      listener = 'visibilitychange'
    } else if ('mozHidden' in document) {
      listener = 'mozvisibilitychange'
    } else if ('webkitHidden' in document) {
      listener = 'webkitvisibilitychange'
    } else if ('msHidden' in document) {
      listener = 'msvisibilitychange'
    } else {
      window.onpageshow = window.onpagehide = window.onfocus = window.onblur = focusChange
    }

    // Add listener
    if (listener) document.addEventListener(listener, focusChange)
  }
}
