import React from 'react'
import { connect } from 'react-redux'
import { updateSettings } from '../../actions'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import List, {
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
} from 'material-ui/List'
import Card, { CardContent } from 'material-ui/Card'
import Switch from 'material-ui/Switch'
import DarkIcon from 'material-ui-icons/InvertColors'

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

class Settings extends React.Component {

  updateSetting = (setting, value) => {
    const { dispatch } = this.props
    dispatch(updateSettings({
      [setting]: value
    }))
  }

  render() {
    const { classes, settings } = this.props

    return (
      <Card className={classes.root}>
        <CardContent className={classes.content}>
          <List subheader={<ListSubheader>Settings</ListSubheader>}>
            <ListItem>
              <ListItemIcon>
                <DarkIcon />
              </ListItemIcon>
              <ListItemText primary="Dark mode" />
              <ListItemSecondaryAction>
                <Switch
                  onChange={(event, value) => this.updateSetting('dark', value)}
                  checked={settings.dark}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>
    )
  }
}

Settings.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default connect(({ injectify: {settings} }) => ({ settings }))(withStyles(styles)(Settings))