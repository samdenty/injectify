import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'
import Typography from 'material-ui/Typography'
import { switchSection } from '../../../actions'

const styles = theme => ({
  header: {
    flex: '1',
    cursor: 'pointer',
    userSelect: 'none',
    paddingLeft: 35,
  },
  logo: {
    position: 'absolute',
    marginLeft: -35,
    height: 24,
  },
  '@media (max-width: 380px)': {
    header: {
      textOverflow: 'initial'
    },
    title: {
      visibility: 'hidden'
    },
  },
  '@media (max-width: 270px)': {
    header: {
      display: 'none',
    }
  },
})

class Header extends React.Component {
  returnHome = () => {
    let { dispatch } = this.props
    dispatch(switchSection('home'))
  }

  render() {
    const { classes } = this.props

    return (
      <Typography
        variant="title"
        color="inherit"
        noWrap
        onClick={this.returnHome.bind(this)}
        className={classes.header}>
        <img src="/assets/logo/injectify.svg" className={classes.logo} />
        <span className={classes.title}>
          Injectify
        </span>
      </Typography>
    )
  }
}

export default connect(({ injectify: {section} }) => ({ section }))(withStyles(styles)(Header))