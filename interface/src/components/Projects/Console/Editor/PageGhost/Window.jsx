import React from 'react'
import { withStyles } from 'material-ui/styles'
import Tooltip from 'material-ui/Tooltip'

const styles = theme => ({
  iframe: {
    border: 0,
    width: '100%',
    height: '100%'
  }
})

class PageGhost extends React.Component {
  render () {
    const { classes, setRef } = this.props
    return (
      <iframe className={classes.iframe} src="/PageGhost/?embedded" ref={iframe => { setRef(iframe) }} />
    )
  }
}

export default withStyles(styles)(PageGhost)
