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
let webpackConfig = {
    name: 'webview',
    context: `${root}/web`,
    cache: false,
    output: {
        path: `${root}/dist`,
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js',
        publicPath: 'https://9876-black-marmoset-d720tsvs.ws-eu23.gitpod.io',
        pathinfo: false,
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.json'],
    },
    module: {
        rules: [
            {
                test: /\.ts|tsx|js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                    },
                },
            },
            {
                test: /\.(html|svg|ico|eot)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.(c|sc)ss$/,
                use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(png|jpg|gif|woff|woff2|mp3|obj|mtl|wav|babylon)$/,
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
    plugins: [
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[name].css',
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
        new CopyPlugin([{ from: '../images', to: 'images' }]),
    ],
};

//* DEVELOPMENT CONFIG
if (process.env.NODE_ENV === 'development') {
    webpackConfig = merge(webpackConfig, {
        entry: {
            webview: [
                'webpack-hot-middleware/client?noInfo=false&reload=true&path=https://9876-black-marmoset-d720tsvs.ws-eu23.gitpod.io/__webpack_hmr',
                `${root}/web/index.tsx`,
            ],
        },
        module: {
            rules: [
                {
                    test: /\.(ttf)$/,
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
        cache: true,
        mode: 'development',
        devtool: 'eval-source-map',
        plugins: [new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin()],
    });

    //* PRODUCTION CONFIG
} else {
    webpackConfig = merge(webpackConfig, {
        entry: {
            webview: [`${root}/web/index.tsx`],
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
        module: {
            rules: [
                {
                    test: /\.(ttf)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'fonts/[name].[ext]',
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new OptimizeCssAssetsPlugin({
                cssProcessorPluginOptions: {
                    preset: ['default', { discardComments: { removeAll: true } }],
                },
                canPrint: true,
            }),
            new CompressionPlugin({
                test: /\.js|css(\?.*)?$/i,
                cache: true,
            }),
            new CopyPlugin([{ from: '../images', to: 'images' }]),
        ],
    });
}

module.exports = webpackConfig;
