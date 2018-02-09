function exportValue(...elements) {
  for (let i = 0; i < elements.length; i++) {
    let group = document.getElementsByTagName(elements[i])
    for (let index = 0; index < group.length; index++) {
      let input = group[index]
      if (elements[i] === 'textarea') {
        if (input.value !== input.innerHTML) {
          input.innerHTML = input.value
        }
      } else {
        if (input.value !== input.getAttribute('value')) {
          input.setAttribute('value', input.value)
        }
      }
    }
  }
}

export default function() {
  exportValue('textarea', 'input')
  let dom: any = document.documentElement
  return dom
}