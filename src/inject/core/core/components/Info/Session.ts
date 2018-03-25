import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify

export default class {
  static get info(): Injectify.session.Info {
    if (injectify.info.platform === 'browser') {
      /**
       * Get the correct document.hidden method
       */
      let hidden = 'hidden'
      if ('mozHidden' in document) {
        hidden = 'mozHidden'
      } else if ('webkitHidden' in document) {
        hidden = 'webkitHidden'
      } else if ('msHidden' in document) {
        hidden = 'msHidden'
      }
      let title = document.title
      if (!title) {
        if (window.location.href.slice(0,7) === 'file://') {
          let path = window.location.href.split('/')
          title = decodeURIComponent(path[path.length - 1])
        } else {
          title = decodeURIComponent(window.location.href)
        }
      }
      /**
       * Return object
       */
      return {
        window: {
          url: window.location.href,
          title: title,
          active: !document[hidden],
        },
        devtools: injectify.devtools
      }
    } else {
      return {
        window: {
          url: eval(`require('file-url')(process.cwd())`),
          title: process.cwd(),
          active: true,
        },
        devtools: injectify.devtools
      }
    }
  }

  static send() {
    let info = this.info
    let stringified = JSON.stringify(this.info)
    if (injectify.global.listeners.timed.prevState !== stringified) {
      injectify.send('i', info)
      /// #if DEBUG
      injectify.debugLog('session-info', 'debug', 'Delivered current state to server')
      /// #endif
    }
    injectify.global.listeners.timed.prevState = stringified
  }
}
