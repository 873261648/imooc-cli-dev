'use strict';
const {readdirSync, writeFileSync} = require('fs');
const {homedir} = require('os');
const path = require("path");
const {emptyDir, copySync} = require("fs-extra");
const inquirer = require('inquirer');
const semver = require('semver');
const glob = require('glob');
const ejs = require('ejs');
const command = require('@gych-imooc-cli-dev/command');
const log = require('@gych-imooc-cli-dev/log');
const request = require('@gych-imooc-cli-dev/request');
const Package = require('@gych-imooc-cli-dev/package');
const {spinnerStart, execAsync} = require("@gych-imooc-cli-dev/utils");

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';
const WHITE_COMMAND = ['npm', 'cnpm', 'node'];

class InitCommand extends command {
    constructor(...args) {
        super(...args);
    }

    init() {
        this.projectName = this._args[0];
        this.force = this._args[1]?.Force;
        console.log(this.projectName, this.force)
    }

    async exec() {
        // 0.获取模板基本信息
        this.projerctTemplate = await this.getTemplateList();
        if (!this.projerctTemplate || !this.projerctTemplate.length) {
            throw new Error('无可用项目模板');
        }
        // 1.准备阶段
        this.projectInfo = await this.prepare();
        // 2.下载模板

        this.projectInfo && await this.downTemplate(this.projectInfo);
        // 3.安装模板
    }

    async getTemplateList() {
        return request('/project/template')
    }

    async prepare() {
        // 1.判断项目是否为空
        if (!this.isCwdEmpty()) {
            // 1.1.询问用户是否强制安装
            let isConfirm = false;
            // 2.是否启用强制安装
            if (!this.force) {
                isConfirm = (await inquirer.prompt({
                    type: 'confirm',
                    name: 'isConfirm',
                    message: '当前文件夹不为空，是否继续创建项目？',
                    default: false
                })).isConfirm
            }
            if (isConfirm || this.force) {
                let {confirmDel} = await inquirer.prompt({
                    type: 'confirm',
                    name: 'confirmDel',
                    message: '是否确认清空当前目录下的文件？',
                    default: false
                })
                if (confirmDel) {
                    emptyDir(process.cwd());
                } else {
                    return null
                }
            } else {
                return null
            }
        }

        return await this.getProjectInfo();
    }

    isCwdEmpty() {
        // 获取脚手架执行目录
        // process.cwd()
        // path.resolve('.')
        let fileList = readdirSync(process.cwd());
        fileList = fileList.filter(file => !file.startsWith('.') && !['package.json', 'node_modules'].includes(file))
        return !fileList || !fileList.length
    }

    async getProjectInfo() {
        let projectPrompt = [];
        const isValidName = v => {
            return /^(@[a-zA-Z0-9-_]+\/)?[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v);
        }
        // 3.选择创建项目或组件
        let {type} = await inquirer.prompt({
            type: 'list',
            name: 'type',
            message: '请选择创建项目或组件',
            default: TYPE_PROJECT,
            choices: [
                {name: '项目', value: TYPE_PROJECT},
                {name: '组件', value: TYPE_COMPONENT}
            ]
        })
        const title = type === TYPE_PROJECT ? '项目':'组件';
        // 过滤类型只有组件或项目的列表
        this.projerctTemplate = this.projerctTemplate.filter(item => item.tag === type);
        // 外部传入合法项目名称就直接使用不再询问
        if (!this.projectName || !isValidName(this.projectName)) {
            projectPrompt.push({
                type: 'input',
                name: 'projectName',
                message: `请输入${title}名称`,
                default: '',
                validate(val) {
                    // 官方写法无法反驳
                    const done = this.async()
                    setTimeout(function () {
                        if (!isValidName(val)) {
                            done(`请输入有效合法的${title}名称`);
                            return;
                        }
                        done(null, true);
                    }, 0);
                }
            })
        }

        if(type === TYPE_COMPONENT){
            projectPrompt.push({
                type: 'input',
                name: 'description',
                message: '请输入组件描述',
                default: '',
                validate(val) {
                    const done = this.async()
                    setTimeout(function () {
                        if (!val) {
                            done('请输入组件描述');
                            return;
                        }
                        done(null, true);
                    }, 0);
                }
            })
        }
        projectPrompt = projectPrompt.concat([{
            type: 'input',
            name: 'version',
            message: '请输入版本号',
            default: '1.0.0',
            validate(val) {
                const done = this.async()
                setTimeout(function () {
                    if (!semver.valid(val)) {
                        done('请输入有效合法的版本号');
                        return;
                    }
                    done(null, true);
                }, 0);
            },
            filter: function (val) {
                if (!!semver.valid(val)) {
                    return semver.valid(val);
                } else {
                    return val;
                }
            }
        }, {
            type: 'list',
            name: 'template',
            message: `请选择${title}模板`,
            default: 0,
            choices: this.projerctTemplate.map(item => new Object({name: item.projectName, value: item.npmName}))
        }])
        let option = await inquirer.prompt(projectPrompt);
        return {
            type,
            projectName: this.projectName,
            ...option,
        }
    }

