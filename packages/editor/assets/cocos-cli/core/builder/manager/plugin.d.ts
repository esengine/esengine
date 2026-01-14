import EventEmitter from 'events';
import { Platform, IDisplayOptions, IBuildTaskOption } from '../@types';
import { IInternalBuildPluginConfig, PlatformBundleConfig, IBuildStageItem, BuildCheckResult, BuildTemplateConfig, IPlatformConfig, ITextureCompressConfig, IBuildHooksInfo, IBuildCommandOption, MakeRequired, IBuilderConfigItem, IBuilderRegisterInfo } from '../@types/protected';
export interface InternalPackageInfo {
    name: string;
    path: string;
    buildPath: string;
    doc?: string;
    displayName?: string;
    version: string;
}
type ICustomAssetHandlerType = 'compressTextures';
export declare class PluginManager extends EventEmitter {
    bundleConfigs: Record<string, PlatformBundleConfig>;
    commonOptionConfig: Record<string, Record<string, IBuilderConfigItem & {
        verifyKey: string;
    }>>;
    pkgOptionConfigs: Record<string, Record<string, IDisplayOptions>>;
    platformConfig: Record<string, IPlatformConfig>;
    buildTemplateConfigMap: Record<string, BuildTemplateConfig>;
    configMap: Record<string, Record<string, IInternalBuildPluginConfig>>;
    private builderPathsMap;
    private customBuildStagesMap;
    protected customBuildStages: Record<string, {
        [pkgName: string]: IBuildStageItem[];
    }>;
    private assetHandlers;
    protected readonly pkgPriorities: Record<string, number>;
    packageRegisterInfo: Map<string, InternalPackageInfo>;
    private platformRegisterInfoPool;
    constructor();
    init(): Promise<void>;
    registerAllPlatform(): Promise<void>;
    register(platform: string): Promise<void>;
    checkPlatform(platform: string): boolean;
    private registerPlatform;
    private internalRegister;
    _registerI18n(registerInfo: IBuilderRegisterInfo): void;
    getCommonOptionConfigs(platform: Platform): Record<string, IBuilderConfigItem>;
    getCommonOptionConfigByKey(key: keyof IBuildTaskOption, options: IBuildTaskOption): IBuilderConfigItem | null;
    getPackageOptionConfigByKey(key: string, pkgName: string, options: IBuildTaskOption): IBuilderConfigItem | null;
    getOptionConfigByKey(key: keyof IBuildTaskOption, options: IBuildTaskOption): IBuilderConfigItem | null;
    /**
     * 完整校验构建参数（校验平台插件相关的参数校验）
     * @param options
     */
    checkOptions(options: MakeRequired<IBuildCommandOption, 'platform' | 'mainBundleCompressionType'>): Promise<undefined | IBuildTaskOption>;
    checkCommonOptions(options: IBuildTaskOption): Promise<Record<string, BuildCheckResult>>;
    checkCommonOptionByKey(key: keyof IBuildTaskOption, value: any, options: IBuildTaskOption): Promise<BuildCheckResult>;
    /**
     * 校验构建插件注册的构建参数
     * @param options
     */
    private checkPluginOptions;
    shouldGenerateOptions(platform: Platform | string): boolean;
    /**
     * 获取平台默认值
     * @param platform
     */
    getOptionsByPlatform<P extends Platform | string>(platform: P): Promise<IBuildTaskOption>;
    getTexturePlatformConfigs(): Record<string, ITextureCompressConfig>;
    queryPlatformConfig(): {
        native: string[];
        config: Record<string, IPlatformConfig>;
    };
    /**
     * 获取带有钩子函数的构建阶段任务
     * @param platform
     * @returns
     */
    getBuildStageWithHookTasks(platform: Platform | string, taskName: string): IBuildStageItem | null;
    /**
     * 根据插件权重传参的插件数组
     * @param pkgNames
     * @returns
     */
    private sortPkgNameWidthPriority;
    /**
     * 获取平台插件的构建路径信息
     * @param platform
     */
    getHooksInfo(platform: Platform | string): IBuildHooksInfo;
    getBuildTemplateConfig(platform: string): BuildTemplateConfig;
    /**
     * 根据类型获取对应的执行方法
     * @param type
     * @returns
     */
    getAssetHandlers(type: ICustomAssetHandlerType): {
        pkgNameOrder: string[];
        handles: Record<string, Function>;
    };
}
export declare const pluginManager: PluginManager;
export {};
