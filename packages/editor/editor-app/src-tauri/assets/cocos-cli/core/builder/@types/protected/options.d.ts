import { StatsQuery } from '@cocos/ccbuild';
import * as rollup from 'rollup';
import * as babel from '@babel/core';
import { IPolyFills, IBuildOptionBase, ITaskItemJSON, BundleCompressionType, IBundleOptions, Platform, BundleFilterConfig, MakeRequired, IPlatformType } from '../public';
export { IPlatformType };
import { IAssetInfo as IAssetInfoFromDB, IAssetMeta } from '../../../assets/@types/private';
import { BuiltinBundleName } from './bundle-config';
export type BabelPluginItem = babel.PluginItem;
export type IModules = 'esm' | 'commonjs' | 'systemjs';
export interface ITransformOptions {
    importMapFormat: IModules;
    plugins?: BabelPluginItem[];
    loose?: boolean;
}
export interface IBundleInternalOptions extends IBundleOptions {
    dest: string;
    scriptDest: string;
    priority: number;
    compressionType: BundleCompressionType;
    isRemote: boolean;
    bundleFilterConfig?: BundleFilterConfig[];
}
type PlatformType = StatsQuery.ConstantManager.PlatformType;
type IBuildTimeConstantValue = StatsQuery.ConstantManager.ValueType;
export interface ScriptAssetUserData {
    isPlugin?: boolean;
    isNative?: boolean;
    loadPluginInNative?: boolean;
    loadPluginInWeb?: boolean;
}
export interface fileMap {
    src: string;
    dest: string;
}
export type Physics = 'cannon' | 'ammo' | 'builtin';
export type Url = string;
export type AssetInfoArr = Array<string | number>;
export declare const enum TaskAddResult {
    BUSY = 0,
    SUCCESS = 1,
    PARAM_ERROR = 2
}
export interface IBundleInitOptions extends IBundleOptions {
    root: string;
    name: BuiltinBundleName | string;
    priority: number;
    compressionType: BundleCompressionType;
    isRemote: boolean;
    md5Cache: boolean;
    debug: boolean;
    output?: boolean;
    dest: string;
    scriptDest: string;
}
export interface IBuildScriptParam {
    /**
     * 若存在，表示将 import map 转换为指定的模块格式。
     */
    importMapFormat?: 'commonjs' | 'esm';
    polyfills?: IPolyFills;
    /**
     * 擦除模块结构。当选择后会获得更快的脚本导入速度，但无法再使用模块特性，如 `import.meta`、`import()` 等。
     * @experimental
     */
    experimentalEraseModules?: boolean;
    outputName: string;
    targets?: ITransformTarget;
    system?: {
        preset?: 'web' | 'commonjs-like';
    };
    flags: Record<string, IBuildTimeConstantValue>;
    platform: PlatformType;
    /**
     * 是否开启模块热重载
     * @default false
     */
    hotModuleReload?: boolean;
    commonDir: string;
    bundleCommonChunk: boolean;
}
/**
 * 模块保留选项。
 * - 'erase' 擦除模块信息。生成的代码中将不会保留模块信息。
 * - 'preserve' 保留原始模块信息。生成的文件将和原始模块文件结构一致。
 * - 'facade' 保留原始模块信息，将所有模块转化为一个 SystemJS 模块，但这些模块都打包在一个单独的 IIFE bundle 模块中。
 *   当这个 bundle 模块执行时，所有模块都会被注册。
 *   当你希望代码中仍旧使用模块化的特性（如动态导入、import.meta.url），但又不希望模块零散在多个文件时可以使用这个选项。
 */
