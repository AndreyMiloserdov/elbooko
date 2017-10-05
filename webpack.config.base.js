// Common Webpack configuration: used by others webpack configurations

const path = require('path');
const webpack = require('webpack');

const BINARY_FILE_MAX_SIZE = 8192;

const BASE_DIR = 'src';
const OUTPUR_DIR = 'build';

const JS_CUSTOM_APP_NAME = 'js/[name].js';
const JS_COMMON_VENDOR_NAME = 'js/vendor.bundle.js';

module.exports = {
  entry: {
    vendor: [
      'react',
      'react-dom',
      'react-redux',
      'react-bootstrap',
      'redux'
    ]
  },
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, OUTPUR_DIR),
    publicPath: '/'
  },
  resolve: {
    modules: [
      path.join(__dirname, BASE_DIR),
      'node_modules'
    ],
    extensions: ['.js', '.jsx', '.json', '.scss']
  },
  plugins: [
    // Shared code
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'js/vendor.bundle.js',
      minChunks: Infinity
    })
  ],
  module: {
    loaders: [
      // JavaScript / ES6
      {
        test: /\.(jsx|js)$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'babel-loader'
      },
      // JSON
      {
        test: /\.(json)$/,
        loader: 'json-loader'
      },
      // Images
      // Inline base64 URLs for <=8k images, direct URLs for the rest
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        loader: 'url-loader',
        query: {
          limit: BINARY_FILE_MAX_SIZE,
          name: 'images/[name].[ext]?[hash]'
        }
      },
      // Fonts
      {
        test: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        loaders: [{
          loader: 'url-loader',
          query: {
            limit: BINARY_FILE_MAX_SIZE,
            name: 'theme/[name].[ext]?[hash]'
          }
        }]
      }
    ]
  }
};
