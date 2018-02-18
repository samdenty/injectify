import _ from 'lodash'

const config = {
  sections: ['home', 'settings', 'projects'],
  pages: ['overview', 'console', 'data', 'config'],
}

const initialState = {
  section: 'home',
  page: 'overview',

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
  account: null
}

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
    case 'SWITCH_SECTION': {
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
        project: action.project
      }
    }

    case 'BROWSER_HISTORY': {
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

    default: {
      return state
    }
  }
}