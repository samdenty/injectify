import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Autosuggest from 'react-autosuggest'
import match from 'autosuggest-highlight/match'
import parse from 'autosuggest-highlight/parse'
import TextField from 'material-ui/TextField'
import { MenuItem } from 'material-ui/Menu'
import { withStyles } from 'material-ui/styles'

import Project from './Project'

const styles = theme => ({
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  search: {
    outline: 'none',
    marginBottom: 10
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
})

function renderInput(inputProps) {
  const { classes, ref, ...other } = inputProps

  return (
    <MenuItem
      button={false}
      className={classes.search}
    >
      <TextField
        fullWidth
        inputRef={ref}
        InputProps={{
          classes: {
            input: classes.input,
          },
          ...other,
        }}
      />
    </MenuItem>
  )
}

function renderProject(project, { query, isHighlighted }) {
  const matches = match(project.name, query)
  const parts = parse(project.name, matches)

  return (
    <Project project={project} parts={parts} />
  )
}

function renderProjectsContainer(options) {
  const { children, containerProps } = options
  return (
    <span {...containerProps}>
      {children}
    </span>
  )
}

function getSuggestionValue(suggestion) {
  return suggestion.name
}

class Search extends React.Component {
  state = {
    value: '',
    suggestions: this.props.projects,
  }

  getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase()
    const inputLength = inputValue.length
    let count = 0
    return inputLength === 0
      ? this.props.projects
      : this.props.projects.filter(suggestion => {
          const keep =
            count < 5 && suggestion.name.toLowerCase().slice(0, inputLength) === inputValue

          if (keep) {
            count += 1
          }

          return keep
        })
  }

  handleSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value),
    })
  }

  handleChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    })
  }

  render() {
    const { classes } = this.props

    return (
      <Autosuggest
        theme={{
          container: classes.container,
          suggestionsList: classes.suggestionsList,
          suggestion: classes.suggestion,
        }}
        renderInputComponent={renderInput}
        suggestions={this.state.suggestions}
        onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
        renderSuggestionsContainer={renderProjectsContainer}
        getSuggestionValue={getSuggestionValue}
        alwaysRenderSuggestions={true}
        renderSuggestion={renderProject}
        inputProps={{
          classes,
          placeholder: 'Search',
          value: this.state.value,
          onChange: this.handleChange,
        }}
      />
    )
  }
}

Search.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default connect(({ injectify: { projects } }) => ({ projects }))(withStyles(styles)(Search))