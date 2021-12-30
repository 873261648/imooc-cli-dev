'use strict';

const path = require("path");
const {existsSync} = require('fs')
const pkgDir = require('pkg-dir');
const npmInstall = require('npminstall');
const {gt} = require("semver");
const {isObject} = require("@gych-imooc-cli-dev/units");
const {getLatestNpmVersions, getDefaultRegistry} = require("@gych-imooc-cli-dev/npm-info");

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

    getCacheFilePath(version = this.version ) {
        // _@gych-imooc-cli-dev_init@1.0.10@@gych-imooc-cli-dev
        return path.resolve(this.storePath, `_${this.packageName.replaceAll('/', '_')}@${version}@${this.packageName.slice(0, this.packageName.indexOf('/'))}`)
    }

    async prepare() {
        if (this.version === 'latest') {
            this.version = await getLatestNpmVersions(this.packageName)
        }
    }

    async exists() {
        if (this.storePath) {
            await this.prepare();
            return existsSync(this.getCacheFilePath(this.version));
        } else {
            return existsSync(this.targetPath)
        }
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

    async update() {
        let latestVersion = await getLatestNpmVersions(this.packageName);
        let newCacheFilePath = this.getCacheFilePath(latestVersion);
        if (!existsSync(newCacheFilePath)) {
            this.version = latestVersion;
            await npmInstall({
                root: this.targetPath,
                storeDir: this.storePath,
                pkgs: [{
                    name: this.packageName,
                    version: this.version
                }],
                registry: getDefaultRegistry(true)
            })
        }
    }

    getRootFilePath() {
        const _getRootPath = function (targetPath) {
            const pkgPath = pkgDir.sync(targetPath);
            console.log(existsSync(targetPath))
            console.log(pkgPath)
            let pkg = require(path.resolve(pkgPath, 'package.json')) || {};
            if (pkg.main) {
                return path.resolve(pkgPath, pkg.main);
            }
            if (pkg.bin) {
                return path.resolve(pkgPath, pkg.bin[Object.keys(pkg.bin)[0]]);
            }
            return null;
        }

        if (this.storePath) {
            return _getRootPath(this.getCacheFilePath())
        } else {
            return _getRootPath(this.targetPath)
        }
    }
}

module.exports = Package;
