import { EntityConfig } from "../types";
import { humpToUperCase, tplfile, toLowcase } from "../utils";

/**
 * 创建请求接口代码
 * @description
 * ServerName 服务名称, 比如 boss
 * EntityName 实体名称
 * EntityDesc 实体说明
 * EntityVariableName 实体变量名称,一般是实体类型的首字母小写
 * @param config 实体配置
 */
export default function makeServiceFace(config: EntityConfig) {
    const { entity } = config;
    const { addControllerRemove, updateControllerRemove, removeControllerRemove } = entity;

    const params = {
        ServerName: config["server-name"],
        TableName: humpToUperCase(entity.name),
        EntityName: entity.name,
        EntityDesc: entity.description,
        EntityVariableName: toLowcase(entity.name),
    };

    let code = tplfile("service-face", params);

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
    const start = code.indexOf(tag) - 15;
    const responseCodeList = code.match(/Response(.+);/g);

    // 在 `Response deleteById(@RequestParam("id") Long id);` 这样的签名中, 寻找最近的作为结束区块
    let end = 0;
    let approResponse = "";
    responseCodeList.forEach((x) => {
        const i = code.indexOf(x);
        if (i > start) {
            if (end === 0 || i < end) {
                end = i;
                approResponse = x;
            }
        }
    });

    const part = code.slice(start, end + approResponse.length);

    // console.log("========测试========");
    // console.log(code.slice(start, end + approResponse.length));
    // console.log("========测试========");
    return code.replace(part, "");
}
