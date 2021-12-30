'use strict';

const isObject = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Object]'
}

module.exports = {
    sub: (a, b) => a + b,
    isObject
};
