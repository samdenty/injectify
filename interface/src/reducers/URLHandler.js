export default (store, history) => {
  let currentState = store.getState().injectify
  let currentPath = null
  store.subscribe(() => {
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
          console.debug(`Pushing from ${history.location.pathname} to ${url}`)
          history.push(url)
        }
      }
    }
  })

  function updateHistory(section, project, page) {
    store.dispatch({
      type: 'BROWSER_HISTORY',
      section,
      project,
      page
    })
  }

  function checkURL(location = window.location) {
    let url = location.pathname.split('/').splice(1)
    updateHistory(decodeURIComponent(url[0]), url[1], url[2])
  }

  history.listen((location, action) => {
    checkURL(location)
  })

  checkURL()
}