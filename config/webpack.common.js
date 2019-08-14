const path = require('path'); //公共模块
const CleanWebpackPlugin = require('clean-webpack-plugin'); //公共插件
const HtmlWebpackPlugin = require('html-webpack-plugin'); //公共插件
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); //生产模式使用分离代码插件
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const glob = require("glob");
const htmls = glob.sync('src/pages/**/*.html'); //扫描出入口页面模板的路径, 如src/pages/index/index.html, 存放在 htmls 对象里
const entrys = {}; //定义一个 entrys 动态添加入口文件
const htmlCfgs = [
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(['dist'], {
        root: path.resolve(__dirname, '..'),
    })
]; //定义一个 htmlCfg 动态添加入口文件配置
htmls.forEach((filePath) => { //遍历扫描到的页面模板路径
    let path = filePath.split('/'); //分割路径, ['src', 'pages', 'index', 'index.html'], 放进 path 数组里
    let file = path.pop(); //把入口模板页面文件名pop出来, 比如: index.html
    let name = file.split('.')[0]; //把入口页面名分割出来, 取第一个就是 index
    entrys[name] = './src/pages/' + name + '/' + name + '.js'; //动态配置入口文件路径
    htmlCfgs.push( //动态配置入口文件插件
        new HtmlWebpackPlugin({
            template: filePath,
            chunks: [name, 'commons'],
            filename: file
        })
    )
});

module.exports = {
    entry: entrys,
    output: { //公共output
        path: path.join(__dirname, '../dist'),
        filename: process.env.NODE_ENV == "production" ? 'js/[name].[chunkhash:6].js' : 'js/[name].js', //根据入口文件分为不同出口文件
    },
    module: {
        rules: [ //公共配置加载器
            {
                test: /\.js$/,
                //exclude: /node_modules|packages/,  exclude代表不需要进行 loader 的目录
                include: path.resolve(__dirname, "../src"), //include代表需要进行 loader 的目录
                use: 'babel-loader',
                // options: {
                //   plugins: [
                //     ['transform-runtime', {
                //       "helpers": false,
                //       "polyfill": true,
                //       "regenerator": false,
                //       "moduleName": "babel-runtime"
                //     }]
                //   ]
                // },
            },
            {
                test: /\.(sa|sc|c)ss$/,
                include: path.resolve(__dirname, "../src"), //include代表需要进行 loader 的目录
                use: [
                    process.env.NODE_ENV == "production" ? MiniCssExtractPlugin.loader : 'vue-style-loader', //生产模式使用分离代码插件, 开发模式不使用
                    'css-loader',
                    'sass-loader',
                ]
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {}
                    // other vue-loader options go here
                }
            },
        ]
    },
    plugins: htmlCfgs,
    externals: {
      jquery: 'jQuery',
      vue:'Vue'
    }
};