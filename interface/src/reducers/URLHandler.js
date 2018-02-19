import { project as switchProject } from '../actions'
export default (store, history) => {
  let currentState = store.getState().injectify
  let currentPath = null
  store.subscribe(() => {
    const { socket } = window
    let previousState = currentState
    let previousPath = currentPath
    currentState = store.getState().injectify
    currentPath = store.getState().router.location ? store.getState().router.location.pathname : null
    /**
     * If the section / project / page changed push state
     */
    if (previousPath === currentPath) {
      if (currentState.page !== previousState.page || currentState.section !== previousState.section || currentState.project !== previousState.project) {
        let url
        switch (currentState.section) {
          case 'projects':
            url = `/${currentState.section}/${encodeURIComponent(currentState.project.name)}/${currentState.page}`
            break
          case 'home':
            url = `/`
            break
          case 'settings':
            url = `/settings`
            break
        }
        if (url && decodeURIComponent(history.location.pathname) !== decodeURIComponent(url)) {
          console.debug(`Pushing from "${history.location.pathname}" to "${decodeURIComponent(url)}"`)
          history.push(url)
        }
      }
    }
    if (currentState.project !== previousState.project) {
      console.debug(`Project changed from`, previousState.project, `to`, currentState.project)
    } else if (currentState.page !== previousState.page) {
      console.debug(`Page changed from`, previousState.page, `to`, currentState.page)
      if (currentState.section === 'projects' && currentState.project && currentState.project.name) {
        store.dispatch(switchProject(currentState.project, currentState.page))
      }
    } else if (currentState.section !== previousState.section) {
      console.debug(`Section changed from`, previousState.section, `to`, currentState.section)
    }
  })

  function updateHistory(section, project, page) {
    let data = {
      section,
    }
    if (section === 'projects') {
      data = {
        ...data,
        project,
        page
      }
    }
    store.dispatch({
      type: 'BROWSER_HISTORY',
      ...data
    })
  }

  function checkURL(location = window.location) {
    let url = location.pathname.split('/').splice(1)
    updateHistory(decodeURIComponent(url[0]), decodeURIComponent(url[1]), url[2])
  }

  history.listen((location, action) => {
    checkURL(location)
  })

  checkURL()
}