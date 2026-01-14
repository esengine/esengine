import { IBuildPluginConfig, IBuildOptionBase, IDisplayOptions, ISettings, IVerificationRuleMap, PlatformCompressConfig, ITaskState, BundleCompressionType, IConsoleType, MakeRequired, IBuildTaskItemJSON } from '../public';
import { IBundle, InternalBuildResult, IBundleManager, IBuildStageTask, IBuildUtils } from './build-result';
import { IInternalBuildOptions, IInternalBundleBuildOptions } from './options';
import { IPlatformType } from './options';
import { StatsQuery } from '@cocos/ccbuild';
import { IConfigItem } from '../../../base/type';
import { BuilderCache } from '../protected';
export interface IQuickSpawnOption {
    cwd?: string;
    env?: any;
    downGradeWaring?: boolean;
    downGradeLog?: boolean;
    downGradeError?: boolean;
    ignoreLog?: boolean;
    ignoreError?: boolean;
    prefix?: string;
    shell?: boolean;
}
export interface IPackageRegisterInfo {
    config: string;
    platform: string;
    hooks?: string;
    register?: boolean;
}
export type IBuilderRegisterInfo = IPlatformRegisterInfo | IPluginRegisterInfo;
export interface IPlatformRegisterInfo {
    config: IPlatformBuildPluginConfig;
    platform: string;
    path: string;
    hooks?: string;
    pkgName?: string;
    type: 'register';
}
export interface IPluginRegisterInfo {
    config: IInternalBuildPluginConfig;
    platform: string;
    pkgName?: string;
    path: string;
    hooks?: string;
    type: 'plugin';
}
export interface IInternalBuildUtils extends IBuildUtils {
    /**
     * 获取构建出的所有模块或者模块包文件。
     */
    getModuleFiles(result: InternalBuildResult): Promise<string[]>;
    /**
     * 快速开启子进程
     * @param command
     * @param cmdParams
     * @param options
     */
    quickSpawn(command: string, cmdParams: string[], options?: IQuickSpawnOption): Promise<number | boolean>;
    /**
     * 将某个 hash 值添加到某个路径上
     * @param targetPath
     * @param hash
     * @returns
     */
    patchMd5ToPath(targetPath: string, hash: string): string;
    /**
     * 编译脚本，遇到错误将会抛出异常
     * @param contents
     * @param path
     */
    compileJS(contents: Buffer, path: string): string;
}
export type IProcessingFunc = (process: number, message: string, state?: ITaskState) => void;
export interface IBuildManager {
    taskManager: any;
    currentCompileTask: any;
    currentBuildTask: any;
    __taskId: string;
}
export interface IBuildProcessInfo {
    state: ITaskState;
    progress: number;
    message: string;
    id: string;
    options: any;
}
export interface IScriptInfo {
    file: string;
    uuid: string;
}
type ICheckRule = 'pathExist' | 'valid' | 'required' | 'normalName' | 'noChinese' | 'array' | 'string' | 'number' | 'http';
export interface IBuildPanel {
    Vue: any;
    validator: {
        has: (ruleName: string) => boolean;
        checkRuleWithMessage: (ruleName: ICheckRule, val: any, ...arg: any[]) => Promise<string>;
        check: (ruleName: ICheckRule, val: any, ...arg: any[]) => Promise<boolean>;
        checkWithInternalRule: (ruleName: ICheckRule, val: any, ...arg: any[]) => boolean;
        queryRuleMessage: (ruleName: ICheckRule) => string;
    };
}
export interface IBuildWorkerPluginInfo {
    assetHandlers?: string;
    hooks?: Record<string, string>;
    pkgName: string;
    internal: boolean;
    priority: number;
    customBuildStages?: {
        [platform: string]: IBuildStageItem[];
    };
    buildTemplate?: BuildTemplateConfig;
    customIconConfigs?: {
        [platform: string]: IBuildIconItem[];
    };
}
export interface IBuildStagesInfo {
    pkgNameOrder: string[];
    infos: Record<string, IBuildStageItem>;
}
export interface IBuildAssetHandlerInfo {
    pkgNameOrder: string[];
    handles: {
        [pkgName: string]: Function;
    };
}
export type IPluginHookName = 'onBeforeBuild' | 'onAfterInit' | 'onBeforeInit' | 'onAfterInit' | 'onBeforeBuildAssets' | 'onAfterBuildAssets' | 'onBeforeCompressSettings' | 'onAfterCompressSettings' | 'onAfterBuild' | 'onBeforeCopyBuildTemplate' | 'onAfterCopyBuildTemplate' | 'onError';
export type IPluginHook = Record<IPluginHookName, IInternalBaseHooks>;
export declare namespace IInternalHook {
    type throwError = boolean;
    type title = string;
    type onBeforeBuild = IInternalBaseHooks;
    type onBeforeInit = IInternalBaseHooks;
    type onAfterInit = IInternalBaseHooks;
    type onBeforeBuildAssets = IInternalBaseHooks;
    type onAfterBuildAssets = IInternalBaseHooks;
    type onBeforeCompressSettings = IInternalBaseHooks;
    type onAfterCompressSettings = IInternalBaseHooks;
    type onAfterBuild = IInternalBaseHooks;
    type onBeforeCopyBuildTemplate = IInternalBaseHooks;
    type onAfterCopyBuildTemplate = IInternalBaseHooks;
    type onBeforeBundleInit = IInternalBundleBaseHooks;
    type onAfterBundleInit = IInternalBundleBaseHooks;
    type onBeforeBundleDataTask = IInternalBundleBaseHooks;
    type onAfterBundleDataTask = IInternalBundleBaseHooks;
    type onBeforeBundleBuildTask = IInternalBundleBaseHooks;
    type onAfterBundleBuildTask = IInternalBundleBaseHooks;
    type onBeforeRun = IInternalStageTaskHooks;
    type run = IInternalStageTaskHooks;
    type onAfterRun = IInternalStageTaskHooks;
    type onBeforeMake = IInternalStageTaskHooks;
    type make = IInternalStageTaskHooks;
    type onAfterMake = IInternalStageTaskHooks;
}
export interface PlatformPackageOptions {
    [packageName: string]: Record<string, any>;
}
export type IInternalBaseHooks = (options: IInternalBuildOptions, result: InternalBuildResult, cache: BuilderCache, ...args: any[]) => void;
export type IInternalStageTaskHooks = {
    this: IBuildStageTask;
    root: string;
    options: IInternalBuildOptions;
};
export type IInternalBundleBaseHooks = (this: IBundleManager, options: IInternalBundleBuildOptions, bundles: IBundle[], cache: BuilderCache) => void;
export interface IBuildTask {
    handle: (options: IInternalBuildOptions, result: InternalBuildResult, cache: BuilderCache, settings?: ISettings) => {};
    title: string;
    name: string;
}
export type OverwriteCommonOption = 'buildPath' | 'server' | 'polyfills' | 'mainBundleIsRemote' | 'name' | 'sourceMaps' | 'experimentalEraseModules' | 'buildStageGroup';
export interface IBuildStageItem {
    name: string;
    displayName?: string;
    description?: string;
    hidden?: boolean;
    parallelism?: 'none' | 'all' | 'other';
    hook: string;
    requiredBuildOptions?: boolean;
}
export interface IconConfig {
    type: 'icon' | 'image';
    value: string;
}
export interface IPlatformInfo {
    label: string;
    icon?: IconConfig;
}
interface ICustomBuildIconItem extends IconConfig {
    description?: string;
    disabled?: (taskInfo: IBuildTaskItemJSON) => boolean | Promise<boolean>;
}
interface IconConfigWithHook extends ICustomBuildIconItem {
    executeType: 'hook';
    hook: string;
}
export type IBuildIconItem = IconConfigWithHook;
export type ICustomBuildIconInfo = IBuildIconItem & {
    pkgName: string;
};
export type IBuilderConfigItem = IConfigItem & {
    experiment?: boolean;
    hidden?: boolean;
    verifyRules?: string[];
    verifyLevel?: IConsoleType;
};
export interface IInternalBuildPluginConfig extends IBuildPluginConfig {
    doc?: string;
    displayName?: string;
    hooks?: string;
    priority?: number;
    options?: IDisplayOptions;
    verifyRuleMap?: IVerificationRuleMap;
    commonOptions?: Record<string, Partial<IBuilderConfigItem>>;
    internal?: boolean;
    customBuildStages?: Array<IBuildStageItem>;
}
export interface IPlatformBuildPluginConfig extends MakeRequired<IInternalBuildPluginConfig, 'displayName'> {
    platformType: StatsQuery.ConstantManager.PlatformType;
    icon?: IconConfig;
    textureCompressConfig?: PlatformCompressConfig;
    buildTemplateConfig?: BuildTemplateConfig;
    assetBundleConfig?: {
        supportedCompressionTypes: BundleCompressionType[];
        platformType: IPlatformType;
    };
    customIconConfigs?: Array<IBuildIconItem>;
}
export interface BuildTemplateConfig {
    templates: {
        path: string;
        destUrl: string;
    }[];
    displayName?: string;
    version: string;
    dirname?: string;
}
export type ICustomBuildStageDisplayItem = IBuildStageItem & {
    groupItems: IBuildStageItem[];
    inGroup: boolean;
    lock?: boolean;
};
export interface BuildCheckResult {
    error: string;
    newValue: any;
    level: IConsoleType;
}
export type IBuildVerificationFunc = (value: any, options: IBuildOptionBase) => boolean | Promise<boolean>;
export {};
