import React from 'react'
import { connect } from 'react-redux'

import { withStyles } from 'material-ui/styles'
import SyntaxHighlighter from 'react-syntax-highlighter'
import syntaxDark from 'react-syntax-highlighter/styles/hljs/dracula'
import syntaxLight from 'react-syntax-highlighter/styles/hljs/github'
import copy from 'copy-to-clipboard'

import Card, {
  CardHeader,
  CardMedia,
  CardContent,
  CardActions
} from 'material-ui/Card'
import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import Switch from 'material-ui/Switch'
import List, {
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader
} from 'material-ui/List'

import PayloadIcon from 'material-ui-icons/Memory'
import DebugIcon from 'material-ui-icons/DeveloperMode'
import CheckIcon from 'material-ui-icons/Check'
import TestIcon from 'material-ui-icons/Launch'
import CopyIcon from 'material-ui-icons/ContentCopy'

const styles = (theme) => ({
  root: {
    margin: theme.spacing.unit * 4,
    backgroundColor: theme.palette.background.paper,
    overflow: 'hidden'
  },
  '@media (max-width: 700px)': {
    root: {
      margin: theme.spacing.unit * 2
    }
  },
  '@media (max-width: 500px)': {
    root: {
      margin: theme.spacing.unit
    }
  },
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)'
  },
  headerDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  icon: {
    marginRight: 10,
    color: '#fff'
  },
  copyIcon: {
    height: 20
  },
  copyButton: {
    marginRight: 10
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    padding: '5px 16px'
  },
  code: {
    '& pre': {
      whiteSpace: 'pre-wrap',
      background: 'none !important'
    }
  },
  codeDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  codeLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)'
  }
})

class InstallationCode extends React.Component {
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
    let win = window.open(
      `/demo/project/?${encodeURIComponent(selectedProject.name)}`
    )
    // Disable page hopping
    win.opener = null
  }

  render() {
    const { classes, settings, selectedProject } = this.props

    const url = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
      location.host
    }/i1?${this.state.debug ? '$' : ''}${btoa(selectedProject.name)}`
    const code = `!function i‍‍(){var i=setTimeout;self.i‍=new WebSocket(${JSON.stringify(
      url
    )}),i‍.onmessage=function(d){try{i(d.data)}catch(i‍‍‍){i‍.send('e:'+JSON.stringify(i‍‍‍.stack))}},i‍.onclose=function(){i(i‍‍,1e3)}}();`

    return (
      <Card className={classes.root}>
        <CardHeader
          avatar={<PayloadIcon className={classes.icon} />}
          className={settings.dark ? classes.headerDark : classes.header}
          action={
            <IconButton
              onClick={() => this.copy(code)}
              className={classes.copyButton}>
              {this.state.copied ? (
                <CheckIcon className={classes.copyIcon} />
              ) : (
                <CopyIcon className={classes.copyIcon} />
              )}
            </IconButton>
          }
          title="Installation code"
          subheader="Start hooking browsers"
        />
        <CardContent
          className={`${classes.content} ${classes.code} ${
            settings.dark ? classes.codeDark : classes.codeLight
          }`}>
          <SyntaxHighlighter
            language="javascript"
            style={settings.dark ? syntaxDark : syntaxLight}
            wrapLines={true}>
            {code}
          </SyntaxHighlighter>
        </CardContent>
        <CardContent className={classes.content}>
          <List>
            <ListItem>
              <ListItemIcon>
                <DebugIcon />
              </ListItemIcon>
              <ListItemText
                primary="Debug mode"
                secondary="Client-side console output, ability to inspect websocket messages, access to sourcemaps and more"
              />
              <ListItemSecondaryAction>
                <Switch
                  onChange={(event, value) => this.set('debug', value)}
                  checked={this.state.debug}
                />
              </ListItemSecondaryAction>
            </ListItem>
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

export default connect(({ injectify: { selectedProject, settings } }) => ({
  selectedProject,
  settings
}))(withStyles(styles)(InstallationCode))
