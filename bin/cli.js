#!/usr/bin/env node
const program = require("commander");
const chalk = require("chalk");
const packageInfo = require("../package.json");
const create = require("./create");

program
    .name(`${chalk.redBright(packageInfo.name)}`)
    .version(packageInfo.version)
    .description(`${chalk.cyan(packageInfo.description)}`)
    .usage(`${chalk.green("wallet-generate -f menu.json")}`)
    .option("-f, --file [value]", "实体配置文件")
    .option("-d, --dir <path>", "配置文件目录")
    .option("-c, --create [value]", "生成配置文件案例, 指定配置文件名称")
    .action(create)
    .parse(process.argv);
