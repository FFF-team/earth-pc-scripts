'use strict';
const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const fs = require('fs-extra');
const glob = require('glob');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const webpackHotDevClient = require.resolve('react-dev-utils/webpackHotDevClient');





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
            name: "static/img/[name].[ext]",
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
            "plugins": [
                "@babel/proposal-class-properties",
                "@babel/proposal-object-rest-spread",
            ]
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
            "plugins": [
                "@babel/proposal-class-properties",
                "@babel/proposal-object-rest-spread",
            ]
        },
    };

    let cssLoaderArr = [
        require.resolve('style-loader'),
        require.resolve('css-loader'),
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
            name: 'static/media/[name].[ext]',
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

    let hmrPlugin = new webpack.HotModuleReplacementPlugin();


    // 获取REACT_VAR_开头的，以及NODE_ENV
    let envJsonStartsWithReactVar = _.pickBy(
        envMap, (v, k)=>(/^REACT\_VAR\_.*/i.test(k) || 'NODE_ENV'===k)
    );

    
    let htmlVarPlugin = new InterpolateHtmlPlugin(HtmlWebpackPlugin, envJsonStartsWithReactVar);
    
    // 为value值添加额外的引号包裹，DefinePlugin将会直接正则替换源码中的值
    let jsValPlugin = new webpack.DefinePlugin(
        _.chain(envJsonStartsWithReactVar)
            .mapValues((v,k)=>JSON.stringify(v))
            .mapKeys((v,k)=>`process.env.${k}`)
            .value()
    );
    

    return [...htmlPlugin, hmrPlugin, htmlVarPlugin, jsValPlugin];
}





function createEntry(PATHS, {DEV_SERVER_PORT}) {

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
    
    return _.mapValues(entries,
        v=>[`webpack-dev-server/client?http://localhost:${DEV_SERVER_PORT}/`, v]);
}





function createOutput(PATHS) {
    return {
        chunkFilename: "static/js/[name].chunk.js",
        filename: "static/js/[name].js",
        path: PATHS.BUILD,
    };
}





function createSrvConf(PATHS) {
    return {
        clientLogLevel: "none",
        compress: false,
        contentBase: PATHS.PUBLIC,
        disableHostCheck: true,
        historyApiFallback: {disableDotRule: true},
        host: "0.0.0.0",
        hot: true,
        https: false,
        overlay: false,
        public: "localhost",
        publicPath: "/",
        quiet: true,
        watchContentBase: true,
        watchOptions: {ignored: /node_modules/},
        // setup(app, server) {
        //   // This lets us fetch source contents from webpack for the error overlay
        //   app.use(evalSourceMapMiddleware(server));
        //   // This lets us open files from the runtime error overlay.
        //   app.use(errorOverlayMiddleware());
        //   // This service worker file is effectively a 'no-op' that will reset any
        //   // previous service worker registered for the same host:port combination.
        //   // We do this in development to avoid hitting the production cache if
        //   // it used the same host and port.
        //   // https://github.com/facebookincubator/create-react-app/issues/2272#issuecomment-302832432
        //   app.use(noopServiceWorkerMiddleware());
        // },
    };
}





module.exports = {
    createEntry,
    createOutput,
    createModule,
    createPlugins,
    createResolve,
    createExternals,
    createSrvConf,
}
