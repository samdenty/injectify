import _ from 'lodash'
import NProgress from 'nprogress'
import update from 'immutability-helper'

const config = {
  sections: ['home', 'settings', 'projects'],
  pages: ['overview', 'console', 'data', 'config']
}

const initialState = {
  section: 'home',
  page: 'overview',
  loading: true,

  drawerOpen: window.innerWidth >= 960,
  clientsListOpen: window.innerWidth >= 960,

  server: {
    github: {
      client_id: '95dfa766d1ceda2d163d',
      scope: 'user gist public_repo'
    },
    discord: {
      server: '335836376031428618',
      channel: '377173106940182529',
      options: '0002',
      colors: {
        toggle: '#3F51B5'
      },
      style: 'material',
      beta: false
    }
  },

  settings: {
    dark: true
  },

  // ALl projects
  projects: [],
  // Selected project
  selectedProject: {
    name: null,
    index: null
  },

  // All accounts
  accounts: [],
  // Selected account
  account: null
}

const initialConsole = {
  clients: {},
  selected: null,
  code: window.localStorage.getItem('injectScript') || `// Import types to enable intellisense\nimport { injectify, window } from 'injectify'\n\n// Type your code here`,
  logs: [
    {
      type: 'warn',
      message: [
        {
          type: 'string',
          message: 'This is your console! Any output from the code you run is shown here'
        }
      ],
      timestamp: +new Date(),
      id: 'default-message0'
    },
    {
      type: 'error',
      message: [
        {
          type: 'string',
          message: `You'll see any errors here, but you can also inspect Strings, Arrays, Objects and DOM nodes`
        }
      ],
      timestamp: +new Date(),
      id: 'default-message1'
    },
    {
      type: 'info',
      message: [
        {
          type: 'array',
          message: [1, 2, 3]
        },
        {
          type: 'object',
          message: {value: true}
        },
        {
          type: 'HTMLElement',
          message: {
            tagName: 'div',
            innerHTML: '<ul><li><a href="/one">Example 1</a></li><li><a href="/two">Example 2</a></li><li><a href="/three">Example 3</a></li></ul>'
          }
        }
      ],
      timestamp: +new Date(),
      id: 'default-message1'
    }
  ]
}

NProgress.start()

try {
  let settings = window.localStorage.getItem('settings')
  if (settings) {
    initialState.settings = {
      ...initialState.settings,
      ...JSON.parse(settings)
    }
  }
} catch (e) {
  window.localStorage.removeItem('settings')
}

