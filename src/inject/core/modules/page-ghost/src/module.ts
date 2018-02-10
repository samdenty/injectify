import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify }: ModuleTypings

class PageGhost {
  state = {
    dom: injectify.DOMExtractor.innerHTML,
  }
  config = {
    enable: null,
    mouse: true,
    values: true
  }
  intervalTimer: null

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
      window.removeEventListener('scroll', Module.state.scroll)
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
      scroll: this.scroll
    })
    window.addEventListener('mousemove', Module.state.mousemove)
    window.addEventListener('mouseover', Module.state.mouseover)
    window.addEventListener('mouseenter', Module.state.mousemove)
    window.addEventListener('click', Module.state.click)
    window.addEventListener('resize', Module.state.resize)
    window.addEventListener('scroll', Module.state.scroll)
    setInterval(() => {
      this.timedExtraction()
    }, 100)

    let { innerHeight, innerWidth } = window

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

  scroll(e?: Event) {
    let scroll: [Number, Number]
    if (window.pageYOffset !== undefined) {
      scroll = [pageXOffset, pageYOffset]
    } else {
      let sx, sy, d = document, r = d.documentElement, b = d.body
      sx = r.scrollLeft || b.scrollLeft || 0
      sy = r.scrollTop || b.scrollTop || 0
      scroll = [sx, sy]
    }
    injectify.send('p', {
      scroll: scroll
    })
  }

  timedExtraction() {
    let dom = injectify.DOMExtractor.innerHTML
    if (dom !== this.state.dom) {
      this.state.dom = dom
      injectify.send('p', {
        dom
      })
    }
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