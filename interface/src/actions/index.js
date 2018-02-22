import NProgress from 'nprogress'

export function toggleDrawer (open, onlyOnMobile) {
  return (dispatch) => {
    if (!(onlyOnMobile && window.innerWidth >= 960)) {
      dispatch({
        type: 'TOGGLE_DRAWER',
        open
      })
    }
  }
}

export function toggleClientsList (open, onlyOnMobile) {
  return (dispatch) => {
    if (!(onlyOnMobile && window.innerWidth >= 650)) {
      dispatch({
        type: 'TOGGLE_CLIENTS_LIST',
        open
      })
    }
  }
}

// export function updateGraph (graph) {
//   return {
//     type: 'UPDATE_GRAPH',
//     graph
//   }
// }

export function switchSection (section) {
  return {
    type: 'SWITCH_SECTION',
    section
  }
}

export function switchPage (page) {
  return {
    type: 'SWITCH_PAGE',
    page
  }
}

export function updateSettings (settings) {
  return {
    type: 'UPDATE_SETTINGS',
    settings
  }
}

export function project (name, page) {
  const { socket } = window
  return (dispatch, getState) => {
    if (!page) page = getState().injectify.page
    socket.emit('project:read', {
      project: name,
      page
    })
    NProgress.start()
    dispatch({
      type: 'SWITCH_PROJECT',
      name
    })
  }
}

export function loading (state) {
  return {
    type: 'LOADING',
    loading: !!state
  }
}

export function setProject (project, page) {
  return {
    type: 'SET_PROJECT',
    project,
    page
  }
}

export function setServer (server) {
  return {
    type: 'SET_SERVER',
    server
  }
}

export function authAccount (token, user) {
  return {
    type: 'AUTH_ACCOUNT',
    token,
    user
  }
}

export function removeAccount (query) {
  return {
    type: 'REMOVE_ACCOUNT',
    query
  }
}

export function setProjects (projects) {
  return {
    type: 'SET_PROJECTS',
    projects
  }
}

export function setClients (project, clients) {
  return {
    type: 'SET_CLIENTS',
    project,
    clients: clients || []
  }
}

export function addClient (project, token, client) {
  return {
    type: 'ADD_CLIENT',
    project,
    token,
    client
  }
}

export function removeClient (project, token, id) {
  return {
    type: 'REMOVE_CLIENT',
    project,
    token,
    id
  }
}

export function selectClient (project, token) {
  return (dispatch) => {
    const { socket } = window
    socket.emit('inject:client', {
      project: project,
      client: token
    })
    dispatch({
      type: 'SELECT_CLIENT',
      project,
      token
    })
  }
}

export function updateClient (project, client) {
  return {
    type: 'UPDATE_CLIENT',
    project,
    client
  }
}

export function log (log) {
  return {
    type: 'CONSOLE_LOG',
    log
  }
}

// export function execute() {

// }
