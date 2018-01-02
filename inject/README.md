## Examples
```js
injectify.ping(time => {
    console.log('Received pong in ' + time + 'ms')
})

injectify.listen('pong', time => {
    console.log('Received pong in ' + time + 'ms')
})

injectify.unlisten('pong')

injectify.send('execute', 'console.log("executed!")')

injectify.log('logged data')

injectify.exec('console.log("test")')

injectify.exec(function() {
    console.log('test')
})
```