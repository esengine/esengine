import { IMigrationTarget } from './types';
/**
 * CocosCreator 配置迁移器实现
 */
export declare class CocosMigration {
    private static loader;
    /**
     * 执行迁移
     * @param projectPath 项目路径
     * @param target 迁移目标配置
     * @returns 迁移后的新配置
     */
    static migrate(projectPath: string, target: IMigrationTarget): Promise<any>;
    /**
     * 应用目标路径
     * @param config 配置对象
     * @param targetPath 目标路径
     * @returns 应用路径后的配置
     */
    private static applyTargetPath;
}
