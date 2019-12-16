"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 创建国际化消息(中文)
 * @param config 实体配置
 */
function makeI18nMessage_zh(config) {
    var entity = config.entity;
    var Name = entity.name;
    var code = "# " + entity.description + "\n" + Name + "=" + entity.description + "\n";
    code = entity.columns.reduce(function (prev, current) {
        return prev + (Name + "." + current.name + "=" + current.desc + "\n");
    }, code);
    return code;
}
exports.makeI18nMessage_zh = makeI18nMessage_zh;
/**
 * 创建国际化消息(英文)
 * @param config 实体配置
 */
function makeI18nMessage_en(config) {
    var entity = config.entity;
    var Name = entity.name;
    var code = "# " + entity.description + "\n" + Name + "=" + Name + "\n";
    code = entity.columns.reduce(function (prev, current) {
        return prev + (Name + "." + current.name + "=" + current.name + "\n");
    }, code);
    return code;
}
exports.makeI18nMessage_en = makeI18nMessage_en;
//# sourceMappingURL=index.js.map