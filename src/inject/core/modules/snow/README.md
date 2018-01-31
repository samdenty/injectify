## `snow` module

Makes the page snow!

## Usage

```js
injectify.module('snow')
// undefined


/**
 * Prevent user from clicking on page
 */
injectify.module('snow', true)
// undefined


injectify.module('snow', {
    opacity: 0.7,
    blocking: true
}).then(canvas => {
    console.log(canvas.style)
})
// canvas{position:absolute;top:0;left:0;...}
```