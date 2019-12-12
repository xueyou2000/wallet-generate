import path from "path";
import fs from "fs";
import { EntityConfig, EntityColumn } from "./types";

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
