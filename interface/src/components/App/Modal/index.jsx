import React from 'react'
import { connect } from 'react-redux'
import startCase from 'lodash/startCase'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'
import Button from 'material-ui/Button'

import { toggleModal, newProject } from '../../../actions'

const styles = (theme) => ({})

class Modal extends React.Component {
  projectName = null

  close = () => {
    const { dispatch } = this.props
    dispatch(toggleModal(null))
  }

  newProject = () => {
    const { dispatch } = this.props
    dispatch(newProject(this.projectName.value))
    this.close()
  }

  render() {
    const { classes, modal } = this.props

    return (
      <Dialog open={modal.open} onClose={this.close}>
        <DialogTitle>{startCase(modal.type)}</DialogTitle>
        {modal.type === 'newProject' ? (
          <React.Fragment>
            <DialogContent>
              <DialogContentText>
                Choose a new project ID ~ nothing identifying as it could be
                intercepted by a third-party
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Project name"
                type="text"
                fullWidth
                // onKeyPress={this.handleKeyPress}
                inputProps={{
                  autoCorrect: 'false',
                  spellCheck: 'false',
                  maxLength: '50'
                }}
                inputRef={(input) => (this.projectName = input)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.close} color="primary">
                Cancel
              </Button>
              <Button onClick={this.newProject} color="primary">
                Create
              </Button>
            </DialogActions>
          </React.Fragment>
        ) : null}
      </Dialog>
    )
  }
}

export default connect(({ injectify: { modal } }) => ({
  modal
}))(withStyles(styles, { withTheme: true })(Modal))
