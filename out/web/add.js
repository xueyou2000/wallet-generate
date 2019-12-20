"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs_1 = require("fs");
var path_1 = tslib_1.__importDefault(require("path"));
var utils_1 = require("../utils");
/**
 * 生成新增页面
 */
exports.default = (function (config) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var projectDir, code, defaultPage, pageFile;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                projectDir = fs_1.realpathSync(process.cwd());
                if (!utils_1.checkDir(projectDir)) {
                    throw new Error("给定目录不是项目目录!");
                }
                code = makeAddCode(config);
                defaultPage = utils_1.toLowcase(config.entity.name);
                pageFile = path_1.default.join(projectDir, "src/pages", config.page || defaultPage, "add.tsx");
                if (!!utils_1.exists(pageFile)) return [3 /*break*/, 2];
                return [4 /*yield*/, utils_1.codeToFile(pageFile, code)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); });
/**
 * 生成新增对话框代码
 * @param config
 */
function makeAddCode(config) {
    var entity = config.entity;
    var params = {
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: utils_1.toLowcase(entity.name),
        ValidConfig: makeValidConfig(entity),
        AddComponent: makeComponentCode(entity),
    };
    return utils_1.tplfile("add-page", params);
}
/**
 * 创建验证配置
 * @param entity
 */
function makeValidConfig(entity) {
    return entity.columns.reduce(function (prev, current) {
        if (current.nullable) {
            return prev;
        }
        var code = "        " + current.name + ": [ { name: \"Required\", errMsg: I18N.common.required }, ],";
        return prev + code + "\n";
    }, "");
}
/**
 * 创建组件代码
 * @param entity
 */
function makeComponentCode(entity) {
    return entity.columns.reduce(function (prev, current) {
        return prev + utils_1.alignTab(utils_1.makeFormItem(current, entity.name, utils_1.makeComponent(current)), 6) + "\n";
    }, "");
}
//# sourceMappingURL=add.js.map