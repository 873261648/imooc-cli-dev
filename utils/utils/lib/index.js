'use strict';

const path = require("path");
const {spawn} = require('child_process');

const {Spinner} = require('cli-spinner');
const dots = require('cli-spinners');

const isObject = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Object]'
}
const formatPath = (str) => {
    // windows兼容
    if (path.sep !== '/') {
        return str.replace(/\\/g, '/');
    }
    return str
}

function spinnerStart(msg) {
    const s = new Spinner('%s ' + msg);
    const _dots = Object.keys(dots);
    const r = Math.ceil(Math.random() * _dots.length);
    // s.setSpinnerString(dots[_dots[r]].frames.join(''));
    s.setSpinnerString(dots['dots8Bit'].frames.join(''));
    s.start();
    return s
}

async function execAsync(command,args,options) {
    return new Promise((resolve, reject) => {
        if(command === 'npm' && process.platform === 'win32'){
            command = 'npm.cmd'
        }
        const cp = spawn(command,args,options);
        cp.on('close',resolve);
        cp.on('error',reject);
    })
}

module.exports = {
    sub: (a, b) => a + b,
    isObject,
    formatPath,
    spinnerStart,
    execAsync
};
