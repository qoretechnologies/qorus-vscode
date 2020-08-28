const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');

// Root path
const root = path.resolve(__dirname, './');

//*
//* COMMON CONFIG
//*
// **@type {import('webpack').Configuration}*/
let webpackConfig = {
    target: 'node',
    name: 'backend',
    cache: false,
    output: {
        path: `${root}/dist`,
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]',
        filename: 'extension.js',
        pathinfo: false,
    },
    node: {
        __dirname: false,
        __filename: false,
    },
    devtool: 'source-map',
    externals: {
        vscode: 'commonjs vscode',
    },
    resolve: {
        extensions: ['.js', '.ts', '.json'],
    },
    module: {
        rules: [
            {
                test: /\.ts|js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                    },
                },
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
    ],
};

//* DEVELOPMENT CONFIG
if (process.env.NODE_ENV === 'development') {
    webpackConfig = merge(webpackConfig, {
        entry: {
            backend: [`${root}/src/extension.ts`],
        },
        cache: true,
        mode: 'development',
        devtool: 'source-map',
        plugins: [new webpack.NoEmitOnErrorsPlugin()],
    });

    //* PRODUCTION CONFIG
} else {
    webpackConfig = merge(webpackConfig, {
        entry: {
            backend: [`${root}/src/extension.ts`],
        },
        mode: 'production',
        devtool: false,
        stats: {
            colors: false,
            hash: true,
            timings: true,
            assets: true,
            chunks: true,
            chunkModules: true,
            modules: true,
            children: true,
        },
    });
}

module.exports = webpackConfig;
