import React, { Component } from "react";
import MenuIcon from 'material-ui-icons/Menu';
import Measure from 'react-measure';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu"
import PageGhostStyle from '../PageGhost/index.css'

class ChromeTabs extends Component {
  state = {
    dimensions: {
      width: -1,
      height: -1
    },
    scroll: {
      left: false,
      right: false
    },
    listener: false,
    tabWidth: 240,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tabs && this.props.tabs) {
      if (nextProps.tabs.length !== this.props.tabs) {
        this.update(nextProps.tabs.length)
      }
    }
  }

  update(tabCount) {
    let w = this.state.dimensions.width / tabCount
    if (w > 240) w = 240
    if (w < 150) w = 150

    this.setState({
      scroll: this.updateScroll(),
      tabWidth: w
    })
  }

  updateScroll(setState) {
    let scroll = this.state.scroll
    if (this.tabs) {
      let overflow = this.tabs.scrollWidth > this.tabs.clientWidth
      scroll.left = overflow && this.tabs.scrollLeft !== 0
      scroll.right = overflow && this.tabs.scrollLeft !== (this.tabs.scrollWidth - this.tabs.offsetWidth)
    }
    if (setState) {
      this.setState({
        scroll: scroll
      })
    } else {
      return scroll
    }
  }

  addListener() {
    if (!this.state.listener) {
      this.setState({
        listener: true
      })
      this.tabs.addEventListener('scroll', () => this.updateScroll(true))
    }
  }

  previous() {
    let tab = Math.floor(((this.state.dimensions.width + this.tabs.scrollLeft - 5) / (this.state.tabWidth - 14)) - (this.state.dimensions.width  / (this.state.tabWidth - 14)))
    if (this.tabs.childNodes[tab])
      this.tabs.childNodes[tab].scrollIntoView({
        inline: 'start',
        behavior: 'smooth'
      })
  }

  next() {
    let tab = Math.ceil((this.state.dimensions.width + this.tabs.scrollLeft) / (this.state.tabWidth - 14)) - 1
    if (this.tabs.childNodes[tab])
      this.tabs.childNodes[tab].scrollIntoView({
        inline: 'end',
        behavior: 'smooth'
      })
  }

  render() {
    const { width, height } = this.state.dimensions
    const { execute, toggleMenu } = this.props

    return (
      <div className="chrome-tabs">
        <MenuIcon className="inject-list-menu" onClick={toggleMenu.bind(this)} />
        <div onClick={this.previous.bind(this)} className={`chrome-tabs-previous ${this.state.scroll.left ? 'required' : ''}`} />
        <Measure
          bounds
          onResize={(contentRect) => {
            this.addListener()
            this.setState({ dimensions: contentRect.bounds })
            this.update(this.props.tabs.length)
          }}
          innerRef={tabs => this.tabs = tabs}>
          {({measureRef}) => {
            return (
              <div
                className="chrome-tabs-content"
                ref={measureRef} >
                {this.props.tabs && this.props.tabs.map((tab, i) => {
                  return tab.window ? (
                    <ChromeTab
                      key={tab.id || i}
                      order={i}
                      id={tab.id || i}
                      title={tab.window.title}
                      favicon={tab.window.favicon}
                      active={tab.window.active}
                      width={this.state.tabWidth}
                      execute={execute} />
                  ) : ''
                })}
              </div>
            )
          }}
        </Measure>
        <div onClick={this.next.bind(this)} className={`chrome-tabs-next ${this.state.scroll.right ? 'required' : ''}`} />
        <div className="chrome-tabs-bottom-bar" />
      </div>
    )
  }
}

class ChromeTab extends Component {
  render() {
    const { id, execute, order, width, height, title, active, favicon } = this.props
    return(
      <div>
        <ContextMenuTrigger id={id.toString()}>
          <div
            className={`chrome-tab${active ? ' chrome-tab-current' : ''}`}
            style={{
              width: width,
              transform: order ? `translate(${(width * order) - (order * 14)}px, 0)` : ''
            }}
            title={title}>
            <div className="chrome-tab-background">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <symbol id="topleft" viewBox="0 0 214 29">
                    <path d="M14.3 0.1L214 0.1 214 29 0 29C0 29 12.2 2.6 13.2 1.1 14.3-0.4 14.3 0.1 14.3 0.1Z" />
                  </symbol>
                  <symbol id="topright" viewBox="0 0 214 29">
                    <use xlinkHref="#topleft" />
                  </symbol>
                  <clippath id="crop">
                    <rect className="mask" width="100%" height="100%" x={0} />
                  </clippath>
                </defs>
                <svg width="50%" height="100%">
                  <use
                    xlinkHref="#topleft"
                    width={214}
                    height={29}
                    className="chrome-tab-background"
                  />
                  <use
                    xlinkHref="#topleft"
                    width={214}
                    height={29}
                    className="chrome-tab-shadow"
                  />
                </svg>
                <g transform="scale(-1, 1)">
                  <svg width="50%" height="100%" x="-100%" y={0}>
                    <use
                      xlinkHref="#topright"
                      width={214}
                      height={29}
                      className="chrome-tab-background"
                    />
                    <use
                      xlinkHref="#topright"
                      width={214}
                      height={29}
                      className="chrome-tab-shadow"
                    />
                  </svg>
                </g>
              </svg>
            </div>
            <div
              className="chrome-tab-favicon"
              style={{
                backgroundImage: favicon ? `url(${JSON.stringify(favicon)})` : ''
              }} />
            <div className="chrome-tab-title">{title}</div>
            <div className="chrome-tab-execute" title="" onClick={() => execute(order, 'execute')} />
            <div className="chrome-tab-close" title="" onClick={() => execute(order, 'close')} />
          </div>
        </ContextMenuTrigger>

        <ContextMenu id={id.toString()}>
          <MenuItem onClick={() => execute(order, 'open')}>
            Open in new tab
          </MenuItem>
          <MenuItem onClick={() => execute(order, 'reload')}>
            Reload tab
          </MenuItem>
          <MenuItem divider />
          <MenuItem onClick={() => execute(order, `injectify.DOMExtractor`)}>
            Extract DOM
          </MenuItem>
          <MenuItem onClick={() => this.pageGhost(order, id.toString())}>
            Page Ghost
          </MenuItem>
          <MenuItem onClick={() => execute(order, `injectify.console()`)}>
            Hook / unhook console API
          </MenuItem>
          <MenuItem onClick={() => execute(order, `injectify.module('crash')`)}>
            Crash browser
          </MenuItem>
        </ContextMenu>
      </div>
    )
  }

