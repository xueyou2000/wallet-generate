"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs_1 = require("fs");
var path_1 = tslib_1.__importDefault(require("path"));
var utils_1 = require("../utils");
/**
 * 生成查询页面
 */
exports.default = (function (config) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var projectDir, queryCode, defaultPage, queryPageFile;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // 强制给实体字段加上 id 和 createTime列
                config.entity.columns = tslib_1.__spreadArrays([
                    {
                        name: "id",
                        type: "Long",
                        desc: "id",
                    },
                    {
                        name: "createTime",
                        type: "Date",
                        desc: "创建时间",
                    }
                ], config.entity.columns.filter(function (x) { return x.name !== "id" && x.name !== "createTime"; }));
                projectDir = fs_1.realpathSync(process.cwd());
                if (!utils_1.checkDir(projectDir)) {
                    throw new Error("给定目录不是项目目录!");
                }
                queryCode = makeQueryCode(config);
                defaultPage = utils_1.toLowcase(config.entity.name);
                queryPageFile = path_1.default.join(projectDir, "src/pages", config.path || defaultPage, "index.tsx");
                if (!!utils_1.exists(queryPageFile)) return [3 /*break*/, 2];
                return [4 /*yield*/, utils_1.codeToFile(queryPageFile, queryCode)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [4 /*yield*/, insetI18nMessage(projectDir, config.entity)];
            case 3:
                _a.sent();
                return [4 /*yield*/, insetI18nEntity(projectDir, config.entity)];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * 生成查询页面
 * @param config
 */
function makeQueryCode(config) {
    var entity = config.entity;
    var params = {
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: utils_1.toLowcase(entity.name),
        DictColumn: makeDictMapsCode(entity),
        EntityQueryColumn: makeQueryArgs(entity),
        EntityTableColumn: makeTableColumn(entity),
        StartQuery: makeStartQueryCode(entity),
        QueryComponent: makeQueryComponentCode(entity),
    };
    return utils_1.tplfile("query", params);
}
/**
 * 生成useDicts代码
 * @param entity
 */
function makeDictMapsCode(entity) {
    if (utils_1.hasDict(entity)) {
        var code = "    // \u5B57\u5178\n    const dictMaps = useDicts({\n";
        code = entity.columns.reduce(function (prev, current) {
            if (!current.dict) {
                return prev;
            }
            return prev + ("        " + current.dict + ": [],\n");
        }, code);
        code += "    });\n";
        return code;
    }
    else {
        return "";
    }
}
/**
 * 生成查询参数代码
 * @param entity
 */
function makeQueryArgs(entity) {
    return entity.columns.reduce(function (prev, current) {
        return prev + ("            " + current.name + ": null,\n");
    }, "");
}
/**
 * 生成表格列代码
 * @param entity
 */
function makeTableColumn(entity) {
    var columnsCode = entity.columns.reduce(function (prev, current) {
        var code = "\n        {\n            title: " + utils_1.getI18nFieldName(current.name, entity.name) + ",\n            dataIndex: \"" + current.name + "\",\n            key: \"" + current.name + "\",\n";
        if (current.dict) {
            code += "            render: (record: " + entity.name + ") => {\n                return renderTableColColor(dictMaps." + current.dict + ", record." + current.name + ");\n            },\n";
        }
        if (current.type === "Date") {
            code += "            render: (record: " + entity.name + ") => {\n                return formateDate(record." + current.name + ");\n            },\n";
        }
        code += "        },\n";
        return prev + code;
    }, "");
    var variableName = utils_1.toLowcase(entity.name);
    columnsCode += "\n        {\n            title: I18N.common.operate,\n            width: 100,\n            key: \"right\",\n            render: (record: " + entity.name + ") => {\n                return (\n                    <div>\n                        <Permission paths={[" + variableName + "Service.findById, " + variableName + "Service.update]}>\n                            <a onClick={() => showUpdateModal(record)}>{I18N.common.modify}</a>\n                        </Permission>\n                    </div>\n                );\n            },\n        },\n";
    return columnsCode;
}
/**
 * 创建开始查询条件
 * @param entity
 */
function makeStartQueryCode(entity) {
    if (utils_1.hasDict(entity)) {
        var someDict = entity.columns.find(function (x) { return !!x.dict; });
        return "dictMaps." + someDict.dict + ".length > 0";
    }
    else {
        return "true";
    }
}
/**
 * 创建查询条件组件代码
 * @param entity
 */
function makeQueryComponentCode(entity) {
    return entity.columns.reduce(function (prev, current) {
        if (current.name === "id" || current.name === "createTime") {
            return prev;
        }
        return prev + utils_1.alignTab(utils_1.makeFormItem(current, entity.name, utils_1.makeComponent(current)), 5) + "\n";
    }, "");
}
/**
 * 插入页面国际化资源文件
 * @param entity
 */
function insetI18nMessage(projectDir, entity) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var pageI18n, params, content, lastIndex, startIndex, start, code, end, error_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pageI18n = path_1.default.join(projectDir, ".kiwi/zh_CN/page.ts");
                    params = {
                        EntityName: entity.name,
                        EntityDesc: entity.description,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fs_1.promises.readFile(pageI18n, { encoding: "utf-8" })];
                case 2:
                    content = _a.sent();
                    if (content.indexOf(entity.name + "Query") !== -1) {
                        // 存在则不追加
                        return [2 /*return*/];
                    }
                    lastIndex = content.search(/\};/);
                    startIndex = lastIndex - 1;
                    start = content.slice(0, startIndex);
                    code = utils_1.tplfile("page-i18n", params);
                    end = content.slice(startIndex);
                    return [4 /*yield*/, utils_1.codeToFile(pageI18n, start + "\n" + code + end)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("国际化消息插入错误", error_1.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * 插入i18n实体文件
 * @param projectDir
 * @param entity
 */
function insetI18nEntity(projectDir, entity) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var pageI18n, content, lastIndex, startIndex, start, code, end, error_2;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pageI18n = path_1.default.join(projectDir, ".kiwi/zh_CN/entity.ts");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fs_1.promises.readFile(pageI18n, { encoding: "utf-8" })];
                case 2:
                    content = _a.sent();
                    if (content.indexOf(entity.name + ":") !== -1) {
                        // 存在则不追加
                        console.log("跳过", entity.name);
                        return [2 /*return*/];
                    }
                    lastIndex = content.search(/\};/);
                    startIndex = lastIndex - 1;
                    start = content.slice(0, startIndex);
                    code = "    " + entity.name + ": {\n        entityName: \"" + entity.description + "\",\n";
                    code = entity.columns.reduce(function (prev, current) {
                        return prev + ("        " + current.name + ": \"" + current.desc + "\",\n");
                    }, code);
                    code += "    },";
                    end = content.slice(startIndex);
                    return [4 /*yield*/, utils_1.codeToFile(pageI18n, start + "\n" + code + end)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error("国际化实体插入错误", error_2.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=query.js.map