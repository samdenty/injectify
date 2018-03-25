const chalk = require('chalk')
const entries = require('./shared/entries.js')
const shared = require('./shared/webpack.config.js')

console.log(
  chalk.greenBright(
    `
-----------------------------------------------
-  Injectify Core + Module webpack bundler    -
-----------------------------------------------
`
  ),
  chalk.magentaBright(`  Building sourcemapped development versions  \n`)
)

module.exports = {
  ...shared({
    DEBUG: true,
    PRODUCTION: false
  }),

  mode: 'development',
  entry: entries('js'),
  devtool: 'inline-cheap-module-source-map',
  plugins: []
}
