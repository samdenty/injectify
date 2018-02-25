import ReactDOM, { render } from 'react-dom'
import React from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

import Tabs from './Tabs'
import Console from './Console'
import PageGhost from './PageGhost'
import { toggleClientsList } from '../../../../actions'

import MonacoEditor from 'react-monaco-editor'
import {UnControlled as CodeMirror} from 'react-codemirror2'
require('codemirror/mode/javascript/javascript')

import ModuleTypings from '../../../../../../src/inject/core/definitions/modules.d.ts'
import Typings from '../../../../../../src/inject/core/definitions/core.d.ts'
const typings = Typings
  .replace(/^\s*import /mg, `// import `)
  .replace('export namespace Injectify', 'declare namespace injectify')
  .replace('//#modules', ModuleTypings.replace('export interface Modules', 'interface Modules'))

class Editor extends React.Component {
  interval = null

  componentDidMount() {
    this.interval = setInterval(this.saveToStorage, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  updateDimensions = () => {
    if (this.editor) {
      switch (window.code.type) {
        case 'monaco': {
          this.editor.layout()
          break
        }
      }
    }
  }

  monacoDidMount = (editor, monaco) => {
    this.editor = editor
    window.code = {
      ...window.code,
      type: 'monaco',
      editor
    }
    /**
     * Set the theme
     */
    monaco.editor.defineTheme('Injectify', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '626466' },
        { token: 'keyword', foreground: '6CAEDD' },
        { token: 'identifier', foreground: 'fac863' },
      ],
    })
    monaco.editor.setTheme('Injectify')
    /**
     * Import typings
     */
    try {
      monaco.languages.typescript.javascriptDefaults.addExtraLib(typings, `injectify.d.ts`)
    } catch(e) {

    }
    /**
     * Initialize
     */
    editor.focus()
    window.addEventListener('resize', this.updateDimensions)
  }

  codemirrorDidMount = (editor) => {
    console.log(editor)
    this.editor = editor
    window.code = {
      ...window.code,
      type: 'codemirror',
      editor
    }
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
    const options = {
      selectOnLineNumbers: true,
      lineNumbers: true,
      dragAndDrop: true,
      mode: 'javascript',
      formatOnPaste: true,
      folding: true,
      autoIndent: true,
      glyphMargin: false,
      fontLigatures: true,
      theme: 'panda-syntax'
    }

    return (
      <div className='inject-editor-container' onClick={() => { state.clientsListOpen && dispatch(toggleClientsList(false, true)) }}>
        <Tabs />
        <div className="inject-editor-view">
          <div className="inject-editor">
            {window.innerWidth >= 650 ? (
              <MonacoEditor
                language="javascript"
                defaultValue={state.code}
                options={options}
                editorDidMount={this.monacoDidMount} />
            ) : (
              <CodeMirror
                value={state.code}
                options={options}
                editorDidMount={this.codemirrorDidMount}
                onChange={(editor, data, value) => {}} />
            )}
            <Console />
          </div>
          <PageGhost />
        </div>
      </div>
    )
  }
}


export default connect(({ injectify }) => ({ state: injectify }))(Editor)