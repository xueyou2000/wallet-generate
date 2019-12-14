"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
/**
 * 创建service接口实现代码
 * @description
 * ServerName 服务名称, 比如 boss
 * EntityName 实体名称
 * EntityDesc 实体说明
 * EntityVariableName 实体变量名称,一般是实体类型的首字母小写
 * SetColumns 要设置的列代码, .set(qMenu.name, menu.getName()) 字符串
 * @param config 实体配置
 */
function makeServiceImpl(config) {
    var entity = config.entity;
    var params = {
        ServerName: config["server-name"],
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: utils_1.toLowcase(entity.name),
        SetColumns: createSetColumns(entity.name, config.entity.columns),
    };
    var code = utils_1.tplfile("service-impl", params);
    return code;
}
exports.default = makeServiceImpl;
/**
 * 创建更新语句
 * @param name 实体名称
 * @param columns 字段定义
 */
function createSetColumns(name, columns) {
    var variableName = utils_1.toLowcase(name);
    return columns.reduce(function (prev, current, index) {
        return (prev += (index === 0 ? "" : "\n") + "\t\t\t\t.set(q" + name + "." + current.name + ", " + variableName + ".get" + utils_1.toUpcase(current.name) + "())");
    }, "");
}
//# sourceMappingURL=service-impl.js.map