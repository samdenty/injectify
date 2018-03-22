import React from 'react'

import InstallationCode from './InstallationCode'

class Overview extends React.Component {
  render() {
    const { classes, settings, selectedProject } = this.props

    return (
      <React.Fragment>
        <InstallationCode />
      </React.Fragment>
    )
  }
}

export default Overview
