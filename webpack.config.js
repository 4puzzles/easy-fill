const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const src = __dirname + '/src';

module.exports = {
  entry: {
    popup: src + "/js/popup.js",
    "content-script": src + "/js/content-script.js", 
    inject: src + "/js/inject.js", 
  },

  output: {
    path: path.resolve(__dirname, 'dist/easy-fill/build'),
    filename: '[name].bundle.js',
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'Popup',
      template: src + '/views/popup.html',
      filename: __dirname + '/dist/easy-fill/popup.html',
      inject: 'head',
      minify: {
        removeComments: true,
      },
    }),
    
    new HtmlWebpackPlugin({
      title: 'Options',
      template: src + '/views/options.html',
      filename: __dirname + '/dist/easy-fill/options.html',
      inject: 'head',
      minify: {
        removeComments: true,
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src/'),
    },
  },
};