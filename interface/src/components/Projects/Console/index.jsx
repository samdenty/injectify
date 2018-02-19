import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'
import { switchSection } from '../../../actions'

const styles = theme => ({

})

class Console extends React.Component {
  render() {
    const { classes, project } = this.props

    return (
      <div>{JSON.stringify(project)}</div>
    )
  }
}

export default connect(({ injectify: {section, project} }) => ({ section, project }))(withStyles(styles)(Console))