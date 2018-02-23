import React from 'react'
import { withStyles } from 'material-ui/styles'
import Rnd from 'react-rnd'
import OpenIcon from 'material-ui-icons/OpenInNew'
import Tooltip from 'material-ui/Tooltip'
import IconButton from 'material-ui/IconButton'
import Window from './Window'

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 3
  },
  header: {
    display: 'flex',
    backgroundColor: '#514E4F',
    alignItems: 'center',
    lineHeight: 1,
    boxShadow: 'rgba(62, 61, 61, 0.71) 0px 1px 3px',
    width: '100%',
    height: '2.7rem',
    boxSizing: 'border-box',
    padding: '0.5rem',
    flexShrink: 0
  },
  address: {
    height: '1.6rem',
    width: '100%',
    borderRadius: 2,
    border: 'none',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Roboto',
    backgroundColor: '#636164',
    boxShadow: '0px 0px 1px 0 rgba(0, 0, 0, 0.55)',
    padding: 6,
    outline: 'none'
  },
  button: {
    color: '#9e9e9e'
  }
})

class PageGhost extends React.Component {
  listener = null
  iframe = null

  componentDidMount() {
    this.listener = this.message.bind(this)
    window.addEventListener('PageGhost', this.listener)
  }

  componentWillUnmount() {
    window.removeEventListener('PageGhost', this.listener)
  }

  message = ({ data }) => {
    this.iframe.contentWindow.postMessage(data, '*')
  }

  triggerResize = (state = false) => {
    if (state) {
      this.dynamicResize = setInterval(() => {
        window.dispatchEvent(new Event('resize'))
      }, 100)
    } else {
      clearInterval(this.dynamicResize)
      window.dispatchEvent(new Event('resize'))
    }
  }

  setRef = ref => {
    this.iframe = ref
  }

  render () {
    const { classes } = this.props
    return (
      <Rnd
        bounds="parent"
        default={{ width: 200 }}
        enableResizing={{
          top: false,
          right: false,
          bottom: false,
          left: true,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
        onResizeStart={() => this.triggerResize(true)}
        onResizeStop={() => this.triggerResize(false)}
        disableDragging={true}
        className="inject-pageghost"
        minWidth={60}
        resizeHandleClasses={{ left: 'resizer' }}
      >
        <div className={classes.root}>
          <div className={classes.header}>
            <input className={classes.address} />
            <Tooltip title='Open in new window' placement='bottom'>
              <IconButton className={classes.button}>
                <OpenIcon />
              </IconButton>
            </Tooltip>
          </div>
          <Window setRef={this.setRef.bind(this)} />
        </div>
      </Rnd>
    )
  }
}

export default withStyles(styles)(PageGhost)
