import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'
import { CircularProgress } from 'material-ui/Progress'

const styles = theme => ({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  progress: {

  }
})

class Loading extends React.Component {
  render() {
    const { classes, project } = this.props

    return (
      <div className={classes.container}>
        <CircularProgress className={classes.progress} size={50} />
      </div>
    )
  }
}

export default connect(({ injectify: {section, project} }) => ({ section, project }))(withStyles(styles)(Loading))