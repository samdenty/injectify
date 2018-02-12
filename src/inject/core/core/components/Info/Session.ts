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
      /**
       * Return object
       */
      return {
        window: {
          url: window.location.href,
          title: document.title ? document.title : window.location.host + window.location.pathname,
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
    injectify.send('i', this.info)
    injectify.debugLog('session-info', 'debug', 'Delivered current state to server')
  }
}