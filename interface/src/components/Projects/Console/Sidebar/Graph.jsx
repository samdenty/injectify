import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'

import { LineChart } from 'react-easy-chart'

class Graph extends React.Component {
  refreshGraph = () => {
    const { state } = this.props
    const { graph } = clients.console
    if (this._mounted) {
      let totaltime = 100
      let array = []
      if (graph[0].length === 0) {
        for (var i = 0; i < totaltime; i++) {
          array[i] = {
            x: i + 1,
            y: 0
          }
        }
      }
      if (!array.length) array = graph[0]
      array = array.slice(1)
      array.forEach((entry, index) => {
        array[index] = {
          x: index + 1,
          y: entry.y
        }
      })
      array.push({
        x: totaltime,
        y: this.state.clients && Object.keys(this.state.clients).length
      })
      this.setState({
        clientsGraph: [
          array
        ]
      })
      setTimeout(this.refreshGraph, 1000)
    }
  }

  render() {
    const { state } = this.props

    return (
      <LineChart
        axes
        xTicks={-1}
        yTicks={5}
        axisLabels={{ x: 'Time', y: 'Clients' }}
        width={210}
        lineColors={['cyan']}
        data={state.console.graph} />
    )
  }
}


export default connect(({ injectify }) => ({ state: injectify }))(Graph)