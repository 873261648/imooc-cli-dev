#!/usr/bin/env node
'use strict';

const importLocal = require('import-local');
const log = require("@gych-imooc-cli-dev/log");

if(importLocal(__filename)){
    log.info('cli', '正在使用本地脚手架');
}else{
    require('../lib')(process.argv.slice(2))
}
