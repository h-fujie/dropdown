const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = [
    {
        output:{
            clean:true
        }
    },
    {
        entry: "./src/dropdown.js",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "dropdown.js",
            publicPath: "dist/"
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [
                        "style-loader",
                        {
                            loader: "css-loader",
                            options: {
                                importLoaders: 1
                            }
                        }
                    ]
                }
            ]
        }
    },
    {
        entry: "./src/options/options.js",
        output: {
            path: path.resolve(__dirname, "dist", "options"),
            filename: "options.js",
            publicPath: "dist/options"
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [
                        "style-loader",
                        {
                            loader: "css-loader",
                            options: {
                                importLoaders: 1
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, "src", "options", "options.html"),
                        to: path.resolve(__dirname, "dist", "options")
                    }
                ]
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, "src", "manifest.json"),
                        to: path.resolve(__dirname, "dist")
                    }
                ]
            })
        ]
    },
];
