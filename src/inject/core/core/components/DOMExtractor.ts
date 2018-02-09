function exportValue(...elements) {
  for (let i = 0; i < elements.length; i++) {
    let group = document.getElementsByTagName(elements[i])
    for (let i = 0; i < group.length; i++) {
      let input = group[i]
      if (input.value !== input.getAttribute('value')) {
        input.setAttribute('value', input.value)
      }
    }
  }
}

export default function() {
  exportValue('textarea', 'input')
  let dom: any = document.documentElement
  return dom
}