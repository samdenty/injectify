import React, { Component } from "react"
import MenuIcon from 'material-ui-icons/Menu'
import Measure from 'react-measure'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu"
import { connect } from 'react-redux'
import { toggleClientsList, executeMacro } from '../../../../../actions'
import Tooltip from 'material-ui/Tooltip'

import PageGhostIcon from 'material-ui-icons/RemoveRedEye'
import ExecuteIcon from 'material-ui-icons/Send'
import IconButton from 'material-ui/IconButton'

class Tabs extends Component {
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

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.tabs && this.props.tabs) {
  //     if (nextProps.tabs.length !== this.props.tabs) {
  //       this.update(nextProps.tabs.length)
  //     }
  //   }
  // }

  update(tabCount) {
    if (tabCount instanceof Number) {
      let w = this.state.dimensions.width / tabCount
      if (w > 240) w = 240
      if (w < 150) w = 150

      this.setState({
        scroll: this.updateScroll(),
        tabWidth: w
      })
    }
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
    const { projects, selectedProject, dispatch } = this.props
    const project = projects[selectedProject.index]
    const { state } = project.console
    const tabs = state.clients[state.selected]

    return (
      <div className="chrome-tabs">
        <MenuIcon className="inject-list-menu" onClick={() => dispatch(toggleClientsList(true))} />
        <div onClick={this.previous.bind(this)} className={`chrome-tabs-previous ${this.state.scroll.left ? 'required' : ''}`} />
        <Measure
          bounds
          onResize={(contentRect) => {
            this.addListener()
            this.setState({ dimensions: contentRect.bounds })
            this.update(tabs && tabs.length)
          }}
          innerRef={tabs => this.tabs = tabs}>
          {({measureRef}) => {
            return (
              <div
                className="chrome-tabs-content"
                ref={measureRef} >
                {tabs && tabs.sessions.map((tab, i) => {
                  return tab.window ? (
                    <Tab
                      key={tab.id || i}
                      order={i}
                      id={tab.id || i}
                      title={tab.window.title}
                      devtools={tab.devtools}
                      favicon={tab.window.favicon}
                      active={tab.window.active}
                      width={this.state.tabWidth} />
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

class Tab extends Component {
  render() {
    const { id, order, width, height, devtools, title, active, favicon } = this.props

    return(
      <React.Fragment>
        <ContextMenuTrigger id={id.toString()}>
          <div
            className={`chrome-tab ${active ? 'chrome-tab-current' : ''} ${devtools.open ? 'devtools' : ''}`}
            style={{
              width: width,
              transform: order ? `translate(${(width * order) - (order * 14)}px, 0)` : ''
            }}
            title={`${devtools.open ? '⚠⚠ TARGET HAS DEVTOOLS OPEN! ⚠⚠\n\n' : ''}${title}`}>
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
                <svg width="50%" height="100%">`
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
                backgroundImage: devtools.open ? `url('https://twemoji.maxcdn.com/2/72x72/26a0.png')` : favicon ? `url(${JSON.stringify(favicon)})` : ''
              }} />
            <div className="chrome-tab-title">{`${devtools.open ? '[DEVTOOLS] ' : ''}${title}`}</div>
            <div className="chrome-tab-actions">
              <Tooltip title="Page Ghost" placement="left" enterDelay={500}>
                <IconButton className="pageghost" title="" onClick={() => executeMacro(id, 'pageghost')}>
                  <PageGhostIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Execute code" placement="left" enterDelay={500}>
                <IconButton className="execute" title="" onClick={() => executeMacro(id, 'execute')}>
                  <ExecuteIcon />
                </IconButton>
              </Tooltip>
            </div>
            {/* <Tooltip title="Close tab" placement="left">
              <div className="chrome-tab-close" title="" onClick={() => executeMacro(id, 'close')} />
            </Tooltip> */}
          </div>
        </ContextMenuTrigger>

        <ContextMenu id={id.toString()}>
          <MenuItem onClick={() => executeMacro(id, 'open')}>
            Open in new tab
          </MenuItem>
          <MenuItem onClick={() => executeMacro(id, 'reload')}>
            Reload tab
          </MenuItem>
          <MenuItem onClick={() => executeMacro(id, 'close')}>
            Close tab
          </MenuItem>
          <MenuItem divider />
          <MenuItem onClick={() => executeMacro(id, 'pageghost')}>
            Page Ghost
          </MenuItem>
          <MenuItem onClick={() => executeMacro(id, `injectify.DOMExtractor`)}>
            Extract DOM
          </MenuItem>
          <MenuItem divider />
          <MenuItem onClick={() => executeMacro(id, `injectify.console()`)}>
            Hook / unhook console API
          </MenuItem>
        </ContextMenu>
      </React.Fragment>
    )
  }
}

export default connect(({ injectify: {projects, selectedProject} }) => ({ projects, selectedProject }))(Tabs)