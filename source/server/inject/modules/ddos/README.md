## `ddos` module

Performs a DDOS attack on any given URL

## Usage

```js
injectify.module('ddos', 'http://example.com/')
// undefined


injectify.module('ddos', {
    url: 'http://example.com/',
    interval: 10,
    query: false
})
// undefined
```