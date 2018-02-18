import React from 'react'
import { connect } from 'react-redux'
import { switchProject } from '../../../actions'

import { withStyles } from 'material-ui/styles'
import DeniedIcon from 'material-ui-icons/NotInterested'
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import Menu, { MenuItem } from 'material-ui/Menu'
import Tooltip from 'material-ui/Tooltip'

import OwnerIcon from 'material-ui-icons/Portrait'
import AdminIcon from 'material-ui-icons/People'
import ViewOnlyIcon from 'material-ui-icons/RemoveRedEye'
// import OwnerIcon from 'material-ui-icons/LooksOne'
// import AdminIcon from 'material-ui-icons/LooksTwo'
// import ViewOnlyIcon from 'material-ui-icons/Looks3'

const styles = theme => ({
  selectedLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.1) !important'
  },
  selectedDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15) !important'
  },

  ownerIconLight: {
    fill: 'rgb(241, 22, 168)'
  },
  ownerIconDark: {
    fill: 'rgb(241, 22, 168)'
  },
  adminIconLight: {
    fill: 'rgb(216, 135, 0)'
  },
  adminIconDark: {
    fill: 'rgb(255, 160, 0)'
  },
  viewOnlyIconLight: {
    fill: 'rgba(0, 0, 0, 0.35)'
  },
  viewOnlyIconDark: {
    fill: 'rgba(255, 255, 255, 0.5)'
  },

  denied: {
    fill: 'rgb(255, 0, 0)'
  },
  tooltip: {
    pointerEvents: 'initial'
  },
  deniedIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.71) !important'
  },
})

class Project extends React.Component {
  switchProject = project => {
    let { dispatch } = this.props
    dispatch(switchProject(project))
  }

  render() {
    const { classes, project, account, selected, settings, denied, section } = this.props

    return (
      <MenuItem
        button
        selected={(denied || section === 'projects') && selected}
        onClick={() => { this.switchProject(project) }}
        classes={{
          selected: denied ? classes.deniedIcon : settings.dark ? classes.selectedDark : classes.selectedLight
        }}
        disabled={denied}
      >
        {denied ? (
          <ListItemIcon>
            <Tooltip title="Access denied" placement="right" className={classes.tooltip}>
              <DeniedIcon className={classes.denied} />
            </Tooltip>
          </ListItemIcon>
        ) : project.permissions.owners.includes(account && account.user.id) ? (
          <ListItemIcon>
            <Tooltip title="Project owner" placement="right">
              <OwnerIcon className={settings.dark ? classes.ownerIconDark : classes.ownerIconLight} />
            </Tooltip>
          </ListItemIcon>
        ) : project.permissions.admins.includes(account && account.user.id) ? (
          <ListItemIcon>
            <Tooltip title="Project admin" placement="right">
              <AdminIcon className={settings.dark ? classes.adminIconDark : classes.adminIconLight} />
            </Tooltip>
          </ListItemIcon>
        ) : project.permissions.readonly.includes(account && account.user.id) ? (
          <ListItemIcon>
            <Tooltip title="View-only permissions" placement="right">
              <ViewOnlyIcon className={settings.dark ? classes.viewOnlyIconDark : classes.viewOnlyIconLight} />
            </Tooltip>
          </ListItemIcon>
        ) : null}
        <ListItemText inset primary={project.name} />
      </MenuItem>
    )
  }
}

export default connect(({ injectify: {settings, account, section} }) => ({ settings, account, section }))(withStyles(styles)(Project))