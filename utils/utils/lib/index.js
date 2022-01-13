'use strict';

const path = require("path");
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


module.exports = {
    sub: (a, b) => a + b,
    isObject,
    formatPath
};
