'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});





// Ensure environment variables are read.
const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const fs = require('fs-extra');
const webpack = require('webpack');
const { getPaths, getEnvs, getCustomizedConf } = require('./pathsAndEnvAndConf');
const tools = require('./tools4build');





let PATHS = getPaths();
let envMap = getEnvs();
let entryMap = tools.createEntry(PATHS);





let config = _.merge({
    devtool: 'source-map',
    mode: 'development', //'production';// ,
    bail: true,
    resolve: tools.createResolve(PATHS),
    optimization: {},
    externals: tools.createExternals(),
    //node: nodeMap,
    entry: entryMap,
    output: tools.createOutput(PATHS),
    module: tools.createModule(PATHS),
    plugins: tools.createPlugins(PATHS, entryMap, envMap),
}, getCustomizedConf().webpackConf);





// Remove all content but keep the directory so that
// if you're in it, you don't end up in Trash
fs.emptyDirSync(PATHS.BUILD);

// Merge with the public folder
fs.copySync(PATHS.PUBLIC, PATHS.BUILD, {
    dereference: true,
    filter: filename => {
        // 非html直接copy
        if ( !filename.endsWith('.html') ) return true;

        let filenameWithoutHtmlSuffix = filename.substr(0, filename.length-5);
        let entrynameArr = Object.keys(entryMap).map(str=>path.sep+str);

        // html的话，不属于entry里的也可以copy
        // 属于entry的不能copy，需要应用HtmlPlugin
        return entrynameArr.every(entryname=>!filenameWithoutHtmlSuffix.endsWith(entryname));
    },
});





webpack(config).run((err, stats) => {
    process.stdout.write('\n**********BUILD RESULT**********\n\n');
    
    if (err) {
        process.stdout.write(chalk.red(err));
        process.stdout.write('\n**********BUILD FAILED**********\n');
        process.exit(1);
    } 


    let statsJson = stats.toJson();
    
    if (stats.hasErrors()) {
        process.stdout.write(chalk.red(statsJson.errors.join('\n\n')));
        process.stdout.write('\n**********BUILD FAILED**********\n');
        process.exit(1);
    }

    if (stats.hasWarnings()) {
        process.stdout.write(chalk.yellow(statsJson.warnings.join('\n\n')));
    }

    statsJson.assets.forEach(asset=>{
        process.stdout.write(
            chalk.green(asset.name) + ' ' +
            chalk.cyan(asset.size) + '\n'
        );
    });
    process.stdout.write('\n**********BUILD SUCCEED**********\n');
    process.exit(0);
});




