const fs = require("fs").promises;
const path = require("path");
const glob = require("glob");
const ora = require("ora");

// 确保能 require(*.ts)文件
require("ts-node").register({
    compilerOptions: {
        module: "commonjs",
    },
});

const Generate = require(path.resolve(__dirname, "../src/index.ts")).default;

/**
 * 创建单个实体
 * @param {*} file
 */
async function createEntity(file) {
    const stat = await fs.stat(file);
    if (!stat.isFile()) {
        throw new Error("指定的实体配置文件无效");
    }
    const config = await fs.readFile(file, { encoding: "utf-8" });
    return Generate(JSON.parse(config));
}

/**
 * 创建实体模型以及相关类型
 */
module.exports = async (cmd) => {
    const spinner = ora("::代码生成开始::\n").start();
    try {
        if (!cmd.file && !cmd.dir) {
            throw new Error("请指定参数");
        }
        if (cmd.file) {
            // 根据指定配置文件, 生成单个实体
            await createEntity(cmd.file);
        } else {
            // 扫描指定目录下的所有配置文件
            const configs = glob.sync(path.resolve(cmd.dir, "*.json"));
            for (let i = 0; i < configs.length; ++i) {
                await createEntity(configs[i]);
            }
        }
        spinner.succeed("::代码生成完毕::");
    } catch (error) {
        spinner.fail("创建实体异常: ", error.message);
    }
};
