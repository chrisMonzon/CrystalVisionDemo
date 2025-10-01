const HtmlWebpackPlugin = require('html-webpack-plugin');
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
        type: 'asset/source', // Webpack 5 built-in loader for raw text
      },
      {
        // Transpile the whole three-custom-shader-material package
        test: /three-custom-shader-material.*\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: dist,
    clean: true, // wipe dist/ before every build
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(src, 'index.html'), // take src/index.html
      filename: 'index.html',                 // output dist/index.html
    }),
  ],
  devServer: {
    static: src, // serve static assets (textures, models) from src/
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