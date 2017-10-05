const webpack = require('webpack');
const merge = require('webpack-merge');
const config = require('./webpack.config.base');

const env = {
  NODE_ENV: JSON.stringify('development')
};

const GLOBALS = {
  'process.env': env,
  __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'true'))
};

module.exports = merge(config, {
  cache: true,
  devtool: 'source-map',
  entry: {
    'cards': [
      'webpack-hot-middleware/client',
      'react-hot-loader/patch',
      'babel-polyfill',
      'cards'
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin(GLOBALS)
  ],
  module: {
    loaders: [
      {
        test: /\.css$|\.scss$/,
        loaders: ['style-loader', 'css-loader', {
          loader: 'postcss-loader'
        }, {
          loader: 'sass-loader',
          query: { outputStyle: 'expanded' }
        }]
      }
    ]
  }
});
