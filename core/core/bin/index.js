#!/usr/bin/env node
'use strict';

const importLocal = require('import-local');

if(importLocal(__filename)){
    require('npmlog').info('cli', '正在使用本地脚手架');
}else{
    require('../lib')(process.argv.slice(2))
}