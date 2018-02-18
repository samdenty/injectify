import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog'
import List, { ListItem, ListItemAvatar, ListItemIcon, ListItemText } from 'material-ui/List'
import Divider from 'material-ui/Divider'
import Avatar from 'material-ui/Avatar'
import AddIcon from 'material-ui-icons/Add'
import CloseIcon from 'material-ui-icons/Close'

const styles = theme => ({
  switchUser: {
    minWidth: 350
  },
  remove: {
    cursor: 'pointer'
  },
  active: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  }
})

class SwitchUser extends React.Component {
  render() {
    const { classes, accounts, account, add, remove, open, handleOpen, handleClose } = this.props

    return (
      <Dialog open={open} onClose={handleClose} classes={{ paper: classes.switchUser }}>
        <DialogTitle>
          Switch accounts
        </DialogTitle>
        <div>
          <List>
            {accounts.map((altAccount, i) => (
              <ListItem
                button={altAccount.user.id !== account.user.id}
                key={i}
                className={account.user.id === altAccount.user.id ? classes.active : ''}
              >
                <ListItemAvatar>
                  <Avatar
                    src={`https://avatars3.githubusercontent.com/u/${altAccount.user.id}?v=4&s=70`} />
                </ListItemAvatar>
                <ListItemText primary={altAccount.user.login} />
                <ListItemAvatar>
                  <Avatar className={classes.remove}>
                    <CloseIcon onClick={() => remove(altAccount.user.id)} />
                  </Avatar>
                </ListItemAvatar>
              </ListItem>
            ))}
            {accounts.length ? <Divider /> : ''}
            <ListItem
              button
              onClick={add.bind(this)}
            >
              <ListItemAvatar>
                <Avatar>
                  <AddIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="add account" />
            </ListItem>
          </List>
        </div>
      </Dialog>
    )
  }
}

export default connect(({ injectify: {account, accounts} }) => ({ account, accounts }))(withStyles(styles)(SwitchUser))