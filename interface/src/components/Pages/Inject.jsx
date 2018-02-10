import React, { Component } from "react"
import Inspector, { DOMInspector, chromeDark } from 'react-inspector'
import Rnd from 'react-rnd'
import Linkify from 'react-linkify'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu"
import copy from 'copy-to-clipboard'

import ChromeTabs from '../ChromeTabs'
import MonacoEditor from 'react-monaco-editor'
import CodeMirror from 'react-codemirror'
require('codemirror/mode/javascript/javascript')
import Typings from '../../../../src/inject/core/definitions/core.d.ts'
import ModuleTypings from '../../../../src/inject/core/definitions/modules.d.ts'

import { LineChart } from 'react-easy-chart'
import Tooltip from 'material-ui/Tooltip'
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import ListSubheader from 'material-ui/List/ListSubheader'
import ComputerIcon from 'material-ui-icons/Computer'
import moment from 'moment'

function download(filename, text) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
  }
  else {
      pom.click();
  }
}

export class Inject extends Component {
  state = {
    code: localStorage.getItem('injectScript') ||
      `// Import types to enable intellisense
import { injectify, window } from 'injectify'

// Type your code here`,
    clients: {},
    clientsGraph: [
      [
      ]
    ],
    selectedClient: {},
    logs: [],
    open: false
  }

