import { EntityConfig, EntityColumn } from "../types";
import { humpToUperCase, tplfile, toLowcase, toUpcase } from "../utils";

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
export default function makeServiceImpl(config: EntityConfig) {
    const { entity } = config;

    const params = {
        ServerName: config["server-name"],
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: toLowcase(entity.name),
        SetColumns: createSetColumns(entity.name, config.entity.columns),
    };

    const code = tplfile("service-impl", params);
    return code;
}

/**
 * 创建更新语句
 * @param name 实体名称
 * @param columns 字段定义
 */
function createSetColumns(name: string, columns: EntityColumn[]) {
    const variableName = toLowcase(name);

    return columns.reduce((prev, current, index) => {
        return (prev += `${index === 0 ? "" : "\n"}\t\t\t\t.set(q${name}.${current.name}, ${variableName}.get${toUpcase(current.name)}())`);
    }, "");
}
