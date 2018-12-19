module.exports = {
    entry: {
        qorus_project_config: './web/qorus_project_config/src/Main.js',
    },
    output: {
        path: __dirname,
        filename: 'web/[name]/bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.(jpg|png|svg)$/,
                loader: 'url-loader'
            }
        ]
    }
};
