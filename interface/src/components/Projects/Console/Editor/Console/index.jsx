import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'
import isEqual from 'lodash/isEqual'

import Rnd from 'react-rnd'
import Linkify from 'react-linkify'
import Inspector, { DOMInspector, chromeDark } from 'react-inspector'
import moment from 'moment'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { execute, clearConsole } from '../../../../../actions'

function download(filename, text) {
  console.debug(`Downloading "${text}" as "${filename}" from Console component`)
  let pom = document.createElement('a')
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
  pom.setAttribute('download', filename)

  if (document.createEvent) {
    let event = document.createEvent('MouseEvents')
    event.initEvent('click', true, true)
    pom.dispatchEvent(event)
  } else {
    pom.click()
  }
}

class Console extends React.Component {
  logs = 0

  componentDidMount() {
    this.hookConsole()
  }

  shouldComponentUpdate(nextProps) {
    const project = this.props.projects[this.props.selectedProject.index]
    const nextProject = nextProps.projects[nextProps.selectedProject.index]

    return !isEqual(project.console.state.logs, nextProject.console.state.logs)
  }

  componentWillUpdate(nextProps) {
    const { projects, selectedProject } = this.props
    const project = projects[selectedProject.index]
    const { logs } = project.console.state
    /**
     * Scroll to bottom
     */
    if (logs.length !== this.logs) {
      this.logs = logs.length
      if (this.console) {
        if (this.console.scrollHeight - this.console.scrollTop === this.console.clientHeight) {
          setTimeout(() => {
            this.console.scrollTop = this.console.scrollHeight
          }, 0)
        }
      }
    }
  }

  triggerResize = (state = false) => {
    if (state) {
      this.dynamicResize = setInterval(() => {
        window.dispatchEvent(new Event('resize'))
      }, 100)
    } else {
      clearInterval(this.dynamicResize)
      window.dispatchEvent(new Event('resize'))
    }
  }

  hookConsole = () => {
    const { dispatch } = this.props
    let Console = console
    if (console.Console) Console = console.Console
    const clear = () => {
      dispatch(clearConsole())
    }
    console = {
      ...Console,
      clear() {
        Console.clear()
        clear()
      },
      Console: Console
    }
  }

  execute = (code) => {
    const { dispatch } = this.props
    console.debug(`Executing "${code}" from Console component`)
    dispatch(execute(code))
  }

