"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs_1 = require("fs");
var path_1 = tslib_1.__importDefault(require("path"));
var utils_1 = require("../utils");
/**
 * 生成接口
 * - 实体接口和, 实体查询接口
 * - Service 层
 * - 绑定信息
 */
exports.default = (function (config) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var projectDir, typesCode, serviceCode, variableName, apiDir;
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
                typesCode = makeTypesCode(config);
                serviceCode = makeServiceCode(config);
                variableName = utils_1.toLowcase(config.entity.name);
                apiDir = path_1.default.join(projectDir, "src/api/" + variableName);
                utils_1.codeToFile(path_1.default.join(apiDir, "types.d.ts"), typesCode);
                utils_1.codeToFile(path_1.default.join(apiDir, "index.ts"), serviceCode);
                return [4 /*yield*/, appendTypes(projectDir, config)];
            case 1:
                _a.sent();
                return [4 /*yield*/, bindApi(projectDir, config)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * 生成接口代码
 * @param config
 */
function makeTypesCode(config) {
    var entity = config.entity;
    var columnCode = entity.columns.reduce(function (prev, current) {
        var code = "    /**\n     * " + current.desc + "\n     */\n    " + current.name + "?: " + utils_1.javaTypeToTsType(current.type) + ";\n";
        return (prev += code);
    }, "");
    var params = {
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: utils_1.toLowcase(entity.name),
        EntityColumnCode: columnCode,
    };
    return utils_1.tplfile("types", params);
}
/**
 * 生成service代码
 * @param config
 */
function makeServiceCode(config) {
    var entity = config.entity;
    var addControllerRemove = entity.addControllerRemove, updateControllerRemove = entity.updateControllerRemove;
    var params = {
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: utils_1.toLowcase(entity.name),
        ServerName: config["server-name"] + "-api",
    };
    var code = utils_1.tplfile("web-service", params);
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
function appendTypes(projectDir, config) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var typesFile, entity, params, content, lastIndex, startIndex, start, code, end, error_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    typesFile = path_1.default.join(projectDir, "src/config/constants/API_TYPES.ts");
                    entity = config.entity;
                    params = {
                        EntityName: entity.name,
                        EntityDesc: entity.description,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fs_1.promises.readFile(typesFile, { encoding: "utf-8" })];
                case 2:
                    content = _a.sent();
                    if (content.indexOf(entity.name + "Service") !== -1) {
                        // 存在则不追加
                        return [2 /*return*/];
                    }
                    lastIndex = content.search(/\};/);
                    startIndex = lastIndex - 1;
                    start = content.slice(0, startIndex);
                    code = utils_1.tplfile("api-type", params);
                    end = content.slice(startIndex);
                    return [4 /*yield*/, utils_1.codeToFile(typesFile, start + "\n" + code + end)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("api API_TYPES插入错误", error_1.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * 绑定服务
 * @param projectDir
 * @param config
 */
function bindApi(projectDir, config) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var bindConfigFile, entity, entityName, variableName, content, lastImportIndex, importCode, error_2;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    bindConfigFile = path_1.default.join(projectDir, "src/config/context/ApiBindConfig.ts");
                    entity = config.entity;
                    entityName = entity.name;
                    variableName = utils_1.toLowcase(entity.name);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fs_1.promises.readFile(bindConfigFile, { encoding: "utf-8" })];
                case 2:
                    content = _a.sent();
                    if (content.indexOf(entity.name + "Service") !== -1) {
                        // 存在则不追加
                        return [2 /*return*/];
                    }
                    lastImportIndex = content.indexOf("container.bind") - 46;
                    importCode = "import " + entityName + "Service from \"@/api/" + variableName + "\";";
                    content = content.slice(0, lastImportIndex) + "\n" + importCode + content.slice(lastImportIndex);
                    content = content.slice(0, content.length - 2) + ("\tcontainer.bind(API_TYPES." + entityName + "Service).to(" + entityName + "Service);") + "\n}";
                    return [4 /*yield*/, utils_1.codeToFile(bindConfigFile, content)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error("api绑定配置错误", error_2.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * 删除方法
 * @param code 控制器代码
 * @param tag 要删除的标签, 比如 新增/修改/删除
 */
function removeMethod(code, tag) {
    var END_POINT = "    }";
    var start = code.indexOf(tag) - 15;
    var end = code.indexOf(END_POINT, start);
    var part = code.slice(start, end + END_POINT.length);
    return code.replace(part, "");
}
//# sourceMappingURL=api.js.map