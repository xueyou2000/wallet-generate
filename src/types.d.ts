/**
 * 实体配置
 */
export interface EntityConfig {
    /**
     * 服务名称
     */
    "server-name": string;
    /**
     * 实体定义
     */
    entity: Entity;
}

/**
 * 实体定义
 */
export interface Entity {
    /**
     * 实体名称
     */
    name: string;
    /**
     * 实体说明
     */
    description: string;
    /**
     * 实体字段
     */
    columns: EntityColumn[];
}

/**
 * 实体字段定义
 */
export interface EntityColumn {
    /**
     * 字段名称
     */
    name: string;
    /**
     * 字段类型
     */
    type: string;
    /**
     * 字段中文
     */
    desc: string;
    /**
     * 是否枚举类型
     */
    isEnum?: boolean;
    /**
     * 是否可为空
     */
    nullable?: boolean;
    /**
     * 数据库长度
     */
    length?: number;
    /**
     * 字段说明
     */
    summary?: string;
}
