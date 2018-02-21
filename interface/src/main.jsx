import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { BrowserRouter as Router } from 'react-router-dom'
import Injectify from './components'
import reducers from './reducers'
import URLHandler from './reducers/URLHandler'
import ioHandler from './socket-io'
import io from 'socket.io-client'

/**
 * Redux
 */
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
import thunk from 'redux-thunk'
import history from './reducers/history'

/**
 * Middleware
 */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const middleware = routerMiddleware(history)

/**
 * Create store
 */
const store = createStore(
  combineReducers({
    injectify: reducers,
    router: routerReducer
  }),
  composeEnhancers(applyMiddleware(thunk), applyMiddleware(middleware))
)

/**
 * Window URL & history handler
 */
URLHandler(store, history)

/**
 * Socket.io handler
 */
const socket = window.socket = io(window.location.origin)
ioHandler(socket, store, history)

const render = App => {
  ReactDOM.render(
    <Provider store={store}>
      <Router>
        <ConnectedRouter history={history}>
          <AppContainer>
            <App />
          </AppContainer>
        </ConnectedRouter>
      </Router>
    </Provider>,
    document.getElementsByTagName('react')[0]
  )
  if (!document.body.classList.contains('fade-in')) {
    document.body.classList.add('fade-in')
    // Force resize event as the transform messed up initial viewport
    setTimeout(() => {
      let resizeEvent = new Event('resize')
      window.dispatchEvent(resizeEvent)
    }, 1000)
  }
}

render(Injectify)

//#region Console output
console.log(
`%c _  _         _  _____ ____  _____  _  ________  _
/ \\/ \\  /|   / |/  __//   _\\/__ __\\/ \\/    /\\  \\//
| || |\\ ||   | ||  \\  |  /    / \\  | ||  __\\ \\  /
| || | \\||/\\_| ||  /_ |  \\_   | |  | || |    / /
\\_/\\_/  \\|\\____/\\____\\\\____/  \\_/  \\_/\\_/   /_/`,
`color: #ef5350; font-weight: bold`)
console.log({
  environment: process.env.NODE_ENV,
  react: React.version
})
//#endregion

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./components', () => {
    render(Injectify)
  })
}