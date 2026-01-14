import { IBaseConfiguration } from './config';
import { EventEmitter } from 'events';
/**
 * 配置注册器接口
 */
export interface IConfigurationRegistry {
    /**
     * 获取所有配置实例
     */
    getInstances(): Record<string, IBaseConfiguration>;
    /**
     * 通过模块名获取配置实例
     * @param moduleName
     */
    getInstance(moduleName: string): IBaseConfiguration | undefined;
    /**
     * 注册配置（使用默认配置对象）
     * @param moduleName 模块名
     * @param defaultConfig 默认配置对象
     * @returns 注册成功返回配置实例，失败返回 null
     */
    register(moduleName: string, defaultConfig?: Record<string, any>): Promise<IBaseConfiguration>;
    /**
     * 注册配置（使用自定义配置实例）
     * @param moduleName 模块名
     * @param instance 自定义配置实例
     * @returns 注册成功返回配置实例，失败返回 null
     */
    register<T extends IBaseConfiguration>(moduleName: string, instance: T): Promise<T>;
    /**
     * 反注册配置
     * @param moduleName
     */
    unregister(moduleName: string): Promise<void>;
}
/**
 * 配置注册器实现类
 */
export declare class ConfigurationRegistry extends EventEmitter implements IConfigurationRegistry {
    private instances;
    /**
     * 获取所有配置实例
     */
    getInstances(): Record<string, IBaseConfiguration>;
    /**
     * 通过模块名获取配置实例
     * @param moduleName
     */
    getInstance(moduleName: string): IBaseConfiguration | undefined;
    /**
     * 注册配置（使用默认配置对象）
     * @param moduleName 模块名
     * @param defaultConfig 默认配置对象
     * @returns 注册成功返回配置实例，失败报错
     */
    register(moduleName: string, defaultConfig?: Record<string, any>): Promise<IBaseConfiguration>;
    /**
     * 注册配置（使用自定义配置实例）
     * @param moduleName 模块名
     * @param instance 自定义配置实例
     * @returns 注册成功返回配置实例，失败报错
     */
    register<T extends IBaseConfiguration>(moduleName: string, instance: T): Promise<T>;
    unregister(moduleName: string): Promise<void>;
}
/**
 * 默认配置注册器实例
 */
export declare const configurationRegistry: ConfigurationRegistry;
