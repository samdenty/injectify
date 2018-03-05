import Autosuggest from 'react-autosuggest'

// https://github.com/moroshko/react-autosuggest/issues/503
export default class extends Autosuggest {
  // Prevent value from changing on click
  onSuggestionClick = () => {}
}