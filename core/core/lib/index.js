const os = require('os');
const path = require("path");
const {existsSync} = require('fs');
const commander = require('commander');
const semver = require('semver');  // 对比版本号
const colors = require("colors");  // 对输入的log染色
// const rootCheck = require('root-check');  // root降级，使用普通用户启动脚手架
// const {pathExistsSync} = require('path-exists'); // 判断目标文件或文件夹是否存在
const dotenv = require('dotenv');
const {sub} = require('@gych-imooc-cli-dev/utils');
const log = require('@gych-imooc-cli-dev/log');
const {getSemverNpmVersions} = require('@gych-imooc-cli-dev/npm-info');
const init = require('@gych-imooc-cli-dev/init');
const exec = require('@gych-imooc-cli-dev/exec/lib');
const pkg = require('../../../package.json');
const {NODE_LOW_VERSION} = require('./const');

const core = function () {
    try {
        prepare();
        registerCommander();
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
    if (!userHome || !existsSync(userHome)) {
        throw new Error(colors.red('用户目录不存在！'))
    }else{
        process.env.CLI_HOME_PATH = userHome;
    }
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
    if (lastVersion && semver.lt(current, lastVersion)) {
        log.notice(colors.yellow(`新版本已推出！本地版本为${current},请手动更新到${lastVersion}
        使用npm install ${name} -g 更新到最新版本`));
    }
}

const program = new commander.Command();

const prepare = async ()=>{
    checkVersion();
    checkLowNodeVersion();
    checkUserHome();
    // rootCheck();
    checkEnv();
    await checkGlobalUpdate();
}

const registerCommander = () => {
    program
        .name(Object.keys(pkg.bin)[0])
        .usage('<comment> [options]')
        .version(pkg.version)
        .option('-d ,--debug', '开启debug模式', false)
        .option('-tp ,--targetPath <targetPath>', '执行路径', '')

    // 注册命令
    program
        .command('init [projectName]')
        .option('-f,-force','是否强制安装',false)
        .action(exec)

    // 启用debug模式
    program.on('option:debug', () => {
        process.env.LOG_LEVEL = program.opts().debug ? 'verbose' : 'info';
        log.level = process.env.LOG_LEVEL;
        log.verbose('已启用debug模式');
    })

    // 将option保存在环境变量，减少值传递
    program.on('option:targetPath', () => {
        process.env.CLI_TARGET_PATH = program.opts().targetPath
    })

    // 未知命令处理
    program.on('command:*', (obj) => {
        console.log(colors.red('不存在的命令：' + obj[0]));
        console.log(colors.red('可用命令：' + program.commands.map(cmd => cmd.name).join()));
    })
    program.parse(process.argv);

    // 未输入命令打印帮助文档
    if(!program.args || !program.args.length){
        program.outputHelp()
        console.log();
    }
}


module.exports = core