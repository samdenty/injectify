import { Injectify } from '../../../definitions/core'
declare const injectify: typeof Injectify

export default function(enable?: boolean) {
  if (typeof enable !== 'undefined') {
    if (enable && injectify.global.listeners.devtools) return
    if (enable === false) {
      clearInterval(injectify.global.listeners.devtools)
      return
    }
  } else if (injectify.global.listeners.devtools) {
    return
  }

  let emit = (open: boolean, orientation: null | string) => {
    window.dispatchEvent(new CustomEvent('devtoolschange', {
      detail: {
        open,
        orientation
      }
    }))
  }

  injectify.global.listeners.devtools = setInterval(() => {
    let mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    let widthThreshold = window.outerWidth - window.innerWidth > 160
    let heightThreshold = window.outerHeight - window.innerHeight > 160
    let orientation: any = widthThreshold ? 'vertical' : 'horizontal'

    if (!mobile && !(heightThreshold && widthThreshold) &&
      (((<any>window).Firebug && (<any>window).Firebug.chrome && (<any>window).Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
      if (!injectify.devtools.open || injectify.devtools.orientation !== orientation) {
        emit(true, orientation)
      }

      injectify.devtools.open = true
      injectify.devtools.orientation = orientation
    } else {
      if (injectify.devtools.open) {
        emit(false, null)
      }

      injectify.devtools.open = false
      injectify.devtools.orientation = null
    }
  }, 500)
}
