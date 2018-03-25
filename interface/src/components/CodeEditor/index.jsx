// @ts-check
import ReactDOM, { render } from 'react-dom'
import React from 'react'

import MonacoEditor from 'react-monaco-editor'
import { UnControlled as CodeMirror } from 'react-codemirror2'
require('codemirror/mode/javascript/javascript')

// @ts-ignore
import ModuleTypings from '../../../../src/inject/core/definitions/modules.d.ts'
// @ts-ignore
import Typings from '../../../../src/inject/core/definitions/core.d.ts'
const typings = Typings.replace(/^\s*import /gm, `// import `)
  .replace('export namespace Injectify', 'declare namespace injectify')
  .replace(
    '//#modules',
    ModuleTypings.replace('export interface Modules', 'interface Modules')
  )

class CodeEditor extends React.Component {
  /**
   * BUG:
   * Switch from cached read-only page to project with
   * write permissions
   */
  state = {
    mounted: true,
    editor: null,
    type: null
  }
  listener = null

  componentWillMount() {
    this.listener = this.updateDimensions.bind(this)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.listener)
  }

  updateDimensions = () => {
    const { editor, type } = this.state
    if (editor) {
      switch (type) {
        case 'monaco': {
          editor.layout()
          break
        }
      }
    }
  }

  monacoDidMount = (editor, monaco) => {
    /**
     * Set the theme
     */
    monaco.editor.defineTheme('Injectify', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '626466' },
        { token: 'keyword', foreground: '6CAEDD' },
        { token: 'identifier', foreground: 'fac863' }
      ]
    })
    monaco.editor.setTheme('Injectify')

    /**
     * Import typings
     */
    try {
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        typings,
        `injectify.d.ts`
      )
    } catch (e) {}

    /**
     * Initialize
     */
    editor.focus()
    window.addEventListener('resize', this.listener)

    /**
     * Update state
     */
    this.setState({
      editor,
      type: 'monaco'
    })

    /**
     * Callback
     */
    if (this.props.onMount) {
      this.props.onMount('monaco', editor)
    }
  }

  codemirrorDidMount = (editor) => {
    /**
     * Update state
     */
    this.setState({
      editor,
      type: 'codemirror'
    })

    /**
     * Callback
     */
    if (this.props.onMount) {
      this.props.onMount('codemirror', editor)
    }
  }

  render() {
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
      theme: 'panda-syntax',
      readOnly: !!this.props.disabled,
      ...(this.props.options || {})
    }

    return this.state.mounted ? (
      window.innerWidth >= 650 ? (
        <MonacoEditor
          // @ts-ignore
          language="javascript"
          defaultValue={this.props.default || ''}
          options={options}
          editorDidMount={this.monacoDidMount.bind(this)}
          onChange={(value) =>
            this.props.onChange && this.props.onChange(value)
          }
        />
      ) : (
        <CodeMirror
          value={this.props.default || ''}
          options={options}
          editorDidMount={this.codemirrorDidMount.bind(this)}
          onChange={(editor, data, value) =>
            this.props.onChange && this.props.onChange(value)
          }
        />
      )
    ) : null
  }
}

export default CodeEditor
