import { promises as fs, realpathSync } from "fs";
import path from "path";
import chalk from "chalk";
import { EntityConfig, Entity } from "../types";
import { mkdirs, checkDir, toLowcase, tplfile, javaTypeToTsType, codeToFile, hasDict, getI18nFieldName, makeFormItem, makeComponent, alignTab, exists } from "../utils";

/**
 * 生成查询页面
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

    const queryCode = makeQueryCode(config);
    const defaultPage = toLowcase(config.entity.name);
    const queryPageFile = path.join(projectDir, "src/pages", config.page || defaultPage, "index.tsx");
    if (!exists(queryPageFile)) {
        await codeToFile(queryPageFile, queryCode);
    }

    await insetI18nMessage(projectDir, config.entity);
    await insetI18nEntity(projectDir, config.entity);
};

/**
 * 生成查询页面
 * @param config
 */
function makeQueryCode(config: EntityConfig) {
    const { entity } = config;

    const params = {
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: toLowcase(entity.name),
        DictColumn: makeDictMapsCode(entity),
        EntityQueryColumn: makeQueryArgs(entity),
        EntityTableColumn: makeTableColumn(entity),
        StartQuery: makeStartQueryCode(entity),
        QueryComponent: makeQueryComponentCode(entity),
    };

    return tplfile("query", params);
}

/**
 * 生成useDicts代码
 * @param entity
 */
function makeDictMapsCode(entity: Entity) {
    if (hasDict(entity)) {
        let code = `        // 字典\n    const dictMaps = useDicts({\n`;
        code = entity.columns.reduce((prev, current) => {
            if (!current.dict) {
                return prev;
            }
            return prev + `        ${current.dict}: [],\n`;
        }, code);

        code += `    });\n`;
        return code;
    } else {
        return "";
    }
}

/**
 * 生成查询参数代码
 * @param entity
 */
function makeQueryArgs(entity: Entity) {
    return entity.columns.reduce((prev, current) => {
        return prev + `            ${current.name}: null,\n`;
    }, "");
}

/**
 * 生成表格列代码
 * @param entity
 */
function makeTableColumn(entity: Entity) {
    let columnsCode = entity.columns.reduce((prev, current) => {
        let code = `
        {
            title: ${getI18nFieldName(current.name, entity.name)},
            dataIndex: "${current.name}",
            key: "${current.name}",
`;

        if (current.dict) {
            code += `            render: (record: ${entity.name}) => {
                return renderTableColColor(dictMaps.${current.dict}, record.${current.name});
            },
`;
        }
        if (current.type === "Date") {
            code += `            render: (record: ${entity.name}) => {
                return formateDate(record.${current.name});
            },
`;
        }

        code += `        },\n`;
        return prev + code;
    }, "");

    var variableName = toLowcase(entity.name);
    columnsCode += `
        {
            title: I18N.common.operate,
            width: 100,
            key: "right",
            render: (record: ${entity.name}) => {
                return (
                    <div>
                        <Permission paths={[${variableName}Service.findById, ${variableName}Service.update]}>
                            <a onClick={() => showUpdateModal(record)}>{I18N.common.modify}</a>
                        </Permission>
                    </div>
                );
            },
        },
`;

    return columnsCode;
}

/**
 * 创建开始查询条件
 * @param entity
 */
function makeStartQueryCode(entity: Entity) {
    if (hasDict(entity)) {
        const someDict = entity.columns.find((x) => !!x.dict);
        return `dictMaps.${someDict.dict}.length > 0`;
    } else {
        return "true";
    }
}

/**
 * 创建查询条件组件代码
 * @param entity
 */
function makeQueryComponentCode(entity: Entity) {
    return entity.columns.reduce((prev, current) => {
        if (current.name === "id" || current.name === "createTime") {
            return prev;
        }
        return prev + alignTab(makeFormItem(current, entity.name, makeComponent(current)), 5) + "\n";
    }, "");
}

/**
 * 插入页面国际化资源文件
 * @param entity
 */
async function insetI18nMessage(projectDir: string, entity: Entity) {
    const pageI18n = path.join(projectDir, `.kiwi/zh_CN/page.ts`);

    const params = {
        EntityName: entity.name,
        EntityDesc: entity.description,
    };

    try {
        const content = await fs.readFile(pageI18n, { encoding: "utf-8" });
        if (content.indexOf(`${entity.name}Query`) !== -1) {
            // 存在则不追加
            return;
        }
        const lastIndex = content.search(/\};/);
        const startIndex = lastIndex - 1;
        const start = content.slice(0, startIndex);
        const code = tplfile("page-i18n", params);
        const end = content.slice(startIndex);
        await codeToFile(pageI18n, start + "\n" + code + end);
    } catch (error) {
        console.error("国际化消息插入错误", error.message);
    }
}

/**
 * 插入i18n实体文件
 * @param projectDir
 * @param entity
 */
async function insetI18nEntity(projectDir: string, entity: Entity) {
    const pageI18n = path.join(projectDir, `.kiwi/zh_CN/entity.ts`);

    try {
        const content = await fs.readFile(pageI18n, { encoding: "utf-8" });
        if (content.indexOf(`${entity.name}:`) !== -1) {
            // 存在则不追加
            console.log("跳过", entity.name);
            return;
        }
        const lastIndex = content.search(/\};/);
        const startIndex = lastIndex - 1;
        const start = content.slice(0, startIndex);

        let code = `    ${entity.name}: {\n        entityName: "${entity.description}",\n`;
        code = entity.columns.reduce((prev, current) => {
            return prev + `        ${current.name}: "${current.desc}",\n`;
        }, code);
        code += `    },`;

        const end = content.slice(startIndex);
        await codeToFile(pageI18n, start + "\n" + code + end);
    } catch (error) {
        console.error("国际化实体插入错误", error.message);
    }
}
