const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
	entry: ['./main.jsx', './scss/main.scss'],
	output: {
		path: path.resolve(__dirname) + '/../public',
		filename: 'bundle.js',
		publicPath: '/'
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'react-hot-loader!babel-loader'
			},
			{
				test: /\.(sass|scss)$/,
				loader: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
					use: ['css-loader', 'sass-loader']
				}))
			},
			{
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      }
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
		}),
		new ExtractTextPlugin({ // define where to save the file
			filename: 'assets/css/[name].css',
			allChunks: true,
			//disable: process.env.NODE_ENV !== 'production'
		}),
		new CopyWebpackPlugin([
			{
				from: 'node_modules/monaco-editor/min/vs',
				to: 'vs',
			}
		])
		//new UglifyJSPlugin()
	],
	resolve: {
		extensions: ['.*', '.js', '.jsx']
	},
	devServer: {
		contentBase: '../public/',
		hot: true
	}
}