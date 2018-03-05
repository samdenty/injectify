import ReactDOM, { render } from 'react-dom'
import React from 'react'
import Request from 'react-http-request'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'

import Dialog, {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import Button from 'material-ui/Button'
import Radio, { RadioGroup } from 'material-ui/Radio'
import { FormControlLabel } from 'material-ui/Form'

import { addUser, removeUser } from '../../../../../actions'

const styles = (theme) => ({})

class AddUser extends React.Component {
  state = {
    method: 'username'
  }

  handleChange = (event, method) => {
    this.setState({
      method
    })
  }

  add = () => {
    const { dispatch, group, close } = this.props
    dispatch(addUser(group, this.state.method, this.input.value))
    close()
  }

  render() {
    let { variant, close } = this.props

    return (
      <React.Fragment>
        <DialogTitle>Add {variant} to project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {this.state.method == 'id'
              ? 'Please enter a GitHub user ID to add to this project'
              : 'Please enter a GitHub username to add to this project'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            inputRef={(input) => {
              this.input = input
            }}
            onKeyPress={(e) => {
              e.key === 'Enter' && this.add()
            }}
            label={
              this.state.method === 'id' ? 'GitHub user ID' : 'GitHub username'
            }
            fullWidth
          />
          <RadioGroup value={this.state.method} onChange={this.handleChange}>
            <FormControlLabel
              value="username"
              control={<Radio />}
              label="Github Username"
            />
            <FormControlLabel value="id" control={<Radio />} label="User ID" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} color="primary">
            Cancel
          </Button>
          <Button onClick={this.add} color="primary">
            Add
          </Button>
        </DialogActions>
      </React.Fragment>
    )
  }
}

class RemoveUser extends React.Component {
  remove = () => {
    const { dispatch, user, close } = this.props
    dispatch(removeUser(user.id))
    close()
  }

  render() {
    const { variant, close, user, me } = this.props
    return (
      <React.Fragment>
        <DialogTitle>
          {me ? (
            <React.Fragment>Remove yourself from this project?</React.Fragment>
          ) : (
            <React.Fragment>
              Remove <b>{user.login}</b> from the {variant} role?
            </React.Fragment>
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {me ? (
              <React.Fragment>You'll permanently lose access to this project until someone re-adds you</React.Fragment>
            ) : (
              <React.Fragment>
                They'll no longer be able to access this project
              </React.Fragment>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} color="primary">
            Cancel
          </Button>
          <Button onClick={this.remove} color="secondary">
            Remove
          </Button>
        </DialogActions>
      </React.Fragment>
    )
  }
}

class Modal extends React.Component {
  close = () => {
    let { toggle } = this.props
    toggle(false)
  }

  render() {
    const {
      classes,
      user,
      account,
      dispatch,
      group,
      action,
      variant,
      open
    } = this.props
    return (
      <Dialog open={!!open} onClose={this.close}>
        {action === 'add' ? (
          <AddUser
            close={this.close.bind(this)}
            variant={variant}
            dispatch={dispatch.bind(this)}
            group={group}
          />
        ) : (
          <RemoveUser
            close={this.close.bind(this)}
            variant={variant}
            dispatch={dispatch.bind(this)}
            group={group}
            user={user}
            me={account.user.id === user.id}
          />
        )}
      </Dialog>
    )
  }
}

export default connect(({ injectify: { account } }) => ({ account }))(
  withStyles(styles)(Modal)
)
