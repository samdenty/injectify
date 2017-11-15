import ReactDOM, { render } from 'react-dom'
import React, { Component } from "react";
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import { MenuItem } from 'material-ui/Menu';
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
import Dialog, {
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from 'material-ui/Dialog';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

let drawerWidth = 240

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
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  },
  toolbar: {
    minHeight: 64,
  },
  appBarHeader: {
    flex: '1',
    cursor: 'pointer',
    userSelect: 'none',
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
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
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
})

class PersistentDrawer extends Component {
  state = {
    open: false,
    currentProject: null,
    loading: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.parentState.user.login !== this.props.parentState.user.login) {
      if (nextProps.parentState.user.login) {
        this.setState({ open: true })
      } else {
        this.setState({ open: false })
      }
    }
    if (nextProps.parentState.project !== this.props.parentState.project) {
      this.loading(false)
    }
    this.setState({ currentProject: nextProps.parentState.project})
  }

  handleDrawerOpen = () => {
    this.setState({ open: true })
  }

  handleDrawerClose = () => {
    this.setState({ open: false })
  }

  returnHome = () => {
    this.setState({ currentProject: null })
    this.props.emit("project:close")
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

  render() {
    const { classes, theme, signIn } = this.props;
    const { open } = this.state;

    const drawer = (
      <Drawer
        type="persistent"
        classes={{
          paper: classes.drawerPaper,
        }}
        open={open}
      >
        <div className={classes.drawerInner}>
          <div className={classes.drawerHeader}>
            <IconButton onClick={this.handleDrawerClose}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </div>
          <Projects projects={this.props.parentState.projects} projectData={this.props.parentState.project} emit={this.props.emit} classes={classes} token={this.props.token} loading={this.loading.bind(this)} />
        </div>
      </Drawer>
    )
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
                      <Avatar src={`${this.props.parentState.user.avatar_url}&s=40`} />
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
          {drawer}
          {this.state.currentProject ? (
                <main
                  className={classNames(classes.content, classes[`content`], {
                    [classes.contentShift]: open,
                  })}
                >
                  <Paper>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell width="400">Time</TableCell>
                          <TableCell>Username</TableCell>
                          <TableCell>Password</TableCell>
                          <TableCell>Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.currentProject.passwords.map((record, i) => {
                          return (
                            <TableRow key={i}>
                              <TableCell className="time"><Timestamp time={record.timestamp} format='ago'/></TableCell>
                              <TableCell numeric>{record.username}</TableCell>
                              <TableCell numeric>{record.password}</TableCell>
                              <TableCell numeric>
                                <Button color="primary" dense>
                                  More
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <tr ref={el => this.tableEnd = el} className="tableEnd"></tr>
                      </TableBody>
                    </Table>
                  </Paper>
                </main>
              ) : (
                <main
                  className={classNames(classes.content, classes[`content`], {
                    [classes.contentShift]: open,
                  })}
                >
                  {this.props.children}
                </main>
            )
          }
        </div>
      </div>
    );
  }
}

class Projects extends Component {
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
              <ProjectList raised color="primary" key={i} record={project.name} projectData={this.props.projectData} emit={this.props.emit} token={this.props.token} loading={this.props.loading}></ProjectList>
            )}
          </List>
        </div>
			)
		} else {
			return null
		}
	}
}

class ProjectList extends Component {
	handleClickOpen = (a) => {
    this.props.emit("project:close", {
			name: this.props.record
		})
		this.props.emit("project:read", {
			name: this.props.record
    })
    if (this.props.projectData && this.props.record !== this.props.projectData.name) this.props.loading(true)
	}

	render() {
		return (
      <ListItem button onClick={this.handleClickOpen}>
        <ListItemText primary={this.props.record} />
      </ListItem>
		)
	}
}

PersistentDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(PersistentDrawer);