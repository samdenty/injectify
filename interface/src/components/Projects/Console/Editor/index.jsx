import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

import Tabs from './Tabs'
import Console from './Console'
import PageGhost from './PageGhost'
import { toggleClientsList } from '../../../../actions'
import CodeEditor from '../../../CodeEditor'

class Editor extends React.Component {
  interval = null
  editor = null

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  editorDidMount = (type, editor) => {
    this.editor = editor

    window.code = {
      ...window.code,
      type,
      editor
    }
    this.interval = setInterval(this.saveToStorage, 1000)
  }

  saveToStorage = () => {
    if (this.editor) {
      try {
        localStorage.setItem('code', this.editor.getValue())
      } catch(e) {

      }
    }
  }

  render() {
    const { state, dispatch } = this.props

    return (
      <div className='inject-editor-container' onClick={() => { state.clientsListOpen && dispatch(toggleClientsList(false, true)) }}>
        <Tabs />
        <div className="inject-editor-view">
          <div className="inject-editor">
            <CodeEditor
              default={state.code}
              onMount={this.editorDidMount.bind(this)}
            />
            <Console />
          </div>
          <PageGhost />
        </div>
      </div>
    )
  }
}


export default connect(({ injectify }) => ({ state: injectify }))(Editor)
