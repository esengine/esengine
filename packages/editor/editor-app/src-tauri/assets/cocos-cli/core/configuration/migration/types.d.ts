/**
 * CocosCreator 配置迁移相关类型定义
 */
/**
 * Cocos Creator 配置范围
 */
export type CocosCreatorConfigScope = 'local' | 'project' | 'global';
/**
 * Cli 配置范围
 */
export type CocosCLIConfigScope = 'project';
/**
 * 迁移目标配置
 */
export interface IMigrationTarget {
    /** 源配置范围 */
    sourceScope: CocosCreatorConfigScope;
    /** 源配置范围 */
    targetScope?: CocosCLIConfigScope;
    /** Cocos Creator 插件名 */
    pluginName: string;
    /** 新配置中的目标路径，如果不配置，默认在整个配置表根目录 */
    targetPath?: string;
    /** 自定义 migrate 函数（可选，如果不提供则使用自动重定向） */
    migrate(oldConfig: Record<string, any>): Promise<any>;
}
export declare const COCOS_CREATOR_VERSION: string;
