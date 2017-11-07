const path = require("path")
const webpack = require("webpack")

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
			"process.env": {
				VERSION: JSON.stringify(require('child_process').execSync('git rev-parse HEAD').toString())
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
		  include: /\.min\.js$/,
		  minimize: true
		})
	],
	resolve: {
		extensions: ['*', '.js', '.jsx']
	},
	devServer: {
		contentBase: '../../output/site',
		hot: true
	}
}