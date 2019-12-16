import { EntityConfig } from "../types";

/**
 * 创建国际化消息(中文)
 * @param config 实体配置
 */
export function makeI18nMessage_zh(config: EntityConfig) {
    const { entity } = config;

    const Name = entity.name;

    let code = `# ${entity.description}\n${Name}=${entity.description}\n`;
    code = entity.columns.reduce((prev, current) => {
        return prev + `${Name}.${current.name}=${current.desc}\n`;
    }, code);

    return code;
}

/**
 * 创建国际化消息(英文)
 * @param config 实体配置
 */
export function makeI18nMessage_en(config: EntityConfig) {
    const { entity } = config;

    const Name = entity.name;

    let code = `# ${entity.description}\n${Name}=${Name}\n`;
    code = entity.columns.reduce((prev, current) => {
        return prev + `${Name}.${current.name}=${current.name}\n`;
    }, code);

    return code;
}
