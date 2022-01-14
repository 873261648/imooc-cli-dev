'use strict';
const {readdirSync} = require('fs');
const {emptyDir} = require("fs-extra");
const {homedir} = require('os');
const path = require("path");
const inquirer = require('inquirer');
const semver = require('semver');
const command = require('@gych-imooc-cli-dev/command');
const log = require('@gych-imooc-cli-dev/log');
const request = require('@gych-imooc-cli-dev/request');
const Package = require('@gych-imooc-cli-dev/package');
const {spinnerStart} = require("@gych-imooc-cli-dev/utils");

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

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
        const info = await this.prepare();
        // 2.下载模板
        await this.downTemplate(info);
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
        let option = {};
        if (type === TYPE_PROJECT) {
            option = await inquirer.prompt([{
                type: 'input',
                name: 'projectName',
                message: '请输入项目名称',
                default: '',
                validate(val) {
                    // 官方写法无法反驳
                    const done = this.async()
                    setTimeout(function () {
                        if (!isValidName(val)) {
                            done('请输入有效合法的项目名称');
                            return;
                        }
                        done(null, true);
                    }, 0);
                }
            }, {
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
                message: '请选择项目模板',
                default: 0,
                choices: this.projerctTemplate.map(item => new Object({name: item.projectName, value: item.npmName}))
            }])
        }
        return {
            ...option,
            type: TYPE_PROJECT
        }
    }

    async downTemplate(info) {
        const targetPath = path.resolve(homedir(), '.imooc-cli-dev', 'template');
        const storePath = path.resolve(homedir(), '.imooc-cli-dev', 'template', 'node_modules');
        const {npmName, version} = this.projerctTemplate.find(item=>item.npmName === info.template)
        const pkg = new Package({
            packageName:npmName,
            version,
            targetPath,
            storePath
        })
        if(!await pkg.exists()){
            const spinner = spinnerStart('模板下载中...')
            await pkg.install();
            spinner.stop(true);
            await new Promise(resolve => setTimeout(resolve,5000))
            log.notice('下载成功！')
        }else{
            await pkg.update();
        }
    }
}

const init = (...args) => {
    // console.log(projectName, force, process.env.CLI_TARGET_PATH)
    new InitCommand(...args);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
