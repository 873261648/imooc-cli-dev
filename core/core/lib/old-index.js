// 使用yogs实现脚手架基基本逻辑
const semver = require('semver');  // 对比版本号
const colors = require("colors");  // 对输入的log染色
// const rootCheck = require('root-check');  // root降级，使用普通用户启动脚手架
// const {pathExistsSync} = require('path-exists'); // 判断目标文件或文件夹是否存在
const minimist = require("minimist"); // 解析参数
const dotenv = require('dotenv');
const os = require('os');
const path = require("path");
const {sub} = require('@gych-imooc-cli-dev/utils');
const log = require('@gych-imooc-cli-dev/log');
const {getNpmInfo, getNpmVersions, getSemverNpmVersions} = require('@gych-imooc-cli-dev/npm-info');
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

const checkGlobalUpdate = async function () {
    // 1.获取当前版本号
    // 2.使用npm API获取最新版本号
    // 3.对比脚手架版本提醒用户更新
    const current = pkg.version;
    const name = pkg.name;
    let versions = await getSemverNpmVersions(name, current);
    let lastVersion = versions?.[0] || null;
    if(lastVersion && semver.lt(current,lastVersion)){
        log.notice(colors.yellow(`新版本已推出！本地版本为${current},请手动更新到${lastVersion}
        使用npm install ${name} -g 更新到最新版本`));
    }
}

module.exports = core