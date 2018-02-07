import ModuleTypings from '../../../definitions/module'
declare const { Module, injectify }: ModuleTypings
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import ReactJson from 'react-json-view'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { monokai } from 'react-syntax-highlighter/styles/hljs'
import jss from './styles'

class Panel extends React.Component {
  state = {
    classes: null,
    data: {
      info: injectify.info,
      global: injectify.global
    }
  }

  componentWillMount() {
    Module.setState(true)
    this.setState({
      classes: jss(Module),
      data: this.getData()
    })
    setTimeout(() => {
      this.checkForUpdates(300)
    }, 300)
  }

  hide() {
    Module.setState(false)
  }

  checkForUpdates = (time) => {
    let data = this.getData()
    if (JSON.stringify(data) !== JSON.stringify(this.state.data)) {
      this.setState({
        data: {
          ...this.state.data,
          ...data,
        }
      })
    }
    setTimeout(() => {
      this.checkForUpdates(time)
    }, time)
  }

  getData = () => {
    return {
      info: injectify.info,
      global: injectify.global
    }
  }

  render() {
    const { classes, data } = this.state
    const lastCommand = data.global.commandHistory[data.global.commandHistory.length - 1] || `// No commands executed yet`
    return Module.state ? (
      <div className={classes.container}>
        <div className={classes.column}>
          <h3 className={classes.columnHeader}>Last executed command</h3>
          <div className={classes.columnContent}>
            <SyntaxHighlighter
              language='javascript'
              style={monokai}>
              {lastCommand}
            </SyntaxHighlighter>
          </div>
        </div>
        <div className={classes.column}>
          <h3 className={classes.columnHeader}>Variables</h3>
          <div className={classes.columnContent}>
            <ReactJson
              src={data}
              theme="monokai"
              enableClipboard={true}
              name={false}
              displayDataTypes={false}
              iconStyle="circle" />
          </div>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 12 12"
          className={classes.close}
          onClick={() => this.hide()}
        >
          <path className={classes.closeFill} d="M0 0h12v12H0" />
          <path className={classes.closeButton} d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6" />
        </svg>
      </div>
    ) : null
  }
}

if (typeof Module.state !== 'undefined') {
  Module.setState(!Module.state)
} else {
  let container
  if (typeof Module.params === 'function') {
    container = eval(`${Module.params}()`)
  } else if (typeof Module.params === 'string') {
    container = eval(Module.params)
  } else {
    container = document.createElement('div')
    if (document.body) {
      document.body.appendChild(container)
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(container)
      })
    }
  }

  ReactDOM.render(
    <Panel />,
    container
  )
  Module.resolve(container)
}
// export const Hello = (props: HelloProps) => <h1>Hello from {props.compiler} and {props.framework}!</h1>;