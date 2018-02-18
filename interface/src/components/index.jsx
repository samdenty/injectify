import React from 'react'
import { connect } from 'react-redux'
import url from 'url'
import { Switch, Route, Link, withRouter } from 'react-router-dom'

/**
 * MUI
 */
import { MuiThemeProvider, createMuiTheme, withStyles } from 'material-ui/styles'
import { grey, indigo } from 'material-ui/colors'

/**
 * Components
 */
import App from './App'
import Drawer from './App/Drawer'
import Header from './App/Header'
import Navigation from './App/Navigation'

/**
 * Sections
 */
import Home from './Home'
import Settings from './Settings'
import Projects from './Projects'

const styles = theme => ({
  content: {
    height: '100%',
    width: '100%',
  }
})

class Injectify extends React.Component {
  render() {
    const { settings, classes } = this.props

    return (
      <MuiThemeProvider theme={createMuiTheme({
        palette: {
          type: settings.dark ? 'dark' : 'light',
          primary: settings.dark ? grey : indigo,
        },
      })}>
        <App>
          <Drawer key="drawer" />
          <Header key="header" />
          <Navigation key="navigation" />
          <div key="content" className={classes.content}>
            {/* <Link to='/'>Home</Link>
            <Link to='/projects/asds/overview'>Overview</Link> */}
            <Switch>
              <Route exact path='/' component={Home} />
              <Route path='/settings' component={Settings} />
              <Route path='/projects/**/*' component={Projects} />
            </Switch>
          </div>
        </App>
      </MuiThemeProvider>
    )
  }
}

export default withRouter(connect(({ injectify: {settings} }) => ({ settings }))(withStyles(styles)(Injectify)))