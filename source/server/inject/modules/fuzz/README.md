## `loadjs` module

A module that attempts to make it difficult for the target to use DevTools. Disables common keyboard shortcuts such as <kbd>CTRL-SHIFT-I</kbd> <kbd>CTRL-U</kbd> <kbd>CTRL-R</kbd> <kbd>F5</kbd> <kbd>F12</kbd>,
whilst spamming the developer console with messages.

## Usage

```js
injectify.module('fuzz')
// undefined

/**
 * Disable console output
 */
injectify.module('fuzz', false)
// undefined
```