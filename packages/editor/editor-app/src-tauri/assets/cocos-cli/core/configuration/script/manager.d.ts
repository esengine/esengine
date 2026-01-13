import { IConfiguration, ConfigurationScope } from './interface';
import EventEmitter from 'events';
export interface IConfigurationManager {
    /**
     * 初始化配置管理器
     */
    initialize(projectPath: string): Promise<void>;
    /**
     * 获取配置
     * @param key 配置键名，支持点号分隔的嵌套路径，如 'test.x.x'，第一位作为模块名
     * @param scope 配置作用域，不指定时按优先级查找
     */
    get<T>(key: string, scope?: ConfigurationScope): Promise<T>;
    /**
     * 设置配置
     * @param key 配置键名，支持点号分隔的嵌套路径，如 'test.x.x'，第一位作为模块名
     * @param value 新的配置值
     * @param scope 配置作用域，默认为 'project'
     */
    set<T>(key: string, value: T, scope?: ConfigurationScope): Promise<boolean>;
    /**
     * 移除配置
     * @param key 配置键名，支持点号分隔的嵌套路径，如 'test.x.x'，第一位作为模块名
     * @param scope 配置作用域，默认为 'project'
     */
    remove(key: string, scope?: ConfigurationScope): Promise<boolean>;
}
export declare class ConfigurationManager extends EventEmitter implements IConfigurationManager {
    static VERSION: string;
    static name: string;
    static SchemaPathSource: string;
    static relativeSchemaPath: string;
    private initialized;
    private projectPath;
    private configPath;
    private projectConfig;
    private _version;
    get version(): string;
    set version(value: string);
    private configurationMap;
    private onRegistryConfigurationBind;
    private onUnRegistryConfigurationBind;
    /**
     * 初始化配置管理器
     */
    initialize(projectPath: string): Promise<void>;
    /**
     * 从硬盘重新加载项目配置，将会丢弃内存中现有的配置
     */
    reload(): Promise<void>;
    private onRegistryConfiguration;
    private onUnRegistryConfiguration;
    /**
     * 从项目配置中初始化配置实例
     * @param instance 配置实例
     * @param existingConfig 现有的项目配置
     * @private
     */
    private initializeConfigFromProject;
    /**
     * 迁移，包含了 3x 迁移，允许外部单独触发
     */
    migrate(): Promise<void>;
    /**
     * 从指定项目路径迁移配置到当前项目
     * @param projectPath 项目路径
     * @returns 迁移后的项目配置
     */
    migrateFromProject(projectPath: string): Promise<IConfiguration>;
    /**
     * 解析配置键，提取模块名和实际键名
     * @param key 配置键名，如 'test.x.x'
     * @private
     */
    private parseKey;
    /**
     * 获取模块配置实例
     * @param moduleName 模块名
     * @private
     */
    private getInstance;
    /**
     * 获取配置值
     * 读取规则：优先读项目配置，如果没有再读默认配置，默认配置也没定义的话，就打印警告日志
     * @param key 配置键名，支持点号分隔的嵌套路径，如 'test.x.x'，第一位作为模块名
     * @param scope 配置作用域，不指定时按优先级查找
     */
    get<T>(key: string, scope?: ConfigurationScope): Promise<T>;
    /**
     * 更新配置值
     * @param key 配置键名，支持点号分隔的嵌套路径，如 'test.x.x'，第一位作为模块名
     * @param value 新的配置值
     * @param scope 配置作用域，默认为 'project'
     */
    set<T>(key: string, value: T, scope?: ConfigurationScope): Promise<boolean>;
    /**
     * 移除配置值
     * @param key 配置键名，支持点号分隔的嵌套路径，如 'test.x.x'，第一位作为模块名
     * @param scope 配置作用域，默认为 'project'
     */
    remove(key: string, scope?: ConfigurationScope): Promise<boolean>;
    /**
     * 确保配置管理器已初始化
     */
    private ensureInitialized;
    /**
     * 加载项目配置
     */
    private load;
    /**
     * 保存项目配置
     */
    private save;
    reset(): void;
}
export declare const configurationManager: ConfigurationManager;
