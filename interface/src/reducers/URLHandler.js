import { project as switchProject } from '../actions'
export default (store, history) => {
  let currentState = store.getState().injectify
  let currentPath = null
  store.subscribe(() => {
    let previousState = currentState
    let previousPath = currentPath
    currentState = store.getState().injectify
    currentPath = store.getState().router.location
      ? store.getState().router.location.pathname
      : null
    /**
     * If the section / project / page changed push state
     */
    if (previousPath === currentPath) {
      if (
        currentState.page !== previousState.page ||
        currentState.section !== previousState.section ||
        currentState.selectedProject.name !== previousState.selectedProject.name
      ) {
        let url = (() => {
          switch (currentState.section) {
            case 'projects':
              return `/${currentState.section}/${encodeURIComponent(
                currentState.selectedProject.name
              )}/${currentState.page}`
            case 'home':
              return '/'
            default:
              return `/${currentState.section}`
          }
        })()

        if (
          url &&
          decodeURIComponent(history.location.pathname) !==
            decodeURIComponent(url)
        ) {
          console.debug(
            `Pushing from "${
              history.location.pathname
            }" to "${decodeURIComponent(url)}"`
          )
          history.push(url)
        }
      }
    }
    if (
      currentState.selectedProject.name !== previousState.selectedProject.name
    ) {
      console.debug(
        `Project changed from`,
        previousState.selectedProject.name,
        `to`,
        currentState.selectedProject.name
      )
    } else if (currentState.page !== previousState.page) {
      console.debug(
        `Page changed from`,
        previousState.page,
        `to`,
        currentState.page
      )
      if (
        currentState.section === 'projects' &&
        currentState.selectedProject.name
      ) {
        store.dispatch(
          switchProject(currentState.selectedProject.name, currentState.page)
        )
      }
    } else if (currentState.section !== previousState.section) {
      console.debug(
        `Section changed from`,
        previousState.section,
        `to`,
        currentState.section
      )
    }
  })

  function updateHistory(section, project, page) {
    let data = {
      section
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
    updateHistory(
      decodeURIComponent(url[0]),
      decodeURIComponent(url[1]),
      url[2]
    )
  }

  history.listen((location, action) => {
    checkURL(location)
  })

  checkURL()
}
