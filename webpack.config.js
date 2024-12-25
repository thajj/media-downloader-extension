const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  devtool: false,
  entry: {
    content: "./src/content/content.js",
    background: "./src/background/background.js",
    popup: "./src/popup/popup.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    iife: true,
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    chrome: "88",
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "manifest.json",
          to: "manifest.json",
          force: true,
        },
        {
          from: "src/popup/popup.html",
          to: "popup.html",
          force: true,
        },
        {
          from: "src/popup/popup.css",
          to: "popup.css",
          force: true,
        },
        {
          from: "assets/icons",
          to: "icons",
          force: true,
        },
      ],
    }),
  ],
  resolve: {
    extensions: [".js"],
  },
};
