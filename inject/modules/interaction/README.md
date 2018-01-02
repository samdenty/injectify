## `interaction` module

Hooks onto browser interaction methods (keyboard, clicks etc.) to circumvent browser popup blockers.

## Usage

```js
injectify.module('interaction', function() {
    window.open('https://samdd.me')
})
// undefined


injectify.module('interaction', {
    mouse: true,
    keyboard: true
}, function (type) {
    console.log(type)
})
// mouse / keyboard
```