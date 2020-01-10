"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
/**
 * 创建实体代码
 * @description
 * ServerName 服务名称, 比如 boss
 * TableName 表名称, 根据实体名称全改大写,并驼峰用_取代
 * EntityName 实体名称
 * EntityDesc 实体说明
 * EntityColumns 实体字段代码字符串
 * @param config 实体配置
 */
function makeEntity(config) {
    var entity = config.entity;
    var columnsCode = createColumns(entity.columns);
    var params = {
        ServerName: config["server-name"],
        TableName: utils_1.humpToUperCase(entity.name),
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityColumns: columnsCode,
    };
    return utils_1.tplfile("entity", params);
}
exports.default = makeEntity;
/**
 * 创建列代码
 * @param columns 列定义
 * @returns [引入代码, 列代码]
 */
function createColumns(columns) {
    // 列代码
    var columnsCode = columns.reduce(function (prev, current, index) {
        var name = utils_1.humpToUperCase(current.name);
        var type = parsType(current);
        var apiType = current.isEnum ? "string" : type;
        var code = "\n    /**\n     * " + current.desc + "\n     * " + (current.summary || "") + "\n     */" + (name === "VERSION"
            ? ""
            : "\n    @Column(name = \"" + name + "\", length = " + (current.length || 60) + ", nullable = " + (current.nullable || false) + ")\n    @ApiModelProperty(value = \"" + current.desc + "\", dataType = \"" + apiType + "\")\n    @ExcelField(name = \"" + current.name + "\", column = " + index + ")");
        // 特殊注解
        if (name === "ID") {
            code += "\n    @Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)";
        }
        if (name === "VERSION") {
            code += "\n    @Version\n    @JSONField(serialize=false)";
        }
        if (current.isEnum) {
            code += "\n    @Enumerated(EnumType.STRING)";
        }
        code += "\n    private " + type + " " + current.name + ";";
        return prev + "\n" + code;
    }, "");
    return columnsCode;
}
/**
 * 解析类型
 * Long 返回Long
 * com.yl.wallet.common.enums.EnableOrUnenable 返回EnableOrUnenable
 */
function parsType(column) {
    var type = column.type;
    if (!utils_1.needImportType(type)) {
        return type;
    }
    else {
        return type.slice(type.lastIndexOf(".") + 1);
    }
}
//# sourceMappingURL=entity.js.map