  constructor(props) {
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this)
  }

  componentDidMount() {
    let { socket, project } = this.props
    this._mounted = true
    this.hookConsole()

    /**
     * Clients listener
     */
    let listener = data => {
      let { event, session, clients } = data
      /**
       * Remove listener if unmounted
       */
      if (!this._mounted) {
        socket.off('inject:clients', listener)
        return
      }
      /**
       * Parse data
       */
      if (event == 'list') {
        this.setState({
          clients: clients
        })
      } else if (data.project === project) {
        if (event == 'connect') {
          let newClients = this.state.clients || {}
          newClients[session.token] = session.data
          this.setState({
            clients: newClients
          })
          /**
           * If they are selected, put them into the selected client object
           */
          if (this.state.selectedClient.token === session.token) {
            /**
             * They've been re-added
             */
            if (!this.state.selectedClient.client) {
              socket.emit('inject:client', {
                project: project,
                client: this.state.selectedClient.token
              })
            }
            this.setState({
              selectedClient: {
                ...this.state.selectedClient,
                client: this.state.clients[session.token]
              }
            })
          }
        }

        if (event == 'disconnect') {
          let newClients = this.state.clients
          if (newClients[session.token]) {
            if (newClients[session.token].sessions.length === 1) {
              /**
               * Remove entire client object
               */
              delete newClients[session.token]
            } else {
              /**
               * Filter client
               */
              newClients[session.token].sessions = newClients[session.token].sessions.filter(c => c.id !== session.id)
            }
            this.setState({
              clients: newClients
            })
            /**
             * If they are selected, remove them from the selected client object
             */
            if (this.state.selectedClient.token === session.token) {
              this.setState({
                selectedClient: {
                  ...this.state.selectedClient,
                  client: this.state.clients[session.token]
                }
              })
            }
          }
        }
      }
      console.log("%c[websocket] " + "%cinject:clients =>", "color: #ef5350", "color:  #FF9800", data)
    }
    socket.on(`inject:clients`, listener)

    /**
     * Client listener
     */
    let clientListener = client => {
      if (!this._mounted) {
        socket.off('inject:client', clientListener)
        return
      }
      console.log('Client emitted an update', client)
      this.setState({
        clients: {
          ...this.state.clients,
          [this.state.selectedClient.token]: client
        },
        selectedClient: {
          ...this.state.selectedClient,
          client: client
        }
      })
    }
    socket.on(`inject:client`, clientListener)

    /**
     * Page Ghost listener
     */
    window.pageGhost = {}
    let pageGhostListener = data => {
      if (!this._mounted) {
        socket.off('inject:pageghost', pageGhostListener)
        return
      }
      if (window.pageGhost[data.sender.id]) {
        if (data.dom) window.pageGhost[data.sender.id].dom = data.dom
        window.pageGhost[data.sender.id].win.postMessage(data, '*')
      }
    }
    socket.on(`inject:pageghost`, pageGhostListener)

    let pageGhostMessages = ({data}) => {
      if (!this._mounted) {
        window.removeEventListener('message', pageGhostMessages)
        return
      }
      if (typeof data === 'object' && data.type === 'PageGhost') {
        let { id } = data
        if (window.pageGhost[id]) {
          if (window.pageGhost[id].dom) {
            window.pageGhost[id].win.postMessage({
              dom: window.pageGhost[id].dom
            }, '*')
          } else {
            window.pageGhost[id].refresh()
          }
        }
      }
    }
    window.addEventListener('message', pageGhostMessages)
    /**
     * Console listener
     */
    let consoleListener = (log) => {
      let { type, message } = log
      if (!this._mounted) {
        socket.off('inject:log', consoleListener)
        return
      }

      if (type === 'return') {
        console.log.apply(this, message)
      } else {
        console[type].apply(this, message)
      }

      let logs = this.state.logs
      logs.push(log)
      this.setState({
        logs: logs
      })
    }
    socket.on(`inject:log`, consoleListener)

    socket.emit('inject:clients', {
      project: project
    })

    this.refreshGraph()
    this.saveToStorage(true)
  }

  hookConsole = () => {
    let Console = console
    if (console.Console) Console = console.Console
    const clear = () => {
      this.setState({ logs: [] })
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

  refreshGraph = () => {
    if (this._mounted) {
      let totaltime = 100
      let array = []
      if (this.state.clientsGraph[0].length === 0) {
        for (var i = 0; i < totaltime; i++) {
          array[i] = {
            x: i + 1,
            y: 0
          }
        }
      }
      if (!array.length) array = this.state.clientsGraph[0]
      array = array.slice(1)
      array.forEach((entry, index) => {
        array[index] = {
          x: index + 1,
          y: entry.y
        }
      })
      array.push({
        x: totaltime,
        y: this.state.clients && Object.keys(this.state.clients).length
      })
      this.setState({
        clientsGraph: [
          array
        ]
      })
      setTimeout(this.refreshGraph, 1000)
    }
  }

  saveToStorage = (refresh) => {
    if (this._mounted) {
      if (this.oldCode !== this.state.code) {
        localStorage.setItem('injectScript', this.state.code)
      }
      this.oldCode = this.state.code
      if (refresh)
        setTimeout(() => {
          this.saveToStorage(true)
        }, 5000)
    }
  }

  componentWillReceiveProps(nextProps) {
    let { socket } = this.props
    /**
     * Project was switched
     */
    if (nextProps.project !== this.props.project) {
      socket.emit('inject:clients', {
        project: nextProps.project
      })
      this.setState({
        clientsGraph: [
          []
        ],
        clients: {},
        selectedClient: {}
      })
    }
  }

  componentWillUnmount() {
    let { socket } = this.props
    this._mounted = false

    socket.emit('inject:close')
    window.removeEventListener("resize", this.updateDimensions)
  }

  updateDimensions = () => {
    if (this.editor) this.editor.layout()
  }

  editorDidMount = (editor, monaco) => {
    this.editor = editor
    let typings = Typings
      .replace(/^\s*import /mg, `// import `)
      .replace('export namespace Injectify', `declare module 'injectify'`)
      .replace('//1', 'export namespace injectify {')
      .replace('//2', ModuleTypings.replace('export interface Modules', 'interface Modules'))
      .replace('//3',
        `}
      export var window: any`)
    monaco.editor.defineTheme('Injectify', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '626466' },
        { token: 'keyword', foreground: '6CAEDD' },
        { token: 'identifier', foreground: 'fac863' },
      ],
    })
    monaco.editor.setTheme('Injectify')
    try {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(typings, 'injectify.d.ts')
    } catch(e) {}
    editor.focus()
    window.addEventListener("resize", this.updateDimensions)
  }

  toggleMenu = (value) => {
    this.setState({
      open: typeof value !== "undefined" ? value : !this.state.open
    })
  }

  onChange = (newValue, e) => {
    this.setState({
      code: newValue
    })
  }

  execute = (token, id, script) => {
    let { socket, project } = this.props

    if (token === '*') {
      socket.emit('inject:execute', {
        project: project,
        recursive: true,
        script: script || this.state.code && this.state.code.replace(/^\s*import .*\n/gm, ``)
      })
    } else if (id === '*') {
      socket.emit('inject:execute', {
        project: project,
        token: token,
        script: script || this.state.code && this.state.code.replace(/^\s*import .*/gm, ``)
      })
    } else {
      socket.emit('inject:execute', {
        project: project,
        token: token,
        id: id,
        script: script || this.state.code && this.state.code.replace(/^\s*import .*/gm, ``)
      })
    }
  }

  executeSession = (id, data) => {
    let { token, client } = this.state.selectedClient
    let session = client.sessions[id]
    if (data === 'execute') {
      this.execute(token, session.id)
    } else if (data === 'close') {
      this.execute(token, session.id, 'window.close()')
    } else if (data === 'open') {
      window.open(session.window.url)
    } else if (data === 'reload') {
      this.execute(token, session.id, 'window.location.reload()')
    } else {
      this.execute(token, session.id, data)
    }
  }

  switchClient = (token) => {
    let { socket, project } = this.props

    this.toggleMenu(false)

    this.setState({
      selectedClient: {
        token: token,
        client: this.state.clients[token]
      }
    })

    /**
     * Subscribe to client updates
     */
    socket.emit('inject:client', {
      project: project,
      client: token
    })
  }

  render() {
    const code = this.state.code
    const { classes, main } = this.props
    const options = {
      selectOnLineNumbers: true,
      lineNumbers: true,
      mode: 'javascript',
      formatOnPaste: true,
      folding: true,
      glyphMargin: false,
      fontLigatures: true,
      theme: 'panda-syntax'
    }
    return (
      <div className={`${classes.injectContainer} ${this.state.open ? 'inject-list-open' : ''}`}>
        <div className="inject-list-container">
          <ListSubheader className="inject-list-header">
            <Tooltip title="Execute on all clients" placement="right">
              <ComputerIcon onClick={() => this.execute('*')} />
            </Tooltip>
            Online clients {this.state.clients ? `(${Object.keys(this.state.clients).length})` : ''}
          </ListSubheader>
          <ContextMenuTrigger id={'graph'}>
            <LineChart
              axes
              xTicks={-1}
              yTicks={5}
              axisLabels={{ x: 'Time', y: 'Clients' }}
              width={210}
              lineColors={['cyan']}
              data={this.state.clientsGraph} />
          </ContextMenuTrigger>
          <ContextMenu id={'graph'}>
            <MenuItem onClick={() => this.setState({ clientsGraph: [[]] })}>
              Clear graph
            </MenuItem>
            <MenuItem divider />
            <MenuItem onClick={() => copy(JSON.stringify(this.state.clientsGraph))}>
              Copy graph data
            </MenuItem>
          </ContextMenu>
          <List className={classes.injectList}>
            {this.state.clients && Object.keys(this.state.clients).map((token, i) => {
              const client = this.state.clients[token]
              return (
                <div key={token}>
                  <ContextMenuTrigger id={token}>
                    <ListItem
                      button
                      dense
                      onClick={() => this.switchClient(token)}
                      className={this.state.selectedClient.token === token ? 'active' : ''}>
                      <ListItemIcon>
                        <img src={client.images.country} />
                      </ListItemIcon>
                      <ListItemIcon>
                        <img src={client.images.browser} />
                      </ListItemIcon>
                      <ListItemText primary={client.ip.query} />
                    </ListItem>
                  </ContextMenuTrigger>
                  <ContextMenu id={token}>
                    <MenuItem onClick={() => this.execute(token)}>
                      Execute on all tabs
                    </MenuItem>
                    <MenuItem onClick={() => window.open(`https://www.iplocation.net/?query=${client.ip.query}`)}>
                      IP lookup
                    </MenuItem>
                    <MenuItem divider />
                    <MenuItem onClick={() => this.execute(token, '*', `injectify.console()`)}>
                      Hook / unhook console API
                    </MenuItem>
                    <MenuItem onClick={() => this.execute(token, '*', `injectify.module('crash')`)}>
                      Crash tabs
                    </MenuItem>
                  </ContextMenu>
                </div>
              )
            })}
          </List>
        </div>
        <div className="inject-editor-container" onClick={() => this.state.open && this.toggleMenu()}>
          <ChromeTabs toggleMenu={this.toggleMenu.bind(this)} tabs={this.state.selectedClient && this.state.selectedClient.client && this.state.selectedClient.client.sessions ? this.state.selectedClient.client.sessions : []} execute={this.executeSession} />
          {window.innerWidth >= 650 ? (
            <MonacoEditor
              language={this.state.code && /^\s*import /m.test(this.state.code) ? 'typescript' : 'javascript'}
              value={code}
              options={options}
              onChange={this.onChange}
              editorDidMount={this.editorDidMount}
            />
          ) : (
              <CodeMirror value={code} onChange={this.onChange} options={options} />
            )}
          <Console logs={this.state.logs} resizeMonaco={this.updateDimensions.bind(this)} />
        </div>
      </div>
    )
  }
}

