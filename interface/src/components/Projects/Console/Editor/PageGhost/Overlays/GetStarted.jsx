import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { withStyles } from 'material-ui/styles'
import PageGhostIcon from 'material-ui-icons/RemoveRedEye'
import ClientsIcon from 'material-ui-icons/ViewList'
import Typography from 'material-ui/Typography'

const styles = theme => ({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    userSelect: 'none'
  },
  icon: {
    width: 70,
    height: 70
  },
  content: {
    color: 'inherit'
  }
})

class Loading extends React.Component {
  render() {
    const { classes, type } = this.props

    return (
      <div className={classes.container}>
        {type === 'pageghost' ? (
          <React.Fragment>
            <PageGhostIcon className={classes.icon} />
            <Typography variant="subheading" className={classes.content}>
              Click on the eye symbol to see what's on their screen
            </Typography>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <ClientsIcon className={classes.icon} />
            <Typography variant="subheading" className={classes.content}>
              Select an IP from the list on the left
            </Typography>
          </React.Fragment>
        )}
      </div>
    )
  }
}

export default withStyles(styles)(Loading)