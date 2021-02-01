import * as path from 'path';
import * as webpack from 'webpack';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import { LESS_VARS, PUG_VARS } from "./core/constants";

const config: webpack.Configuration = {
    mode: 'production',
    entry: "./scripts/main.ts",
    resolve: {
        extensions: [ '.ts', '.js' ],
    },
    output: {
        path: path.join(__dirname, './build/'),
        filename: "./all.min.js"
    },
    devtool: 'eval-source-map',
    optimization: {
        minimize: true
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'babel-loader',
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                    },
                    {
                        loader: "less-loader",
                        options: {
                            lessOptions: {
                                modifyVars: LESS_VARS
                            }
                        }
                    }
                ],
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /\.pug$/,
                use: 'pug-loader',
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
                use: 'file-loader', // img(src=require('../../assets/img/engme_ru_logo.png'))
                exclude: /(node_modules|bower_components)/
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './pages/index.pug',
            templateParameters: PUG_VARS
        }),
        new CleanWebpackPlugin()
    ]
}

export default config;
