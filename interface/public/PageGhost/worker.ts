import { Mutation } from '../../../src/inject/core/modules/page-ghost/src/definitions/mutation'

function Cursors(input?: string) {
  let cursor = 'default'
  switch (input) {
    case 'all-scroll':
    case 'grab':
    case 'grabbing':
    case 'move':
      cursor = 'grab'
      break
    case 'e-resize':
    case 'ew-resize':
      cursor = 'e-resize'
      break
    case 'ne-resize':
    case 'sw-resize':
    case 'nesw-resize':
      cursor = 'ne-resize'
      break
    case 'ns-resize':
    case 's-resize':
      cursor = 'ns-resize'
      break
    case 'nw-resize':
    case 'se-resize':
    case 'nwse-resize':
      cursor = 'nw-resize'
      break
    case 'crosshair':
    case 'col-resize':
    case 'help':
    case 'n-resize':
    case 'no-drop':
    case 'not-allowed':
    case 'pointer':
    case 'progress':
    case 'wait':
    case 'text':
    case 'w-resize':
    case 'default':
    case 'row-resize':
      cursor = input
      break
  }
  return `./cursors/unix/${cursor}.apng`
}

function htmlToElement(html) {
  let template = document.createElement('template')
  //html = html.trim() // Never return a text node of whitespace as the result
  template.innerHTML = html
  return template.content.firstChild
}

function escapeHtml(unsafe) {
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;")
}

