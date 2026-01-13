import { IAsset } from '../../../assets/@types/protected';
import { BundleCompressionType, IBuildPaths, IBuildOptionBase, IBundleConfig, ISettings, UUID, IBuildSceneItem } from '../public';
import { BuilderCache } from './asset-manager';
import { ImportMap, ImportMapWithImports } from './import-map';
import { IAssetInfo, IImportMapOptions, IInternalBuildOptions, IBuildSeparateEngineResult, IBuildResultSuccess, ITransformOptions } from './options';
import { IPacInfo } from './texture-packer';
export interface TextureCompress {
    platform: string;
    init(): Promise<void>;
    updateUserConfig(): Promise<void>;
    addTask(assetInfo: IAssetInfo): IImageTaskInfo;
    run(): Promise<void>;
}
/**
 * 构建内置的脚本编译模块，后续会开放更多的接口，供平台使用
 */
export declare class ScriptBuilder {
    static outputImportMap(importMap: ImportMap, options: IImportMapOptions): Promise<void>;
}
export interface IBundleManager {
    bundleMap: Record<string, IBundle>;
    bundles: IBundle[];
    destDir: string;
    scriptBuilder: ScriptBuilder;
    packResults: IPacInfo[];
    cache: BuilderCache;
    hookMap: Record<string, string>;
    buildAsset(): Promise<void>;
    initBundle(): Promise<void>;
    initAsset(): Promise<void>;
    buildScript(): Promise<any>;
    outputBundle(): Promise<void>;
    bundleDataTask(): Promise<void>;
    runPluginTask(hookName: string): Promise<void>;
    break(reason: string): void;
}
export interface IBuildTemplate {
    query(name: string): string | null;
    initUrl(relativeUrl: string, name?: string): string | undefined;
    copyTo(dest: string): Promise<void>;
    findFile(dest: string): string | undefined;
    isEnable: boolean;
}
export interface InternalBuildResult {
    settings: ISettings;
    scriptPackages: string[];
    pluginVers: Record<UUID, string>;
    pluginScripts: Array<{
        uuid: string;
        url: string;
        file: string;
    }>;
    compressImageResult: ICompressImageResult;
    importMap: ImportMapWithImports;
    rawOptions: IBuildOptionBase;
    paths: IBuildPaths;
    compileOptions?: any;
    separateEngineResult?: IBuildSeparateEngineResult;
}
export interface ImageCompressTask {
    src: string;
    mipmapFiles?: string[];
    presetId: string;
    compressOptions: Record<string, any>;
    dest?: string[];
    suffix?: string[];
    mtime?: any;
}
export interface IImageTaskInfo {
    src: string;
    presetId: string;
    hasAlpha: boolean;
    mtime: string | number;
    hasMipmaps: boolean;
    compressOptions: Record<string, any>;
    dest: string[];
    suffix: string[];
    dirty?: boolean;
}
export interface ISuffixMap {
    native: Record<string, string[]>;
    import: Record<string, string[]>;
}
export interface IVersionMap {
    import: Record<UUID, string>;
    native: Record<UUID, string>;
}
export interface IMD5Map {
    'raw-assets': Record<UUID, string>;
    import: Record<UUID, string>;
    plugin?: Record<UUID, string>;
}
export interface IAtlasResult {
    assetsToImage: Record<string, string>;
    imageToAtlas: Record<string, string>;
    atlasToImages: Record<string, string[]>;
}
export interface IBuildUtils {
    /**
     * 检查是否全局安装了 nodejs
     */
    isInstallNodeJs: () => Promise<boolean>;
    /**
     * 获取相对路径接口
     * 返回 / 拼接的相对路径
     */
    relativeUrl: (from: string, to: string) => string;
    transformCode: (code: string, options: ITransformOptions) => Promise<string>;
    resolveToRaw: (path: string) => string;
}
export interface IBuilder {
    cache: BuilderCache;
    result: InternalBuildResult;
    options: IInternalBuildOptions;
    bundleManager: IBundleManager;
    hooksInfo: IBuildHooksInfo;
    buildTemplate: IBuildTemplate;
    buildExitRes: IBuildResultSuccess;
    id: string;
    utils: IBuildUtils;
    updateProcess(message: string, increment?: number): void;
    break(reason: string): void;
}
export interface IBuildStageTask {
    buildExitRes: IBuildResultSuccess;
    options: IBuildOptionBase;
    buildTaskOptions?: IBuildOptionBase;
    run(): Promise<boolean>;
    saveOptions(): Promise<void>;
}
export interface IBuildHooksInfo {
    pkgNameOrder: string[];
    infos: Record<string, {
        path: string;
        internal: boolean;
    }>;
}
export interface IBundle {
    readonly scenes: IBuildSceneItem[];
    readonly assets: UUID[];
    readonly assetsWithoutRedirect: UUID[];
    readonly scripts: UUID[];
    readonly rootAssets: UUID[];
    readonly isSubpackage: boolean;
    root: string;
    dest: string;
    importBase: string;
    nativeBase: string;
    scriptDest: string;
    name: string;
    priority: number;
    compressionType: BundleCompressionType;
    assetVer: IVersionMap;
    version: string;
    readonly isRemote: boolean;
    redirect: Record<UUID, string>;
    deps: Set<string>;
    groups: IGroup[];
    configOutPutName: string;
    config: IBundleConfig;
    readonly isZip: boolean;
    zipVer: string;
    compressRes: Record<string, string[]>;
    atlasRes: IAtlasResult;
    compressTask: Record<UUID, IImageTaskInfo>;
    _rootAssets: Set<UUID>;
    _scenes: Record<string, IBuildSceneItem>;
    _scripts: Set<UUID>;
    _assets: Set<UUID>;
    output: boolean;
    md5Cache: boolean;
    debug: boolean;
    paths: Record<string, string[]>;
    build(): void;
    initConfig(): void;
    initAssetPaths(): Promise<void>;
    /**
     * 添加根资源，此方法会递归添加子资源的数据支持普通资源与脚本资源
     * @param asset
     * @returns
     */
    addRootAsset(asset: IAsset): void;
    addAsset(asset: IAsset): void;
    /**
     * 添加参与 Bundle 打包的脚本资源，最终输出到 index.js 内
     * 需要提前判断脚本资源类型
     * @param asset
     * @returns
     */
    addScript(asset: IAsset): void;
    removeAsset(asset: UUID): void;
    addRedirect(asset: UUID, redirect: string): void;
    addAssetWithUuid(asset: UUID): void;
    getRedirect(uuid: UUID): string | undefined;
    addGroup(type: IJSONGroupType, uuids: UUID[], name?: string): void;
    addToGroup(type: IJSONGroupType, uuid: UUID): void;
    removeFromGroups(uuid: UUID): void;
    containsAsset(uuid: string, deep?: boolean): boolean;
}
export type ICompressImageResult = Record<UUID, {
    formats: string[];
    files: string[];
}>;
export interface IGroup {
    name: string;
    type: IJSONGroupType;
    uuids: UUID[];
}
export type IJSONGroupType = 'NORMAL' | 'TEXTURE' | 'IMAGE' | 'BIN';
export interface IDefaultGroup {
    assetUuids: UUID[];
    scriptUuids: UUID[];
    jsonUuids: UUID[];
}
export interface IPreviewSettingsResult {
    settings: ISettings;
    script2library: Record<string, string>;
    bundleConfigs: IBundleConfig[];
}
