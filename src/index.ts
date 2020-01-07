import { promises as fs, realpathSync, existsSync } from "fs";
import path from "path";
import chalk from "chalk";
import { EntityConfig } from "./types";
import { extractTypeImport, insetImportCode, mkdirs } from "./utils";
import makeEntity from "./model/entity";
import makeDto from "./model/dto";
import makeServiceFace from "./model/serviceFace";
import makeRepository from "./api/repository";
import makeService from "./api/service";
import makeServiceImpl from "./api/service-impl";
import makeController from "./api/controller";
import { makeI18nMessage_en, makeI18nMessage_zh } from "./message";

export default async (config: EntityConfig) => {
    // 强制给实体字段加上 id 和 createTime列
    config.entity.columns = [
        {
            name: "id",
            type: "Long",
            desc: "id",
        },
        {
            name: "createTime",
            type: "Date",
            desc: "创建时间",
        },
        {
            name: "version",
            type: "Long",
            desc: "乐观锁",
        },
        ...config.entity.columns.filter((x) => x.name !== "id" && x.name !== "createTime" && x.name !== "version"),
    ];

    // 输出目录
    const outDir = path.resolve(realpathSync(process.cwd()), "./dist");

    const { name, description } = config.entity;
    console.log(chalk.white(`============= ${name}(${description}) ============= `));

    // 模型相关代码
    const importCode = extractTypeImport(config);
    const entityCode = insetImportCode(makeEntity(config), importCode);
    console.log(chalk.blue("* Create Entity"));
    const dtoCode = makeDto(config);
    console.log(chalk.blue("* Create Dto"));
    const serviceFaceCode = makeServiceFace(config);
    console.log(chalk.blue("* Create ServiceFace"));

    // 接口相关代码
    const repositoryCode = makeRepository(config);
    console.log(chalk.green("* Create Repository"));
    const serviceCode = makeService(config);
    console.log(chalk.green("* Create Service"));
    const serviceImplCode = makeServiceImpl(config);
    console.log(chalk.green("* Create ServiceImpl"));
    const controllerCode = makeController(config);
    console.log(chalk.green("* Create Controller"));

    // 创建国际化资源
    const en_message = makeI18nMessage_en(config);
    const zh_message = makeI18nMessage_zh(config);

    console.log(chalk.cyan("----> 开始写入文件"));
    // 创建模型输出文件
    const modelDir = path.join(outDir, "model");
    await codeToFile(path.join(modelDir, `./entity/${name}.java`), entityCode);
    await codeToFile(path.join(modelDir, `./dto/${name}Dto.java`), dtoCode);
    await codeToFile(path.join(modelDir, `./service/${name}ServiceFace.java`), serviceFaceCode);

    // 创建接口输出文件
    const apiDir = path.join(outDir, "api");
    await codeToFile(path.join(apiDir, `./repository/${name}Repository.java`), repositoryCode);
    await codeToFile(path.join(apiDir, `./service/${name}Service.java`), serviceCode);
    await codeToFile(path.join(apiDir, `./service/impl/${name}ServiceImpl.java`), serviceImplCode);
    await codeToFile(path.join(apiDir, `./controller/${name}Controller.java`), controllerCode);

    // 创建国际化资源输出文件
    const messageDir = path.join(outDir, "message");
    // 存在则追加,不存在则创建
    await codeAppendFile(path.join(messageDir, `./message_en_US.properties`), en_message);
    await codeAppendFile(path.join(messageDir, `./message_zh_CN.properties`), zh_message);

    console.log(chalk.cyan("----> 开始完毕"));

    return Promise.resolve();
};

/**
 * 写入文件
 * @param file 文件路径
 * @param code 代码
 */
export function codeToFile(file: string, code: string) {
    console.log("Create File ", file);
    mkdirs(path.dirname(file));
    return fs.writeFile(file, code, { encoding: "utf-8" });
}

/**
 * 追加文件
 * @param file
 * @param code
 */
export async function codeAppendFile(file: string, code: string) {
    console.log("Append File ", file);
    mkdirs(path.dirname(file));

    if (!existsSync(file)) {
        // 存在则追加
        let content = await fs.readFile(file, { encoding: "utf-8" });

        if (content.indexOf(code) !== -1) {
            // 存在则不追加
            return;
        }

        return codeToFile(file, content + "\n" + code);
    } else {
        // 不存在则创建
        return codeToFile(file, code);
    }
}