  render() {
    const { projects, selectedProject } = this.props
    const project = projects[selectedProject.index]
    const { logs } = project.console.state

    return (
      <Rnd
        bounds="parent"
        default={{ height: 200 }}
        enableResizing={{
          top: true,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
        onResizeStart={() => this.triggerResize(true)}
        onResizeStop={() => this.triggerResize(false)}
        disableDragging={true}
        className="inject-console"
        minHeight={60}
        maxHeight="100%"
        resizeHandleClasses={{ top: 'resizer' }}
      >
        <ContextMenuTrigger id={'console'}>
          <div className="inject-console-content" ref={console => this.console = console}>
            {logs.map((log, i) => {
              return (
                <div className={`console-message-wrapper ${log.type}`} key={i}>
                  <div className="console-message">
                    <div className="console-timestamp">{moment(log.timestamp).format('HH:mm:ss')}</div>
                    <div className="console-indicator"></div>
                    <div className="source-code">
                      <MessageParser messages={log.message} type={log.type} sender={log.sender} id={log.id} execute={this.execute.bind(this)} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ContextMenuTrigger>
        <ContextMenu id={'console'}>
          <MenuItem onClick={() => { console.clear(); }}>
            Clear console
          </MenuItem>
          <MenuItem divider />
          <MenuItem onClick={() => { this.execute(`console.clear()`); }} attributes={{ className: 'requires-active' }}>
            Clear target's console
          </MenuItem>
        </ContextMenu>
      </Rnd>
    )
  }
}

class MessageParser extends React.Component {
  render() {
    let { messages, id, execute } = this.props
    return (
      this.props.type === 'table' ? (
        <span className="react-inspector-table">
          <ContextMenuTrigger id={id}>
            <Inspector data={[messages[0].message]} theme="chromeDark" table />
            <Inspector data={messages[0].message} theme={{ ...chromeDark, ...({ ARROW_FONT_SIZE: 9 }) }} />
          </ContextMenuTrigger>
          <ContextMenu id={id}>
            <MenuItem onClick={() => { download(`ExtractedTableObject-${+new Date()}.json`, JSON.stringify(messages[0].message, null, '  ')) }}>
              Save as JSON file
            </MenuItem>
            <MenuItem divider />
            <MenuItem onClick={() => { console.clear(); }}>
              Clear console
            </MenuItem>
            <MenuItem divider />
            <MenuItem onClick={() => { execute(`console.clear()`); }} attributes={{ className: 'requires-active' }}>
              Clear target's console
            </MenuItem>
          </ContextMenu>
        </span>
      ) : (
          <span className="message-group">
            {messages.map((data, i) => {
              let { type, message } = data
              return (
                <span key={i}>
                  {type === 'string' ? (
                    this.string(message, this.props.type === 'return' || messages[0].type !== 'string')
                  ) : /^undefined|null$/.test(type) ? (
                    this.literal(type)
                  ) : type === 'boolean' ? (
                    this.boolean(message)
                  ) : type === 'broadcast' ? (
                    this.literal(message, 'broadcast')
                  ) : type === 'number' ? (
                    this.boolean(message)
                  ) : type === 'promise' ? (
                    this.promise()
                  ) : type === 'HTMLElement' ? (
                    this.html(message)
                  ) : this.object(message)}
                </span>
              )
            })}
          </span>
        )
    )
  }

  string(message, quotes = true) {
    return (
      <span className={`string ${quotes ? 'quotes' : ''}`}>
        {quotes && <span className="quotes">&quot;</span>}
        <Linkify properties={{ target: '_blank' }}>
          {message}
        </Linkify>
        {quotes && <span className="quotes">&quot;</span>}
      </span>
    )
  }

  object(object) {
    let { id, execute } = this.props
    return (
      <React.Fragment>
        <ContextMenuTrigger id={id}>
          <Inspector data={object} theme={{ ...chromeDark, ...({ ARROW_FONT_SIZE: 9 }) }} />
        </ContextMenuTrigger>
        <ContextMenu id={id}>
          <MenuItem onClick={() => { download(`ExtractedObject-${+new Date()}.json`, JSON.stringify(object, null, '  ')) }}>
            Save as JSON file
          </MenuItem>
          <MenuItem divider />
          <MenuItem onClick={() => { console.clear(); }}>
            Clear console
          </MenuItem>
          <MenuItem divider />
          <MenuItem onClick={() => { execute(`console.clear()`); }} attributes={{ className: 'requires-active' }}>
            Clear target's console
          </MenuItem>
        </ContextMenu>
      </React.Fragment>
    )
  }

  number(number) {
    return <span className="number">{number.toString()}</span>
  }

  boolean(boolean) {
    return <span className="boolean">{boolean.toString()}</span>
  }

  literal(type, className) {
    return <span className={className || type}>{type}</span>
  }

  promise() {
    return (
      <span className="promise">
        Promise {`{`}
        <span>
          {`<pending>`}
        </span>{`}`}
      </span>
    )
  }

  html(message) {
    let { tagName, innerHTML } = message
    let { sender, id, execute } = this.props
    if (tagName && typeof innerHTML !== 'undefined') {
      try {
        let element = document.createElement(tagName)
        element.innerHTML = innerHTML
        return (
          <React.Fragment>
            <ContextMenuTrigger id={id}>
              <DOMInspector data={element} theme={{ ...chromeDark, ...({ ARROW_FONT_SIZE: 9 }) }} />
            </ContextMenuTrigger>
            <ContextMenu id={id}>
              <MenuItem onClick={() => { let win = window.open(); win.document.documentElement.innerHTML = `<base href=${JSON.stringify(sender.window.url)}>${innerHTML}` }}>
                Recreate DOM in new tab
              </MenuItem>
              <MenuItem onClick={() => { download(`ExtractedDOM-${+new Date()}.html`, `<base href=${JSON.stringify(sender.window.url)}>${innerHTML}`) }}>
                Save as HTML file
              </MenuItem>
              <MenuItem divider />
              <MenuItem onClick={() => { console.clear(); }}>
                Clear console
              </MenuItem>
              <MenuItem divider />
              <MenuItem onClick={() => { execute(`console.clear()`); }} attributes={{ className: 'requires-active' }}>
                Clear target's console
              </MenuItem>
            </ContextMenu>
          </React.Fragment>
        )
      } catch (e) {
        return this.object(message)
      }
    } else {
      return this.object(message)
    }
  }
}


export default connect(({ injectify: {projects, selectedProject} }) => ({ projects, selectedProject }))(Console)
