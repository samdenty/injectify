import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify }: ModuleTypings

class PageGhost {
  config = {
    enable: null,
    mouse: true,
    values: true
  }

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
    if (Module.state) {
      window.removeEventListener('mousemove', Module.state.mousemove)
      window.removeEventListener('mouseenter', Module.state.mousemove)
      window.removeEventListener('resize', Module.state.resize)
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
      resize: this.resize
    })
    window.addEventListener('mousemove', Module.state.mousemove)
    window.addEventListener('mouseenter', Module.state.mousemove)
    window.addEventListener('resize', Module.state.resize)
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

  resize(e) {
    let { innerHeight, innerWidth } = window
    injectify.send('p', {
      innerHeight,
      innerWidth
    })
  }
}

Module.resolve(new PageGhost())