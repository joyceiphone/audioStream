const webpack = require('webpack');

module.exports = function override(config, env) {
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ]);

  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      process: 'process/browser',
    },
  };

  return config;
};