class Console extends Component {
  logs = 0

  componentWillUpdate(nextProps) {
    /**
     * Scroll to bottom
     */
    if (this.props.logs.length !== this.logs) {
      this.logs = this.props.logs.length
      if (this.console) {
        if (this.console.scrollHeight - this.console.scrollTop === this.console.clientHeight) {
          setTimeout(() => {
            this.console.scrollTop = this.console.scrollHeight
          }, 0)
        }
      }
    }
  }

  render() {
    let { logs, resizeMonaco } = this.props
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
        onResizeStop={resizeMonaco.bind(this)}
        disableDragging={true}
        className="inject-console"
        minHeight={60}
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
                      <MessageParser messages={log.message} type={log.type} sender={log.sender} id={log.id} />
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
          {/* <MenuItem divider /> */}
        </ContextMenu>
      </Rnd>
    )
  }
}

class MessageParser extends React.Component {
  render() {
    let { messages, id } = this.props
    return (
      this.props.type === 'table' ? (
        <span className="react-inspector-table">
          <ContextMenuTrigger id={id}>
            <Inspector data={[messages[0].message]} theme="chromeDark" table />
            <Inspector data={messages[0].message} theme={{ ...chromeDark, ...({ ARROW_FONT_SIZE: 9 }) }} />
          </ContextMenuTrigger>
          <ContextMenu id={id}>
            <MenuItem onClick={() => { download(`ExtractedTableObject-${+new Date()}.json`, JSON.stringify(messages[0].message, null, '  '))}}>
              Save as JSON file
            </MenuItem>
            <MenuItem divider />
            <MenuItem onClick={() => { console.clear(); }}>
              Clear console
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
                  this.string(message, messages[0].type !== 'string')
                ) : /^undefined|null$/.test(type) ? (
                  this.literal(type)
                ) : type === 'boolean' ? (
                  this.boolean(message)
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
    let { id } = this.props
    return (
      <span>
        <ContextMenuTrigger id={id}>
          <Inspector data={object} theme={{ ...chromeDark, ...({ ARROW_FONT_SIZE: 9 }) }} />
        </ContextMenuTrigger>
        <ContextMenu id={id}>
          <MenuItem onClick={() => { download(`ExtractedObject-${+new Date()}.json`, JSON.stringify(object, null, '  '))}}>
            Save as JSON file
          </MenuItem>
          <MenuItem divider />
          <MenuItem onClick={() => { console.clear(); }}>
            Clear console
          </MenuItem>
        </ContextMenu>
      </span>
    )
  }

  number(number) {
    return <span className="number">{number.toString()}</span>
  }

  boolean(boolean) {
    return <span className="boolean">{boolean.toString()}</span>
  }

  literal(type) {
    return <span className={type}>{type}</span>
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
    let { sender, id } = this.props
    if (tagName && typeof innerHTML !== 'undefined') {
      try {
        let element = document.createElement(tagName)
        element.innerHTML = innerHTML
        return (
          <span>
            <ContextMenuTrigger id={id}>
              <DOMInspector data={element} theme={{ ...chromeDark, ...({ ARROW_FONT_SIZE: 9 }) }} />
            </ContextMenuTrigger>
            <ContextMenu id={id}>
              <MenuItem onClick={() => { let win = window.open(); win.document.documentElement.innerHTML = `<base href=${JSON.stringify(sender.window.url)}>${innerHTML}` }}>
                Recreate DOM in new tab
              </MenuItem>
              <MenuItem onClick={() => { download(`ExtractedDOM-${+new Date()}.html`, `<base href=${JSON.stringify(sender.window.url)}>${innerHTML}`)}}>
                Save as HTML file
              </MenuItem>
              <MenuItem divider />
              <MenuItem onClick={() => { console.clear(); }}>
                Clear console
              </MenuItem>
            </ContextMenu>
          </span>
        )
      } catch (e) {
        return this.object(message)
      }
    } else {
      return this.object(message)
    }
  }
}