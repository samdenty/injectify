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
  disabled = true
  autoexecute = `injectify.log('initial')`

  handleChange = (value) => {
    const { autoexecute } = this
    const disabled = value === autoexecute
    if (disabled !== this.disabled) this.props.disabled(disabled)
    this.disabled = disabled
  }

  render() {
    const { autoexecute } = this
    const { classes, projects, selectedProject } = this.props
    const project = projects[selectedProject.index]

    return (
      <React.Fragment>
        <div className={classes.editor}>
          <CodeEditor
            disabled={!!this.props.readOnly}
            default={autoexecute}
            // onMount={(type, editor) => {
            //   console.log(type, editor.getValue())
            // }}
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
