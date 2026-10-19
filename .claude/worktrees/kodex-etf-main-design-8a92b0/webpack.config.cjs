const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src/main.tsx"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "assets/js/[name].[contenthash:8].js",
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            compilerOptions: {
              noEmit: false,
            },
          },
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                silenceDeprecations: ["import"],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|webp|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/images/[name].[contenthash:8][ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/assets"),
          to: "assets",
        },
      ],
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, "src"),
      publicPath: "/",
    },
    client: {
      overlay: true,
    },
  },
  devtool: "source-map",
};
