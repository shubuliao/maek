const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer"),
        "process": require.resolve("process/browser"),
        "path": require.resolve("path-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "fs": false,
        "net": false,
        "tls": false,
        "child_process": false,
        "module": false,
      };

      // Add aliases to handle specific package import issues
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        "process/browser": require.resolve("process/browser"),
        "process/browser.js": require.resolve("process/browser"),
      };

      // Add plugins
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
      ];

      // Configure module resolution for ESM compatibility
      webpackConfig.resolve.extensionAlias = {
        ".js": [".js", ".ts", ".jsx", ".tsx"],
        ".mjs": [".mjs", ".js", ".ts"],
      };

      // Add specific rules for problematic packages
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false, // disable the behavior
        },
      });

      return webpackConfig;
    },
  },
}; 