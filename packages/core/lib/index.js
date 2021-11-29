#!/usr/bin/env node
'use strict';

const pkg = require('../package.json')
const yargs = require('yargs/yargs');
const {hideBin}  = require('yargs/helpers');
const dedent = require('dedent');  // 用于删除所有缩进

// process.argv.slice(2)的简写，包含了一些环境的兼容性
// const arg = hideBin(process.argv)

const argv = process.argv.slice(2);

const context = {
    imoocVersion:pkg.version
}

const cli = yargs();
cli.usage('Usage:imooc-cli [command] <options>')  // 使用说明
    .demandCommand(1,'最少输入一个参数')
    .strict()  // 严格模式
    .recommendCommands()  // 错误推断 Did you mean init?
    .fail((err,msg)=>{
        // 自定义错误处理
        console.log(err)
    })
    .alias('h','help')  // 命令别名
    .alias('v','version')
    .wrap(cli.terminalWidth())  // 设置终端宽度，terminalWidth可以获取当前终端宽度
    .epilogue(dedent`   这里是页脚

  页脚
页脚`)  //最后结尾的页脚
    .options({  // 为所有命令添加参数
        debug:{
            type:Boolean,
            describe:'debug 模式',
            alias:'d'
        }
    })
    .option('ci',{
        type:Boolean,
        describe:'添加单个参数',
        hidden:true // 不在help中展示
    })
    .group(['debug'],'Dev Options:')
    .command('init [name]','初始化项目',(yargs)=>{
        // 命令执行前执行的一些操作
        yargs.option('name',{
            type:String,
            require:true
        })
    },argv=>{
        // 命令的处理方法
        console.log(argv)
    })
    .parse(argv,{...context,a:'注入自定义参数'});