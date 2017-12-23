# Miscellaneous Injectify client scripts

## `no-electron.js`
A pure NodeJS client without the electron framework. It was discontinued mostly due to the fact that some browser-based modules are non-compatible

For instance, these commands would require compatibility layers:
```js
alert()
new Image()
atob()
btoa()
```
This client does work, but if desktop-browser module compatibility is wanted, it's impossible to scale. Electron has everything built in, so it makes it more scalable and future-proof

## `oldcode.js`
Contains code that may eventually make itself into the current client