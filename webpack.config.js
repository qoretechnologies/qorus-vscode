const path = require('path');
const root = path.resolve(__dirname, './');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        login: './web/login/main.js',
        project_config: './web/project_config/main.js',
        release_package: './web/release_package/main.js',
        delete_interfaces: './web/delete_interfaces/main.js',
    },
    output: {
        path: `${root}/dist`,
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js',
        pathinfo: false,
    },
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
                test: /\.(s)?css$/,
                use: [
                    'style-loader',
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
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
        new MiniCssExtractPlugin({filename: '[name].css', chunkFilename: '[name].css'})
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
