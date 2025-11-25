const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.tsx'
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].async.js',
    publicPath: '/',
    library: 'graphic-custom-component',
    libraryTarget: 'umd',
    globalObject: 'window'
  },

  devtool: 'source-map',

  externals: {
    react: 'var window.GPReact',
    'react-dom': 'var window.GPReactDOM',
    moment: 'var window.moment',
    lodash: 'var window._',
    antd: 'var window.GPAntd',
    '@ant-design/pro-form': 'var window.ProForm',
    '@ant-design/pro-table': 'var window.ProTable',
    '@metacode/runtime': 'var window.MetacodeRuntime'
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
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(scss|sass)$/,
        oneOf: [
          {
            resourceQuery: /module/,
            use: [
              MiniCssExtractPlugin.loader,
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
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
          }
        ]
      },
      {
        test: /\.less$/,
        oneOf: [
          {
            resourceQuery: /module/,
            use: [
              MiniCssExtractPlugin.loader,
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
              MiniCssExtractPlugin.loader,
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

  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.error']
          },
          format: {
            comments: false
          }
        },
        extractComments: false
      })
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
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[name].[contenthash:8].async.css'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.DEPLOY_ENV': JSON.stringify(process.env.DEPLOY_ENV),
      '__RUN_ON_LOCAL__': JSON.stringify(false)
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