export type ModulePreservation = 'erase' | 'preserve' | 'facade';
export interface AssetSerializeOptions {
    'cc.EffectAsset': {
        glsl1: boolean;
        glsl3: boolean;
        glsl4: boolean;
    };
}
export interface ISerializedOptions {
    debug: boolean;
    useCCONB?: boolean;
    useCCON?: boolean;
    _exporting?: boolean;
    dontStripDefault?: boolean;
    'cc.EffectAsset'?: {
        glsl1: boolean;
        glsl3: boolean;
        glsl4: boolean;
    };
}
export interface IBundleBuildOptions {
    buildTaskIds?: string[];
    taskName: string;
    dest: string;
    buildTaskOptions: IBuildOptionBase;
    logDest?: string;
}
export interface TransformOptions {
    /**
     * Babel plugins to excluded. Will be passed to as partial `exclude` options of `@babel/preset-env`.
     */
    excludes?: Array<string | RegExp>;
    /**
     * Babel plugins to included. Will be passed to as partial `include` options of `@babel/preset-env`.
     */
    includes?: Array<string | RegExp>;
    targets?: ITransformTarget;
}
export interface Md5GlobbyPathInfo {
    base: string;
    pattern: string;
}
export interface IMD5Options {
    excludes: string[];
    includes: string[];
    replaceOnly: string[];
    handleTemplateMd5Link: boolean;
}
export interface IScriptOptions {
    transform: TransformOptions;
    debug: boolean;
    sourceMaps: boolean | 'inline';
    hotModuleReload: boolean;
    moduleFormat: rollup.ModuleFormat;
    modulePreservation: ModulePreservation;
    commonDir: string;
    bundleCommonChunk: boolean;
}
export interface IImportMapOptions {
    debug: boolean;
    dest: string;
    importMapFormat?: 'commonjs' | 'esm';
}
export interface IInternalBundleBuildOptions extends MakeRequired<IBuildOptionBase, 'includeModules' | 'macroConfig' | 'engineModulesConfigKey' | 'customPipeline' | 'renderPipeline' | 'designResolution' | 'physicsConfig' | 'flags' | 'taskId'> {
    dest: string;
    buildScriptParam: IBuildScriptParam;
    assetSerializeOptions: AssetSerializeOptions;
    md5CacheOptions: IMD5Options;
    logDest: string;
    platformType: StatsQuery.ConstantManager.PlatformType;
}
export interface IBuildCommandOption extends Partial<IBuildOptionBase> {
    configPath?: string;
    migrate?: boolean;
    skipCheck?: boolean;
}
export interface IInternalBuildOptions extends IInternalBundleBuildOptions {
    dest: string;
    appTemplateData: appTemplateData;
    buildEngineParam: IBuildEngineParam;
    updateOnly: boolean;
    generateCompileConfig?: boolean;
    recompileConfig?: IRecompileConfig;
    resolution: {
        width: number;
        height: number;
        policy: number;
    };
    useCache?: boolean;
    bundleConfigs?: IBundleInternalOptions[];
}
export interface appTemplateData {
    debugMode: boolean;
    renderMode: boolean;
    showFPS: boolean;
    importMapFile?: string;
    resolution: {
        policy: number;
        width: number;
        height: number;
    };
    md5Cache: boolean;
    cocosTemplate?: string;
}
export interface IEngineCachePaths {
    dir: string;
    all: string;
    plugin: string;
    meta: string;
    signatureJSON: string;
    pluginJSON: string;
}
export interface ISignatureConfig {
    md5: string;
    path: string;
}
export interface IBuildSeparateEngineResult {
    paths: IEngineCachePaths;
    importMap: Record<string, string>;
}
/**
 * 引擎分离编译后，默认会生成一份包含全部引擎散文件的目录结构，默认名称为 cocos-js-all
 */
