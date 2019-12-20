"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var path_1 = tslib_1.__importDefault(require("path"));
var fs_1 = tslib_1.__importDefault(require("fs"));
/**
 * 驼峰转换下划线
 * @param name
 */
function toLine(name) {
    var result = name.replace(/([A-Z])/g, "-$1").toLowerCase();
    if (result[0] === "-") {
        return result.slice(1);
    }
    else {
        return result;
    }
}
exports.toLine = toLine;
/**
 * 驼峰名转换大写
 * @description 并且除了第一位,后续的大写前面都加上_下划线
 * @param name
 */
function humpToUperCase(name) {
    var result = "";
    name.split("").forEach(function (char, i) {
        if (/[A-Z]/.test(char) && i !== 0) {
            result += "_" + char.toUpperCase();
        }
        else {
            result += char.toUpperCase();
        }
    });
    return result;
}
exports.humpToUperCase = humpToUperCase;
/**
 * 首字母大写
 * @param name
 */
function toUpcase(name) {
    return name[0].toUpperCase() + name.slice(1);
}
exports.toUpcase = toUpcase;
/**
 * 首字母潇写
 * @param name
 */
function toLowcase(name) {
    return name[0].toLowerCase() + name.slice(1);
}
exports.toLowcase = toLowcase;
/**
 * 字符串模板替换
 * @param tpls
 * @param data
 */
function tpl(tpls, data) {
    return tpls
        .replace(/{{(.*?)}}/g, function ($1, $2) {
        return data[$2] === undefined ? $1 : data[$2];
    })
        .replace(/{{{(.*?)}}}/g, function ($1, $2) {
        return data[$2] === undefined ? "{" + $1 + "}" : "{" + data[$2] + "}";
    });
}
exports.tpl = tpl;
/**
 * 代码片段替换
 * @param fileName
 * @param data
 */
function tplfile(fileName, data) {
    var file = path_1.default.resolve(__dirname, "../template/" + fileName + ".txt");
    if (!fs_1.default.existsSync(file)) {
        throw new Error("\u4EE3\u7801\u7247\u6BB5(" + fileName + ")\u4E0D\u5B58\u5728");
    }
    var content = fs_1.default.readFileSync(file, { encoding: "utf-8" });
    return tpl(content, data);
}
exports.tplfile = tplfile;
/**
 * 递归创建目录
 * @param dirname
 */
function mkdirs(dirname) {
    if (fs_1.default.existsSync(dirname)) {
        return true;
    }
    else {
        if (mkdirs(path_1.default.dirname(dirname))) {
            fs_1.default.mkdirSync(dirname);
            return true;
        }
    }
}
exports.mkdirs = mkdirs;
/**
 * 文件是否存在
 */
function exists(file) {
    return fs_1.default.existsSync(file);
}
exports.exists = exists;
/**
 * 类型是否需要引入
 * Long 不需要引入 false
 * com.yl.wallet.common.enums.EnableOrUnenable 需要引入 true
 */
function needImportType(type) {
    return type.indexOf(".") !== -1;
}
exports.needImportType = needImportType;
/**
 * 提取需要引入类型的代码片段
 * @param config 实体配置
 */
function extractTypeImport(config) {
    var typeDefin = {};
    return config.entity.columns.reduce(function (prev, current) {
        if (needImportType(current.type) && !typeDefin[current.type]) {
            typeDefin[current.type] = true;
            return prev + ("\nimport " + current.type + ";");
        }
        else {
            return prev;
        }
    }, "");
}
exports.extractTypeImport = extractTypeImport;
/**
 * 插入类型引入代码片段
 * @param code 代码
 * @param importCode 引入代码片段
 */
function insetImportCode(code, importCode) {
    var importList = code.match(/import (\w|\.)+;/g);
    var lastImportCode = importList[importList.length - 1];
    var lastImport = code.indexOf(lastImportCode) + lastImportCode.length;
    return code.slice(0, lastImport) + importCode + code.slice(lastImport);
}
exports.insetImportCode = insetImportCode;
/**
 * 检测目录是否合法
 * @description 目录是一个合法的项目根路径, 有src和package.json
 * @param dir 项目目录
 */
function checkDir(dir) {
    if (fs_1.default.existsSync(path_1.default.join(dir, "src")) && fs_1.default.existsSync(path_1.default.join(dir, "package.json"))) {
        return true;
    }
    else {
        return false;
    }
}
exports.checkDir = checkDir;
/**
 * java类型转ts类型
 * @param type java类型
 */
function javaTypeToTsType(type) {
    switch (type) {
        case "Long":
            return "number";
        default:
            return "string";
    }
}
exports.javaTypeToTsType = javaTypeToTsType;
/**
 * 写入文件
 * @param file 文件路径
 * @param code 代码
 */
function codeToFile(file, code) {
    mkdirs(path_1.default.dirname(file));
    return fs_1.default.promises.writeFile(file, code, { encoding: "utf-8" });
}
exports.codeToFile = codeToFile;
/**
 * 是否存在字典类型
 * @param entity
 */
function hasDict(entity) {
    return entity.columns.some(function (x) { return !!x.dict; });
}
exports.hasDict = hasDict;
/**
 * 获取字典名, 国际化
 * @param fieldName 字段名
 * @param entityName 实体名
 */
function getI18nFieldName(fieldName, entityName) {
    switch (fieldName) {
        case "id":
            return '"id"';
        case "status":
            return "I18N.common.status";
        case "createTime":
            return "I18N.common.createTime";
        default:
            return "I18N.entity." + entityName + "." + fieldName;
    }
}
exports.getI18nFieldName = getI18nFieldName;
/**
 * 生成 FormItem 代码
 * @param column
 * @param entityName
 * @param content
 */
function makeFormItem(column, entityName, content) {
    var code = "<FormItem prop=\"" + column.name + "\" label={" + getI18nFieldName(column.name, entityName) + "} " + extedFormProps(column) + ">\n";
    code += alignTab(content, 2);
    code += "</FormItem>";
    return code;
}
exports.makeFormItem = makeFormItem;
/**
 * FormItem扩展属性
 * @param column
 */
function extedFormProps(column) {
    if (column.type === "Date") {
        return "normalize={dateNormalizeToSubmit}";
    }
    else {
        return "";
    }
}
/**
 * 代码对齐
 * 将代码的每一行都进行空格推进
 * @param content 代码
 * @param spaceCount 对齐tab数量, 1tab等于4空格
 */
function alignTab(content, spaceCount) {
    if (spaceCount === void 0) { spaceCount = 1; }
    var rows = content.split("\n");
    var code = "";
    rows.forEach(function (row) {
        code += new Array(spaceCount).join("    ") + row + "\n";
    });
    return code;
}
exports.alignTab = alignTab;
/**
 * 创建组件内容
 * @param column
 */
function makeComponent(column) {
    if (column.dict) {
        return "{renderSelect(dictMaps." + column.dict + ", true)}";
    }
    switch (column.type) {
        case "Long":
            return "<DatePicker />";
        case "Date":
            return "<InputNumber />";
        default:
            return "<Input />";
    }
}
exports.makeComponent = makeComponent;
//# sourceMappingURL=utils.js.map