"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
/**
 * 创建请求接口代码
 * @description
 * ServerName 服务名称, 比如 boss
 * EntityName 实体名称
 * EntityDesc 实体说明
 * EntityVariableName 实体变量名称,一般是实体类型的首字母小写
 * @param config 实体配置
 */
function makeServiceFace(config) {
    var entity = config.entity;
    var addControllerRemove = entity.addControllerRemove, updateControllerRemove = entity.updateControllerRemove, removeControllerRemove = entity.removeControllerRemove;
    var params = {
        ServerName: config["server-name"],
        TableName: utils_1.humpToUperCase(entity.name),
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: utils_1.toLowcase(entity.name),
    };
    var code = utils_1.tplfile("service-face", params);
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
exports.default = makeServiceFace;
/**
 * 删除方法
 * @param code 控制器代码
 * @param tag 要删除的标签, 比如 新增/修改/删除
 */
function removeMethod(code, tag) {
    var start = code.indexOf(tag) - 15;
    var responseCodeList = code.match(/Response(.+);/g);
    // 在 `Response deleteById(@RequestParam("id") Long id);` 这样的签名中, 寻找最近的作为结束区块
    var end = 0;
    var approResponse = "";
    responseCodeList.forEach(function (x) {
        var i = code.indexOf(x);
        if (i > start) {
            if (end === 0 || i < end) {
                end = i;
                approResponse = x;
            }
        }
    });
    var part = code.slice(start, end + approResponse.length);
    // console.log("========测试========");
    // console.log(code.slice(start, end + approResponse.length));
    // console.log("========测试========");
    return code.replace(part, "");
}
//# sourceMappingURL=serviceFace.js.map