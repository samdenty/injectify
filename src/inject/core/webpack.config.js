const path = require('path')
const glob = require('glob')
const fs = require('fs')
const webpack = require('webpack')
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin')
const modules = glob.sync('./modules/*/')

let entry = {}
for (let i = 0; i < modules.length; i++) {
  let module = modules[i].split('/')[2]
  let path = `./modules/${module}`
  let file
  if (fs.existsSync(`${path}/src/module.tsx`)) {
    file = 'module.tsx'
  } else if (fs.existsSync(`${path}/src/module.ts`)) {
    file = 'module.ts'
  } else if (fs.existsSync(`${path}/src/module.js`)) {
    file = 'module.js'
  }
  if (file) entry[`${path}/dist/bundle.min.js`] = `${path}/src/${file}`
}

module.exports = {
  entry: {
    ...entry,
    'bundle.min.js': './core/App.ts'
  },
  output: {
    filename: '[name]'
  },

  resolve: {
    extensions: ['.ts', '.tsx']
  },

  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'awesome-typescript-loader'
    }]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new UnminifiedWebpackPlugin()
  ],
}