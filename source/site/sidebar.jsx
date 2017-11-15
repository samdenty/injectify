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
import Dialog, {
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from 'material-ui/Dialog';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

const drawerWidth = 240;

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
    height: 'calc(100% - 64px)',
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
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.parentState.user.login !== this.props.parentState.user.login) {
      if (nextProps.parentState.user.login) {
        this.setState({ open: true })
      } else {
        this.setState({ open: false })
      }
    }
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  }

  handleDrawerClose = () => {
    this.setState({ open: false });
  }

  render() {
    const { classes, theme, signIn, signOut } = this.props;
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
          <Projects projects={this.props.parentState.projects} projectData={this.props.parentState.project} emit={this.props.emit} classes={classes} />
        </div>
      </Drawer>
    )

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open,
            })}
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
              <Typography type="title" color="inherit" noWrap className={classes.appBarHeader}>
                Injectify
              </Typography>
              {this.props.parentState.user.login ? (
                  <Tooltip title="Logout" placement="bottom">
                    <Button color="contrast" onClick={signOut} className="signed-in">
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
          {drawer}
          <main
            className={classNames(classes.content, classes[`content`], {
              [classes.contentShift]: open,
            })}
          >
            {this.props.children}
          </main>
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
              <Records raised color="primary" key={i} record={project.name} projectData={this.props.projectData} emit={this.props.emit}></Records>
            )}
          </List>
        </div>
			)
		} else {
			return null
		}
	}
}

class Records extends Component {
	state = {
		open: false
	}

	componentWillUpdate() {
		this.scrollToBottom()
	}

	componentDidUpdate() {
		if (this.props.projectData) this.scrollToBottom()
	}

	handleClickOpen = (a) => {
		this.props.emit("project:read", {
			name: this.props.record
		})
		this.setState({ open: true });
	};

	handleRequestClose = () => {
		this.props.emit("project:close", {
			name: this.props.record
		})
		this.setState({ open: false });
	}

	scrollToBottom = (hide) => {
		const node = ReactDOM.findDOMNode(this.scrollContainer)
		if (node) {
			setTimeout(() =>{
				try {
					node.scrollTo({
						'behavior': 'smooth',
						'left': 0,
						'top': node.scrollHeight
					});
				} catch(e) {
					node.scrollTop = node.scrollHeight
				}
			}, 0)
		}
	}

	viewJS = () => {
		window.open("/payload/?project=" + encodeURIComponent(this.props.projectData.name))
	}

	viewJSON = () => {
		window.open("/api/" + encodeURIComponent(token) + "/" + encodeURIComponent(this.props.projectData.name) /*+ "&download=true"*/)
	}

	render() {
		return (
			<div>
        <ListItem button onClick={this.handleClickOpen}>
          <ListItemText primary={this.props.record} />
        </ListItem>
				{this.props.projectData && this.props.projectData.name == this.props.record ? (
					<Dialog open={this.state.open} onRequestClose={this.handleRequestClose}>
						<DialogTitle>
							<span>{`Project ${this.props.projectData.name}`}</span>
						</DialogTitle>
						<DialogContent ref={(el) => { this.scrollContainer = el }}>
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
									{this.props.projectData.passwords.map((record, i) => {
										return (
											<TableRow key={i}>
												<TableCell className="time"><Timestamp time={record.timestamp} format='ago'/></TableCell>
												<TableCell numeric>{record.username}</TableCell>
												<TableCell numeric>{record.password}</TableCell>
												<TableCell numeric>
													<Button color="primary">
														More
													</Button>
												</TableCell>
											</TableRow>
										);
									})}
									<tr ref={el => this.tableEnd = el} className="tableEnd"></tr>
								</TableBody>
							</Table>
						</DialogContent>
						<DialogActions>
							<Tooltip title="Payload for this project" placement="left">
								<Button onClick={this.viewJS} color="primary">
									Javascript code
								</Button>
							</Tooltip>
							<Button onClick={this.viewJSON} color="primary" autoFocus>
								View JSON
							</Button>
						</DialogActions>
					</Dialog>
				) : null}
			</div>
		)
	}
}

PersistentDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(PersistentDrawer);