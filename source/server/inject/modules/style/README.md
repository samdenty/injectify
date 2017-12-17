## `style` module

Inserts CSS into the DOM

## Usage

```js
injectify.module('style', 'body: { background: #000 }')
// undefined


injectify.module('style', {
    css: 'body: { background: #000 }'
})
// undefined
```