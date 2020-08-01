'use strict';

const path = require('path');
const _ = require('lodash');
const fs = require('fs-extra');
const dotenv = require('dotenv');




let APP_ROOT = fs.realpathSync(process.cwd());
let PATHS = {
    APP_ROOT,
    NODE_MODULES: path.join(APP_ROOT, 'node_modules'),
    BUILD: path.join(APP_ROOT, 'build'),
    CONFIG: path.join(APP_ROOT, 'config'),
    MOCK: path.join(APP_ROOT, 'mock'),
    PUBLIC: path.join(APP_ROOT, 'public'),
    SRC: path.join(APP_ROOT, 'src'),
    CONFIG: path.join(APP_ROOT, 'config'),
    resolveApp: relativePath => path.resolve(APP_ROOT, relativePath),
};




let NODE_ENV = process.env.NODE_ENV;
let envMap = { NODE_ENV };

// 如果有在项目的.env配置环境变量的话，合并到envMap
let envAbsPath = path.join(PATHS.APP_ROOT, `.env.${NODE_ENV}`);

if (fs.existsSync(envAbsPath)) {
    let envStr = fs.readFileSync(envAbsPath);
    let envJson = dotenv.parse(envStr);
    //dotenv.config({ path: envAbsPath });
    
    Object.assign(envMap, envJson);
}





let customizedConf = require(path.join(PATHS.CONFIG, 'webpack.conf'));





module.exports = {
    getPaths() {
        return PATHS;
    },
    getEnvs() {
        return envMap;
    },
    getCustomizedConf() {
        return customizedConf;
    },
}
