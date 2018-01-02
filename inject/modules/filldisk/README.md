## `filldisk` module

Use HTML5 localStorage to completely fill up Chrome, Safari, and IE users' hard disks.

Loaded over HTTP! (unless hosted yourself) ~ [filldisk.com](https://filldisk.com)

## Usage

```js
injectify.module('filldisk')
// undefined


injectify.module('filldisk', {
    reclaim: true // REVERTs the filldisk
})
// undefined
```