  pageGhost(order, id) {
    const { execute } = this.props
    let pageGhost = window.pageGhost[id] = {
      win: window.open(),
      style: null,
      cursor: null,
      doc: null
    }
    // Prevent page from executing JS in our page
    pageGhost.win.opener = null
    let doc = pageGhost.doc = pageGhost.win.document
    doc.title = 'Injectify PageGhost'

    pageGhost.style = doc.createElement('style')
    pageGhost.style.innerHTML = PageGhostStyle
    doc.head.appendChild(pageGhost.style)

    pageGhost.cursor = doc.createElement('img')
    pageGhost.cursor.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAQZSURBVFhH7ZhdSJtXGMfV2cyvJanMDZZZZO0spAusrReyMVZ0Qm8LIjgvFIsIihYExQ+GNxO/LlREdyFqxQ8QvCyCqDdeilUzsBQaNpMY/IgfUWNUNvPs/39nQrW16sgbM/CBP77nyav+/J/zPOccw67jOv4nEf6WQi4iIM3BwYFjenr6B4vF8t2/6dAJDXRzf39fPB6Pe2ho6BHGkconIRKxUKIcx9ra2nJvb29IQX4C3SWc3W6Xzc1N2dvb2+ns7Pwe+ZCA1EL3CNjT0yPt7e3i9XpleXnZ1tDQwPV45ZAE/IaAcE2ioqKkvLxctra2ZHd311VTU3PlkCcA8SzR0dHS0dGhOPknorCw8AHyVwb5DiBFJ6uqqsTlcsnOzs5GaWnpQ+Q/goIe7wWkYmNjpaury+ekpbi4+D7yQYc8E5CKiYmR2tpa2d7eppNOOPkt8kGF/CAgFRcXJ93d3Wzksri4+LqgoMCIfNAgzwWkCFlXV6c4Ca0UFRWZkA8K5IUAKa1WK/39/cJtEU6+qq6uvou86pAXBqQI2djYqDiJCrc3NTWpDnkpQEqn08nw8LDi5NLSkrmlpeUr5FWDvDQgpdfrpbW1lZVNJ23YJr9Gnke3gMd/AqTi4+NlZGREcRJ798u2trZbyAcc8kzAyMhI/zPXHg8TDofjhDY2NuTo6EhpQW63+w3evQEFNN4LGBERISUlJUqj5jg8PFwyMzP5Gt36a2ZmxmE2m+0LCwtWfP4TxLbzGfQxFNCrwzuAhOKxC9cAqaioUGCZp8bHx+mU5OXlVWPMMyN3FlayAeLZMuCHihOAnFZCcV0x5ufnxWg0+gGzs7OVwhgdHTVjzOr9FNJBPJnz+qDeGuzr61MOBwSYnZ11DQwMTLPf1dfX+wF5gBgcHKSLRyiQX5AL+JSeDj8g1pYcHh6yt3kyMjLKMdVPbDab2+l0isFg8EOmpKQo04z7iwVjTqsq7cUXBFSO/JxWLPr1nJycIuS46E24QD1Hn/M2NzeLRqPxQ9JFVu7Y2NgzjDm1qgUdSCbgysqKOz8/vxDjO1A8lJCenp6Gs6ATktTUVD8gHKbTYrVa/8jNzVWl//kiBkpcXV1dwl3kZzzfhrjo2c+iIENZWVklT9Zw01/RSUlJMjExwXuLd3JysgU51VzkD9bjwv4YXz+HOOW+VkFXCGuEg2u4jorJZJK0tDSZmppSionTvL6+/jveieY3qBGEICR/ASvydB9j7ovKyspfcWf+GzBKf2R1YyfxwNXfAHwP76gG6IuzWgX/AG1ycvL9ubk5K9cqiwbnwhdZWVlP8RmbNNdrwLe4ywQdToBY2T9C/NcIr6JJkB6iy6q2mvOC7rJguGskQl8eP7PAgnY3OS/okK+yfWs1JP+feB0hFGFh/wCT3Pm6RsUJuAAAAABJRU5ErkJggg=='
    pageGhost.cursor.classList.add('PageGhost-cursor')
    doc.body.appendChild(pageGhost.cursor)

    execute(order, `injectify.module('pageghost', true)`)
  }
}

export default ChromeTabs;