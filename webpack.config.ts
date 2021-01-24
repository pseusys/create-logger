import * as path from 'path';
import * as webpack from 'webpack';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { CCopyPlugin } from  "copy-webpack-plugin";

import { LESS_VARS } from "./constants";



const config: webpack.Configuration = {
    mode: 'production',
    entry: "./scripts/main.ts",
    resolve: {
        extensions: [ '.ts', '.js' ],
    },
    output: {
        path: path.join(__dirname, './docs/'),
        filename: "./all.min.js"
    },
    devtool: 'inline-source-map',
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
                exclude: /node_modules/,
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
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin()
        /*, new CopyPlugin({
            patterns: [
                { from: "./src/files/", to: "./files/" },
                { from: "./src/favicon.ico", to: "./favicon.ico" }
            ]
        })*/
    ]
}

export default config;
