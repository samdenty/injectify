import React from 'react'
import { connect } from 'react-redux'

import { withStyles } from 'material-ui/styles'
import SyntaxHighlighter from 'react-syntax-highlighter'
import syntaxDark from 'react-syntax-highlighter/styles/hljs/tomorrow-night'
import syntaxLight from 'react-syntax-highlighter/styles/hljs/github'
import Card, { CardContent } from 'material-ui/Card'
import Button from 'material-ui/Button'
import Tooltip from 'material-ui/Tooltip'
import Switch from 'material-ui/Switch'
import Divider from 'material-ui/Divider'
import copy from 'copy-to-clipboard'
import List, {
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
} from 'material-ui/List'
import DebugIcon from 'material-ui-icons/DeveloperMode'
import CheckIcon from 'material-ui-icons/Check'
import TestIcon from 'material-ui-icons/Launch'
import CopyIcon from 'material-ui-icons/ContentCopy'

const styles = theme => ({
  root: {
    margin: theme.spacing.unit * 4,
    backgroundColor: theme.palette.background.paper,
    overflow: 'hidden'
  },
  '@media (max-width: 700px)': {
    root: {
      margin: theme.spacing.unit * 2,
    }
  },
  '@media (max-width: 500px)': {
    root: {
      margin: theme.spacing.unit,
    }
  },
  icon: {
    marginRight: 6,
    height: 18
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    padding: '5px 16px',
  },
  code: {
    '& pre': {
      whiteSpace: 'pre-wrap',
      background: 'none !important'
    }
  },
  codeDark: {
    backgroundColor: '#1D1F21',
    boxShadow: '0px -36px 30px 34px #1D1F21'
  },
  codeLight: {
    backgroundColor: '#f3efef',
    boxShadow: '0px -36px 30px 34px rgba(0, 0, 0, 0.25)'
  },
  button: {
    opacity: 0.7,
    float: 'right'
  },
})

class Overview extends React.Component {
  state = {
    debug: false,
    copied: false
  }

  set(state, value) {
    this.setState({
      copied: false,
      [state]: value
    })
  }

  copy(code) {
    this.setState({
      copied: true
    })
    copy(code)
    setTimeout(() => {
      this.setState({
        copied: false
      })
    }, 2000)
  }

  test() {
    const { selectedProject } = this.props
    let win = window.open(`/demo/project/?${encodeURIComponent(selectedProject.name)}`)
    // Disable page hopping
    win.opener = null
  }

  render() {
    const { classes, settings, selectedProject } = this.props

    const url = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/i?${this.state.debug ? '$' : ''}${btoa(selectedProject.name)}`
    const code = `!function i(){window.ws=new WebSocket(${JSON.stringify(url)}),ws.onmessage=function(d){try{eval(JSON.parse(d.data).d)}catch(e){ws.send(JSON.stringify({t:"e",d:e.stack}))}},ws.onclose=function(){setTimeout(i,1e3)}}();`

    return (
      <Card className={classes.root}>
        <CardContent className={`${classes.content} ${classes.code} ${settings.dark ? classes.codeDark : classes.codeLight}`}>
          <List subheader={<ListSubheader>JavaScript payload</ListSubheader>}>
            <SyntaxHighlighter
              language='javascript'
              style={settings.dark ? syntaxDark : syntaxLight}
              wrapLines={true}
            >
              {code}
            </SyntaxHighlighter>
            <Tooltip title="Copy code to clipboard" placement="left">
              <Button size="small" className={classes.button} onClick={() => this.copy(code)}>
                {this.state.copied ? <CheckIcon className={classes.icon} /> : <CopyIcon className={classes.icon} />}
                Copy
              </Button>
            </Tooltip>
          </List>
        </CardContent>
        <CardContent className={classes.content}>
          <List>
            <ListItem>
              <ListItemIcon>
                <DebugIcon />
              </ListItemIcon>
              <ListItemText primary="Debug mode" secondary="Client-side console output, ability to inspect websocket messages, access to sourcemaps and more" />
              <ListItemSecondaryAction>
                <Switch
                  onChange={(event, value) => this.set('debug', value)}
                  checked={this.state.debug}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem button onClick={this.test.bind(this)}>
              <ListItemIcon>
                <TestIcon />
              </ListItemIcon>
              <ListItemText primary="Test it out on a demo page" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    )
  }
}

export default connect(({ injectify: {selectedProject, settings} }) => ({ selectedProject, settings }))(withStyles(styles)(Overview))