const path = require('path');
const fs = require('fs');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');


const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;
const PATHS = {
    src: path.resolve(__dirname, '../frontend_education/src'),
    dist: path.resolve(__dirname, '../dist'),
    assets: 'assets/'
}


const PAGES_DIR = `${PATHS.src}/pug/pages/`
const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'))

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    };

    if (isProd) {
        config.minimizer = [
            new OptimizeCssAssetWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    }

    return config
};


const filename = ext => isDev ? `${ext}/[name].${ext}` : `${ext}/[name].[hash].${ext}`;

const cssLoaders = extra => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: isDev,
                reloadAll: true,
                publicPath: '../',
            },
        },
       
        
        'css-loader'
        
    ]

    if (extra) {
        loaders.push(extra)
    }

    return loaders
}

const babelOptions = preset => {
    const opts = {
        presets: [
            '@babel/preset-env'
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]
    };

    if (preset) {
        opts.presets.push(preset)
    }

    return opts
};


const jsLoaders = () => {
    const loaders = [{
        loader: 'babel-loader',
        options: babelOptions()
    }];

    if (isDev) {
        loaders.push('eslint-loader')
    }

    return loaders
};


const plugins = () => {

    const base = [


        ...PAGES.map(page => new HTMLWebpackPlugin({
            minify: {
                collapseWhitespace: isProd,
            },
            template: `${PAGES_DIR}/${page}`,
            filename: `./pages/${page.replace(/\.pug/, '.html')}`
        })),

        
            new CopyWebpackPlugin([
                {
                    from: path.resolve(__dirname, 'src/image'),
                    to: path.resolve(__dirname, 'dist/image')
                }
            ]),

        new MiniCssExtractPlugin({
          filename: 'css/style.css'
}),


        ]
    if (isProd) {
        base.push(new CleanWebpackPlugin())
    }
return base
}
module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: ['@babel/polyfill', './index.js'],

    },
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js', '.json', '.png'],
        alias: {
            '@models': path.resolve(__dirname, 'src/models'),
            '@': path.resolve(__dirname, 'src'),
        }
    },
    optimization: optimization(),
    devServer: {
        port: 4200,
        
        contentBase: './dist/',
        hot: isDev,

    },
    devtool: isDev ? 'source-map' : '+',
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.pug$/,
               
                loader: 'pug-loader?pretty=true'
            },
            {
                test: /\.css$/,
                use: cssLoaders(),
                
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader'),
                
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                use: ['file-loader']
            },
            {
                test: /\.(ttf|woff|woff2|eot|svg)$/,
                loader: 'file-loader',
                options: {
                    outputPath: 'fonts',
                  },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: jsLoaders()
            },

        ]
    }
}