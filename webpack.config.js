const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const src = path.resolve(__dirname, 'src');
const dist = path.resolve(__dirname, 'dist');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        type: 'asset/source',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: dist,
    clean: true, // clears old dist before build
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(src, 'index.html'),
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.join(src, 'models'), to: 'models' },
        { from: path.join(src, 'textures'), to: 'textures' },
        { from: path.join(src, 'style.css'), to: '' },
      ],
    }),
  ],
  devServer: {
    static: src,
  },
};





// const path = require('path');

// const src = path.resolve(__dirname, 'src');

// module.exports = {
//   mode: 'development',
//   entry: './src/index.ts',
//   devtool: 'inline-source-map',
//   module: {
//     rules: [
//       {
//         test: /\.tsx?$/,
//         use: 'ts-loader',
//         exclude: /node_modules/
//       }
//     ]
//   },
//   resolve: {
//     extensions: ['.tsx', '.ts', '.js']
//   },
//   output: {
//     filename: 'index.js',
//     path: src
//   },
//   devServer: {
//     static: src,
//   },
  
// }