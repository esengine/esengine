import { AssetDBRegisterInfo, IAssetDBInfo } from '../@types/private';
import * as assetdb from '@cocos/asset-db';
import EventEmitter from 'events';
/**
 * 总管理器，管理整个资源进程的启动流程、以及一些子管理器的启动流程
 */
declare class AssetDBManager extends EventEmitter {
    assetDBMap: Record<string, assetdb.AssetDB>;
    globalInternalLibrary: boolean;
    private hasPause;
    private startPause;
    get isPause(): boolean;
    ready: boolean;
    private waitPauseHandle?;
    private waitPausePromiseTask?;
    private state;
    assetDBInfo: Record<string, IAssetDBInfo>;
    private waitingTaskQueue;
    private waitingRefreshAsset;
    private pendingAutoRefreshResolves;
    private autoRefreshTimer?;
    private get assetBusy();
    private reimportCheck;
    private assetBusyTask;
    private pluginManager;
    private assetHandlerManager;
    static useCache: boolean;
    static libraryRoot: string;
    static tempRoot: string;
    get free(): boolean;
    /**
     * 初始化，需要优先调用
     * @param 资源配置信息
     */
    init(): Promise<void>;
    /**
     * 启动数据库入口
     */
    start(): Promise<void>;
    /**
     * 首次启动数据库
     */
    private _start;
    /**
     * 直接启动数据库
     */
    private _startDirectly;
    /**
     * 从缓存启动数据库，如果恢复失败会回退到原始的启动流程
     */
    private _startFromCache;
    isBusy(): boolean;
    hasDB(name: string): boolean;
    private startDB;
    /**
     * 将一个绝对路径，转成 url 地址
     * @param path
     * @param dbName 可选
     */
    path2url(path: string, dbName?: string): string;
    private _createDB;
    /**
     * 预启动 db, 需要与 _startupDB 搭配使用，请勿单独调用
     * @param db
     * @returns
     */
    private _preStartDB;
    /**
     * 完全启动之前预启动的 db ，请勿单独调用
     * @param startupDatabase
     */
    private _startupDB;
    /**
     * 启动某个指定数据库
     * @param name
     */
    _startDB(name: string): Promise<void>;
    /**
     * 添加某个 asset db
     */
    addDB(info: AssetDBRegisterInfo): Promise<void>;
    /**
     * 移除某个 asset-db
     * @param name
     * @returns
     */
    removeDB(name: string): Promise<unknown>;
    private _operate;
    private _removeDB;
    /**
     * 刷新所有数据库
     * @returns
     */
    refresh(): Promise<unknown>;
    private _refresh;
    /**
     * 懒刷新资源，请勿使用，目前的逻辑是针对重刷文件夹定制的
     * @param file
     */
    autoRefreshAssetLazy(pathOrUrlOrUUID: string): Promise<unknown>;
    /**
     * 恢复被暂停的数据库
     * @returns
     */
    resume(): Promise<boolean>;
    addTask(func: Function, args: any[]): Promise<any>;
    private _addTaskToQueue;
    step(): Promise<void>;
    /**
     * 暂停数据库
     * @param source 来源标识
     * @returns
     */
    pause(source?: string): Promise<boolean | undefined>;
}
declare const assetDBManager: AssetDBManager;
export default assetDBManager;
