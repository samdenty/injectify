import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'
import Typography from 'material-ui/Typography'
import IconButton from 'material-ui/IconButton'
import Tooltip from 'material-ui/Tooltip'
import NewProjectIcon from 'material-ui-icons/Add'
import { toggleModal } from '../../../actions'
import Accounts from '../Accounts'

const styles = (theme) => ({
  root: {
    display: 'flex',
    width: '100%'
  },
  header: {
    flex: '1',
    cursor: 'pointer',
    userSelect: 'none',
    paddingLeft: 35
  },
  logo: {
    position: 'absolute',
    marginLeft: -35,
    height: 24
  },
  '@media (max-width: 380px)': {
    header: {
      textOverflow: 'initial'
    },
    title: {
      visibility: 'hidden'
    }
  },
  '@media (max-width: 270px)': {
    header: {
      display: 'none'
    }
  }
})

class Header extends React.Component {
  newProject = () => {
    let { dispatch } = this.props
    dispatch(toggleModal('newProject'))
  }

  render() {
    const { classes, account } = this.props
    return (
      <React.Fragment>
        <Typography
          variant="title"
          color="inherit"
          noWrap
          className={classes.header}>
          <img src="/assets/logo/injectify.svg" className={classes.logo} />
          <span className={classes.title}>Injectify</span>
        </Typography>
        {account ? (
          <Tooltip title="New project" placement="bottom">
            <IconButton onClick={this.newProject}>
              <NewProjectIcon />
            </IconButton>
          </Tooltip>
        ) : null}
        <Accounts />
      </React.Fragment>
    )
  }
}

export default connect(({ injectify: { section, account } }) => ({
  section,
  account
}))(withStyles(styles)(Header))
