import React from 'react'

import InstallationCode from './InstallationCode'
import Advanced from './Advanced'

class Overview extends React.Component {
  render() {
    const { classes, settings, selectedProject } = this.props

    return (
      <React.Fragment>
        <InstallationCode />
        <Advanced />
      </React.Fragment>
    )
  }
}

export default Overview
