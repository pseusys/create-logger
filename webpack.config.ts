import * as path from 'path';
import * as webpack from 'webpack';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import { LESS_VARS, PUG_VARS } from "./core/constants";
import { LITERALS } from "./core/babylon";

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
                test: /\.jsx?$/,
                use: 'babel-loader'
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
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                    }
                ]
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
        new CleanWebpackPlugin()
    ]
}

module.exports = (env, argv) => {
    if (argv.mode == 'development') {
        config.devtool = 'eval-source-map';
        config.performance = {
            hints: 'warning'
        }
    } else PUG_VARS.build = process.env.build_link;

    for (const literal in LITERALS) {
        PUG_VARS.literals = LITERALS[literal]
        const vars = JSON.stringify(PUG_VARS);
        config.plugins.push(
            new HtmlWebpackPlugin({
                template: './pages/index.pug',
                filename: ((literal == 'en') ? 'index' : literal) + '.html',
                templateParameters: JSON.parse(vars)
            })
        );
    }

    return config;
};