    async downTemplate(info) {
        const targetPath = path.resolve(homedir(), '.imooc-cli-dev', 'template');
        const storePath = path.resolve(homedir(), '.imooc-cli-dev', 'template', 'node_modules');
        this.templateInfo = this.projerctTemplate.find(item => item.npmName === info.template)
        const {npmName, version, type} = this.templateInfo;
        this.npmInfo = new Package({
            packageName: npmName,
            version,
            targetPath,
            storePath
        })
        if (!await this.npmInfo.exists()) {
            // const spinner = spinnerStart('模板下载中...')
            try {
                await this.npmInfo.install();
                log.notice('下载模板成功！')
            } catch (e) {
                throw e
            } finally {
                // spinner.stop(true);
            }
        } else {
            try {
                await this.npmInfo.update();
                log.notice('更新模板成功！')
            } catch (e) {
                throw e
            }
        }
        if (type === 'normal') {
            this.installNormalTemplate();
        } else if (type === 'custom') {
            this.installCustomTemplate();
        }
    }

    async installNormalTemplate() {
        const spinner = spinnerStart('模板安装中...');
        const {installCommand, startCommand} = this.templateInfo;
        try {
            const targetPath = process.cwd();
            const templatePath = path.resolve(this.npmInfo.getCacheFilePath(), 'template');
            copySync(templatePath, targetPath);
        } catch (e) {
            throw e
        } finally {
            spinner.stop(true);
            log.notice('安装模板成功！')

        }
        await this.ejsRender();
        await this.exceCommand(installCommand, '依赖安装失败！');
        await this.exceCommand(startCommand, '项目运行失败！');
    }

    async ejsRender() {
        return new Promise((resolve, reject) => {
            const cwd = process.cwd();
            const globOptions = {
                cwd: cwd,
                nodir: true,
                ignore: ['node_modules/**', ...(this.templateInfo.ignore || [])]
            }
            glob("**", globOptions, (err, files) => {
                if (err) {
                    reject(err)
                    return;
                }
                Promise.all(files.map(async file => {
                    let filePath = path.resolve(cwd, file)
                    let str = await ejs.renderFile(filePath, this.projectInfo, {})
                    writeFileSync(filePath, str);
                })).then(resolve).catch(reject)
            })
        })
    }

    async exceCommand(command, errMsg) {
        if (command) {
            let commands = command.split(' ');
            let cmd = this.isWhite(commands[0]);
            let args = commands.slice(1);
            const res = await execAsync(cmd, args, {
                cwd: process.cwd(),
                stdio: 'inherit'
            })
            if (res !== 0) {
                throw new Error(errMsg)
            }
        }
    }

    isWhite(command) {
        if (WHITE_COMMAND.includes(command)) {
            return command
        } else {
            return null
        }
    }

    installCustomTemplate() {
        console.log('安装自定义模板')
    }

}

const init = (...args) => {
    // console.log(projectName, force, process.env.CLI_TARGET_PATH)
    new InitCommand(...args);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
