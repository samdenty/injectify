import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import classNames from 'classnames'
import Drawer from 'material-ui/Drawer'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Button from 'material-ui/Button'
import List from 'material-ui/List'
import IconButton from 'material-ui/IconButton'
import MenuIcon from 'material-ui-icons/Menu'
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft'
import SvgIcon from 'material-ui/SvgIcon'

import { toggleDrawer } from '../../actions'

const drawerWidth = 240

const styles = theme => ({
  root: {
    width: '100%',
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
  },
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  appFrameDark: {
    backgroundColor: '#303030'
  },
  appBar: {
    position: 'absolute',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: '#3F51B5',
    color: '#fff',
  },
  gutters: {
    paddingRight: '24px !important',
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    }
  },
  drawerPaper: {
    [theme.breakpoints.up('md')]: {
      position: 'relative',
    },
    height: '100%',
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  github: {
    position: 'absolute',
    left: 15
  },
  content: {
    position: 'relative',
    overflowY: 'auto',
    width: '100%',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    // padding: theme.spacing.unit * 3,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    height: 'calc(100% - 64px)',
    marginTop: 64,
    [theme.breakpoints.up('md')]: {
      marginLeft: -drawerWidth,
    },
  },
  contentWithTabs: {
    height: 'calc(100% - 136px)',
    marginTop: 136,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  appBarShift: {
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
})

class App extends React.Component {
  state = {
    mobile: window.innerWidth <= 960
  }

  componentWillMount() {
    this.resizeListener = this.handleResize.bind(this)
    window.addEventListener('resize', this.resizeListener)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener)
  }

  triggerResize = () => {
    this.dynamicResize = setInterval(() => {
      window.dispatchEvent(new Event('resize'))
    }, 50)
    setTimeout(() => {
      clearInterval(this.dynamicResize)
    }, 300)
  }

  handleResize = () => {
    this.setState({
      mobile: window.innerWidth <= 960
    })
  }

  handleDrawerOpen = () => {
    const { dispatch } = this.props
    dispatch(toggleDrawer(true))
    this.triggerResize()
  }

  handleDrawerClose = () => {
    const { dispatch } = this.props
    dispatch(toggleDrawer(false))
    this.triggerResize()
  }

  getComponent(key) {
    if (this.props.children) {
      return this.props.children.filter((comp) => {
        return comp.key === key
      })
    }
  }

  render() {
    const { classes, theme, section, drawerOpen, settings } = this.props

    return (
      <div className={`app ${settings.dark ? 'dark' : ''} ${classes.appFrame}`}>
        <div className={`main ${settings.dark ? `${classes.appFrameDark}` : ''} ${classes.appFrame}`}>
          <AppBar
            className={classNames(classes.appBar, {
              [classes.appBarShift]: drawerOpen,
            })}
          >
            <Toolbar disableGutters={this.state.mobile || !drawerOpen} classes={{ root: classes.gutters }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, drawerOpen && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              {this.getComponent('header')}
            </Toolbar>
            {this.getComponent('navigation')}
          </AppBar>
          <Drawer
            variant={this.state.mobile ? "temporary" : "persistent"}
            classes={{
              paper: classes.drawerPaper,
            }}
            open={drawerOpen}
            onClose={this.handleDrawerClose}
            ModalProps={{
              keepMounted: true,
            }}
          >
            <div className={classes.drawerInner}>
              <div className={classes.drawerHeader}>
                <Button size="small" className={classes.github} onClick={() => window.open('https://github.com/samdenty99/injectify')}>
                  <SvgIcon viewBox="0 0 16 16" className={classes.leftIcon}>
                    <path d="M7.499,1C3.91,1,1,3.906,1,7.49c0,2.867,1.862,5.299,4.445,6.158C5.77,13.707,6,13.375,6,13.125 c0-0.154,0.003-0.334,0-0.875c-1.808,0.392-2.375-0.875-2.375-0.875c-0.296-0.75-0.656-0.963-0.656-0.963 c-0.59-0.403,0.044-0.394,0.044-0.394C3.666,10.064,4,10.625,4,10.625c0.5,0.875,1.63,0.791,2,0.625 c0-0.397,0.044-0.688,0.154-0.873C4.111,10.02,2.997,8.84,3,7.208c0.002-0.964,0.335-1.715,0.876-2.269 C3.639,4.641,3.479,3.625,3.961,3c1.206,0,1.927,0.873,1.927,0.873s0.565-0.248,1.61-0.248c1.045,0,1.608,0.234,1.608,0.234 S9.829,3,11.035,3c0.482,0.625,0.322,1.641,0.132,1.918C11.684,5.461,12,6.21,12,7.208c0,1.631-1.11,2.81-3.148,3.168 C8.982,10.572,9,10.842,9,11.25c0,0.867,0,1.662,0,1.875c0,0.25,0.228,0.585,0.558,0.522C12.139,12.787,14,10.356,14,7.49 C14,3.906,11.09,1,7.499,1z" />
                  </SvgIcon>
                  GitHub
                </Button>
                <IconButton onClick={this.handleDrawerClose}>
                  <ChevronLeftIcon />
                </IconButton>
              </div>
              {this.getComponent('drawer')}
            </div>
          </Drawer>
          <main
            className={classNames(classes.content, {
              [classes.contentShift]: drawerOpen,
              [classes.contentWithTabs]: this.props.section === 'projects',
            })}
          >
            {this.getComponent('content')}
          </main>
        </div>
      </div>
    )
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
}

export default connect(({ injectify: {section, drawerOpen, settings} }) => ({ section, drawerOpen, settings }))(withStyles(styles, { withTheme: true })(App))