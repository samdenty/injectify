import ReactDOM, { render } from "react-dom"
import React from "react"
import Request from "react-http-request"
import { connect } from "react-redux"
import { withStyles } from "material-ui/styles"

import Dialog, {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "material-ui/Dialog"
import TextField from "material-ui/TextField"
import Button from "material-ui/Button"
import { Radio, RadioGroup } from "material-ui/Radio"
import { FormControlLabel } from "material-ui/Form"

const styles = theme => ({})

class AddUser extends React.Component {
  render() {
    const { classes, variant } = this.props
    return (
      <Dialog>
        <DialogTitle>Add user to project</DialogTitle>
        <DialogContent>
          {/* {this.state.addUser.method == "id" ? ( */}
          <React.Fragment>
            <DialogContentText>
              Please enter a GitHub user ID to add to this project
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              inputRef={input => {
                this.addUserName = input
              }}
              // onKeyPress={e => {
              //   e.key === "Enter" && this.handleAddUser()
              // }}
              label="GitHub user ID"
              fullWidth
            />
          </React.Fragment>
          {/* ) : (
            <React.Fragment>
              <DialogContentText>
                Please enter a GitHub username to add to this project
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                inputRef={input => {
                  this.addUserName = input
                }}
                onKeyPress={e => {
                  e.key === "Enter" && this.handleAddUser()
                }}
                label="GitHub username"
                fullWidth
              />
            </React.Fragment>
          )} */}
          <RadioGroup
            // value={this.state.addUser.method}
            // onChange={this.handleMethodChange}
          >
            <FormControlLabel
              value="username"
              control={<Radio />}
              label="Github Username"
            />
            <FormControlLabel value="id" control={<Radio />} label="User ID" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button /*onClick={this.handleRequestClose}*/ color="primary">
            Cancel
          </Button>
          <Button /*onClick={this.handleAddUser}*/ color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default connect(({ injectify: { account } }) => ({ account }))(
  withStyles(styles)(UserChip)
)
