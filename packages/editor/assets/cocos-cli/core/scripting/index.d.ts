import { CCEModuleMap } from '../engine/@types/config';
import { IPluginScriptInfo, SharedSettings } from './interface';
import { CustomEvent, EventType } from './event-emitter';
import { AssetChangeInfo, DBChangeType } from './packer-driver/asset-db-interop';
import { DBInfo } from './@types/config-export';
export declare const title = "i18n:builder.tasks.load_script";
declare class ScriptManager {
    on(type: EventType, listener: (arg: any) => void): CustomEvent;
    off(type: EventType, listener: (arg: any) => void): CustomEvent;
    once(type: EventType, listener: (arg: any) => void): CustomEvent;
    private _initialized;
    private _pendingCompileTimer;
    private _pendingCompileTaskId;
    /**
     * 初始化Scripting模块
     * @param projectPath 项目路径
     * @param enginePath 引擎路径
     * @param features 引擎功能特性列表
     */
    initialize(projectPath: string, enginePath: string, features: string[]): Promise<void>;
    /**
     * 查询文件的依赖者（谁使用了这个文件）
     * @param path 文件路径
     * @returns 使用该文件的其他文件路径列表
     */
    queryScriptUsers(path: string): Promise<string[]>;
    /**
     * 查询文件的依赖（这个文件使用了哪些文件）
     * @param path 文件路径
     * @returns 该文件依赖的其他文件路径列表
     */
    queryScriptDependencies(path: string): Promise<string[]>;
    /**
     * 查询共享配置
     * @returns 共享配置对象
     */
    querySharedSettings(): Promise<SharedSettings>;
    /**
     * 生成类型声明文件
     */
    generateDeclarations(): Promise<void>;
    /**
     * @param type 变更类型
     * @param uuid 资源UUID
     * @param assetInfo 资源信息
     * @param meta 元数据
     */
    dispatchAssetChange(assetChange: AssetChangeInfo): void;
    /**
     * 调用方需要捕获异常，无异常则编译成功
     * 编译脚本文件
     * @param assetChanges 资源变更列表，如果未提供，则编译上一次缓存的资源变更列表
     */
    compileScripts(assetChanges?: AssetChangeInfo[]): Promise<void>;
    /**
     *
     * @param delay 延迟时间，单位为毫秒, 同一时间只能有一个延迟编译任务，如果存在则返回已有的任务ID
     * @returns 延迟编译任务的ID，如果存在则返回已有的任务ID
     */
    postCompileScripts(delay: number): string;
    /**
     * 检查编译是否忙碌
     * @returns 是否正在编译
     */
    isCompiling(): boolean;
    /**
     * 获取当前正在执行的编译任务ID
     * @returns 任务ID，如果没有正在执行的任务则返回null
     */
    getCurrentTaskId(): string | null;
    /**
     * 检查目标是否就绪
     * @param targetName 目标名称，如 'editor' 或 'preview'
     * @returns 是否就绪
     */
    isTargetReady(targetName: string): boolean;
    /**
     * 加载脚本并执行
     * @param scriptUuids 脚本UUID列表
     * @param pluginScripts 插件脚本信息列表
     */
    loadScript(scriptUuids: string[], pluginScripts?: IPluginScriptInfo[]): Promise<void>;
    /**
     * 查询CCE模块映射
     * @returns CCE模块映射对象
     */
    queryCCEModuleMap(): CCEModuleMap;
    /**
     * 获取指定目标的Loader上下文
     * @param targetName 目标名称
     * @returns 序列化后的Loader上下文
     */
    getPackerDriverLoaderContext(targetName: string): any;
    /**
     * 清除缓存并重新编译
     */
    clearCacheAndRebuild(): Promise<void>;
    /**
     * 更新数据库信息
     * @param dbInfos 数据库信息列表
     */
    updateDatabases(dbInfo: DBInfo, dbChangeType: DBChangeType): Promise<void>;
}
declare const _default: ScriptManager;
export default _default;
export { AssetChangeInfo, AssetChangeType } from './packer-driver/asset-db-interop';
export type { SharedSettings, IPluginScriptInfo } from './interface';
export type { CCEModuleMap } from '../engine/@types/config';
export type { EventType } from './event-emitter';
export type { TypeScriptAssetInfoCache } from './shared/cache';
