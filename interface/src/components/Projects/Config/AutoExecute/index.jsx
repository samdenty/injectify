import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'

import Button from 'material-ui/Button'

import CodeEditor from '../../../CodeEditor'

const styles = (theme) => ({
  editor: {
    height: 400
  }
})

class AutoExecute extends React.Component {
  autoexecute = `injectify.log('initial')`

  handleChange = (value) => {
    const { projects, selectedProject } = this.props
    const project = projects[selectedProject.index]

    const disabled = value === project.config.autoexecute
    this.props.disabled(disabled)
  }

  render() {
    const { classes, projects, selectedProject } = this.props
    const project = projects[selectedProject.index]

    return (
      <React.Fragment>
        <div className={classes.editor}>
          <CodeEditor
            disabled={!!this.props.readOnly}
            default={project.config.autoexecute}
            onMount={this.props.onMount.bind(this)}
            onChange={this.handleChange.bind(this)}
            options={{
              minimap: {
                enabled: false
              }
            }}
          />
        </div>
      </React.Fragment>
    )
  }
}

export default connect(({ injectify: { projects, selectedProject } }) => ({
  projects,
  selectedProject
}))(withStyles(styles)(AutoExecute))
