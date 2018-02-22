import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'

const styles = theme => ({

})

class Data extends React.Component {
  render () {
    const { classes, projects, selectedProject } = this.props
    const project = projects[selectedProject.index]

    return (
      <div>{JSON.stringify(project)}</div>
    )
  }
}

export default connect(({ injectify: {section, projects, selectedProject} }) => ({ section, projects, selectedProject }))(withStyles(styles)(Data))
