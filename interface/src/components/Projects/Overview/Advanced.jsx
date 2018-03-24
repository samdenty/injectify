import React from 'react'
import { connect } from 'react-redux'

import { withStyles } from 'material-ui/styles'
import Card, { CardHeader, CardContent } from 'material-ui/Card'
import List, {
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader
} from 'material-ui/List'

import DefaultQuery from './DefaultQuery.gql'
import PayloadIcon from 'material-ui-icons/Memory'
import GraphQLIcon from './GraphQLIcon'

const styles = (theme) => ({
  root: {
    margin: theme.spacing.unit * 4,
    backgroundColor: theme.palette.background.paper,
    overflow: 'hidden'
  },
  '@media (max-width: 700px)': {
    root: {
      margin: theme.spacing.unit * 2
    }
  },
  '@media (max-width: 500px)': {
    root: {
      margin: theme.spacing.unit
    }
  },
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)'
  },
  headerDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  icon: {
    marginRight: 10,
    color: '#fff'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    padding: '5px 16px'
  }
})

class Advanced extends React.Component {
  graphiql() {
    const { account, selectedProject } = this.props
    const variables = {
      project: selectedProject.name
    }
    window.open(
      `/api?token=${encodeURIComponent(
        account.token
      )}&query=${encodeURIComponent(
        DefaultQuery
      )}&variables=${encodeURIComponent(JSON.stringify(variables))}`
    )
  }

  render() {
    const { classes, settings } = this.props

    return (
      <Card className={classes.root}>
        <CardHeader
          avatar={<PayloadIcon className={classes.icon} />}
          className={settings.dark ? classes.headerDark : classes.header}
          title="Advanced"
          subheader="Unleash the full power of Injectify"
        />
        <CardContent className={classes.content}>
          <List>
            <ListItem button onClick={this.graphiql.bind(this)}>
              <ListItemIcon>
                <GraphQLIcon />
              </ListItemIcon>
              <ListItemText
                primary="GraphQL API"
                secondary="Access to the online GraphiQL editor, allowing you to make API requests"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    )
  }
}

export default connect(
  ({ injectify: { account, settings, selectedProject } }) => ({
    account,
    settings,
    selectedProject
  })
)(withStyles(styles)(Advanced))
