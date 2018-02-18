import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'
import { switchPage } from '../../../actions'

import Tabs, { Tab } from 'material-ui/Tabs'
import Typography from 'material-ui/Typography'
import indigo from 'material-ui/colors/indigo'
import { withStyles } from 'material-ui/styles'

/**
 * Icons
 */
import StorageIcon from 'material-ui-icons/Storage'
import TimelineIcon from 'material-ui-icons/Timeline'
import CodeIcon from 'material-ui-icons/Code'
import SettingsIcon from 'material-ui-icons/Settings'

const styles = theme => ({
  tabs: {
    backgroundColor: 'rgba(0,0,0,0.1)'
  }
})

class Navigation extends React.Component {
  state = {
    width: window.innerWidth
  }

  pages = [
    'overview',
    'console',
    'data',
    'config',
  ]

  componentWillMount() {
    this.updateDimensions()
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions)
  }

  updateDimensions = () => {
    this.setState({ width: window.innerWidth });
  }

  handleChange = (event, value) => {
    let { page, dispatch } = this.props
    dispatch(switchPage(this.pages[value]))
  }

  render() {
    const { section, classes } = this.props
    const currentTab = this.pages.indexOf(this.props.page)

    return (
      section === 'projects' ? (
        <Tabs
          value={currentTab}
          onChange={this.handleChange}
          centered={this.state.width >= 400}
          scrollable={this.state.width <= 400}
          scrollButtons={this.state.width < 400 ? 'on' : 'off'}
          indicatorColor={indigo[100]}
          className={classes.tabs}
        >
          <Tab label="Overview" icon={<TimelineIcon />} />
          <Tab label="Console" icon={<CodeIcon />} />
          <Tab label="Data" icon={<StorageIcon />} />
          <Tab label="Config" icon={<SettingsIcon />} />
        </Tabs>
      ) : null
    )
  }
}

export default connect(({ injectify: {section, page} }) => ({ section, page }))(withStyles(styles)(Navigation))