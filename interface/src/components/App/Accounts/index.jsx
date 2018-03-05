import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import Avatar from 'material-ui/Avatar'
import Tooltip from 'material-ui/Tooltip'
import SwitchUser from './SwitchUser'
import { removeAccount } from '../../../actions'

const styles = (theme) => ({
  button: {
    color: '#fff'
  },
  avatar: {
    width: 35,
    height: 35,
    marginLeft: 8
  },
  signedIn: {
    height: 64,
    marginLeft: 10
  }
})

class Accounts extends React.Component {
  state = {
    open: false
  }

  handleClose = () => {
    this.setState({
      open: false
    })
  }

  handleOpen = () => {
    this.setState({
      open: true
    })
  }

  addUser = () => {
    let { server } = this.props
    window.location = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
      server.github.client_id
    )}&state=${encodeURIComponent(location.href.split('?')[0].split('#')[0])}${
      server.github.scope
        ? `&scope=${encodeURIComponent(server.github.scope)}`
        : ``
    }`
  }

  removeUser = (id) => {
    let { dispatch } = this.props
    dispatch(
      removeAccount({
        user: {
          id
        }
      })
    )
  }

  render() {
    const { classes, accounts, account } = this.props

    return account ? (
      <React.Fragment>
        <SwitchUser
          open={this.state.open}
          add={this.addUser.bind(this)}
          remove={this.removeUser.bind(this)}
          handleOpen={this.handleOpen.bind(this)}
          handleClose={this.handleClose.bind(this)}
        />
        <Tooltip title="Account switcher" placement="bottom">
          <Button
            onClick={this.handleOpen.bind(this)}
            className={`${classes.button} ${classes.signedIn}`}>
            {account.user.login}
            <Avatar
              src={`${account.user.avatar_url}&s=40`}
              className={classes.avatar}
            />
          </Button>
        </Tooltip>
      </React.Fragment>
    ) : (
      <Button
        autoFocus
        className={classes.button}
        onClick={this.addUser.bind(this)}>
        {window.innerWidth > 350 ? 'Login with GitHub' : 'Login'}
      </Button>
    )
  }
}

export default connect(({ injectify: { server, accounts, account } }) => ({
  server,
  accounts,
  account
}))(withStyles(styles)(Accounts))
