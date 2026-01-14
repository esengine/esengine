import { CocosCreatorConfigScope } from './types';
/**
 * CocosCreator 旧配置加载器
 */
export declare class CocosConfigLoader {
    private initialized;
    private projectPath;
    private configMap;
    initialize(projectPath: string): void;
    /**
     * 根据 scope 获取路径
     * @param pkgName
     * @param scope
     * @private
     */
    private getPathByScope;
    /**
     * 加载配置
     * @param scope 配置范围
     * @param pkgName 包名
     * @returns 配置对象
     */
    loadConfig(scope: CocosCreatorConfigScope, pkgName: string): Promise<any>;
}
