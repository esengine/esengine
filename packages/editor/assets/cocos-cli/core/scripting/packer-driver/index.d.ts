import { SharedSettings } from '../shared/query-shared-settings';
import { AssetChangeInfo, DBChangeType, ModifiedAssetChange } from './asset-db-interop';
import { LanguageServiceAdapter } from '../language-service';
import { AsyncDelegate } from '../utils/delegate';
import { DBInfo } from '../@types/config-export';
interface CCEModuleConfig {
    description: string;
    main: string;
    types: string;
}
type CCEModuleMap = {
    [moduleName: string]: CCEModuleConfig;
} & {
    mapLocation: string;
};
/**
 * Packer 驱动器。
 * - 底层用 QuickPack 快速打包模块相关的资源。
 * - 产出是可以进行加载的模块资源，包括模块、Source map等；需要使用 QuickPackLoader 对这些模块资源进行加载和访问。
 */
export declare class PackerDriver {
    languageService: LanguageServiceAdapter | null;
    private static _instance;
    static getInstance(): PackerDriver;
    /**
     * 创建 Packer 驱动器。
     */
    static create(projectPath: string, engineTsPath: string): Promise<PackerDriver>;
    static queryCCEModuleMap(): CCEModuleMap;
    /**构建任务的委托，在构建之前会把委托里面的所有内容执行 */
    readonly beforeEditorBuildDelegate: AsyncDelegate<(changes: ModifiedAssetChange[]) => Promise<void>>;
    busy(): boolean;
    updateDbInfos(dbInfo: DBInfo, dbChangeType: DBChangeType): Promise<void>;
    dispatchAssetChanges(assetChange: AssetChangeInfo): void;
    /**
     * 从 asset-db 获取所有数据并构建，包含 ts 和 js 脚本。
     * AssetChange format:
     *  {
     *      type: AssetChangeType.add,
            uuid: assetInfo.uuid,
            filePath: assetInfo.file,
            url: getURL(assetInfo),
            isPluginScript: isPluginScript(meta || assetInfo.meta!),
     *  }
     * @param assetChanges 资源变更列表
     * @param taskId 任务ID，用于跟踪任务状态
     */
    build(changeInfos?: AssetChangeInfo[], taskId?: string): Promise<void>;
    clearCache(): Promise<void>;
    getQuickPackLoaderContext(targetName: TargetName): any;
    isReady(targetName: TargetName): boolean | undefined;
    /**
     * 获取当前正在执行的编译任务ID
     * @returns 任务ID，如果没有正在执行的任务则返回null
     */
    getCurrentTaskId(): string | null;
    queryScriptDeps(queryPath: string): string[];
    queryScriptUsers(queryPath: string): string[];
    shutDown(): Promise<void>;
    private _dbInfos;
    private _tsBuilder;
    private _clearing;
    private _targets;
    private _logger;
    private _statsQuery;
    private readonly _assetDbInterop;
    private _assetChangeQueue;
    private _building;
    private _featureChanged;
    private _beforeBuildTasks;
    private _depsGraph;
    private _needUpdateDepsCache;
    private _usedGraphCache;
    private _depsGraphCache;
    private static _cceModuleMap;
    private static _importRestrictions;
    private _init;
    private _features;
    private _currentTaskId;
    private constructor();
    set features(features: string[]);
    init(features: string[]): Promise<void>;
    generateDeclarations(): Promise<void>;
    querySharedSettings(): Promise<SharedSettings>;
    destroyed(): Promise<void>;
    private _warnMissingTarget;
    /**
     * 开始一次构建。
     * @param taskId 任务ID，用于跟踪任务状态
     */
    private _startBuild;
    private static _createIncrementalRecord;
    private static _validateIncrementalRecord;
    private static _getEngineFeaturesShippedInEditor;
    private _syncEngineFeatures;
    private static _getEngineIndexModuleSource;
    /**
     * 将 depsGraph 从 file 协议转成 db 路径协议。
     * 并且过滤掉一些外部模块。
     */
    private _transformDepsGraph;
}
type TargetName = string;
export {};
