import type { TextureCompress } from '../texture-compress';
import type { PacInfo } from '../texture-packer/pac-info';
import { ScriptBuilder } from '../script';
import { BuiltinBundleName, BundleCompressionTypes } from '../../../../share/bundle-utils';
import { BuilderAssetCache } from '../../manager/asset';
import { BuildTaskBase } from '../../manager/task-base';
import { IBundleManager, IBuilder, IInternalBundleBuildOptions, IBuildHooksInfo, IBundle, IBuildOptionBase } from '../../../../@types/protected';
import { IPluginScriptInfo } from '../../../../../scripting/interface';
export declare class BundleManager extends BuildTaskBase implements IBundleManager {
    static BuiltinBundleName: typeof BuiltinBundleName;
    static BundleConfigs: Record<string, Record<string, {
        isRemote: boolean;
        compressionType: BundleCompressionTypes;
    }>>;
    private _task?;
    options: IInternalBundleBuildOptions;
    destDir: string;
    hooksInfo: IBuildHooksInfo;
    bundleMap: Record<string, IBundle>;
    bundles: IBundle[];
    _pacAssets: string[];
    _bundleGroupInPriority?: Array<IBundle[]>;
    imageCompressManager?: TextureCompress;
    scriptBuilder: ScriptBuilder;
    packResults: PacInfo[];
    cache: BuilderAssetCache;
    hookMap: {
        onBeforeBundleInit: string;
        onAfterBundleInit: string;
        onBeforeBundleDataTask: string;
        onAfterBundleDataTask: string;
        onBeforeBundleBuildTask: string;
        onAfterBundleBuildTask: string;
    };
    pipeline: (string | Function)[];
    get bundleGroupInPriority(): IBundle[][];
    static internalBundlePriority: Record<string, number>;
    private constructor();
    static create(options: IBuildOptionBase, task?: IBuilder): Promise<BundleManager>;
    loadScript(scriptUuids: string[], pluginScripts: IPluginScriptInfo[]): Promise<void>;
    /**
     * 初始化项目设置的一些 bundle 配置信息
     */
    static initStaticBundleConfig(): Promise<void>;
    getUserConfig(ID?: string): {
        isRemote: boolean;
        compressionType: BundleCompressionTypes;
    } | null;
    /**
     * 对 options 上的数据做补全处理
     */
    initOptions(): Promise<void>;
    clearBundleDest(): void;
    /**
     * 初始化整理资源列表
     */
    initAsset(): Promise<void>;
    initBundleConfig(): Promise<void>;
    buildAsset(): Promise<void>;
    /**
     * 独立构建 Bundle 时调用
     * @returns
     */
    run(): Promise<boolean>;
    outputBundle(): Promise<void>;
    private addBundle;
    private getDefaultBundleConfig;
    /**
     * 根据参数初始化一些信息配置，整理所有的 bundle 分组信息
     */
    initBundle(): Promise<void>;
    /**
     * 初始化内置 Bundle（由于一些历史的 bundle 行为配置，内置 Bundle 的配置需要单独处理）
     */
    private initInternalBundleConfigs;
    /**
     * 填充成完整可用的项目 Bundle 配置（传入自定义配置 > Bundle 文件夹配置 > 默认配置）
     * @param customConfig
     * @returns IBundleInitOptions | null
     */
    private patchProjectBundleConfig;
    /**
     * 初始化 bundle 分组内的根资源信息
     * 初始化 bundle 内的各项不同的处理任务
     */
    private initBundleRootAssets;
    /**
     * 按照 Bundle 优先级整理 Bundle 的资源列表
     */
    private initBundleShareAssets;
    /**
     * 根据不同的选项做不同的 bundle 任务注册
     */
    bundleDataTask(): Promise<void>;
    /**
     * 纹理压缩处理
     * @returns
     */
    private compressImage;
    /**
     * 执行自动图集任务
     */
    private packImage;
    /**
     * 编译项目脚本
     */
    buildScript(): Promise<any>;
    /**
     * 输出所有的 bundle 资源，包含脚本、json、普通资源、纹理压缩、图集等
     */
    private outputAssets;
    handleHook(func: Function, internal: boolean, ...args: any[]): Promise<void>;
    runAllTask(): Promise<void>;
    runBuildTask(handle: Function, increment: number): Promise<void>;
}
