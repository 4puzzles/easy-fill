const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');


const src = __dirname + '/src';

module.exports = {
  entry: {
    "content-script": src + "/content-script.js", 
    inject: src + "/inject.js", 
  },

  output: {
    path: path.resolve(__dirname, 'dist/easy-fill/build'),
    filename: '[name].bundle.js',
  },

  plugins: [
    new VueLoaderPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src/'),
    },
  },
};