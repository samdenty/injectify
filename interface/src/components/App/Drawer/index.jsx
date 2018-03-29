import React from 'react'
import { connect } from 'react-redux'
import { switchSection, toggleDrawer } from '../../../actions'
import Project from './Project'
import Search from './Search'

import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import ListSubheader from 'material-ui/List/ListSubheader'
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import Menu, { MenuItem } from 'material-ui/Menu'
import Collapse from 'material-ui/transitions/Collapse'

import HomeIcon from 'material-ui-icons/Home'
import DocumentationIcon from 'material-ui-icons/ChromeReaderMode'
import SettingsIcon from 'material-ui-icons/Settings'
import ProjectsIcon from 'material-ui-icons/Tab'

import ExpandLess from 'material-ui-icons/ExpandLess'
import ExpandMore from 'material-ui-icons/ExpandMore'

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
})

class Drawer extends React.Component {
  state = { open: true }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.section !== this.props.section ||
      nextProps.projects.length !== this.props.projects.length ||
      nextState.open !== this.state.open
  }

  section = (section) => {
    let { dispatch } = this.props
    dispatch(switchSection(section))
    dispatch(toggleDrawer(false, true))
  }

  handleClick = () => {
    this.setState({ open: !this.state.open })
  }

  render() {
    const { classes, section, projects, account } = this.props

    return (
      <div className={classes.root}>
        <List component="nav">
          <MenuItem button onClick={() => this.section('home')} selected={section === 'home'}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText inset primary="Home" />
          </MenuItem>
          <MenuItem button onClick={() => this.section('documentation')} selected={section === 'documentation'}>
            <ListItemIcon>
              <DocumentationIcon />
            </ListItemIcon>
            <ListItemText inset primary="Documentation" />
          </MenuItem>
          <MenuItem button onClick={() => this.section('settings')} selected={section === 'settings'}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText inset primary="Settings" />
          </MenuItem>
          {account && (
            <React.Fragment>
              <MenuItem button onClick={this.handleClick} selected={section === 'projects'}>
                <ListItemIcon>
                  <ProjectsIcon />
                </ListItemIcon>
                <ListItemText inset primary={`Projects ${`(${this.props.projects.length})`}`} />
                {this.state.open ? <ExpandLess /> : <ExpandMore />}
              </MenuItem>
              <Collapse in={this.state.open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <Search />
                </List>
              </Collapse>
            </React.Fragment>
          )}
        </List>
      </div>
    )
  }
}

Drawer.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default connect(({ injectify: {section, account, projects} }) => ({ section, account, projects }))(withStyles(styles)(Drawer))
