import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'
import { switchSection } from '../../../actions'

const styles = theme => ({

})

class Config extends React.Component {
  render() {
    const { classes } = this.props

    return (
      <div>Config</div>
    )
  }
}

export default connect(({ injectify: {section} }) => ({ section }))(withStyles(styles)(Config))