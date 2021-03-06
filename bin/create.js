const _fs = require("fs");
const fs = _fs.promises;
const path = require("path");
const glob = require("glob");
const ora = require("ora");

// 确保能 require(*.ts)文件
require("ts-node").register({
    compilerOptions: {
        module: "commonjs",
    },
});

const Generate = require(path.resolve(__dirname, "../out/index.js")).default;
const ApiGenerate = require(path.resolve(__dirname, "../out/web/api.js")).default;
const QueryGenerate = require(path.resolve(__dirname, "../out/web/query.js")).default;
const AddGenerate = require(path.resolve(__dirname, "../out/web/add.js")).default;
const UpdateGenerate = require(path.resolve(__dirname, "../out/web/update.js")).default;
// const Generate = require(path.resolve(__dirname, "../src/index.ts")).default;

async function readConcig(file) {
    const stat = await fs.stat(file);
    if (!stat.isFile()) {
        throw new Error("指定的实体配置文件无效");
    }
    const config = await fs.readFile(file, { encoding: "utf-8" });
    return JSON.parse(config);
}

/**
 * 创建实体模型以及相关类型
 */
module.exports = async (cmd) => {
    try {
        if (cmd.create) {
            await fs.copyFile(path.resolve(__dirname, "../entitys/menu.json"), path.resolve(_fs.realpathSync(process.cwd()), `${typeof cmd.create === "string" ? cmd.create : "example"}.json`));
            return;
        }
        var spinner = ora("::代码生成开始::\n").start();
        if (cmd.web) {
            if (cmd.api || cmd.all) {
                await ApiGenerate(await readConcig(cmd.file));
            }
            if (cmd.query || cmd.all) {
                await QueryGenerate(await readConcig(cmd.file));
            }
            if (cmd.add || cmd.all) {
                await AddGenerate(await readConcig(cmd.file));
            }
            if (cmd.update || cmd.all) {
                await UpdateGenerate(await readConcig(cmd.file));
            }
        } else {
            if (!cmd.file && !cmd.dir) {
                throw new Error("请指定参数");
            }
            if (cmd.file) {
                // 根据指定配置文件, 生成单个实体
                await Generate(await readConcig(cmd.file));
            } else {
                // 扫描指定目录下的所有配置文件
                const configs = glob.sync(path.resolve(cmd.dir, "*.json"));
                for (let i = 0; i < configs.length; ++i) {
                    await Generate(await readConcig(configs[i]));
                }
            }
        }
        spinner.succeed("::代码生成完毕::");
    } catch (error) {
        console.error(error);
        spinner.fail("创建实体异常: ", error.message);
    }
};
