/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const { stylePaths } = require("./stylePaths");

module.exports = {
  mode: "production",
  devtool: "inline-source-map",
  output: {
    path: path.resolve("./dist"),
    publicPath: "",
    filename: "[name].js"
  },
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [
      new TerserJSPlugin({}),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ["default", { mergeLonghand: false }]
        }
      })
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[name].bundle.css"
    })
  ],
  stats: {
    excludeModules: true
  },
  performance: {
    maxAssetSize: 30000000,
    maxEntrypointSize: 30000000
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    modules: [path.resolve("../../node_modules"), path.resolve("./node_modules"), path.resolve("./src")]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.(svg|ttf|eot|woff|woff2)$/,
        // only process modules with this loader
        // if they live under a 'fonts' or 'pficon' directory
        include: [
          path.resolve(__dirname, "node_modules/@patternfly/patternfly/assets/fonts/RedHatDisplay"),
          path.resolve(__dirname, "node_modules/@patternfly/patternfly/assets/fonts/overpass-mono-webfont")
        ],
        use: {
          loader: "file-loader",
          options: {
            // Limit at 50k. larger files emited into separate files
            limit: 5000,
            outputPath: "fonts",
            name: "[name].[ext]"
          }
        }
      },
      {
        test: /\.svg$/,
        // only process SVG modules with this loader when they don't live under a 'bgimages',
        // 'fonts', or 'pficon' directory, those are handled with other loaders
        include: input =>
          input.indexOf("fonts") === -1 && input.indexOf("background-filter") === -1 && input.indexOf("pficon") === -1,
        use: {
          loader: "raw-loader",
          options: {}
        }
      },
      {
        test: /\.(jpg|jpeg|png|gif)$/i,
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "node_modules/patternfly"),
          path.resolve(__dirname, "node_modules/@patternfly/patternfly/assets/images"),
          path.resolve(__dirname, "node_modules/@patternfly/react-styles/css/assets/images"),
          path.resolve(__dirname, "node_modules/@patternfly/react-core/dist/styles/assets/images"),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css/assets/images"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css/assets/images"
          ),
          path.resolve(
            __dirname,
            "node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css/assets/images"
          )
        ],
        use: [
          {
            loader: "url-loader",
            options: {}
          }
        ]
      },
      {
        test: /\.css$/,
        include: [...stylePaths],
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      }
    ]
  }
};