interface MessageData {
  data: {
    clientX?: number
    clientY?: number

    click?: 'left' | 'right'

    cursorStyle?: string

    innerHeight?: number
    innerWidth?: number

    dom?: string

    scroll?: [number, number, number | string]

    activeElement?: string

    mutation?: Mutation.childList | Mutation.attributes | Mutation.characterData
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
    static pointer = <HTMLElement>document.getElementsByClassName('pointer')[0]
    static iframe: HTMLIFrameElement
    static base: HTMLBaseElement
    static html: string
    static win = window.parent || window.opener
    static embedded = window.location.search === '?embedded'

    static comment =
`
# PageGhost quick tips 👋

 - How secure is this?
   - Relatively
     - The client can get your IP (but only by modifying their DOM)
     - Code execute is possible - but it's sandboxed on the about:blank domain

 - How are DOM updates applied?
   - Each element is given an unique ID (_-_), a Mutation listener is used to detect changes in the clients DOM and the events are re-emmited and use the ID's to apply the changes to this sandboxed DOM

 - Why is it loaded over HTTP?
   - If it's loaded over HTTPS, you'll only be able to inspect clients with HTTPS pages

 - Why is the window so big / small
   - PageGhost automatically detects the clients screen resolution and scales accordingly. This prevents CSS media queries, mouse positions etc. from not working
`
    static config = {
      smoothCursor: false
    }

    static initialize() {
      let { container, cursor, iframe } = this
      let comment = document.createComment(this.comment)
      document.documentElement.insertBefore(comment, document.head)
      this.containarize((doc: Document) => {
        this.win.postMessage({
          type: 'PageGhost',
          id: decodeURIComponent(window.location.search.substr(1)),
          event: 'refresh'
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

    static scroll(e?: Event) {
      if ((<any>window).shouldNotScroll) {
        (<any>window).shouldNotScroll = false
        return
      }
      if (!e) return
      // @ts-ignore
      if (!window.sO) window.sO = 0;
      (<any>window).sO++
      let element = e.target === this.iframe.contentDocument ? this.iframe.contentDocument.body : <HTMLElement>e.target

      let id = element === this.iframe.contentDocument.body ? '1' : element.getAttribute('_-_') || '1'

      let x = element.scrollLeft || 0
      let y = element.scrollTop || 0

      // @ts-ignore
      if (window.lS && window.lS[0] === x && window.lS[1] === y && window.lS[2] === id) {
        return
      }

      this.sendScroll([x, y, id, (<any>window).sO])
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
      cursor.style.transition = 'transform 0.05s ease-in-out'
      this.setCursor(x, y)
      this.setConfig()
    }

    static setConfig(newConfig?: any) {
      this.config = {
        ...this.config,
        ...newConfig
      }
      if (this.config.smoothCursor) {
        this.cursor.style.transition = 'transform 0.05s ease-in-out'
      } else {
        this.cursor.style.transition = ''
      }
    }

    static update(message: MessageData) {
      console.debug(message.data)
      let { data, id, sender, timestamp } = message
      this.linkify(sender.window.url)
      if (!document.body.classList.contains('loaded')) {
        document.body.classList.add('loaded')
        setTimeout(() => {
          document.body.removeChild(document.getElementsByClassName('loader')[0])
        }, 1000)
      }
      if (data.click) {
        this.click(data.click)
      }
      if (data.activeElement) {
        let element = this.getElementById(data.activeElement)
        console.log(`Focused element ${data.activeElement}`)
        if (element && !this.embedded) {
          element.focus()
          // @ts-ignore
          if (element.select) element.select()
        }
      }
      if (data.scroll instanceof Array && typeof data.scroll[0] === 'number' && typeof data.scroll[1] === 'number') {
        (<any>window).shouldNotScroll = true
        let body = this.iframe.contentDocument.body.getAttribute('_-_')
        let id = data.scroll[2] || body
        // Fix document.documentElement scrolling messed up
        if (id === '1') id = body
        let element = this.getElementById(id)
        element.scrollLeft = data.scroll[0]
        // @ts-ignore
        element.scrollTop = data.scroll[1];

        (<any>window).lS = [data.scroll[0], data.scroll[1], id]
      }
      if (data.dom) {
        this.html = data.dom
        this.setInnerHTML(data.dom)
      }
      if (data.mutation) {
        if (typeof data.mutation.id === 'string' && typeof data.mutation.type === 'string') {
          let element = this.getElementById(data.mutation.id)
          if (element === null) {
            console.warn(`Failed to locate element with ID ${id} in the DOM!`, data.mutation)
            return
          }
          if (data.mutation.type === 'childList') {
            if (data.mutation.data instanceof Array) {
              (<any>data.mutation.data).forEach(change => {
                if (change.type === 'addition') {
                  let { type, html, replace } = change
                  if (replace) {
                    element.innerHTML = html
                  } else {
                    element.appendChild(htmlToElement(html))
                  }
                } else if (change.type === 'removal') {
                  let { type, id } = change
                  let target = element.querySelector(`[_-_=${JSON.stringify(id)}]`)
                  if (element.contains(target)) {
                    element.removeChild(target)
                  }
                }
              })
            }
          } else if (data.mutation.type === 'attributes') {
            if (data.mutation.data.value === null) {
              element.removeAttribute(data.mutation.data.name)
            } else {
              element.setAttribute(data.mutation.data.name, data.mutation.data.value)
            }
          } else if (data.mutation.type === 'characterData') {
            element.innerHTML = escapeHtml(data.mutation.data)
          }
        }
      }
      if (typeof data.cursorStyle === 'string') {
        console.log(`Switched cursor to ${data.cursorStyle}`)
        this.pointer.style.backgroundImage = `url('${Cursors(data.cursorStyle)}')`
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

    static clickJack(event: MouseEvent) {
      event.preventDefault()
      let id = event.toElement.getAttribute('_-_')
      console.log(`You clicked on element ${id}`)

      let config = {
        element: `document.querySelector('[_-_=${JSON.stringify(id)}]')`,
        type: event.type,
        cancelable: event.cancelable,
        detail: event.detail,
        screenX: event.screenX,
        screenY: event.screenY,
        clientX: event.clientX,
        clientY: event.clientY,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
        button: event.button,
      }
      this.execute(`injectify.module('click', ${JSON.stringify(config)})`)
    }

    static resize(width: number, height: number) {
      this.master.setAttribute('style', `width: ${width}px; height: ${height}px`)
      this.scale()
    }

    static execute(code: string) {
      this.win.postMessage({
        type: 'PageGhost',
        id: decodeURIComponent(window.location.search.substr(1)),
        event: 'execute',
        data: code
      }, '*')
    }

    static sendScroll(array) {
      this.win.postMessage({
        type: 'PageGhost',
        id: decodeURIComponent(window.location.search.substr(1)),
        event: 'scroll',
        data: array
      }, '*')
    }

    static scale() {
      let padding = this.embedded ? 0 : 60
      this.master.style.transform = ``
      let heightScale = (window.innerHeight - padding) / this.master.offsetHeight
      let widthScale = (window.innerWidth - padding) / this.master.offsetWidth
      let scale = heightScale < widthScale ? heightScale : widthScale
      let pixelScale = ((1 - scale) + 1)
      if (pixelScale < 0.5) pixelScale = 0.5
      this.master.style.transform = `translateZ(0) scale(${scale}) translate(-50%, -50%)`
      if (!this.embedded) {
        this.master.style.borderRadius = `${pixelScale * 7}px`
      }
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
        this.iframe.contentDocument.documentElement.setAttribute('_-_', '1')
      }
    }

    static containarize(callback: Function) {
      let iframe = document.createElement('iframe')
      iframe.setAttribute('style', 'border: 0; height: 100%; width: 100%')
      this.iframe = iframe

      let comment = document.createComment(
`
 - Why is there two iframes?
    - For security reasons
      - Sandboxed frame is handled to prevent code execution on the ${window.location.host} domain
    - To sandbox the <base> outside the parent
`
      )

      let viewport = document.createElement('meta')
      viewport.name = 'viewport'
      viewport.content = 'width=device-width, initial-scale=1.0'


      this.container.onload = this.iframe.onload = () => {
        try {
          // Prevent window hijacking
          (<any>this.container.contentWindow.parent) = null;
          (<any>this.iframe.contentWindow.parent) = null;
          this.iframe.contentWindow.onclick = this.clickJack.bind(this)

          // Sync scroll events with parent
          this.iframe.contentWindow.addEventListener('scroll', this.scroll.bind(this), true)

          // Reload HTML
          if (this.html) {
            this.setInnerHTML(this.html)
          }
        } catch (e) { }
      }
      (<any>this.container.contentWindow.parent) = null;

      this.container.contentDocument.head.appendChild(viewport)
      this.container.contentDocument.body.appendChild(comment)
      this.container.contentDocument.body.appendChild(iframe)
      this.container.contentDocument.body.setAttribute('style', 'margin: 0')
      this.container
      callback(iframe.contentDocument)
    }

    static getElementById(id: string | number): HTMLElement {
      if (typeof id === 'number') id = id.toString()
      if (typeof id === 'string') {
        return <HTMLElement>this.iframe.contentDocument.querySelector(`[_-_=${JSON.stringify(id)}]`)
      } else {
        return null
      }
    }
  }
  window['PageGhost'].initialize()
})