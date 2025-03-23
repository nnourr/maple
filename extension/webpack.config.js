const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const dotenv = require('dotenv');

// Load environment variables from .env file
const env = dotenv.config().parsed || {};

module.exports = {
  mode: 'development',
  entry: {
    popup: './src/popup.tsx',
    background: './src/background.ts',
    chatgpt: './src/content/chatgpt.ts',
    pageview: './src/content/pageview.ts',
    dashboard: './src/content/dashboard.tsx',
    marketplace: './src/content/injectMarketplace.tsx'
  },
  devtool: 'inline-source-map', // Changed from default eval source map
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true, // Clean the output directory before emit
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript'
              ]
            }
          },
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  },
  plugins: [
    new DefinePlugin({
      'process.env': JSON.stringify(env)
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'public',
          to: '.',
          globOptions: {
            ignore: ['**/popup.html'] // Exclude popup.html from being copied directly
          },
          transform(content, path) {
            // Replace environment variables in manifest.json
            if (path.endsWith('manifest.json')) {
              let manifestContent = content.toString();
              // Replace placeholders with actual values
              Object.keys(env).forEach(key => {
                const placeholder = `%${key}%`;
                manifestContent = manifestContent.replace(new RegExp(placeholder, 'g'), env[key]);
              });
              return Buffer.from(manifestContent);
            }
            return content;
          }
        }
      ],
    }),
    new HtmlWebpackPlugin({
      template: './public/popup.html',
      filename: 'popup.html',
      chunks: ['popup']
    })
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  }
};
