import _ from 'lodash'
import NProgress from 'nprogress'

const config = {
  sections: ['home', 'settings', 'projects'],
  pages: ['overview', 'console', 'data', 'config'],
}

const initialState = {
  section: 'home',
  page: 'overview',
  loading: true,

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
    dark: true,
  },

  // ALl projects
  projects: null,
  // Selected project
  project: {
    name: null
  },

  // All accounts
  accounts: [],
  // Selected account
  account: null,

  console: {
    clients: {},
    selected: {},
    graph: [
      [
      ]
    ],
    code: localStorage.getItem('injectScript') || `// Import types to enable intellisense\nimport { injectify, window } from 'injectify'\n\n// Type your code here`,
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
        id: 'default-message0',
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
        id: 'default-message1',
      },
      {
        type: 'info',
        message: [
          {
            type: 'array',
            message: [1,2,3]
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
        id: 'default-message1',
      },
    ],
  }
}

NProgress.start()

try {
  let settings = localStorage.getItem('settings')
  if (settings) initialState.settings = {
    ...initialState.settings,
    ...JSON.parse(settings)
  }
} catch(e) {
  localStorage.removeItem('settings')
}

try {
  let accounts = localStorage.getItem('accounts')
  if (accounts) initialState.accounts = JSON.parse(accounts)
} catch(e) {
  localStorage.removeItem('accounts')
}

export default (state = initialState, action) => {
  switch (action.type) {
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
      document.title = `${state.project.name} - ${_.capitalize(action.page)} • Injectify`
      return {
        ...state,
        page: action.page
      }
    }

    case 'SWITCH_PROJECT': {
      document.title = `${action.project.name} - ${_.capitalize(state.page)} • Injectify`
      return {
        ...state,
        section: 'projects',
        project: action.project,
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
      if (typeof action.project !== 'undefined' && state.project.name !== action.project) {
        data.project = {
          name: action.project
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
      localStorage.setItem('settings', JSON.stringify(settings))
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
      let accounts = state.accounts
      let account = _.find(accounts, { user: { id: action.user.id } })
      if (!account) {
        account = {}
        accounts.push(account)
      }
      account.lastUsed = +new Date()
      account.token = action.token
      account.user = action.user
      localStorage.setItem('accounts', JSON.stringify(accounts))
      return {
        ...state,
        accounts,
        account
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
          project: {
            name: null
          },
          section: 'home'
        }
      }
      localStorage.setItem('accounts', JSON.stringify(data.accounts))
      return {
        ...state,
        ...data
      }
    }

    case 'SET_PROJECTS': {
      return {
        ...state,
        projects: action.projects
      }
    }

    case 'SET_PROJECT': {
      let data = {
        project: action.project
      }
      if (config.pages.includes(action.page)) data.page = action.page
      if (state.project.name === action.project.name) {
        data.project = {
          ...state.project,
          ...action.project
        }
      }
      // Update in the projects collection
      let projects = state.projects
      let index = _.findIndex(projects, { name: data.project.name })
      if (index > -1) {
        projects[index] = data.project
        data.projects = projects
      }
      return {
        ...state,
        ...data
      }
    }

    case 'SET_CLIENTS': {
      return {
        ...state,
        console: {
          ...state.console,
          clients: action.clients
        }
      }
    }

    case 'ADD_CLIENT': {
      let clients = state.console.clients
      clients[action.token] = action.client
      return {
        ...state,
        console: {
          ...state.console,
          clients
        }
      }
    }

    case 'REMOVE_CLIENT': {
      let { clients, selected } = state.console
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
        /**
         * If they're selected, deselect them
         */
        if (selected.token === action.token) {
          selected.client = clients[action.token]
        }
      }

      return {
        ...state,
        console: {
          ...state.console,
          selected,
          clients
        }
      }
    }

    case 'SELECT_CLIENT': {
      return {
        ...state,
        console: {
          ...state.console,
          clients: {
            ...state.console.clients,
            [action.token]: action.client
          }
        }
      }
    }

    case 'UPDATE_CLIENT': {
      return {
        ...state,
        console: {
          ...state.console,
          clients: {
            ...state.console.clients,
            [state.console.selected.token]: action.client
          },
          selected: {
            ...state.console.selected,
            client: action.client
          }
        }
      }
    }

    case 'CONSOLE': {
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