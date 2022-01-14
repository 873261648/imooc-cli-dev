'use strict';

const path = require("path");
const {Spinner} = require('cli-spinner');
const dots = require('cli-spinners');

const isObject = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Object]'
}
const formatPath = (str)=>{
    // windows兼容
    if (path.sep !== '/') {
        return str.replace(/\\/g, '/');
    }
    return str
}
function spinnerStart(msg) {
    const s = new Spinner('%s '+msg);
    const _dots = Object.keys(dots);
    const r = Math.ceil(Math.random() * _dots.length);
    s.setSpinnerString(dots[_dots[r]].frames.join(''));
    s.start();
    return s
}

module.exports = {
    sub: (a, b) => a + b,
    isObject,
    formatPath,
    spinnerStart
};
