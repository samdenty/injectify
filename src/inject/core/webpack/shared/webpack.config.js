// @ts-check
module.exports = (options) => ({
  output: {
    path: process.cwd(),
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
            options
          }
        ]
      }
    ]
  },

  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
})
