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
    var params = {
        ServerName: config["server-name"],
        TableName: utils_1.humpToUperCase(entity.name),
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: utils_1.toLowcase(entity.name),
    };
    var code = utils_1.tplfile("service-face", params);
    return code;
}
exports.default = makeServiceFace;
//# sourceMappingURL=serviceFace.js.map