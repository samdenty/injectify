const path = require('path')
const glob = require('glob')
const fs = require('fs')
const webpack = require('webpack')
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const modules = glob.sync('./modules/*/')
const extension = process.env.NODE_ENV === 'development' ? 'js' : 'min.js'

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
  if (file) entry[`${path}/dist/bundle.${extension}`] = `${path}/src/${file}`
}

module.exports = {
  mode: 'production',

  entry: {
    ...entry,
    [`bundle.${extension}`]: './core/App.ts'
  },

  output: {
    path: __dirname,
    filename: '[name]'
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          { loader: 'awesome-typescript-loader' },
          {
            loader: 'ifdef-loader',
            options: {
              DEBUG: process.env.NODE_ENV === 'development',
              PRODUCTION: process.env.NODE_ENV !== 'development'
            }
          }
        ]
      }
    ]
  },

  devtool:
    process.env.NODE_ENV === 'development'
      ? 'inline-cheap-module-source-map'
      : false,

  plugins:
    process.env.NODE_ENV === 'development'
      ? [new UnminifiedWebpackPlugin()]
      : [new UglifyJsPlugin(), new UnminifiedWebpackPlugin()],

  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
}