try {
  let accounts = window.localStorage.getItem('accounts')
  if (accounts) initialState.accounts = JSON.parse(accounts)
} catch (e) {
  window.localStorage.removeItem('accounts')
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'TOGGLE_DRAWER': {
      return {
        ...state,
        drawerOpen: action.open
      }
    }

    case 'TOGGLE_CLIENTS_LIST': {
      if (typeof action.open !== 'boolean') {
        action.open = !state.clientsListOpen
      }
      return {
        ...state,
        clientsListOpen: action.open
      }
    }

    case 'LOADING': {
      let loading = !!action.loading
      if (loading) {
        NProgress.start()
      } else {
        NProgress.done()
      }
      return {
        ...state,
        loading
      }
    }

    // case 'UPDATE_GRAPH': {
    //   let project = _.cloneDeep(state.project)
    //   project.console.graph = action.graph
    //   return {
    //     ...state,
    //     project
    //   }
    // }

    case 'SWITCH_SECTION': {
      setTimeout(() => {
        NProgress.done()
      })
      document.title = `${_.capitalize(action.section)} - Injectify`
      return {
        ...state,
        section: action.section
      }
    }

    case 'SWITCH_PAGE': {
      document.title = `${state.selectedProject.name} - ${_.capitalize(action.page)} • Injectify`
      return {
        ...state,
        page: action.page
      }
    }

    case 'SWITCH_PROJECT': {
      document.title = `${action.name} - ${_.capitalize(state.page)} • Injectify`
      return {
        ...state,
        section: 'projects',
        selectedProject: {
          name: action.name,
          index: _.findIndex(state.projects, { name: action.name })
        }
      }
    }

    case 'BROWSER_HISTORY': {
      NProgress.start()
      let data = {}
      if (typeof action.page !== 'undefined') {
        data.page = config.pages.includes(action.page) ? action.page : 'overview'
      }
      if (typeof action.section !== 'undefined') {
        data.section = config.sections.includes(action.section) ? action.section : 'home'
      }
      if (typeof action.project !== 'undefined' && state.selectedProject.name !== action.project) {
        data.selectedProject = {
          name: action.project,
          index: _.findIndex(state.projects, { name: action.project })
        }
      }

      return {
        ...state,
        ...data
      }
    }

    case 'UPDATE_SETTINGS': {
      let settings = {
        ...state.settings,
        ...action.settings
      }
      window.localStorage.setItem('settings', JSON.stringify(settings))
      return {
        ...state,
        settings: settings
      }
    }

    case 'SET_SERVER': {
      return {
        ...state,
        server: action.server
      }
    }

    case 'AUTH_ACCOUNT': {
      let data = {
        accounts: _.cloneDeep(state.accounts),
        account: {
          lastUsed: +new Date(),
          token: action.token,
          user: action.user
        }
      }

      let index = _.findIndex(data.accounts, { user: { id: action.user.id } })
      if (index > -1) {
        data.account = {
          ...data.accounts[index],
          ...data.account
        }
        data.accounts[index] = data.account
      } else {
        data.accounts.push(data.account)
      }

      window.localStorage.setItem('accounts', JSON.stringify(data.accounts))
      return {
        ...state,
        ...data
      }
    }

    case 'REMOVE_ACCOUNT': {
      let data = {
        accounts: _.reject(state.accounts, action.query)
      }
      /**
       * Remove signed in user
       */
      if (_.find([state.account], action.query)) {
        data = {
          ...data,
          account: null,
          projects: [],
          selectedProject: {
            name: null,
            index: null
          },
          section: 'home'
        }
      }

      window.localStorage.setItem('accounts', JSON.stringify(data.accounts))
      return {
        ...state,
        ...data
      }
    }

    case 'SET_PROJECTS': {
      let selectedProject = state.selectedProject
      if (selectedProject.name) {
        selectedProject.index = _.findIndex(action.projects, { name: selectedProject.name })
      }
      return {
        ...state,
        selectedProject,
        projects: action.projects
      }
    }

    case 'SET_PROJECT': {
      let data = {
        projects: _.cloneDeep(state.projects)
      }
      // Switch to the correct page
      if (config.pages.includes(action.page)) data.page = action.page

      let index = _.findIndex(data.projects, { name: action.project.name })
      if (index > -1) {
        action.project = _.merge(data.projects[index], action.project)
        data.projects[index] = action.project
      }

      if (action.project.console && !action.project.console.state) action.project.console.state = initialConsole

      return {
        ...state,
        ...data
      }
    }

    case 'SET_CLIENTS': {
      let data = {
        projects: _.cloneDeep(state.projects)
      }

      // Update in the projects collection
      let index = _.findIndex(data.projects, { name: action.project })
      if (index > -1) {
        let newState = data.projects[index].console.state
        newState.clients = action.clients
      }

      return {
        ...state,
        ...data
      }
    }

    case 'ADD_CLIENT': {
      let data = {
        projects: _.cloneDeep(state.projects)
      }

      // Update in the projects collection
      let index = _.findIndex(data.projects, { name: action.project })
      if (index > -1) {
        let newState = data.projects[index].console.state
        newState.clients[action.token] = action.client
      }

      return {
        ...state,
        ...data
      }
    }

    case 'REMOVE_CLIENT': {
      let data = {
        projects: _.cloneDeep(state.projects)
      }

      // Update in the projects collection
      let index = _.findIndex(data.projects, { name: action.project })
      if (index > -1) {
        let { clients, selected } = data.projects[index].console.state
        if (clients[action.token]) {
          if (clients[action.token].sessions.length === 1) {
            /**
             * Last remaining session removed from client
             */
            delete clients[action.token]
          } else {
            /**
             * A session was removed but the client contains other sessions
             */
            clients[action.token].sessions = _.reject(clients[action.token].sessions, {
              id: action.id
            })
          }
        }
      }

      return {
        ...state,
        ...data
      }
    }

    case 'SELECT_CLIENT': {
      let data = {
        projects: _.cloneDeep(state.projects)
      }

      let index = _.findIndex(data.projects, { name: action.project })
      data.projects[index].console.state.selected = action.token
      return {
        ...state,
        ...data
      }
    }

    case 'UPDATE_CLIENT': {
      let index = _.findIndex(state.projects, { name: action.project })
      return update(state, {
        projects: {
          [index]: {
            console: {
              state: {
                clients: {
                  [state.projects[index].console.state.selected]: {
                    $set: action.client
                  }
                }
              }
            }
          }
        }
      })
    }

    case 'CONSOLE_LOG': {
      return update(state, {
        projects: {
          [state.selectedProject.index]: {
            console: {
              state: {
                logs: {
                  $push: [action.log]
                }
              }
            }
          }
        }
      })
      return {
        ...state,
        console: {
          ...state.console,
          logs: [
            ...state.console.logs,
            action.log
          ]
        }
      }
    }

    default: {
      return state
    }
  }
}
