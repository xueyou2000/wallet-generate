"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
/**
 * 创建仓储代码
 * @description
 * ServerName 服务名称, 比如 boss
 * EntityName 实体名称
 * @param config 实体配置
 */
function makeRepository(config) {
    var entity = config.entity;
    var params = {
        ServerName: config["server-name"],
        EntityName: entity.name,
    };
    var code = utils_1.tplfile("repository", params);
    return code;
}
exports.default = makeRepository;
