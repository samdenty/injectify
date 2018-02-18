import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { Switch, Route } from 'react-router-dom'

/**
 * Pages
 */
import Overview from './Overview'
import Console from './Console'
import Data from './Data'
import Config from './Config'

export default class extends React.Component {
  render() {
    return (
      <Switch>
        <Route path='/projects/*/console' component={Console} />
        <Route path='/projects/*/data' component={Data} />
        <Route path='/projects/*/config' component={Config} />
        <Route path='/projects/*' component={Overview} />
      </Switch>
    )
  }
}