const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
	entry: ['./main.jsx', './scss/main.scss'],
	output: {
		path: path.resolve(__dirname) + '/..',
		filename: '../bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'react-hot-loader!babel-loader'
			},
			{
				test: /\.(sass|scss)$/,
				loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
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
		extensions: ['*', '.js', '.jsx']
	},
	devServer: {
		contentBase: '../',
		hot: true
	}
}