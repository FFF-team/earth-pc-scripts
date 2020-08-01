'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});





// Ensure environment variables are read.
const chalk = require('chalk');
const _ = require('lodash');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const openBrowser = require('react-dev-utils/openBrowser');
const { getPaths, getEnvs, getCustomizedConf } = require('./pathsAndEnvAndConf');
const tools = require('./tools4start');





let PATHS = getPaths();
let envMap = getEnvs();
let srvConf = _.merge({}, tools.createSrvConf(PATHS), getCustomizedConf().devSrvConf);
let DEV_SERVER_PORT = getCustomizedConf().devSrvPort || 8014;
let entryMap = tools.createEntry(PATHS, {DEV_SERVER_PORT});





let webpackConf = _.merge({
  devtool: 'cheap-module-source-map',
  mode: 'development',
  bail: false,
  resolve: tools.createResolve(PATHS),
  optimization: {},
  externals: tools.createExternals(),
  //node: nodeMap,
  entry: entryMap,
  output: tools.createOutput(PATHS),
  module: tools.createModule(PATHS),
  plugins: tools.createPlugins(PATHS, entryMap, envMap),
  stats: {
    errors: true,
    warnings: true,
  },
}, getCustomizedConf().webpackConf);





let compiler;
try {
    compiler = webpack(webpackConf);
} catch (err) {
    process.stdout.write(chalk.red('Failed to compile.'));
    process.stdout.write(err.message || err);
    process.exit(1);
}

compiler.hooks.invalid.tap('invalid', () => {
    process.stdout.write(chalk.cyan('\nCompiling...\n'));
});
compiler.hooks.done.tap('done', async stats => {
    process.stdout.write(chalk.cyan('\nDone\n'));
    
    let statsJson = stats.toJson();
    
    if (stats.hasErrors()) {
        process.stdout.write(chalk.red(statsJson.errors.join('\n\n')));
    }

    if (stats.hasWarnings()) {
        process.stdout.write(chalk.yellow(statsJson.warnings.join('\n\n')));
    }
});





let devServer = new WebpackDevServer(compiler, srvConf);

devServer.listen(DEV_SERVER_PORT, '0.0.0.0', err => {
    if (err) {
        process.stdout.write(err);
        return;
    }
    process.stdout.write(chalk.cyan('Starting the development server...\n'));
    openBrowser(`http://localhost:${DEV_SERVER_PORT}/`);
});






['SIGINT', 'SIGTERM'].forEach(function(sig) {
    process.on(sig, function() {
        devServer.close();
        process.exit();
    });
});






