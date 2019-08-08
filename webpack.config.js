var path = require('path');
 var webpack = require('webpack');
 module.exports = {
     mode: 'production',
     entry: './app.js',
     output: {
         path: path.resolve(__dirname, 'build'),
         filename: 'app.bundle.js'
     },
     module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
          ]
     },
     stats: {
         colors: true
     },
     devtool: 'source-map'
 };