export default function() {
  let inputs = document.getElementsByTagName('input')
  for (let i = 0; i < inputs.length; i++) {
    let input: HTMLInputElement = inputs[i]
    if (input.value !== input.getAttribute('value')) {
      input.setAttribute('value', input.value)
    }
  }
  let dom: any = document.documentElement
  return dom
}