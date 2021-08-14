module.exports = {
    // 监听 执行 webpack --watch
    watch: true,
    watchOptions: {
        // 不监听的文件或文件夹
        ignored: /node_modules/,
        // 监听到变化发生后会等300ms再去执行动作，防止文件更新太快导致重新编译频率太高  
        aggregateTimeout: 300,
        // 判断文件是否发生变化是通过不停的去询问系统指定文件有没有变化实现的
        poll: 1000
    },
    // 入口
    entry: "./src/index.jsx",
    // 出口
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },

    // 启用 sourcemaps 以调试 webpack 的输出
    devtool: "source-map",
    mode: 'development',
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            // 所有带有“.ts”或“.tsx”扩展名的文件都将由“awesome-typescript-loader”处理
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

            // 所有输出 '.js' 文件都将包含由 'source-map-loader' 重新处理的所有源映射。
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
            // 解析jsx
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            // 解析less css 文件
            {
                test: /\.(css|less)$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            }
        ]
    },

    // 当导入一个路径匹配以下之一的模块时，只需
    // 假设存在相应的全局变量并改用它。
    // 这很重要，因为它允许我们避免捆绑我们所有的
    // 依赖项，允许浏览器在构建之间缓存这些库。
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
};