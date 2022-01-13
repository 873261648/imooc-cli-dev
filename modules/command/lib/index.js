'use strict';
const semver = require('semver');
const colors = require('colors');
const log = require('@gych-imooc-cli-dev/log');

const NODE_LOW_VERSION = '10.17.0';

class Command {
    constructor(...args) {
        if(!args.length){
            throw new Error(colors.red('请确认传入了参数！'));
        }
        this._args = args;
        const runner = new Promise((resolve, reject) => {
            let chain = Promise.resolve();
            chain = chain.then(() => this.checkLowNodeVersion());
            chain = chain.then(() => this.initArgs());
            chain = chain.then(() => this.init());
            chain = chain.then(() => this.exec());
            chain.catch(err => {
                log.error(err.message)
            })
        })
    }

    checkLowNodeVersion() {
        let current = process.version;
        if (!semver.gte(current, NODE_LOW_VERSION)) {
            throw new Error(colors.red(`不符合最低Node版本要求，要求最低${NODE_LOW_VERSION}`))
        }
    }

    initArgs() {
        this._cmd = this._args[this._args.length-1];
        this._args = this._args.slice(0,this._args.length-1)
    }

    init() {
        throw new Error(colors.red('父类必须实现init方法！'));
    }

    exec() {
        throw new Error(colors.red('父类必须实现init方法！'));
    }
}

module.exports = Command;