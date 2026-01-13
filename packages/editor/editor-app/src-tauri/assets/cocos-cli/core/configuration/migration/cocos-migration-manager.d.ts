import { CocosCLIConfigScope, IMigrationTarget } from './types';
/**
 * CocosCreator 3.x 配置迁移管理器
 */
export declare class CocosMigrationManager {
    private static _targets;
    private static _initialized;
    /**
     * 迁移器列表
     */
    static get migrationTargets(): Map<CocosCLIConfigScope, IMigrationTarget[]>;
    /**
     * 注册所有迁移器
     */
    private static registerMigration;
    /**
     * 注册迁移器
     * @param migrationTarget 迁移器实例
     */
    static register(migrationTarget: IMigrationTarget | IMigrationTarget[]): void;
    /**
     * 执行迁移
     * @param projectPath 项目路径
     * @returns 迁移后的新配置
     */
    static migrate(projectPath: string): Promise<Record<CocosCLIConfigScope, Record<string, any>>>;
    /**
     * 清空所有迁移器
     */
    static clear(): void;
    /**
     * 生成新的配置
     * @private
     */
    private static createConfigList;
}
