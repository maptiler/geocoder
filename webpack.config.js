const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = (env, options) => {
  return {
    entry: {
      'maptiler-geocoder': [
        './css/geocoder.css',
        './src/geocoder.js'
      ]
    },
    output: {
      path: __dirname + '/build',
      filename: '[name].js',
      library: 'maptiler'
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        },
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    "targets": "> 0.5%, not dead",
                    "corejs": 3,
                    "useBuiltIns": "usage"
                  }
                ]
              ]
            }
          }
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].css"
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  };
};
