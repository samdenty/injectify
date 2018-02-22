import React from 'react'
import { connect } from 'react-redux'
import Inspector, { DOMInspector, chromeDark } from 'react-inspector'
import Rnd from 'react-rnd'
import Linkify from 'react-linkify'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import copy from 'copy-to-clipboard'

import Sidebar from './Sidebar'
import Editor from './Editor'

import { LineChart } from 'react-easy-chart'
import Tooltip from 'material-ui/Tooltip'
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import ListSubheader from 'material-ui/List/ListSubheader'
import ComputerIcon from 'material-ui-icons/Computer'
import moment from 'moment'
import Button from 'material-ui/Button';


class Inject extends React.Component {
  state = {
    open: false
  }

  componentDidMount() {
    let { socket } = window
    this._mounted = true

    let pageGhostMessages = ({ data }) => {
      if (!this._mounted) {
        window.removeEventListener('message', pageGhostMessages)
        return
      }
      if (typeof data === 'object' && data.type === 'PageGhost') {
        let { id, event } = data
        if (window.pageGhost[id]) {
          switch (event) {
            case 'refresh':
              window.pageGhost[id].refresh()
              break
            case 'execute':
              window.pageGhost[id].execute(data.data)
              break
          }
        }
      }
    }
    window.addEventListener('message', pageGhostMessages)
    this.addListener()
  }

  componentWillUnmount() {
    let { socket } = window
    this._mounted = false

    socket.emit('inject:close')
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedProject.name !== this.props.selectedProject.name) {
      this.addListener(nextProps.selectedProject.name)
    }
  }

  addListener = (project = this.props.selectedProject.name) => {
    socket.emit('inject:close')
    socket.emit('inject:clients', {
      project: project
    })
    console.debug(`Listening for client events for project ${project}`)
  }

  toggleMenu = (value) => {
    this.setState({
      open: typeof value !== 'undefined' ? value : !this.state.open
    })
  }

  // execute = (token, id, script) => {
  //   let project = this.props.project.name
  //   let { socket } = window

  //   if (token === '*') {
  //     socket.emit('inject:execute', {
  //       project: project,
  //       recursive: true,
  //       script: script || this.state.code && this.state.code.replace(/^\s*import .*\n/gm, ``)
  //     })
  //   } else if (id === '*') {
  //     socket.emit('inject:execute', {
  //       project: project,
  //       token: token,
  //       script: script || this.state.code && this.state.code.replace(/^\s*import .*/gm, ``)
  //     })
  //   } else {
  //     socket.emit('inject:execute', {
  //       project: project,
  //       token: token,
  //       id: id,
  //       script: script || this.state.code && this.state.code.replace(/^\s*import .*/gm, ``)
  //     })
  //   }
  // }

  // executeSession = (id, data) => {
  //   let { token, client } = this.state.selectedClient
  //   let session = client.sessions[id]
  //   if (data === 'execute') {
  //     this.execute(token, session.id)
  //   } else if (data === 'close') {
  //     this.execute(token, session.id, 'window.close()')
  //   } else if (data === 'open') {
  //     window.open(session.window.url)
  //   } else if (data === 'reload') {
  //     this.execute(token, session.id, 'window.location.reload()')
  //   } else {
  //     this.execute(token, session.id, data)
  //   }
  // }

  // switchClient = (token) => {
  //   let { socket, project } = this.props

  //   this.toggleMenu(false)

  //   this.setState({
  //     selectedClient: {
  //       token: token,
  //       client: this.state.clients[token]
  //     }
  //   })

  //   /**
  //    * Subscribe to client updates
  //    */
  //   socket.emit('inject:client', {
  //     project: project,
  //     client: token
  //   })
  // }

  render() {
    const { clientsListOpen } = this.props
    return (
      <div className={`inject ${clientsListOpen ? 'open' : ''}`}>
        <Sidebar />
        <Editor />
      </div>
    )
  }
}

export default connect(({ injectify: {clientsListOpen, projects, selectedProject} }) => ({ clientsListOpen, projects, selectedProject }))(Inject)