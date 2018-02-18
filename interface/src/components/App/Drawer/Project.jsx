import React from 'react'
import { connect } from 'react-redux'
import { switchProject } from '../../../actions'

import { withStyles } from 'material-ui/styles'
import SelectedIcon from 'material-ui-icons/ChevronRight'
import DeniedIcon from 'material-ui-icons/NotInterested'
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import Menu, { MenuItem } from 'material-ui/Menu'

const styles = theme => ({
  selectedLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.1) !important'
  },
  selectedDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.15) !important'
  },
  selectedIconLight: {
    fill: '#5c71e4'
  },
  selectedIconDark: {
    fill: 'rgba(255, 255, 255, 0.62)'
  },
  denied: {
    fill: 'rgb(255, 0, 0)'
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
    const { classes, project, selected, settings, denied, section } = this.props

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
        {selected && (
          <ListItemIcon>
            {denied ? (
              <DeniedIcon className={classes.denied} />
            ) : (
              <SelectedIcon className={settings.dark ? classes.selectedIconDark : classes.selectedIconLight} />
            )}
          </ListItemIcon>
        )}
        <ListItemText inset primary={project.name} />
      </MenuItem>
    )
  }
}

export default connect(({ injectify: {settings, section} }) => ({ settings, section }))(withStyles(styles)(Project))