'use strict';
const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const fs = require('fs-extra');
const glob = require('glob');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');





function createExternals() {
    return {
        'antd': "antd",
        'lodash': "_",
        'moment': "moment",
        'prop-types': "PropTypes",
        'react': "React",
        'react-dom': "ReactDOM",
        'react-redux': "ReactRedux",
        'react-router-dom': "ReactRouterDOM",
        'redux': "Redux",
        'redux-thunk': "ReduxThunk",
    };
}





function createResolve(PATHS) {
    return {
        extensions: [ ".js", ".json", ".jsx", ".ts", ".tsx",],
        modules: [PATHS.NODE_MODULES],
    };
}





function createModule(PATHS) {
    let urlLoader = {
        test: /\.(jpe?g|png)$/,
        //include: PATHS.SRC,
        loader: require.resolve('url-loader'),
        options: {
            limit: 1024*10,
            name: "static/img/[name].[hash:8].[ext]",
        },
    };
    let tsLoader = {
        test: /\.tsx?$/,
        //exclude: /node_modules/,
        include: PATHS.SRC,
        loader: require.resolve('babel-loader'),
        options: {
            presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
            ],
            plugins: [
                "@babel/proposal-class-properties",
                "@babel/proposal-object-rest-spread",
            ],
        },
    };
    let jsLoader = {
        test: /\.jsx?$/,
        //include: PATHS.SRC,
        loader: require.resolve('babel-loader'),
        options: {
            presets: [
                '@babel/preset-env',
                '@babel/preset-react',
            ],
            plugins: [
                "@babel/proposal-class-properties",
                "@babel/proposal-object-rest-spread",
            ],
        },
    };

    let cssLoaderArr = [
        MiniCssExtractPlugin.loader,
        require.resolve('css-loader'),
        {
            loader: require.resolve('postcss-loader'),
            options: {
                ident: 'postcss',
                plugins: () => [
                    require('postcss-flexbugs-fixes'),
                ],
            },
        },
    ];

    let scssLoader = {
        test: /\.scss$/,
        include: PATHS.SRC,
        use: [...cssLoaderArr, require.resolve('sass-loader'),],
    };
    let cssLoader = {
        test: /\.css$/,
        //include: PATHS.SRC,
        use: cssLoaderArr,
    };
    let fileLoader = {
        exclude: /\.(tsx?|jsx?|html|json)$/,
        loader: require.resolve('file-loader'),
        options: {
            name: 'static/media/[name].[hash:8].[ext]',
        },
    };

    return {
        strictExportPresence: true,
        rules: [{
            parser: { requireEnsure: false },
        }, {
            oneOf: [
                urlLoader,
                tsLoader,
                jsLoader,
                scssLoader,
                cssLoader,
                fileLoader,
            ]
        }]
    };
}





function createPlugins(PATHS, entryMap, envMap) {

    let htmlPlugin = Object.keys(entryMap).map(entryStr => {
        return new HtmlWebpackPlugin({
            inject: true,
            filename: `${entryStr}.html`,
            template: path.join(PATHS.PUBLIC, `${entryStr}.html`),
            chunks: [entryStr],
            chunksSortMode: "manual",
            minify: {
                removeComments: false,
                collapseWhitespace: false,
                useShortDoctype: true,
                keepClosingSlash: true,
                minifyJS: false,
                minifyCSS: false,
                minifyURLs: false,
            },
        });
    });

    let cssPlugin = new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
    });

    
    let htmlVarPlugin = new InterpolateHtmlPlugin(HtmlWebpackPlugin, envMap);


    // 获取REACT_VAR_开头的，以及NODE_ENV
    let envJsonStartsWithReactVar = _.pickBy(
        envMap, (v, k)=>(/^REACT\_VAR\_.*/i.test(k) || 'NODE_ENV'===k)
    );
    
    // 为value值添加额外的引号包裹，DefinePlugin将会直接正则替换源码中的值
    let jsValPlugin = new webpack.DefinePlugin(
        _.chain(envJsonStartsWithReactVar)
            .mapValues((v,k)=>JSON.stringify(v))
            .mapKeys((v,k)=>`process.env.${k}`)
            .value()
    );
    

    return [...htmlPlugin, cssPlugin, htmlVarPlugin, jsValPlugin];
}





function createEntry(PATHS) {

    let pages4Dir = fs.readdirSync(path.join(PATHS.SRC, 'pages'));
    let pages4Html = fs.readdirSync(PATHS.PUBLIC)
                        .filter(filename=>filename.endsWith('.html'))
                        .map(filename=>filename.substr(0, filename.length-5));
    
    let pages4Entry = _.intersection(pages4Dir, pages4Html);
    
    let jss4EntryGlob = pages4Entry.map(pname=>path.join(PATHS.SRC, 'pages', pname,
        `{index.tsx,index.ts,index.jsx,index.js,${pname}.tsx,${pname}.ts,${pname}.jsx,${pname}.js}`));
    
    
    let jss4EntryFinal =  jss4EntryGlob.map(globItem=>{
        const files = glob.sync(globItem);
    
        if (!files.length) {
            console.log(chalk.red('Could not find a required file.'));
            console.log(chalk.red(globItem));
            process.exit(1)
        }
    
        return files[0];
    });
    
    let entries = {};
    
    for (let i=0; i<pages4Entry.length; i++) {
        entries[pages4Entry[i]] = jss4EntryFinal[i];
    }
    
    
    return entries;
}





function createOutput(PATHS) {
    return {
        chunkFilename: "static/js/[name].[contenthash:8].chunk.js",
        filename: "static/js/[name].[contenthash:8].js",
        path: PATHS.BUILD,
    };
}





module.exports = {
    createEntry,
    createOutput,
    createModule,
    createPlugins,
    createResolve,
    createExternals,
}
