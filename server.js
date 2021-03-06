const express = require("express");
const https = require("https");
const fs = require("fs");
const history = require("connect-history-api-fallback");
const serveStatic = require("serve-static");
const config = require("./webpack.config");

const app = express();
const env = app.get("env");

if (env === "production") {
    app.use(history());
    app.get("*", serveStatic(config.output.path));
} else {
    // Get webpack
    const webpack = require("webpack");
    const webpackDevMiddleware = require("webpack-dev-middleware");
    const webpackHotMiddleware = require("webpack-hot-middleware");
    const compiler = webpack(config);

    const LOCAL_PORT = 9876;
    const LOCAL_HOST = "localhost";
    const IS_SECURE = false;

    // History
    app.use(history());

    // Dev server
    const devMiddleware = webpackDevMiddleware(compiler, {
        inline: true,
        host: LOCAL_HOST,
        port: parseInt(process.env.PORT, 10),
        historyApiFallback: true,
        publicPath: config.output.publicPath,
        noInfo: true,
        stats: { colors: true },
        hot: true,
        writeToDisk: true,
        headers: { "Access-Control-Allow-Origin": "*" },
    });

    app.use(devMiddleware);

    // Hot reloading
    app.use(webpackHotMiddleware(compiler));

    // Is HTTPS?
    if (IS_SECURE) {
        https
            .createServer(
                {
                    key: fs.readFileSync("./server.key"),
                    cert: fs.readFileSync("./server.cert"),
                },
                app
            )
            .listen(LOCAL_PORT, LOCAL_HOST, () => {
                process.stdout.write(
                    `Qorus VSCode webview ${app.get("env")} server running`
                );
            });
    } else {
        app.listen(LOCAL_PORT, LOCAL_HOST, () => {
            process.stdout.write(
                `Qorus VSCode webview ${app.get("env")} server running`
            );
        });
    }
}
