import { promises as fs, realpathSync } from "fs";
import path from "path";
import chalk from "chalk";
import { EntityConfig } from "../types";
import { mkdirs, checkDir, toLowcase, tplfile, javaTypeToTsType, codeToFile } from "../utils";

/**
 * 生成接口
 * - 实体接口和, 实体查询接口
 * - Service 层
 * - 绑定信息
 */
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
        ...config.entity.columns.filter((x) => x.name !== "id" && x.name !== "createTime"),
    ];

    // 项目根路径
    const projectDir = realpathSync(process.cwd());
    if (!checkDir(projectDir)) {
        throw new Error("给定目录不是项目目录!");
    }
    const typesCode = makeTypesCode(config);
    const serviceCode = makeServiceCode(config);

    // 写入接口文件
    const variableName = toLowcase(config.entity.name);
    const apiDir = path.join(projectDir, `src/api/${variableName}`);
    codeToFile(path.join(apiDir, "types.d.ts"), typesCode);
    codeToFile(path.join(apiDir, "index.ts"), serviceCode);
    await appendTypes(projectDir, config);
    await bindApi(projectDir, config);
};

/**
 * 生成接口代码
 * @param config
 */
function makeTypesCode(config: EntityConfig) {
    const { entity } = config;

    const columnCode = entity.columns.reduce((prev, current) => {
        let code = `    /**\n     * ${current.desc}\n     */\n    ${current.name}?: ${javaTypeToTsType(current.type)};\n`;
        return (prev += code);
    }, "");

    const params = {
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: toLowcase(entity.name),
        EntityColumnCode: columnCode,
    };

    return tplfile("types", params);
}

/**
 * 生成service代码
 * @param config
 */
function makeServiceCode(config: EntityConfig) {
    const { entity } = config;
    const { addControllerRemove, updateControllerRemove } = entity;

    const params = {
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: toLowcase(entity.name),
        ServerName: config["server-name"] + "-api",
    };

    let code = tplfile("web-service", params);
    if (addControllerRemove) {
        code = removeMethod(code, "新增");
    }
    if (updateControllerRemove) {
        code = removeMethod(code, "修改");
    }
    return code;
}

/**
 * 追加API符号
 * @param projectDir
 * @param config
 */
async function appendTypes(projectDir: string, config: EntityConfig) {
    const typesFile = path.join(projectDir, `src/config/constants/API_TYPES.ts`);
    const { entity } = config;
    const params = {
        EntityName: entity.name,
        EntityDesc: entity.description,
    };

    try {
        const content = await fs.readFile(typesFile, { encoding: "utf-8" });

        if (content.indexOf(`${entity.name}Service`) !== -1) {
            // 存在则不追加
            return;
        }

        const lastIndex = content.search(/\};/);
        const startIndex = lastIndex - 1;

        const start = content.slice(0, startIndex);
        const code = tplfile("api-type", params);
        const end = content.slice(startIndex);
        await codeToFile(typesFile, start + "\n" + code + end);
    } catch (error) {
        console.error("api API_TYPES插入错误", error.message);
    }
}

/**
 * 绑定服务
 * @param projectDir
 * @param config
 */
async function bindApi(projectDir: string, config: EntityConfig) {
    const bindConfigFile = path.join(projectDir, `src/config/context/ApiBindConfig.ts`);
    const { entity } = config;
    const entityName = entity.name;
    const variableName = toLowcase(entity.name);

    try {
        let content = await fs.readFile(bindConfigFile, { encoding: "utf-8" });
        if (content.indexOf(`${entity.name}Service`) !== -1) {
            // 存在则不追加
            return;
        }

        const lastImportIndex = content.indexOf("container.bind") - 46;

        const importCode = `import ${entityName}Service from "@/api/${variableName}";`;
        content = content.slice(0, lastImportIndex) + "\n" + importCode + content.slice(lastImportIndex);
        content = content.slice(0, content.length - 2) + `\tcontainer.bind(API_TYPES.${entityName}Service).to(${entityName}Service);` + `\n}`;
        await codeToFile(bindConfigFile, content);
    } catch (error) {
        console.error("api绑定配置错误", error.message);
    }
}

/**
 * 删除方法
 * @param code 控制器代码
 * @param tag 要删除的标签, 比如 新增/修改/删除
 */
function removeMethod(code: string, tag: string) {
    const END_POINT = "    }";
    const start = code.indexOf(tag) - 15;
    const end = code.indexOf(END_POINT, start);

    const part = code.slice(start, end + END_POINT.length);
    return code.replace(part, "");
}
