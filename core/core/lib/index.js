const pkg = require('../../../package.json');
const {sub} = require('@gych-imooc-cli-dev/units');

const log = require('@gych-imooc-cli-dev/log');

const core = function () {
    console.log('core',sub(1,2))
    log.info(pkg.version)
}

module.exports = core