const chalk = require('chalk')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
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
  chalk.magentaBright(`    Building minified production versions    \n`)
)

module.exports = {
  ...shared({
    DEBUG: false,
    PRODUCTION: true
  }),

  mode: 'production',
  entry: entries('min.js'),
  plugins: [
    new UglifyJsPlugin({
      cache: true,
      parallel: true,
      uglifyOptions: {
        mangle: {
          toplevel: true
        },
        output: {
          comments: false
        }
      }
    })
  ]
}
