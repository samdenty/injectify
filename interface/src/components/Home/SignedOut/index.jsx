import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'
import Typography from 'material-ui/Typography'

const styles = theme => ({
  root: {
    marginTop: 40
  },
  '@media (max-width: 700px)': {
    root: {
      marginTop: 30
    }
  },
  '@media (max-width: 500px)': {
    root: {
      marginTop: 20
    }
  },
  content: {
    padding: '5px 16px',
  },
  image: {
    width: '60%'
  }
})

class Home extends React.Component {
  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <Typography variant="headline" align="center">
          <img src="https://cdn.samdd.me/injectify/home.gif" className={classes.image} />
          Perform Advanced MiTM attacks on websites with ease
        </Typography>
      </div>
    )
  }
}

export default connect(({ injectify: {account} }) => ({ account }))(withStyles(styles)(Home))
