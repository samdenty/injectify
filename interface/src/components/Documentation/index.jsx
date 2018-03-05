import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'

const styles = (theme) => ({
  root: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF',
    overflow: 'hidden'
  },
  iframe: {
    border: 'none',
    width: '100%',
    height: '100%',
  }
})

class Documentation extends React.Component {
  render() {
    const { classes, account } = this.props

    return (
      <div className={classes.root}>
        <iframe
          src={`https://injectify.js.org/?embedded=true${
            account ? `&username=${encodeURIComponent(account.user.id)}` : ''
          }`}
          className={classes.iframe}
        />
      </div>
    )
  }
}

export default connect(({ injectify: { account } }) => ({ account }))(
  withStyles(styles)(Documentation)
)
