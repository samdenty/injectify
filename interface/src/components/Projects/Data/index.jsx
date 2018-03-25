import React from 'react'
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles'

import Card, { CardContent } from 'material-ui/Card'
import {
  SortingState,
  SelectionState,
  FilteringState,
  PagingState,
  GroupingState,
  IntegratedFiltering,
  IntegratedGrouping,
  IntegratedPaging,
  IntegratedSorting,
  IntegratedSelection
} from '@devexpress/dx-react-grid'
import {
  Grid,
  VirtualTable,
  TableHeaderRow,
  TableFilterRow,
  TableSelection,
  TableGroupRow,
  PagingPanel,
  GroupingPanel,
  DragDropProvider,
  TableColumnReordering,
  Toolbar,
  TableColumnVisibility,
  ColumnChooser
} from '@devexpress/dx-react-grid-material-ui'
import moment from 'moment'
import Inspector, { chromeDark } from 'react-inspector'
import Modal from './Modal'

const styles = (theme) => ({
  root: {
    margin: theme.spacing.unit * 4,
    backgroundColor: theme.palette.background.paper
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
  content: {
    padding: '5px 16px'
  }
})

const dataSearch = (value, filter) => {
  let data = JSON.stringify(value)
  return data && data.includes(filter.value)
}

const timeSearch = (value, filter) => {
  return (
    value && value.string.toLowerCase().includes(filter.value.toLowerCase())
  )
}

const timeSort = (a, b) => {
  if (a.unix === b.unix) return 0
  return a.unix > b.unix ? -1 : 1
}

const dataSort = (a, b) => {
  let aLength = JSON.stringify(a).length
  let bLength = JSON.stringify(b).length
  if (aLength === bLength) return 0
  return aLength < bLength ? -1 : 1
}

class Data extends React.Component {
  state = {
    ...this.parseDatabase(),
    tableColumnExtensions: [{ columnName: 'amount', align: 'right' }],
    customFiltering: [
      { columnName: 'data', predicate: dataSearch },
      { columnName: 'timestamp', predicate: timeSearch }
    ],
    customSorting: [
      { columnName: 'timestamp', compare: timeSort },
      { columnName: 'data', compare: dataSort }
    ],
    pageSizes: [5, 10, 15],
    selected: null,
    open: false
  }

  parseDatabase(props = this.props) {
    const { projects, selectedProject } = props
    const project = projects[selectedProject.index]
    console.debug('Parsing data')
    return {
      columns: [
        { name: 'table', title: 'Table' },
        { name: 'timestamp', title: 'Time' },
        { name: 'url', title: 'URL' },
        { name: 'ip', title: 'IP Address' },
        { name: 'data', title: 'Data' }
      ],
      rows: _.flatten(
        _.map(project.data, (records, table) => {
          return _.map(records, (record) => {
            return {
              ...record,
              timestamp: {
                unix: record.timestamp,
                string: moment(record.timestamp).format('lll')
              },
              table
            }
          })
        })
      )
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      ...this.parseDatabase(nextProps)
    })
  }

  cell(props) {
    return (
      <React.Fragment>
        {props.column.name === 'data' ? (
          <VirtualTable.Cell className="inspector">
            <Inspector
              data={props.value}
              theme={{ ...chromeDark, ...{ ARROW_FONT_SIZE: 9 } }}
            />
          </VirtualTable.Cell>
        ) : props.column.name === 'timestamp' ? (
          <VirtualTable.Cell>{props.value.string}</VirtualTable.Cell>
        ) : (
          <VirtualTable.Cell {...props} />
        )}
      </React.Fragment>
    )
  }

  row(props) {
    return (
      <React.Fragment>
        <VirtualTable.Row
          {...props}
          onClick={() => this.handleOpen(props.row)}
          className="row"
        />
      </React.Fragment>
    )
  }

  handleOpen(selected) {
    this.setState({
      open: true,
      selected
    })
  }

  handleClose() {
    this.setState({
      open: false
    })
  }

  render() {
    const { classes } = this.props
    const {
      tableColumnExtensions,
      customSorting,
      customFiltering,
      pageSizes,
      rows,
      columns
    } = this.state

    return (
      <React.Fragment>
        <Card className={`${classes.root} data`}>
          <CardContent className={classes.content}>
            <Grid rows={rows} columns={columns}>
              <FilteringState />
              <SortingState
                defaultSorting={[
                  { columnName: 'table', direction: 'asc' },
                  { columnName: 'timestamp', direction: 'asc' }
                ]}
              />

              <GroupingState
                defaultGrouping={[{ columnName: 'table' }]}
              />
              <PagingState defaultCurrentPage={0} defaultPageSize={10} />

              <IntegratedGrouping />
              <IntegratedFiltering columnExtensions={customFiltering} />
              <IntegratedSorting columnExtensions={customSorting} />
              <IntegratedPaging />
              <DragDropProvider />

              <VirtualTable
                columnExtensions={tableColumnExtensions}
                cellComponent={this.cell.bind(this)}
                rowComponent={this.row.bind(this)}
              />

              <TableColumnReordering
                defaultOrder={columns.map((column) => column.name)}
              />

              <TableHeaderRow showSortingControls />
              <TableFilterRow />
              <PagingPanel pageSizes={pageSizes} />

              <TableGroupRow />
              <TableColumnVisibility defaultHiddenColumnNames={['customer']} />
              <Toolbar />
              <GroupingPanel showSortingControls />
              <ColumnChooser />
            </Grid>
          </CardContent>
        </Card>
        <Modal
          selected={this.state.selected}
          open={this.state.open}
          close={this.handleClose.bind(this)}
        />
      </React.Fragment>
    )
  }
}

export default connect(
  ({ injectify: { section, projects, selectedProject } }) => ({
    section,
    projects,
    selectedProject
  })
)(withStyles(styles)(Data))
