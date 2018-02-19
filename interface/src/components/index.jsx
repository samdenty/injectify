import React from 'react'
import { connect } from 'react-redux'
import url from 'url'
import { Switch, Route, Link, withRouter } from 'react-router-dom'

/**
 * MUI
 */
import { MuiThemeProvider, createMuiTheme, withStyles } from 'material-ui/styles'
import { grey, indigo } from 'material-ui/colors'
import NProgress from 'nprogress'

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

NProgress.configure({
  template: `
    <div class="bar" role="bar">
      <dt></dt>
      <dd></dd>
    </div>
  `,
})

const styles = theme => ({
  '@global': {
    '#nprogress': {
      pointerEvents: 'none',
      '& .bar': {
        position: 'fixed',
        background: '#000',
        borderRadius: 1,
        zIndex: theme.zIndex.tooltip,
        top: 0,
        left: 0,
        width: '100%',
        height: 2,
      },
      '& dd, & dt': {
        position: 'absolute',
        top: 0,
        height: 2,
        boxShadow: `${
          theme.palette.type === 'light' ? theme.palette.common.black : theme.palette.common.white
        } 1px 0 6px 1px`,
        borderRadius: '100%',
        animation: 'nprogress-pulse 2s ease-out 0s infinite',
      },
      '& dd': {
        opacity: 0.6,
        width: 20,
        right: 0,
        clip: 'rect(-6px,22px,14px,10px)',
      },
      '& dt': {
        opacity: 0.6,
        width: 180,
        right: -80,
        clip: 'rect(-6px,90px,14px,-6px)',
      },
    },
  },
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
          <React.Fragment key="content">
            {/* <Link to='/'>Home</Link>
            <Link to='/projects/asds/overview'>Overview</Link> */}
            <Switch>
              <Route exact path='/' component={Home} />
              <Route path='/settings' component={Settings} />
              <Route path='/projects/**/*' component={Projects} />
            </Switch>
          </React.Fragment>
        </App>
      </MuiThemeProvider>
    )
  }
}

export default withRouter(connect(({ injectify: {settings} }) => ({ settings }))(withStyles(styles)(Injectify)))