import { ITextureCompressPlatform, ITextureCompressType, PlatformCompressConfig } from './texture-compress';
import { StatsQuery } from '@cocos/ccbuild';
import { EngineInfo, IEngineConfig } from '../../../engine/@types/public';
export type IPlatformType = 'native' | 'miniGame' | 'web';
export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type ISortType = 'taskName' | 'createTime' | 'platform' | 'buildTime';
export interface IPhysicsConfig {
    gravity: IVec3Like;
    allowSleep: boolean;
    sleepThreshold: number;
    autoSimulation: boolean;
    fixedTimeStep: number;
    maxSubSteps: number;
    defaultMaterial?: string;
    useNodeChains: boolean;
    collisionMatrix: ICollisionMatrix;
    physicsEngine: string;
    physX?: {
        notPackPhysXLibs: boolean;
        multiThread: boolean;
        subThreadCount: number;
        epsilon: number;
    };
}
export interface ICollisionMatrix {
    [x: string]: number;
}
export interface IVec3Like {
    x: number;
    y: number;
    z: number;
}
export interface IPhysicsMaterial {
    friction: number;
    rollingFriction: number;
    spinningFriction: number;
    restitution: number;
}
export type IConsoleType = 'log' | 'warn' | 'error' | 'debug' | 'info' | 'success' | 'ready' | 'start';
export type BreakType = 'cancel' | 'crashed' | 'refreshed' | 'interrupted' | '';
export type ICustomConsoleType = IConsoleType | 'group' | 'groupEnd' | 'groupCollapsed';
export interface IConsoleMessage {
    type: ICustomConsoleType;
    value: string;
    num: number;
    time: string;
}
export interface IPlatformConfig {
    texture: PlatformCompressConfig;
    type: IPlatformType;
    platformType: StatsQuery.ConstantManager.PlatformType;
    name: string;
    createTemplateLabel: string;
}
export interface IBinGroupConfig {
    enable: boolean;
    threshold: number;
}
export interface IBuildCacheUseConfig {
    serializeData?: boolean;
    engine?: boolean;
    textureCompress?: boolean;
    autoAtlas?: boolean;
}
export interface IBuildCommonOptions {
    /**
     * 构建任务 id
     */
    taskId?: string;
    /**
     * 构建任务名称，用于日志表示提示，默认为 outputName 字段值
     */
    taskName?: string;
    /**
     * 指定的构建日志输出地址
     */
    logDest?: string;
    /**
     * 游戏名称, 默认为项目名称
     */
    name: string;
    /**
     * 构建输出名称，默认为平台名称
     */
    outputName: string;
    /**
     * 构建后的游戏生成文件夹
     */
    buildPath: string;
    /**
     * 构建平台
     * @default 'web-mobile'
     */
    platform: Platform | string;
    /**
     * 构建场景列表，默认为全部场景
     */
    scenes?: IBuildSceneItem[];
    /**
     * 是否跳过纹理压缩
     * @default false
     */
    skipCompressTexture: boolean;
    /**
     * 是否自动合图
     * @default true
     */
    packAutoAtlas: boolean;
    /**
     * 是否生成 sourceMap
     * @default false
     * @description 将已转换的代码映射到源码，以便可以直接查看和调试源码，定位问题。<br><b>【关闭】</b>: 关闭 source map 的生成。这在生产环境中用于减少开发时的资源消耗和提高性能，但会牺牲代码可维护性和调试能力。<br><b>【启用(内联)】</b>: 选择此选项时，source map 信息将作为数据 URI 内联在生成的代码中，通常作为注释。这可以减少 HTTP 请求，但可能会增加生成文件的大小。<br><b>【启用 (独立文件)】</b>: 当用户选择此选项时，将会为转换后的代码生成一个源代码与转换代码之间的映射文件，该文件是独立的，并与主文件分开存储。这有助于在开发工具中跟踪源代码。
     */
    sourceMaps: boolean | 'inline';
    /**
     * 是否使用实验性 eraseModules
     * @default false
     */
    experimentalEraseModules: boolean;
    /**
     * 在 Bundle 中嵌入公共脚本
     * @description 在 Bundle 中包含所有依赖的公共脚本，确保 Bundle 可以被跨项目单独加载。此选项仅在只构建 Bundle 时生效，正常构建时将默认禁用。
     * 【未勾选时】在构建 Bundle 时，会将不同 Bundle 之间公用的一些 helper 之类的内容生成在 src/chunk 内的 bundle.js 内，减少整体脚本的体积。但这样构建出来的 Bundle 是和项目相耦合的，无法跨项目复用。
     * 【勾选时】不再提取 Bundle 依赖的公共 JS 库内而是直接构建在 Bundle 的内部。这样的 Bundle 可以跨项目使用（因为所需的脚本都在 Bundle 的内部，而引用相同代码的 Bundle 可能会有重复的部分），缺陷是由于脚本资源都在 Bundle 内部，因此最终的 Bundle 体积会增大。
     */
    bundleCommonChunk: boolean;
    /**
     * 设置打开游戏后进入的第一个场景，db url 格式
     * @default 默认为场景列表的第一个场景
     */
    startScene: string;
    /**
     * 是否是调试模式
     * @default false
     */
    debug: boolean;
    mangleProperties: boolean;
    inlineEnum: boolean;
    /**
     * MD5 缓存
     * @default false
     * @description 给构建后的所有资源文件名将加上 MD5 信息，解决 CDN 资源缓存问题
     */
    md5Cache: boolean;
    /**
     * JavaScript Polyfills
     * @description 实现运行环境并不支持的 JavaScript 标准库
     */
    polyfills?: IPolyFills;
    buildScriptTargets?: string;
    mainBundleCompressionType: BundleCompressionType;
    mainBundleIsRemote: boolean;
    server?: string;
    startSceneAssetBundle: boolean;
    bundleCommonJs?: string;
    binGroupConfig?: IBinGroupConfig;
    moveRemoteBundleScript: boolean;
    useSplashScreen?: boolean;
    /**
     * 是否是预览进程发送的构建请求。
     * @default false
    */
    preview?: boolean;
    stage?: string;
    buildMode?: 'normal' | 'bundle' | 'script';
    nextStages?: string[];
    packages: Record<string, any>;
    nativeCodeBundleMode: 'wasm' | 'asmjs' | 'both';
    wasmCompressionMode?: 'brotli';
    buildBundleOnly?: boolean;
    bundleConfigs?: IBundleOptions[];
    /**
     * @deprecated please use engineModulesConfigKey
     */
    overwriteProjectSettings?: {
        macroConfig?: {
            cleanupImageCache: string;
        };
        includeModules?: {
            physics?: 'inherit-project-setting' | string;
            'physics-2d'?: 'inherit-project-setting' | string;
            'gfx-webgl2'?: 'inherit-project-setting' | 'on' | 'off';
            [key: string]: string | undefined;
        };
    };
}
export interface OverwriteProjectSettings extends IEngineConfig {
    engineInfo: EngineInfo;
}
export interface IBuildOptionBase extends IBuildCommonOptions, OverwriteProjectSettings {
    engineModulesConfigKey?: string;
    useCacheConfig?: IBuildCacheUseConfig;
    taskName: string;
}
export interface BundleFilterConfig {
    range: 'include' | 'exclude';
    type: 'asset' | 'url';
    patchOption?: {
        patchType: 'glob' | 'beginWith' | 'endWith' | 'contain';
        value: string;
    };
    assets?: string[];
}
export interface IBundleOptions {
    root: string;
    priority?: number;
    compressionType?: BundleCompressionType;
    isRemote?: boolean;
    output?: boolean;
    name: string;
    dest?: string;
    scriptDest?: string;
    bundleFilterConfig?: BundleFilterConfig[];
}
export interface IBundleTaskOption extends IBuildOptionBase {
    dest: string;
}
export type UUID = string;
/**
 * 构建使用的场景的数据
 */
