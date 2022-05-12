import ReactDOM, { render } from 'react-dom'
import React from 'react'
import Request from 'react-http-request'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'

import Avatar from 'material-ui/Avatar'
import Typography from 'material-ui/Typography'
import Chip from 'material-ui/Chip'

const styles = theme => ({
  label: {
    justifyContent: 'center',
    flexGrow: 1,
    transition: 'all 0.2s ease'
  },
  chip: {
    margin: 5,
    minWidth: 170,
  },
  secondary: {
    color: 'rgba(0, 0, 0, 0.1)',
    opacity: '0.7'
  },
  current: {
    background: '#5d6ccc !important',
    color: 'rgba(255, 255, 255, 0.95) !important',
    transition: 'none !important',
  }
})

class UserChip extends React.Component {
  remove() {

  }

  render() {
    const { classes, id, group, remove, modifiable, account } = this.props

    return (
      <Request
        url={`https://api.github.com/user/${id}`}
        headers={{
          Authorization: `token ${account.token}`,
        }}
        method="get"
        accept='application/json'
      >
        {
          ({ error, result, loading }) => {
            if (loading) {
              return (
                <Chip
                  avatar={<Avatar src={`https://avatars1.githubusercontent.com/u/${id}?v=4&s=40`} />}
                  className={`${classes.chip} ${classes.secondary}`}
                  classes={{
                    label: classes.label
                  }}
                />
              )
            } else {
              let user = result.body
              if (error) {
                user.login = id
                user.id = id
              }
              return (
                <Chip
                  avatar={<Avatar src={`https://avatars1.githubusercontent.com/u/${id}?v=4&s=40`} />}
                  label={user.login}
                  {...(modifiable ? {onDelete: () => remove(user)} : {})}
                  onClick={() => window.open(`https://github.com/${encodeURIComponent(user.login)}`)}
                  className={`${classes.chip} ${user.id === account.user.id ? classes.current : ''} `}
                  classes={{
                    label: classes.label
                  }}
                />
              )
            }
          }
        }
      </Request>
    )
  }
}

export default connect(({ injectify: {account} }) => ({ account }))(withStyles(styles)(UserChip))
