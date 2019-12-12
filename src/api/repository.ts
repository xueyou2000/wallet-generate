import { EntityConfig } from "../types";
import { humpToUperCase, tplfile, toLowcase } from "../utils";

/**
 * 创建仓储代码
 * @description
 * ServerName 服务名称, 比如 boss
 * EntityName 实体名称
 * @param config 实体配置
 */
export default function makeRepository(config: EntityConfig) {
    const { entity } = config;

    const params = {
        ServerName: config["server-name"],
        EntityName: entity.name,
    };

    const code = tplfile("repository", params);
    return code;
}
