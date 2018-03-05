import React from 'react'
import { connect } from 'react-redux'

import SignedIn from './SignedIn'
import SignedOut from './SignedOut'

class HomeSwitcher extends React.Component {
  render() {
    const { classes, account } = this.props

    return (
      <React.Fragment>
        {account ? (
          <SignedIn />
        ) : (
          <SignedOut />
        )}
      </React.Fragment>
    )
  }
}

export default connect(({ injectify: {account} }) => ({ account }))(HomeSwitcher)
