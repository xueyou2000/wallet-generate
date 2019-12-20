import path from "path";
import fs from "fs";
import { EntityConfig, EntityColumn, Entity } from "./types";

/**
 * 驼峰转换下划线
 * @param name
 */
export function toLine(name: string) {
    let result = name.replace(/([A-Z])/g, "-$1").toLowerCase();
    if (result[0] === "-") {
        return result.slice(1);
    } else {
        return result;
    }
}

/**
 * 驼峰名转换大写
 * @description 并且除了第一位,后续的大写前面都加上_下划线
 * @param name
 */
export function humpToUperCase(name: string) {
    let result = "";
    name.split("").forEach((char, i) => {
        if (/[A-Z]/.test(char) && i !== 0) {
            result += "_" + char.toUpperCase();
        } else {
            result += char.toUpperCase();
        }
    });
    return result;
}

/**
 * 首字母大写
 * @param name
 */
export function toUpcase(name: string) {
    return name[0].toUpperCase() + name.slice(1);
}

/**
 * 首字母潇写
 * @param name
 */
export function toLowcase(name: string) {
    return name[0].toLowerCase() + name.slice(1);
}

/**
 * 字符串模板替换
 * @param tpls
 * @param data
 */
export function tpl(tpls: string, data: any) {
    return tpls
        .replace(/{{(.*?)}}/g, function($1, $2) {
            return data[$2] === undefined ? $1 : data[$2];
        })
        .replace(/{{{(.*?)}}}/g, function($1, $2) {
            return data[$2] === undefined ? `{${$1}}` : `{${data[$2]}}`;
        });
}

/**
 * 代码片段替换
 * @param fileName
 * @param data
 */
export function tplfile(fileName: string, data: any) {
    const file = path.resolve(__dirname, `../template/${fileName}.txt`);
    if (!fs.existsSync(file)) {
        throw new Error(`代码片段(${fileName})不存在`);
    }
    const content = fs.readFileSync(file, { encoding: "utf-8" });
    return tpl(content, data);
}

/**
 * 递归创建目录
 * @param dirname
 */
export function mkdirs(dirname: string) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirs(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

/**
 * 文件是否存在
 */
export function exists(file: string) {
    return fs.existsSync(file);
}

/**
 * 类型是否需要引入
 * Long 不需要引入 false
 * com.yl.wallet.common.enums.EnableOrUnenable 需要引入 true
 */
export function needImportType(type: string) {
    return type.indexOf(".") !== -1;
}

/**
 * 提取需要引入类型的代码片段
 * @param config 实体配置
 */
export function extractTypeImport(config: EntityConfig) {
    const typeDefin = {};
    return config.entity.columns.reduce((prev, current) => {
        if (needImportType(current.type) && !typeDefin[current.type]) {
            typeDefin[current.type] = true;
            return prev + `\nimport ${current.type};`;
        } else {
            return prev;
        }
    }, "");
}

/**
 * 插入类型引入代码片段
 * @param code 代码
 * @param importCode 引入代码片段
 */
export function insetImportCode(code: string, importCode: string) {
    const importList = code.match(/import (\w|\.)+;/g);
    const lastImportCode = importList[importList.length - 1];
    const lastImport = code.indexOf(lastImportCode) + lastImportCode.length;
    return code.slice(0, lastImport) + importCode + code.slice(lastImport);
}

/**
 * 检测目录是否合法
 * @description 目录是一个合法的项目根路径, 有src和package.json
 * @param dir 项目目录
 */
export function checkDir(dir: string) {
    if (fs.existsSync(path.join(dir, "src")) && fs.existsSync(path.join(dir, "package.json"))) {
        return true;
    } else {
        return false;
    }
}

/**
 * java类型转ts类型
 * @param type java类型
 */
export function javaTypeToTsType(type: string) {
    switch (type) {
        case "Long":
            return "number";
        default:
            return "string";
    }
}

/**
 * 写入文件
 * @param file 文件路径
 * @param code 代码
 */
export function codeToFile(file: string, code: string) {
    mkdirs(path.dirname(file));
    return fs.promises.writeFile(file, code, { encoding: "utf-8" });
}

/**
 * 是否存在字典类型
 * @param entity
 */
export function hasDict(entity: Entity) {
    return entity.columns.some((x) => !!x.dict);
}

/**
 * 获取字典名, 国际化
 * @param fieldName 字段名
 * @param entityName 实体名
 */
export function getI18nFieldName(fieldName: string, entityName: string) {
    switch (fieldName) {
        case "id":
            return '"id"';
        case "status":
            return `I18N.common.status`;
        case "createTime":
            return `I18N.common.createTime`;
        default:
            return `I18N.entity.${entityName}.${fieldName}`;
    }
}

/**
 * 生成 FormItem 代码
 * @param column
 * @param entityName
 * @param content
 */
export function makeFormItem(column: EntityColumn, entityName: string, content: string) {
    let code = `<FormItem prop="${column.name}" label={${getI18nFieldName(column.name, entityName)}} ${extedFormProps(column)}>\n`;
    code += alignTab(content, 2);
    code += `</FormItem>`;
    return code;
}

/**
 * FormItem扩展属性
 * @param column
 */
function extedFormProps(column: EntityColumn) {
    if (column.type === "Date") {
        return `normalize={dateNormalizeToSubmit}`;
    } else {
        return "";
    }
}

/**
 * 代码对齐
 * 将代码的每一行都进行空格推进
 * @param content 代码
 * @param spaceCount 对齐tab数量, 1tab等于4空格
 */
export function alignTab(content: string, spaceCount: number = 1) {
    const rows = content.split("\n");
    let code = "";

    rows.forEach((row) => {
        code += new Array(spaceCount).join("    ") + row + "\n";
    });

    return code;
}

/**
 * 创建组件内容
 * @param column
 */
export function makeComponent(column: EntityColumn) {
    if (column.dict) {
        return `{renderSelect(dictMaps.${column.dict}, true)}`;
    }
    switch (column.type) {
        case "Long":
            return `<DatePicker />`;
        case "Date":
            return `<InputNumber />`;
        default:
            return `<Input />`;
    }
}
