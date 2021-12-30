'use strict';
const path = require("path");
const os = require('os');
const Package = require('@gych-imooc-cli-dev/package/lib');
const SETTING = {
    init: '@gych-imooc-cli-dev/init'
}

const index = async (...args) => {
    const cmd = args[args.length - 1]
    let homePath = process.env.CLI_HOME_PATH;
    let targetPath = process.env.CLI_TARGET_PATH;
    let pkg = null;
    if (!targetPath) {
        targetPath = path.resolve(os.homedir(), '.imooc-cli-dev', 'dependencies')
        pkg = new Package({
            targetPath: targetPath,
            storePath: path.resolve(targetPath, 'node_modules'),
            packageName: SETTING[cmd.name()],
            version: 'latest'
        });
        if (pkg.exists()) {
            pkg.update()
        } else {
            await pkg.install()
        }
    }else{
        pkg = new Package({
            targetPath: targetPath,
            packageName: SETTING[cmd.name()],
            version: 'latest'
        });
    }
    console.log(pkg.getRootFilePath());
}

module.exports = index;