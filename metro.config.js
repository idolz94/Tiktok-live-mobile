const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {
    mangle: {
      toplevel: false,
    },
    compress: {
      drop_console: true,
      passes: 2,
    },
    output: {
      comments: false,
    },
  },
};

module.exports = config;
