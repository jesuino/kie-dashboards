/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { merge } = require("webpack-merge");
const common = require("../../webpack.common.config");

module.exports = async (env, argv) => {
  let entryPoint = "./src/index.tsx";
  const copyResources = [
    { from: "./static/manifest.json", to: "manifest.json" },
    // main
    { from: "../../node_modules/@patternfly/patternfly/patternfly.min.css", to: "patternfly.min.css" },
    // fonts
    {
      from: "../../node_modules/@patternfly/react-core/dist/styles/assets/fonts/RedHatText/RedHatText-Regular.woff2",
      to: "assets/fonts/RedHatText/RedHatText-Regular.woff2"
    },
    {
      from: "../../node_modules/@patternfly/react-core/dist/styles/assets/fonts/RedHatText/RedHatText-Medium.woff2",
      to: "assets/fonts/RedHatText/RedHatText-Medium.woff2"
    },
    {
      from: "../../node_modules/@patternfly/react-core/dist/styles/assets/fonts/RedHatDisplay/RedHatDisplay-Medium.woff2",
      to: "assets/fonts/RedHatDisplay/RedHatDisplay-Medium.woff2"
    }
  ];

  if (process.env.WEBPACK_DEV_SERVER) {
    entryPoint = "./src/index-dev.tsx";
    copyResources.push({ from: "./static/manifest.dev.json", to: "./manifest.dev.json" });
  }

  return merge(common, {
    entry: {
      index: entryPoint
    },
    optimization: {
      usedExports: true,
      minimize: true
    },
    mode: "production",
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "src", "index.html")
      }),
      new CopyPlugin(copyResources)
    ],
    devServer: {
      historyApiFallback: false,
      disableHostCheck: true,
      watchContentBase: true,
      contentBase: [path.join(__dirname, "./dist"), path.join(__dirname, "./static")],
      compress: true,
      port: 9001
    }
  });
};
