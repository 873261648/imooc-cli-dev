'use strict';


const axios = require("axios");
const urlJoin = require('url-join');

const getNpmInfo = (npmName, registry) => {
    registry = registry || getDefaultRegistry();
    let url = urlJoin(registry, npmName)
    axios.get(url).then(res => {
        console.log(res);
    })


}
const getDefaultRegistry = (isOriginal) => {
    return isOriginal ? 'https://registry.npmjs.org/' : 'https://registry.npm.taobao.org'
}

module.exports = {
    getNpmInfo
};