export interface IBuildSceneItem {
    url: string;
    uuid: string;
}
export interface IPolyFills {
    /**
     * True if async functions polyfills(i.e. regeneratorRuntime) needs to be included.
     * You need to turn on this field if you want to use async functions in language.
     */
    asyncFunctions?: boolean;
    /**
     * If true, [core-js](https://github.com/zloirock/core-js) polyfills are included.
     * The default options of [core-js-builder](https://github.com/zloirock/core-js/tree/master/packages/core-js-builder)
     * will be used to build the core-js.
     */
    coreJs?: boolean;
    targets?: string;
}
export interface IBuildSystemJsOption {
    dest: string;
    platform: string;
    debug: boolean;
    sourceMaps: boolean | 'inline';
    hotModuleReload?: boolean;
}
interface ICompressPresetConfig {
    name: string;
    options: Record<ITextureCompressPlatform, Record<ITextureCompressType, {
        quality: number | string;
    }>>;
}
export interface ITextureCompressConfigs {
    userPreset: Record<string, ICompressPresetConfig>;
    genMipmaps: boolean;
    customConfigs: Record<string, ICompressPresetConfig>;
}
export type Platform = InternalPlatform | string;
export type InternalPlatform = 'web-desktop' | 'web-mobile' | 'mac' | 'ios' | 'android' | 'windows';
export type BundleCompressionType = 'none' | 'merge_dep' | 'merge_all_json' | 'subpackage' | 'zip';
export type IBuildStage = 'build' | 'bundle' | 'make' | 'run' | string;
export type ITaskState = 'waiting' | 'success' | 'failure' | 'cancel' | 'processing' | 'none';
export interface ITaskItemJSON {
    id: string;
    progress: number;
    state: ITaskState;
    message: string;
    detailMessage?: string;
    time: string;
}
export interface IBuildTaskItemJSON extends ITaskItemJSON {
    stage: 'build' | string;
    options: IBuildOptionBase;
    dirty: boolean;
    rawOptions?: IBuildOptionBase;
    type: 'build';
}
export type IOrientation = 'auto' | 'landscape' | 'portrait';
import { IOptions as webDesktopOptions } from '../../platforms/web-desktop/type';
export { webDesktopOptions };
import { IOptions as webMobileOptions } from '../../platforms/web-mobile/type';
export { webMobileOptions };
import { IOptions as windowsOptions } from '../../platforms/windows/type';
export { windowsOptions };
import { IOptions as nativeOptions } from '../../platforms/native-common/type';
import { IInternalBuildOptions } from '../protected';
export { nativeOptions };
/**
 * 构建所需的完整参数
 */
export interface IBuildTaskOption<P extends Platform = Platform> extends IBuildOptionBase {
    platform: P;
    packages: Record<P, PlatformPackageOptionMap[P]>;
}
export interface PlatformPackageOptionMap {
    'web-desktop': webDesktopOptions;
    'web-mobile': webMobileOptions;
    'windows': windowsOptions;
    'mac': nativeOptions;
    'ios': nativeOptions;
    'android': nativeOptions;
    [platform: string]: any;
}
export type IInterBuildTaskOption<P extends Platform = Platform> = IInternalBuildOptions & {
    platform: P;
    packages: Record<P, PlatformPackageOptionMap[P]>;
};
