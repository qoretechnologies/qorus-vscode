const path = require('path');
const root = path.resolve(__dirname, './');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const commonConfig = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: { cacheDirectory: true }
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(jpg|png|svg)$/,
                loader: 'url-loader',
            },
            {
                test: /\.(html|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                        },
                    },
                ],
            },
        ],
    },
    devServer: {
        host: 'localhost',
        port: 9876,
        publicPath: __dirname,
        writeToDisk: true,
        inline: true,
        noInfo: false,
        stats: { colors: true },
    },
    plugins: [
        new MiniCssExtractPlugin({filename: 'base.css', chunkFilename: '[name].css'})
    ],
    optimization: {
        runtimeChunk: false,
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    enforce: true,
                    chunks: 'all',
                },
            },
        },
    },
};

const projectConfig = Object.assign({}, commonConfig, {
    output: {
        path: `${root}/dist/qorus_project_config`,
        filename: 'bundle.js',
        chunkFilename: '[name].bundle.js',
        pathinfo: false,
    },
    entry: {
        qorus_project_config: './web/qorus_project_config/main.js',
    },
});

const releaseConfig = Object.assign({}, commonConfig, {
    output: {
        path: `${root}/dist/qorus_release_package`,
        filename: 'bundle.js',
        chunkFilename: '[name].bundle.js',
        pathinfo: false,
    },
    entry: {
        qorus_release_package: './web/qorus_release_package/main.js',
    },
});

module.exports = [projectConfig, releaseConfig];
