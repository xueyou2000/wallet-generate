"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
/**
 * 创建service接口代码
 * @description
 * ServerName 服务名称, 比如 boss
 * EntityName 实体名称
 * EntityDesc 实体说明
 * EntityVariableName 实体变量名称,一般是实体类型的首字母小写
 * @param config 实体配置
 */
function makeController(config) {
    var entity = config.entity;
    var addControllerRemove = entity.addControllerRemove, updateControllerRemove = entity.updateControllerRemove, removeControllerRemove = entity.removeControllerRemove;
    var params = {
        ServerName: config["server-name"],
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: utils_1.toLowcase(entity.name),
    };
    var code = utils_1.tplfile("controller", params);
    if (addControllerRemove) {
        code = removeMethod(code, "新增");
    }
    if (updateControllerRemove) {
        code = removeMethod(code, "修改");
    }
    if (removeControllerRemove) {
        code = removeMethod(code, "删除");
    }
    return code;
}
exports.default = makeController;
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
    // console.log("========测试========");
    // console.log(code.slice(start, end + END_POINT.length));
    // console.log("========测试========");
    return code.replace(part, "");
}
//# sourceMappingURL=controller.js.map