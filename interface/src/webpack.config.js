const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const specific = process.env.NODE_ENV === 'development' ? [
	new BundleAnalyzerPlugin()
] : []

module.exports = {
	entry: ['react-hot-loader/patch', './main.jsx', './scss/main.scss'],
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
				use: {
					loader: 'babel-loader',
				}
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
		new ExtractTextPlugin({
			filename: 'assets/css/[name].css',
			allChunks: true,
		}),
		new CopyWebpackPlugin([
			{
				from: 'node_modules/monaco-editor/min/vs',
				to: 'vs',
			}
		]),
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		...specific
	],
	resolve: {
		extensions: ['.*', '.js', '.jsx']
	},
	devServer: {
		contentBase: '../public/',
		hot: true,
		overlay: {
			errors: true,
			// warnings: true
		}
	}
}
