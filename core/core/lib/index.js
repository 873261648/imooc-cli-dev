const semver = require('semver');  // 对比版本号
const colors = require("colors");  // 对输入的log染色
// const rootCheck = require('root-check');  // root降级，使用普通用户启动脚手架
// const {pathExistsSync} = require('path-exists'); // 判断目标文件或文件夹是否存在
const minimist = require("minimist"); // 解析参数
const dotenv = require('dotenv');
const os = require('os');
const path = require("path");
const {sub} = require('@gych-imooc-cli-dev/units');
const log = require('@gych-imooc-cli-dev/log');
const {getNpmInfo} = require('@gych-imooc-cli-dev/npm-info');
const pkg = require('../../../package.json');
const {NODE_LOW_VERSION} = require('./const');

let args = null;

const core = function () {
    try {
        checkVersion();
        checkLowNodeVersion();
        // checkUserHome();
        // rootCheck();
        checkInputArgs();
        checkEnv();
        checkGlobalUpdate();
        log.verbose('test debug log');
    } catch (e) {
        log.error(e.message)
    }
}
const checkVersion = function () {
    log.info(pkg.version)
}
const checkLowNodeVersion = function () {
    let current = process.version;
    if (!semver.gte(current, NODE_LOW_VERSION)) {
        throw new Error(colors.red(`不符合最低Node版本要求，要求最低${NODE_LOW_VERSION}`))
    }
}
const checkUserHome = () => {
    const userHome = os.homedir();
    if (!userHome || !pathExistsSync(userHome)) {
        throw new Error(colors.red('用户目录不存在！'))
    }
}
const checkInputArgs = function () {
    args = minimist(process.argv.slice(2));
    checkArgs();
}
const checkArgs = function () {
    if (args.debug) {
        process.env.LOG_LEVEL = 'verbose';
    } else {
        process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
}
const checkEnv = function () {
    const envPath = path.resolve(os.homedir(), '.env');
    dotenv.config({
        path: envPath
    })
}

const checkGlobalUpdate = function () {
    const current = pkg.version;
    const name = pkg.name;
    getNpmInfo(name);
}

module.exports = core