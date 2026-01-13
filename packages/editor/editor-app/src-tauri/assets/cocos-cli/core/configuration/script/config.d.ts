import { ConfigurationScope } from './interface';
import { EventEmitter } from 'events';
type EventEmitterMethods = Pick<EventEmitter, 'on' | 'off' | 'once' | 'emit'>;
/**
 * 配置基类接口
 */
export interface IBaseConfiguration extends EventEmitterMethods {
    /**
     * 模块名
     */
    moduleName: string;
    /**
     * 默认配置数据
     */
    getDefaultConfig(): Record<string, any> | undefined;
    /**
     * 获取配置值
     * @param key 配置键名，支持点号分隔的嵌套路径
     * @param scope 配置作用域，不指定时按优先级查找
     */
    get<T>(key?: string, scope?: ConfigurationScope): Promise<T>;
    /**
     * 获取指定范围的所有配置，默认是 project
     * @param scope
     */
    getAll(scope?: ConfigurationScope): Record<string, any> | undefined;
    /**
     * 设置配置值
     * @param key 配置键名，支持点号分隔的嵌套路径
     * @param value 新的配置值
     * @param scope 配置作用域，默认为 'project'
     */
    set<T>(key: string, value: T, scope?: ConfigurationScope): Promise<boolean>;
    /**
     * 移除配置值
     * @param key 配置键名，支持点号分隔的嵌套路径
     * @param scope 配置作用域，默认为 'project'
     */
    remove(key: string, scope?: ConfigurationScope): Promise<boolean>;
    /**
     * 保存配置
     */
    save(): Promise<boolean>;
}
/**
 * 抽象配置类实现
 */
export declare class BaseConfiguration extends EventEmitter implements IBaseConfiguration {
    readonly moduleName: string;
    protected readonly defaultConfigs?: Record<string, any> | undefined;
    protected configs: Record<string, any>;
    constructor(moduleName: string, defaultConfigs?: Record<string, any> | undefined);
    getDefaultConfig(): Record<string, any>;
    getAll(scope?: ConfigurationScope): Record<string, any> | undefined;
    get<T>(key?: string, scope?: ConfigurationScope): Promise<T>;
    set<T>(key: string, value: T, scope?: ConfigurationScope): Promise<boolean>;
    remove(key: string, scope?: ConfigurationScope): Promise<boolean>;
    save(): Promise<boolean>;
}
export {};
