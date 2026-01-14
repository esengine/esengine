import EventEmitter from 'events';
import { AssetDBPluginInfo, AssetDBRegisterInfo, PackageRegisterInfo } from '../@types/private';
type PackageEventType = 'register' | 'unregister' | 'enable' | 'disable';
interface packageTask {
    type: PackageEventType;
    pkgName: string;
    handler: Function;
    args: any[];
}
/**
 * 扩展管理器
 * 更新一些场景暴露的扩展数据
 */
declare class PluginManager extends EventEmitter {
    packageRegisterInfo: Record<string, PackageRegisterInfo>;
    hookOrder: string[];
    assetDBProfileMap: Record<string, string>;
    _tasks: packageTask[];
    _currentTask: packageTask | null;
    private pkgLock;
    private ready;
    init(): Promise<void>;
    destroyed(): Promise<void>;
    /**
     * 处理插件广播消息任务，由于各个处理消息异步，需要使用队列管理否则可能出现时序问题
     * @param name
     * @param handler
     * @param args
     */
    addTask(type: PackageEventType, pkgName: string, handler: Function, ...args: any[]): void;
    onPackageEnable(data: AssetDBPluginInfo): Promise<void>;
    /**
     * 插件关闭后的一些卸载操作缓存清理，需要与 enable 里的处理互相呼应
     * @param data
     * @returns
     */
    onPackageDisable(data: AssetDBPluginInfo): Promise<void>;
    unRegisterDetach(data: AssetDBPluginInfo): Promise<void>;
    private step;
    getAssetDBInfos(): AssetDBRegisterInfo[];
    getAssetDBInfo(name: string): AssetDBRegisterInfo | null;
}
declare const pluginManager: PluginManager;
export default pluginManager;
