import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { withStyles } from 'material-ui/styles'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import Chip from 'material-ui/Chip'
import Divider from 'material-ui/Divider'

import UserChip from './UserChip'
import Modals from './Modals'

const styles = (theme) => ({
  header: {
    flexGrow: 1
  },
  group: {
    marginBottom: 0,
    marginTop: '1em',
    fontWeight: 500,
    display: 'flex',
    paddingBottom: 9,
    lineHeight: '32px'
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    minHeight: 58,
    background: 'rgba(0, 0, 0, 0.07)',
    padding: '8px 0'
  },
  divider: {
    margin: '0.5em 0'
  },
  noneAdded: {
    background: 'none',
    height: 42
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  }
})

class Permissions extends React.Component {
  state = {
    open: false,
    action: 'add',
    user: {}
  }

  toggle = (open = !this.state.open, action = this.state.action) => {
    this.setState({
      open,
      action
    })
  }

  canModify = () => {
    const { projects, selectedProject, account, group } = this.props
    const project = projects[selectedProject.index]
    const requiredPermission = (() => {
      switch (group) {
        case 'owners':
          return 3
        case 'admins':
          return 2
        default:
          return 1
      }
    })()
    let permission = (() => {
      if (project.permissions.owners.includes(account.user.id)) {
        return 3
      } else if (project.permissions.admins.includes(account.user.id)) {
        return 2
      } else {
        return 1
      }
    })()
    /**
     * Admins can't add admins, users can't add users
     */
    if (
      (permission === 2 && requiredPermission === 2) ||
      (permission === 1 && requiredPermission === 1)
    )
      permission = -1
    return permission >= requiredPermission
  }

  removeUser = (user) => {
    this.setState({
      user
    })
    this.toggle(true, 'remove')
  }

  render() {
    const { account, classes, group, projects, selectedProject, variant } = this.props
    const project = projects[selectedProject.index]
    const permissions = project.permissions[group]
    const modifiable = this.canModify()

    return (
      <React.Fragment>
        <Typography type="subheading" gutterBottom className={classes.group}>
          <span className={classes.header}>{_.capitalize(variant)}s:</span>
          {modifiable ? (
            <Button
              size="small"
              className={classes.buttonSecondary}
              onClick={() => this.toggle(true, 'add')}>
              Add {variant}
            </Button>
          ) : null}
        </Typography>
        {permissions.length > 0 ? (
          <div className={classes.row}>
            {permissions.map((id, i) => {
              return (
                <UserChip
                  key={id}
                  id={id}
                  group={group}
                  modifiable={modifiable || id === account.user.id}
                  remove={this.removeUser.bind(this)}
                />
              )
            })}
          </div>
        ) : (
          <div className={classes.row}>
            <Chip
              label={`No ${variant}s added`}
              className={classes.noneAdded}
            />
          </div>
        )}
        <Divider light className={classes.divider} />
        <Modals
          open={this.state.open}
          action={this.state.action}
          toggle={this.toggle.bind(this)}
          variant={variant}
          user={this.state.user}
          group={group}
        />
      </React.Fragment>
    )
  }
}

export default connect(
  ({ injectify: { account, projects, selectedProject } }) => ({
    account,
    projects,
    selectedProject
  })
)(withStyles(styles)(Permissions))
