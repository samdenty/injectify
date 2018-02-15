## `clickspoof` module

Fakes a window click event on an element

## Usage

```js
injectify.module('click', 'document.body')
// undefined

injectify.module('click', {
  element: 'document.body',
  screenX: 10,
  screenY: 10
})
// undefined
```