
// 前言：仅对配置项进行解读，具体配置方法（如插件的配置、模块的配置）和更多的插件日新月异，需要自行去查看文档

// 根据命令自动识别打包模式：
// 在windows系统下，process.env中并没有NODE_ENV这个标识
// 因此只能人为在package.json中使用script脚本进行添加
// 
// 1. 先在package.json中配置脚本（需要下载cross-env模块）：
// "scripts": {
//   "start":"npm dev",
//   "dev":"cross-env NODE_ENV=development webpack",
//   "build":"cross-env NODE_ENV=production webpack"
// }
// 
// 2. 将mode及相关配置项根据需求进行修改：
// mode: isDev ? "development" : "production"
// output:{
//  filename: isDev ? "js/[name].js" : "js/[name].[hash:8].js"
// }
//      ·······

const resolve = (dir) => {
  return path.resolve(__dirname, '../', dir)
}

const useLoader = (loaderKind) => {
  return [
    { loader: MiniCssExtractPlugin.loader }, // style-loader
    { loader: 'css-loader' },
    // { loader: 'postcss-loader' }, // 如果设置了postcss.config.js ，无需下面的配置
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            [
              'autoprefixer', // 自动补齐前缀 - 样式的兼容性写法
              {
                overrideBrowserslist: ['last 100 versions']
              }
            ],
            [
              'postcss-preset-env'
            ]
          ]
        }
      }
    },
    { loader: loaderKind }
  ]
}

module.exports = {
  mode: 'development',   // 规定webpack的打包模式，值为development（开发环境）/production（生产环境）
  entry: {               // 规定webpack的打包入口（即要打包的东西），值为要打包的文件的绝对路径
    // entryName:absolutePath
    app: resolve('src/main.js'),  // 一共有3种方式，这是第一种：输入对象形式，，最常用这种，可拓展性最高
  },
  // entry: '../src/main.js', // 这是第二种：输入string形式   
  // entry: ['../src/main.js'] // 这是第三种：输入array形式
  output: {              // 规定webpack的打包出口（也就是打包好的东西要存放的地方），值为存放的目标文件夹的绝对路径
    path: resolve('dist'),  /*---注意：出口目的地只能有一个---*/
    //filename: '[FileName].js'   //规定了输出文件的文件名
    //filename: 'Path/[FileName].js' //如果这样写，会自动将打包后的文件存放在path规定的地方目录下的Path路径中
    filename: '[name].js' //这样写代表了打包好的文件名由相对应的entry中的key值决定
  },
  plugins: [                //规定在打包过程中使用的插件，插件要先在这里进行new一个实例，Array类型
  
    new CleanWebpackPlugin(), //每次打包前都自动清空出口文件夹下的所有文件
                              //这个插件在引入时需要进行解构引入：
                              // const { CleanWebpackPlugin } = require('clean-webpack-plugin')

    new CopyWebpackPlugin({   // 拷贝指定文件到指定目录下，配置更新频繁，自行去npm查看文档
      patterns: [
        {
          from: resolve('public/favicon.ico'),
          to: resolve('dist/'),

          // 这是拷贝所有文件的设置
          // context: resolve('public/'), // 一定要添加上下文对象，否则直接复制public目录至dist
          // from: '**/*',
          // to: resolve('dist/'),
          // globOptions: {             //设置无视的文件
          //   ignore: ['index.html']
          // }
        } 
      ]
    }),

    new HTMLWebpackPlugin({     //该插件会在出口路径生成一个指定的html文件，并自动引入打包好的js文件
      title: 'hello webpack',   //定义了要生成的html文件的title
      filename: 'index.html',   //定义了要生成的html文件的文件名
      template: resolve('public/index.html'),   //定义了在创建html文件时引入的模板，此时title字段失效
      inject: true,             //配置该插件生成的html文件是否自动引入打包好的js文件，以及规定引入位置，默认true
      minify: {                 //配置该插件的优化选项
        collapseWhitespace: true, //是否合并代码（去掉多余的空格）
        removeAttributeQuotes: true, //是否去掉可去掉的引号
        removeComments: true      //清理代码中的注释
      }
    }),

    new VueLoaderPlugin() // 解析vue文件必须的

  ],
  module: {                 //规定在打包时使用的预编译模块，使用这些模块将浏览器不可识别的东西转换为浏览器可识别的
                            //预处理模块有很多，需要自己去npm查
    rules: [                //规定模块规则      
      {
        test: /\.vue$/,      //规定使用模块的指定文件
        loader: 'vue-loader' // 规定该指定文件使用哪个模块，如果要使用多个模块则输入数组，使用顺序为后往前
      },
      {
        test: /\.(css|styl)$/,  //常用css/styl处理模块
        // loader: 'style-loader!css-loader'
        // use: ['style-loader', 'css-loader']
        // use: [
        //   { loader: MiniCssExtractPlugin.loader },
        //   { loader: 'css-loader' },
        //   { loader: 'stylus-loader' }
        // ]
        use: useLoader('stylus-loader')
      },
      {
        test: /\.scss$/,      //常用scss处理模块
        use: useLoader('sass-loader')
      },
      {                       //常用js处理模块（将ES6等浏览器解析不了的转换为浏览器可以完全解析的ES5）
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,  //表示除了这些之外
        use: {
          loader: 'babel-loader', // https://babeljs.io/
          options: {
            // presets: ['@babel/preset-env'],
            presets: [
              [
                '@babel/preset-env',
                { // 推荐使用 此垫片 形式    //有一些高级API单单babel还不能转成ES5，还需要babel的一些插件
                  useBuiltIns: 'usage',
                  corejs: 3,
                  targets: {
                    chrome: "58",
                    ie: "11"
                  }
                }
              ]
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              [
                '@babel/plugin-proposal-decorators',
                { "legacy": true }
              ],
              '@babel/plugin-proposal-class-properties'
            ]
          }
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif|webp|svg)$/,   //常用图片处理模块，同时需要下载url-loader和file-loader模块
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024 * 3, // 单位为B，如果设置的值大于图片的大小，转换为base64，如果小于图片的值，直接生成一张图片
              // name: 'img/[name].[ext]' // 查看file-loader的api -- name -- 原来的名字
              // name: 'img/[contenthash].[ext]' // 查看file-loader的api ---- contenthash - webpack起的唯一的名字
              outputPath: 'img',
              // outputPath: resolve('dist/img'),// 不要写绝对路径
              name: '[contenthash].[ext]'
            }
          }
        ]
      }
    ]
  },
  devServer: { // 设置是否使用webpack自带的服务器，仅在开发环境下有效，项目上线时此代码无效
    contentBase: resolve('dist'),
    host: '127.0.0.1',
    port: 3333,
    proxy: {    //代理
      // key: value
      '/api': {
        target: '',
        changeOrigin: true,
        ws: true,  //如果要使用websocket必须写这个
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}