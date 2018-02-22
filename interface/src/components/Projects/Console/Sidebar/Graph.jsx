import React from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

import { LineChart } from 'react-easy-chart'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import Tooltip from 'material-ui/Tooltip'
import copy from 'copy-to-clipboard'
import { updateGraph } from '../../../../actions'

class Graph extends React.Component {
  state = {
    graph: [
      [],
      []
    ],
    tooltip: {
      open: false,
      title: ''
    }
  }
  timer = null
  times = 100

  componentDidMount() {
    this._mounted = true
    this.refreshGraph()
  }

  componentWillUnmount() {
    this._mounted = false
  }

  shouldComponentUpdate(nextProps, nextState) {
    const project = this.props.projects[this.props.selectedProject.index].console.state
    const nextProject = nextProps.projects[nextProps.selectedProject.index].console.state

    return !_.isEqual(nextState.graph, this.state.graph) ||
      _.isEqual(project, nextProject)
  }

  stub = (type) => {
    let stub = []
    for (let i = 0; i < this.times; i++) {
      stub.push({
        x: i + 1,
        y: 0,
        t: type
      })
    }
    return stub
  }

  refreshGraph = () => {
    let { dispatch, projects, selectedProject } = this.props
    let project = projects[selectedProject.index]

    if (this._mounted) {
      let graph = this.state.graph

      /**
       * Fill the graph with blank data
       */
      if (graph[0].length === 0) graph[0] = this.stub(0)
      if (graph[1].length === 0) graph[1] = this.stub(1)

      graph[0].forEach((point, i) => {
        graph[0][i] = {
          ...graph[0][i],
          x: i + 1
        }
      })

      graph[1].forEach((point, i) => {
        graph[1][i] = {
          ...graph[1][i],
          x: i + 1
        }
      })

      let totalSessions = 0
      let totalClients = 0
      if (project.console.state.clients) {
        totalClients = _(project.console.state.clients).size()
        _.forEach(project.console.state.clients, client => {
          if (client.sessions) {
            totalSessions += client.sessions.length
          }
        })
      }

      graph[0].push({
        x: this.times,
        y: totalClients,
        t: 0
      })

      graph[1].push({
        x: this.times,
        y: totalSessions,
        t: 1
      })

      graph[0] = graph[0].slice(1)
      graph[1] = graph[1].slice(1)

      if (this._mounted) {
        this.setState({
          graph
        })
      }

      setTimeout(this.refreshGraph, 1000)
    }
  }

  mouseOverHandler = (point) => {
    clearTimeout(this.timer)
    this.setState({
      tooltip: {
        open: true,
        title: `${point.y} ${point.t === 0 ? `online client` : `total tab`}${point.y !== 1 ? 's' : ''}`
      }
    })
  }

  mouseOutHandler = (point) => {
    this.timer = setTimeout(() => {
      this.setState({
        tooltip: {
          ...this.state.tooltip,
          open: false
        }
      })
    }, 1000)
  }

  mouseMoveHandler = (point) => {
    clearTimeout(this.timer)
    this.setState({
      tooltip: {
        open: true,
        title: `${point.y} ${point.t === 0 ? `online client` : `total tab`}${point.y !== 1 ? 's' : ''}`
      }
    })
  }

  render() {
    const { width } = this.props
    return (
      <React.Fragment>
        <ContextMenuTrigger id={'graph'}>
          <Tooltip
            id="graph-tooltip"
            title={this.state.tooltip.title}
            open={this.state.tooltip.open}
            placement="right"
          >
            <div className="chart">
              <LineChart
                axes
                xTicks={-1}
                yTicks={5}
                dataPoints
                axisLabels={{ x: 'Time', y: 'Clients' }}
                width={width - 10}
                lineColors={['orange', 'red']}
                mouseOverHandler={this.mouseOverHandler}
                mouseOutHandler={this.mouseOutHandler}
                mouseMoveHandler={this.mouseMoveHandler}
                data={this.state.graph} />
              </div>
          </Tooltip>
        </ContextMenuTrigger>
        <ContextMenu id={'graph'}>
          <MenuItem onClick={() => this.setState({ graph: [] })}>
            Clear graph
          </MenuItem>
          <MenuItem divider />
          <MenuItem onClick={() => copy(JSON.stringify(this.state.graph))}>
            Copy graph data
          </MenuItem>
        </ContextMenu>
      </React.Fragment>
    )
  }
}

export default connect(({ injectify: {projects, selectedProject} }) => ({ projects, selectedProject }))(Graph)