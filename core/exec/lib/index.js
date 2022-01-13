'use strict';
const path = require("path");
const os = require('os');
const {spawn} = require('child_process');
const Package = require('@gych-imooc-cli-dev/package');
const log = require('@gych-imooc-cli-dev/log');
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
    } else {
        pkg = new Package({
            targetPath: targetPath,
            packageName: SETTING[cmd.name()],
            version: 'latest'
        });
    }
    const rootFile = pkg.getRootFilePath();
    try {
        let o = Object.create(null);
        let cmd = args[args.length - 1];
        // 精简cmd参数
        Object.keys(cmd).forEach(key => {
            if (!key.startsWith('_') && key !== 'parent') {
                o[key] = cmd[key]
            }
        })
        args[args.length - 1] = o;
        const code = `require("${rootFile}").apply(null,${JSON.stringify(args)})`
        const child = spawn('node', ['-e', code], {
            cwd: process.cwd(),
            stdio: 'inherit'
        })
        child.on('error', e => {
            console.log('执行失败',e);
        })
        child.on('exit', e => {
            console.log('执行结束，code：' + e)
        })

    } catch (e) {
        log.error(e.message);
    }

}

module.exports = index;



