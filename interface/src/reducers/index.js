import _ from 'lodash'

const config = {
  sections: ['home', 'settings', 'projects'],
  pages: ['overview', 'console', 'data', 'config'],
}

const initialState = {
  section: 'home',
  page: 'overview',
  project: {
    name: null
  },
  projects: [
    'a',
    'b'
  ],
  settings: {
    dark: true,
  }
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

export default (state = initialState, action) => {
  switch (action.type) {
    case 'SWITCH_SECTION':
      document.title = `${_.capitalize(action.section)} - Injectify`
      return {
        ...state,
        section: action.section
      }
    case 'SWITCH_PAGE':
      document.title = `${state.project.name} - ${_.capitalize(action.page)} • Injectify`
      return {
        ...state,
        page: action.page
      }
    case 'SWITCH_PROJECT':
      document.title = `${action.project.name} - ${_.capitalize(state.page)} • Injectify`
      return {
        ...state,
        section: 'projects',
        project: action.project
      }
    case 'BROWSER_HISTORY':
      action.page = config.pages.includes(action.page) ? action.page : 'overview'
      action.section = config.sections.includes(action.section) ? action.section : 'home'

      return {
        ...state,
        section: action.section,
        project: {
          name: action.project
        },
        page: action.page
      }
    case 'UPDATE_SETTINGS':
      let settings = {
        ...state.settings,
        ...action.settings
      }
      localStorage.setItem('settings', JSON.stringify(settings))
      return {
        ...state,
        settings: settings
      }
    default:
      return state
  }
}