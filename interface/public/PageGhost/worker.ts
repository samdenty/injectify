interface MessageData {
  data: {
    clientX?: number
    clientY?: number

    click?: 'left' | 'right'

    innerHeight?: number
    innerWidth?: number

    dom?: string

    scroll?: [number, number]
  }
  id: AAGUID
  timestamp: number
  sender: {
    id: AAGUID
    debug: boolean
    socket: any
    window: {
      active: boolean
      favicon: string
      title: string
      url: string
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window['PageGhost'] = class PageGhost {
    static master = <HTMLElement>document.getElementsByClassName('window-container')[0]
    static container = document.getElementsByTagName('iframe')[0]
    static cursor = <HTMLElement>document.getElementsByClassName('cursor')[0]
    static iframe: HTMLIFrameElement
    static base: HTMLBaseElement
    static html: string

    static config = {
      smoothCursor: true
    }

    static initialize() {
      let { container, cursor, iframe } = this
      this.containarize((doc: Document) => {
        window.opener.postMessage({
          type: 'PageGhost',
          id: decodeURIComponent(window.location.search.substr(1))
        }, '*')
        this.setConfig()
        // this.fadeCursor(10, 0)
        // setTimeout(() => {
        //   this.click()
        //   setTimeout(() => {
        //     this.click()
        //     setTimeout(() => {
        //       this.setCursor(100, 50)
        //     }, 1000)
        //   }, 100)
        // }, 1000)
      })
      window.addEventListener('message', ({ data }: { data: MessageData }) => {
        this.update(data)
      })
      window.addEventListener('resize', () => {
        this.scale()
      })
    }

    static linkify(url: string) {
      if (this.base) {
        if (this.base.getAttribute('href') !== url) {
          this.base.setAttribute('href', url)
          this.reload()
        }
      } else {
        this.base = this.container.contentDocument.createElement('base')
        this.base.setAttribute('href', url)
        this.container.contentDocument.head.appendChild(this.base)
        this.reload()
      }
    }

    static reload() {
      if (
        this.iframe &&
        this.iframe.contentWindow &&
        this.iframe.contentWindow.location
      ) {
        this.iframe.contentWindow.location.reload()
      }
    }

    static setCursor(x: number, y: number) {
      this.cursor.style.transform = `translate(${x}px, ${y}px)`
    }

    static fadeCursor(x: number, y: number) {
      let cursor = <HTMLElement>document.getElementsByClassName('cursor')[0]
      cursor.style.transition = 'transform 0.1s ease-in-out'
      this.setCursor(x, y)
      this.setConfig()
    }

    static setConfig(newConfig?: any) {
      this.config = {
        ...this.config,
        ...newConfig
      }
      if (this.config.smoothCursor) {
        this.cursor.style.transition = 'transform 0.1s ease-in-out'
      } else {
        this.cursor.style.transition = ''
      }
    }

    static update(message: MessageData) {
      console.log(message.data)
      let { data, id, sender, timestamp } = message
      this.linkify(sender.window.url)
      if (data.click) {
        this.click(data.click)
      }
      if (data.scroll instanceof Array && typeof data.scroll[0] === 'number' && typeof data.scroll[1] === 'number') {
        this.iframe.contentWindow.scrollTo(data.scroll[0], data.scroll[1])
      }
      if (data.dom) {
        this.html = data.dom
        this.setInnerHTML(data.dom)
      }
      if (typeof data.clientX !== 'undefined' && typeof data.clientY !== 'undefined') {
        this.setCursor(data.clientX, data.clientY)
      }
      if (typeof data.innerHeight === 'number' && typeof data.innerWidth === 'number') {
        this.resize(data.innerWidth, data.innerHeight)
      }
    }

    static click(side: 'left' | 'right') {
      let clicker = document.createElement('div')
      clicker.classList.add('click')
      document.getElementsByClassName('cursor')[0].appendChild(clicker)
      setTimeout(() => {
        document.getElementsByClassName('cursor')[0].removeChild(clicker)
      }, 750)
    }

    static resize(width: number, height: number) {
      this.master.setAttribute('style', `width: ${width}px; height: ${height}px`)
      this.scale()
    }

    static scale() {
      this.master.style.transform = ``
      let heightScale = (window.innerHeight - 60) / this.master.offsetHeight
      let widthScale = (window.innerWidth  - 60) / this.master.offsetWidth
      let scale = heightScale < widthScale ? heightScale : widthScale
      let pixelScale = ((1 - scale) + 1)
      this.master.style.transform = `scale(${scale}) translate(-50%, -50%)`
      this.master.style.borderRadius = `${pixelScale * 7}px`
      this.master.style.boxShadow = `0 ${pixelScale * 14}px ${pixelScale * 28}px rgba(0,0,0,0.25), 0 ${pixelScale * 10}px ${pixelScale * 10}px rgba(0,0,0,0.22)`
    }

    static setInnerHTML(html: string) {
      if (
        this.iframe &&
        this.iframe.contentDocument &&
        this.iframe.contentDocument.documentElement &&
        this.iframe.contentDocument.documentElement.innerHTML
      ) {
        this.iframe.contentDocument.documentElement.innerHTML = html
      }
    }

    static containarize(callback: Function) {
      let iframe = document.createElement('iframe')
      iframe.setAttribute('style', 'border: 0; height: 100%; width: 100%')
      this.iframe = iframe

      let viewport = document.createElement('meta')
      viewport.name = 'viewport'
      viewport.content = 'width=device-width, initial-scale=1.0'


      this.container.onload = this.iframe.onload = () => {
        try {
          // Prevent window hijacking
          (<any>this.container.contentWindow.parent) = null;
          (<any>this.iframe.contentWindow.parent) = null;

          // Reload HTML
          if (this.html) {
            this.setInnerHTML(this.html)
          }
        } catch (e) { }
      }
      (<any>this.container.contentWindow.parent) = null;

      this.container.contentDocument.head.appendChild(viewport)
      this.container.contentDocument.body.appendChild(iframe)
      this.container.contentDocument.body.setAttribute('style', 'margin: 0')
      this.container
      callback(iframe.contentDocument)
    }
  }
  window['PageGhost'].initialize()
})