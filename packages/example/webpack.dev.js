const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isRunOnLocal = process.env.RUN_ON_LOCAL === 'true';

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.tsx'
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].async.js',
    publicPath: '/'
  },

  devtool: 'eval-source-map',

  externals: isRunOnLocal ? {} : {
    react: 'var window.GPReact',
    'react-dom': 'var window.GPReactDOM',
    moment: 'var window.moment',
    lodash: 'var window._',
    antd: 'var window.GPAntd',
    '@ant-design/pro-form': 'var window.ProForm',
    '@ant-design/pro-table': 'var window.ProTable',
    '@metacode/runtime': 'var window.MetacodeRuntime'
  },

  devServer: {
    port: 5010,
    host: '127.0.0.1',
    allowedHosts: 'all',
    headers: { 'Access-Control-Allow-Origin': '*' },
    historyApiFallback: true,
    hot: true,
    client: {
      overlay: false
    }
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(scss|sass)$/,
        oneOf: [
          {
            resourceQuery: /module/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    compileType: 'module',
                    localIdentName: '[path][name]__[local]--[hash:base64:5]'
                  }
                }
              },
              'sass-loader'
            ]
          },
          {
            use: ['style-loader', 'css-loader', 'sass-loader']
          }
        ]
      },
      {
        test: /\.less$/,
        oneOf: [
          {
            resourceQuery: /module/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    compileType: 'module',
                    localIdentName: '[path][name]__[local]--[hash:base64:5]'
                  }
                }
              },
              {
                loader: 'less-loader',
                options: {
                  lessOptions: {
                    javascriptEnabled: true
                  }
                }
              }
            ]
          },
          {
            use: [
              'style-loader',
              'css-loader',
              {
                loader: 'less-loader',
                options: {
                  lessOptions: {
                    javascriptEnabled: true
                  }
                }
              }
            ]
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|pdf)$/,
        type: 'asset/resource'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react']
            }
          },
          {
            loader: '@svgr/webpack',
            options: {
              babel: false,
              icon: true
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './config/template.default.ejs',
      filename: 'index.html',
      inject: 'body',
      chunks: ['index']
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.DEPLOY_ENV': JSON.stringify(process.env.DEPLOY_ENV),
      '__RUN_ON_LOCAL__': JSON.stringify(process.env.RUN_ON_LOCAL === 'true')
    })
  ],

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src/')
    },
    modules: ['node_modules'],
    fallback: {
      stream: require.resolve('stream-browserify')
    }
  }
};