export type IBuildSeparateEngineOptions = Pick<IBuildEngineParam, 'platformType' | 'includeModules' | 'output' | 'nativeCodeBundleMode'> & {
    pluginFeatures?: string[] | 'default' | 'all';
    engine: string;
    platform: string;
    importMapOutFile: string;
    outputLocalPlugin?: boolean;
    pluginName: string;
    useCacheForce?: boolean;
    signatureProvider?: string;
};
export type IEnvLimitModule = Record<string, {
    envList: string[];
    fallback?: string;
}>;
export interface IEngineFeatureQuery {
    all: string[];
    allUnit: string[];
    plugin: string[];
    pluginUnit: string[];
    engineStatsQuery: StatsQuery;
    envLimitModule: IEnvLimitModule;
    _defaultPlugins: string[];
    env: StatsQuery.ConstantManager.ConstantOptions;
    getUnitsOfFeatures(features: string[]): string[];
    filterEngineModules(features: string[]): string[];
}
export type IBuildSeparateEngineCacheOptions = Pick<IBuildSeparateEngineOptions, 'pluginName' | 'engine' | 'platform' | 'platformType' | 'pluginFeatures' | 'nativeCodeBundleMode' | 'signatureProvider' | 'useCacheForce'> & {
    engineFeatureQuery?: IEngineFeatureQuery;
};
export interface IBuildEngineParam {
    entry: string;
    debug: boolean;
    mangleProperties: boolean;
    sourceMaps: boolean | 'inline';
    /**
     * @deprecated please use `platformType` instead
     */
    platform?: PlatformType;
    platformType: PlatformType;
    includeModules: string[];
    engineVersion: string;
    md5Map: string[];
    engineName: string;
    useCache: boolean;
    split?: boolean;
    separateEngineOptions?: Pick<IBuildSeparateEngineOptions, 'useCacheForce' | 'pluginFeatures' | 'outputLocalPlugin' | 'pluginName' | 'signatureProvider'> & {
        checkVersionValid?: boolean;
    };
    targets?: ITransformTarget;
    skip?: boolean;
    nativeCodeBundleMode: 'wasm' | 'asmjs' | 'both';
    assetURLFormat?: 'relative-from-out' | 'relative-from-chunk' | 'runtime-resolved';
    baseUrl?: string;
    flags?: Record<string, IBuildTimeConstantValue>;
    output: string;
    preserveType?: boolean;
    wasmCompressionMode?: 'brotli';
    enableNamedRegisterForSystemJSModuleFormat?: boolean;
    inlineEnum?: boolean;
    loose?: boolean;
}
export type ITransformTarget = string | string[] | Record<string, string>;
export interface IAssetInfo extends IAssetInfoFromDB {
    temp?: string;
    dirty?: boolean;
    meta: IAssetMeta;
    subAssets: Record<string, IAssetInfo>;
    mtime: number;
}
export interface IRecompileConfig {
    enable: boolean;
    generateAssets: boolean;
    generateScripts: boolean;
    generateEngine: boolean;
    generateEngineByCache: boolean;
}
export interface IStageTaskItemJSON extends ITaskItemJSON {
    stage: string;
    options: IBuildStageOptions;
    type: 'build-stage';
}
export interface IBundleTaskItemJSON extends ITaskItemJSON {
    options: IBundleBuildOptions;
    type: 'bundle';
}
export interface IBuildStageOptions {
    dest: string;
    platform: Platform | string;
    taskName?: string;
}
export declare const enum BuildExitCode {
    PARAM_ERROR = 32,
    BUILD_FAILED = 34,
    BUILD_SUCCESS = 0,
    BUILD_BUSY = 37,
    STATIC_COMPILE_ERROR = 38,
    UNKNOWN_ERROR = 50
}
export interface IBuildResultSuccess {
    code: BuildExitCode.BUILD_SUCCESS;
    dest: string;
    custom: Record<string, any>;
}
export interface IBuildResultFailed {
    code: Exclude<BuildExitCode, BuildExitCode.BUILD_SUCCESS>;
    reason?: string;
}
export type IBuildResultData = IBuildResultSuccess | IBuildResultFailed;
export interface ExecuteHookTaskOption {
    pkgName: string;
    hook: string;
    options: IBuildOptionBase;
    [x: string]: any;
}
