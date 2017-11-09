const path = require("path")
const webpack = require("webpack")
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
	entry: ["./main.jsx"],
	output: {
		path: path.resolve(__dirname),
		filename: "bundle.js"
	},
	module: {
		loaders: [{
			test: /\.jsx?$/,
			exclude: /node_modules/,
			loader: 'react-hot-loader!babel-loader'
		}]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
		})
		//new UglifyJSPlugin()
	],
	resolve: {
		extensions: ['*', '.js', '.jsx']
	},
	devServer: {
		contentBase: '../../output/site',
		hot: true
	}
}