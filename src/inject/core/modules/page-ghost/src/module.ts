import ModuleTypings from '../../../definitions/module'
import _MutationObserver from './components/MutationObserver'
declare const { Module, injectify }: ModuleTypings

class PageGhost {
  state = {
    dom: null,
    activeElement: null
  }
  config = {
    enable: null,
    mouse: true,
    values: true
  }
  intervalTimer: any

  constructor() {
    if (Module.params instanceof Object) {
      this.config = {
        ...this.config,
        ...Module.params
      }
    } else if (typeof Module.params === 'boolean') {
      this.config.enable = Module.params
    }
    this.toggle(this.config.enable)
  }

  clearListeners() {
    clearInterval(this.intervalTimer)
    if (Module.state) {
      window.removeEventListener('mouseover', Module.state.mouseover)
      window.removeEventListener('mousemove', Module.state.mousemove)
      window.removeEventListener('mouseenter', Module.state.mousemove)
      window.removeEventListener('click', Module.state.click)
      window.removeEventListener('resize', Module.state.resize)
      window.removeEventListener('scroll', Module.state.scroll, true)
      if (Module.state.MutationObserver) Module.state.MutationObserver.disconnect()
    }
  }

  disable() {
    injectify.debugLog('page-ghost', 'warn', 'Disabled')
    this.clearListeners()
    Module.setState({
      enabled: false
    })
  }

  enable() {
    injectify.debugLog('page-ghost', 'warn', 'Enabled')
    this.clearListeners()
    Module.setState({
      ...Module.state,
      enabled: true,
      mousemove: this.mousemove,
      mouseover: this.mouseover,
      resize: this.resize,
      click: this.click,
      dom: {
        index: 0
      },
      MutationObserver: null,
      scroll: this.scroll
    })
    Module.state.MutationObserver = new _MutationObserver()
    window.addEventListener('mousemove', Module.state.mousemove)
    window.addEventListener('mouseover', Module.state.mouseover)
    window.addEventListener('mouseenter', Module.state.mousemove)
    window.addEventListener('click', Module.state.click)
    window.addEventListener('resize', Module.state.resize)
    window.addEventListener('scroll', Module.state.scroll, true)
    this.intervalTimer = setInterval(() => {
      this.tasks()
    }, 100)

    let { innerHeight, innerWidth } = window

    this.state.dom = injectify.DOMExtractor.innerHTML
    injectify.send('p', {
      dom: this.state.dom,
      innerHeight,
      innerWidth
    })
    this.scroll()
  }

  get enabled() {
    return Module.state && Module.state.enabled
  }

  toggle(enable: boolean | null) {
    if (enable !== null) {
      enable ? this.enable() : this.disable()
    } else {
      this.enabled ? this.disable() : this.enable()
    }
  }

  mousemove(e: MouseEvent) {
    let { clientX, clientY } = e
    injectify.send('p', {
      clientX,
      clientY,
    })
  }

  mouseover(e: MouseEvent) {
    if (!(<any>window).curzorStyle) (<any>window).curzorStyle = 'default'
    let element = <HTMLElement>e.target
    let cursorStyle = window.getComputedStyle(element).cursor
    if (cursorStyle === 'auto') {
      let tagName = element.tagName.toLowerCase()
      switch (tagName) {
        case 'a':
          cursorStyle = 'pointer'
          break
        case 'input':
          cursorStyle = 'text'
          break
        case 'button':
          cursorStyle = 'default'
          break
      }
    }
    if (cursorStyle !== (<any>window).curzorStyle) {
      (<any>window).curzorStyle = cursorStyle
      injectify.send('p', {
        cursorStyle
      })
    }
  }

  click(e: MouseEvent) {
    let { clientX, clientY } = e
    injectify.send('p', {
      clientX,
      clientY,
      click: 'left'
    })
  }

  scroll(e?: any) {
    if (!e) return
    let element = e.target === document ? document.documentElement : e.target

    let id = element.getAttribute('_-_') || '1'

    let scroll: [Number, Number, Number]
    let x = element.scrollLeft || 0
    let y = element.scrollTop || 0
    scroll = [x, y, id]
    if (injectify.global.scroll.x === x && injectify.global.scroll.y === y && injectify.global.scroll.id === id) {
      return
    }

    injectify.send('p', {
      scroll: scroll
    })
  }

  tasks() {
    // Update dom elements
    injectify.DOMExtractor
    if (this.state.activeElement && this.state.activeElement !== document.activeElement) {
      let activeElement = document.activeElement.getAttribute('_-_')
      if (typeof activeElement === 'string') {
        injectify.send('p', {
          activeElement
        })
      }
    }
    this.state.activeElement = document.activeElement
  }

  resize(e) {
    let { innerHeight, innerWidth } = window
    injectify.send('p', {
      innerHeight,
      innerWidth
    })
  }
}
Module.resolve(new PageGhost())