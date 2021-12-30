'use strict';

const pkgDir = require('pkg-dir');
const npmInstall = require('npminstall');
const {isObject} = require("@gych-imooc-cli-dev/units");

const path = require("path");
const {getDefaultRegistry} = require("@gych-imooc-cli-dev/npm-info");

class Package {
    constructor(options) {
        if (!options) {
            throw Error('Package类的参数不能为空！')
        }
        if (!isObject(options)) {
            throw Error('Package类的参数接受一个对象！')
        }
        this.targetPath = options.targetPath;
        this.storePath = options.storePath;
        this.packageName = options.packageName;
        this.version = options.version;
    }

    exists() {
    }

    install() {
        return npmInstall({
            root: this.targetPath,
            storeDir: this.storePath,
            pkgs: [{
                name: this.packageName,
                version: this.version
            }],
            registry: getDefaultRegistry(true)
        })
    }

    update() {
    }

    getRootFilePath() {
        const pkgPath = pkgDir.sync(this.targetPath);
        let pkg = require(path.resolve(pkgPath, 'package.json')) || {};
        if (pkg.main) {
            return path.resolve(pkgPath, pkg.main);
        }
        if (pkg.bin) {
            return path.resolve(pkgPath, pkg.bin[Object.keys(pkg.bin)[0]]);
        }
        return null;
    }
}

module.exports = Package;
