import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import Typography from 'material-ui/Typography'
import Dialog, { DialogContent } from 'material-ui/Dialog'
import ReactJson from 'react-json-view'
import Inspector, { chromeDark } from 'react-inspector'

import List, { ListItem, ListItemText } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import Avatar from 'material-ui/Avatar'
import TimeIcon from 'material-ui-icons/AccessTime'
import IPIcon from 'material-ui-icons/Language'
import URLIcon from 'material-ui-icons/Http'

const styles = theme => ({
  backdrop: {
    '& > div:nth-child(1)': {
      backgroundColor: 'rgba(14, 14, 14, 0.5)'
    }
  },
  dialog: {
    backgroundColor: '#151515',
    minWidth: 600,
    maxWidth: '100%'
  }
})

class DataModal extends React.Component {
  render() {
    const { classes, open, selected, close } = this.props

    return (
      <Dialog
        open={!!open}
        onClose={close}
        className={`${classes.backdrop} data-modal`}
      >
        <DialogContent className={classes.dialog}>
          {selected ? (
            <React.Fragment>
              <List>
                <ListItem>
                  <Avatar>
                    <TimeIcon />
                  </Avatar>
                  <ListItemText primary="Timestamp" secondary={selected.timestamp.string} />
                </ListItem>
                <ListItem button onClick={() => window.open(`https://www.iplocation.net/?query=${selected.ip}`)}>
                  <Avatar>
                    <IPIcon />
                  </Avatar>
                  <ListItemText primary="IP Address" secondary={selected.ip} />
                </ListItem>
                <ListItem button onClick={() => window.open(selected.url)}>
                  <Avatar>
                    <URLIcon />
                  </Avatar>
                  <ListItemText primary="URL" secondary={selected.url} />
                </ListItem>
                <Divider />
                <ListItem component="div">
                  {/^string|number$/.test(typeof selected.data) || selected.data === null ? (
                    <div className="inspector">
                      <Inspector data={selected.data} theme={{ ...chromeDark, ...({ ARROW_FONT_SIZE: 9 }) }} />
                    </div>
                  ) : (
                    <ReactJson
                      theme="summerfruit"
                      collapsed={1}
                      src={selected.data}
                      iconStyle="circle"
                    />
                  )}
                </ListItem>
              </List>
            </React.Fragment>
          ) : null}
        </DialogContent>
      </Dialog>
    )
  }
}

DataModal.propTypes = {
  classes: PropTypes.object.isRequired,
}

// We need an intermediary variable for handling the recursive nesting.
const DataModalWrapped = withStyles(styles)(DataModal)

export default DataModalWrapped
