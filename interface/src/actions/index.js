// export function switchPage(page) {
//   return (dispatch, getState) => {
//     let state = getState().injectify
//     dispatch({
//       type: 'SWITCH_PAGE',
//       page
//     })
//   }
// }

export function switchSection(section) {
  return {
    type: 'SWITCH_SECTION',
    section
  }
}

export function switchPage(page) {
  return {
    type: 'SWITCH_PAGE',
    page
  }
}

export function updateSettings(settings) {
  return {
    type: 'UPDATE_SETTINGS',
    settings
  }
}

export function switchProject(project) {
  return {
    type: 'SWITCH_PROJECT',
    project
  }
}
