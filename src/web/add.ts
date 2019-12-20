import { promises as fs, realpathSync } from "fs";
import path from "path";
import chalk from "chalk";
import { EntityConfig, Entity } from "../types";
import { mkdirs, checkDir, toLowcase, tplfile, javaTypeToTsType, codeToFile, hasDict, getI18nFieldName, makeFormItem, makeComponent, alignTab, exists } from "../utils";

/**
 * 生成新增页面
 */
export default async (config: EntityConfig) => {
    // 项目根路径
    const projectDir = realpathSync(process.cwd());
    if (!checkDir(projectDir)) {
        throw new Error("给定目录不是项目目录!");
    }

    const code = makeAddCode(config);
    const defaultPage = toLowcase(config.entity.name);
    const pageFile = path.join(projectDir, "src/pages", config.page || defaultPage, "add.tsx");
    if (!exists(pageFile)) {
        await codeToFile(pageFile, code);
    }
};

/**
 * 生成新增对话框代码
 * @param config
 */
function makeAddCode(config: EntityConfig) {
    const { entity } = config;

    const params = {
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: toLowcase(entity.name),
        ValidConfig: makeValidConfig(entity),
        AddComponent: makeComponentCode(entity),
    };

    return tplfile("add-page", params);
}

/**
 * 创建验证配置
 * @param entity
 */
function makeValidConfig(entity: Entity) {
    return entity.columns.reduce((prev, current) => {
        if (current.nullable) {
            return prev;
        }

        let code = `        ${current.name}: [ { name: "Required", errMsg: I18N.common.required }, ],`;
        return prev + code + "\n";
    }, "");
}

/**
 * 创建组件代码
 * @param entity
 */
function makeComponentCode(entity: Entity) {
    return entity.columns.reduce((prev, current) => {
        return prev + alignTab(makeFormItem(current, entity.name, makeComponent(current)), 6) + "\n";
    }, "");
}
