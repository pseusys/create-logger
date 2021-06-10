import * as path from 'path';
import * as webpack from 'webpack';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import { COLORS, DEFAULTS, STYLES } from "./core/constants";
import { LANGUAGES, TYPES } from "./core/langs";

import en from "./trans/en.json";
import ru from "./trans/ru.json";



const TRANSLATIONS = {
    en: "English 🇬🇧",
    ru: "Русский 🇷🇺"
}

const LITERALS = {
    en: en,
    ru: ru
};

// For passing variables to LESS:

const LESS_VARS = {
    colors: Object.keys(COLORS),
    styles: Object.keys(STYLES)
};

Object.keys(DEFAULTS).forEach((value) => {
    LESS_VARS["def-" + value] = DEFAULTS[value];
});

// For passing variables to PUG:

const PUG_VARS = {
    colors: Object.keys(COLORS),
    styles: Object.keys(STYLES),

    languages: Object.keys(LANGUAGES),
    types: Object.values(TYPES),

    literals: LITERALS.en,
    translations: TRANSLATIONS,

    build: '#'
};



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
                use: [ "style-loader", "css-loader",
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
                        options: {
                            insert: 'head',
                            injectType: 'singletonStyleTag'
                        }
                    }, "css-loader"
                ]
            },
            {
                test: /\.pug$/,
                use: 'pug-loader',
                exclude: /(node_modules|bower_components)/
            }
        ]
    },
    plugins: [ new CleanWebpackPlugin() ]
}

module.exports = (env, argv) => {
    if (argv.mode == 'development') {
        config.devtool = 'eval-source-map';
    } else PUG_VARS.build = process.env.build_link;

    for (const literal in LITERALS) {
        PUG_VARS.literals = LITERALS[literal]
        const vars = JSON.stringify(PUG_VARS);
        config.plugins.push(
            new HtmlWebpackPlugin({
                template: './pages/index.pug',
                favicon: './favicon.ico',
                filename: ((literal == 'en') ? 'index' : literal) + '.html',
                templateParameters: JSON.parse(vars)
            })
        );
    }

    return config;
};
