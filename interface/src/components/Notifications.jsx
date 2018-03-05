import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Button from 'material-ui/Button'
import Snackbar from 'material-ui/Snackbar'
import IconButton from 'material-ui/IconButton'
import CloseIcon from 'material-ui-icons/Close'

const styles = (theme) => ({
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4
  }
})

class Notification extends React.Component {
  state = {
    open: false,
    content: {
      title: null,
      message: null
    },
    type: 'message'
  }

  componentDidMount() {
    this.listener = this.notify.bind(this)
    window.addEventListener('notification', this.listener)
  }

  componentWillUnmount() {
    window.removeEventListener('notification', this.listener)
  }

  notify = ({ data }) => {
    let { open, type, content } = data
    this.setState({
      open,
      type,
      content
    })
  }

  handleClick = () => {
    this.setState({ open: true })
  }

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }

    this.setState({ open: false })
  }

  render() {
    const { classes } = this.props
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={this.state.open}
        autoHideDuration={6000}
        onClose={this.handleClose}
        SnackbarContentProps={{
          'aria-describedby': 'message-id'
        }}
        message={
          <React.Fragment>
            <b>{this.state.content.title}</b>
            <br />
            {this.state.content.message}
          </React.Fragment>
        }
        action={[
          /*<Button
            key="undo"
            color="secondary"
            size="small"
            onClick={this.handleClose}>
            UNDO
          </Button>,*/
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={this.handleClose}>
            <CloseIcon />
          </IconButton>
        ]}
      />
    )
  }
}

Notification.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Notification)
