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

  render() {
    const { projects, selectedProject, clientsListOpen } = this.props
    const { selected } = projects[selectedProject.index].console.state
    let activeClient = false

    if (selected) {
      if (projects[selectedProject.index].console.state.clients[selected]) {
        activeClient = true
      }
    }

    return (
      <div className={`inject ${clientsListOpen ? 'open' : ''} ${activeClient ? 'active-client' : ''}`}>
        <Sidebar />
        <Editor />
      </div>
    )
  }
}

export default connect(({ injectify: {clientsListOpen, projects, selectedProject} }) => ({ clientsListOpen, projects, selectedProject }))(Inject)