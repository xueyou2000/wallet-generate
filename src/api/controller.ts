import { EntityConfig } from "../types";
import { humpToUperCase, tplfile, toLowcase } from "../utils";

/**
 * 创建service接口代码
 * @description
 * ServerName 服务名称, 比如 boss
 * EntityName 实体名称
 * EntityDesc 实体说明
 * EntityVariableName 实体变量名称,一般是实体类型的首字母小写
 * @param config 实体配置
 */
export default function makeController(config: EntityConfig) {
    const { entity } = config;
    const { addControllerRemove, updateControllerRemove, removeControllerRemove } = entity;

    const params = {
        ServerName: config["server-name"],
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: toLowcase(entity.name),
    };

    let code = tplfile("controller", params);
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

/**
 * 删除方法
 * @param code 控制器代码
 * @param tag 要删除的标签, 比如 新增/修改/删除
 */
function removeMethod(code: string, tag: string) {
    const END_POINT = "    }";
    const start = code.indexOf(tag) - 15;
    const end = code.indexOf(END_POINT, start);

    const part = code.slice(start, end + END_POINT.length);

    // console.log("========测试========");
    // console.log(code.slice(start, end + END_POINT.length));
    // console.log("========测试========");
    return code.replace(part, "");
}
