// https://github.com/webpack/webpack#loaders
// http://webpack.github.io/docs/list-of-loaders.html
// https://github.com/angular-class/angular2-webpack-starter/blob/master/webpack.config.js
var path = require('path');
var webpack = require('webpack');
// var JasmineWebpackPlugin = require('jasmine-webpack-plugin');

module.exports = {
	context: path.join(__dirname, 'app/js'),
	entry: {
		specs: './specs',
		boot: './boot',
	},
	output: {
		// This is where images AND js will go
		path: path.join(__dirname, 'dist'),
		// This is used to generate URLs to e.g. images
    // publicPath: 'http://mycdn.com/',
		// chunkFilename: '[name].[id].js',
		filename: '[name].js'
	},
  //devtool: 'source-map',
	module: {
		loaders: [
			{ test: /\.coffee$/, loader: 'coffee' },
			{ test: /\.ls$/, loader: 'livescript' },
			{ test: /\.tsx?$/, loader: 'ts' },	//babel!
			{ test: /\.js$/, loader: 'babel?presets[]=es2015,presets[]=stage-0', include: [ path.resolve(__dirname, "app"), ] },  // , exclude: [ path.resolve(__dirname, "node_modules"), ]
			{ test: /\.json$/, loader: 'json' },
			{ test: /\.html$/, loader: 'html' },
			{ test: /\.jade$/, loader: 'html!jade-html' },
			// style!css!cssnext!autoprefixer! over raw! for non-ng2 inclusion
			// { test: /\.less$/, loader: 'raw!less' },	//raw is for ng2 `styles: [require('./style.less')]`
			// ^ ng2 sucks for css though -- `css` loader pre-resolves urls, `style` injects into DOM.
			{ test: /\.less$/, loader: 'style!css!less' },
			{ test: /\.css$/, loader: 'style!css' },
			{ test: /\.(jpe?g|png)$/, loader: 'url?limit=8192' }, // inline base64 URLs for <=8k images, direct URLs for the rest
			{ test: /\.(gif|ttf|eot|svg|woff(2)?|wav|mp3)$/, loader: 'file' }
		]
	},
	resolve: {
		extensions: [
			// you can now require('file') instead of require('file.coffee')
			'', '.js', '.coffee', 'ls', '.ts', '.tsx', 'json', 'html', 'jade', 'css', 'less', 'sass', 'scss'
		],
		// root: ['node_modules', 'bower_components', 'app'].map((folder) => path.join(__dirname, folder))
		modulesDirectories: ['node_modules', 'bower_components', 'app'],
		root: __dirname
	},
  plugins: [
		// new JasmineWebpackPlugin(),
		// Materialize
		new webpack.ProvidePlugin({
	    $: 'jquery',
	    jQuery: 'jquery',
	    'Hammer': 'hammerjs/hammer'
		}),
		//new webpack.optimize.UglifyJsPlugin(),
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
    )
  ],
	stats: {
	  colors: false,
	  modules: true,
	  reasons: true
  },
	node: {
		fs: 'empty',
		tls: 'empty',
		net: 'empty',
		dns: 'empty',
		// console: false,
		// global: true,
		// process: true,
		// Buffer: true,
		// __filename: 'mock',
		// __dirname: 'mock',
		setImmediate: true
	},
	// noParse: [/\/dist\//],
	progress: true,
  keepalive: true
}
