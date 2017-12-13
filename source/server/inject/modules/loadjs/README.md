## `loadjs` module

Loads & executes an external Javascript file

## Usage

```js
injectify.module('loadjs', 'http://example.com/file.js')
// undefined

injectify.module('loadjs', {
    url: 'http://example.com/file.js'
})
// undefined
```