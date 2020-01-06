import { EntityConfig, EntityColumn } from "../types";
import { humpToUperCase, tplfile, needImportType } from "../utils";

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
export default function makeEntity(config: EntityConfig) {
    const { entity } = config;
    const columnsCode = createColumns(entity.columns);

    const params = {
        ServerName: config["server-name"],
        TableName: humpToUperCase(entity.name),
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityColumns: columnsCode,
    };
    return tplfile("entity", params);
}

/**
 * 创建列代码
 * @param columns 列定义
 * @returns [引入代码, 列代码]
 */
function createColumns(columns: EntityColumn[]) {
    // 列代码
    let columnsCode = columns.reduce((prev, current, index) => {
        const name = humpToUperCase(current.name);
        const type = parsType(current);
        const apiType = current.isEnum ? "string" : type;
        let code = `
    /**
     * ${current.desc}
     * ${current.summary || ""}
     */
    @Column(name = "${name}", length = ${current.length || 60}, nullable = ${current.nullable || false})
    @ApiModelProperty(value = "${current.desc}", dataType = "${apiType}")
    @ExcelField(name = "${current.name}", column = ${index})`;

        // 特殊注解
        if (name === "ID") {
            code += `
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)`;
        }
        if (name === "VERSION") {
            code += `
    @Version`;
        }

        if (current.isEnum) {
            code += `
    @Enumerated(EnumType.STRING)`;
        }
        code += `


    private ${type} ${current.name};`;
        return prev + "\n" + code;
    }, "");

    return columnsCode;
}

/**
 * 解析类型
 * Long 返回Long
 * com.yl.wallet.common.enums.EnableOrUnenable 返回EnableOrUnenable
 */
function parsType(column: EntityColumn) {
    const { type } = column;
    if (!needImportType(type)) {
        return type;
    } else {
        return type.slice(type.lastIndexOf(".") + 1);
    }
}
