'use strict';
const path = require("path");
const os = require('os');
const Package = require('@gych-imooc-cli-dev/package/lib');
const SETTING = {
    init: '@gych-imooc-cli-dev/init'
}

const index = async (...args) => {
    const cmd = args[args.length - 1]
    let targetPath = process.env.CLI_TARGET_PATH;
    let pkg;
    if (!targetPath) {
        targetPath = path.resolve(os.homedir(), '.imooc-cli-dev', 'dependencies')
        pkg = new Package({
            targetPath: targetPath,
            storePath: path.resolve(targetPath, 'node_modules'),
            packageName: SETTING[cmd.name()],
            version: 'latest'
        });
        if (await pkg.exists()) {
            await pkg.update()
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
    const rootFile = pkg.getRootFilePath();
    console.log(rootFile)
    // require(rootFile)(...args);
}

module.exports = index;