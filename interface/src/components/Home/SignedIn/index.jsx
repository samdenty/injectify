import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'
import Card, { CardContent } from 'material-ui/Card'

const styles = theme => ({
  root: {
    margin: theme.spacing.unit * 4,
    backgroundColor: theme.palette.background.paper,
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
  content: {
    padding: '5px 16px',
  }
})

class Home extends React.Component {
  render() {
    const { classes, settings } = this.props

    return (
      <Card className={classes.root}>
        <CardContent className={classes.content}>
        select a project on the left
        </CardContent>
      </Card>
    )
  }
}

export default connect(({ injectify: {account} }) => ({ account }))(withStyles(styles)(Home))
