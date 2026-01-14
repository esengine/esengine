import { AssetDBRegisterInfo } from './@types/private';
import { ConfigurationScope } from '../configuration';
export interface AssetDBConfig {
    restoreAssetDBFromCache: boolean;
    flagReimportCheck: boolean;
    globList?: string[];
    /**
     * 资源 userData 的默认值
     */
    userDataTemplate?: Record<string, any>;
    /**
     * 资源数据库信息列表
     */
    assetDBList: AssetDBRegisterInfo[];
    /**
     * 资源根目录，通常是项目目录
     */
    root: string;
    /**
     * 资源库导入后根目录，通常根据配置的 root 计算
     */
    libraryRoot: string;
    tempRoot: string;
    createTemplateRoot: string;
    sortingPlugin: string[];
}
declare class AssetConfig {
    /**
     * 环境共享的资源库配置
     */
    private _assetConfig;
    private _init;
    /**
     * 持有的可双向绑定的配置管理实例
     */
    private _configInstance;
    get data(): AssetDBConfig;
    init(): Promise<void>;
    getProject<T>(path: string, scope?: ConfigurationScope): Promise<T>;
    setProject(path: string, value: any, scope?: ConfigurationScope): Promise<boolean>;
}
declare const _default: AssetConfig;
export default _default;
