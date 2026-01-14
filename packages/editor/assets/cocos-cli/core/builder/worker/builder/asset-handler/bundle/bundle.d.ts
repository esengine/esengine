import { Asset, VirtualAsset } from '@cocos/asset-db';
import { BundleCompressionType, BundleFilterConfig, IBundleConfig, IBuildSceneItem } from '../../../../@types';
import { IVersionMap, IGroup, IAtlasResult, IImageTaskInfo, IBundleInitOptions, IJSONGroupType } from '../../../../@types/protected';
import { IAsset } from '../../../../../assets/@types/protected';
export declare class Bundle {
    get scenes(): IBuildSceneItem[];
    get assets(): string[];
    get assetsWithoutRedirect(): string[];
    get scripts(): string[];
    get rootAssets(): string[];
    get isSubpackage(): boolean;
    root: string;
    dest: string;
    importBase: string;
    nativeBase: string;
    scriptDest: string;
    name: string;
    priority: number;
    compressionType: BundleCompressionType;
    assetVer: IVersionMap;
    zipVer: string;
    version: string;
    isRemote: boolean;
    isZip: boolean;
    redirect: Record<string, string>;
    deps: Set<string>;
    groups: IGroup[];
    bundleFilterConfig?: BundleFilterConfig[];
    output: boolean;
    hasPreloadScript: boolean;
    extensionMap: Record<string, string[]>;
    packs: Record<string, string[]>;
    paths: Record<string, string[]>;
    md5Cache: boolean;
    debug: boolean;
    config: IBundleConfig;
    configOutPutName: string;
    atlasRes: IAtlasResult;
    compressRes: Record<string, string[]>;
    _rootAssets: Set<string>;
    _scenes: Record<string, IBuildSceneItem>;
    _scripts: Set<string>;
    _assets: Set<string>;
    compressTask: Record<string, IImageTaskInfo>;
    _jsonAsset: Set<string>;
    _cconAsset: Set<string>;
    _pacAssets: Set<string>;
    constructor(options: IBundleInitOptions);
    /**
     * 添加根资源，此方法会递归添加子资源的数据支持普通资源与脚本资源
     * @param asset
     * @returns
     */
    addRootAsset(asset: Asset | VirtualAsset): void;
    /**
     * 添加参与 Bundle 打包的脚本资源，最终输出到 index.js 内
     * 需要提前判断脚本资源类型
     * @param asset
     * @returns
     */
    addScript(asset: Asset | VirtualAsset): void;
    /**
     * 添加一个资源到该 bundle 中
     */
    addAsset(asset: IAsset): void;
    removeAsset(assetUuid: string): void;
    addRedirect(uuid: string, redirect: string): void;
    addScriptWithUuid(asset: string): void;
    /**
     * 类似图集等资源的 uuid 可能没有 asset info
     * @param asset
     */
    addAssetWithUuid(asset: string): void;
    getRedirect(uuid: string): string | undefined;
    addGroup(type: IJSONGroupType, uuids: string[], name?: string): void;
    addToGroup(type: IJSONGroupType, uuid: string): void;
    removeFromGroups(uuid: string): void;
    /**
     * 初始化 bundle 的 config 数据
     */
    initConfig(): void;
    initAssetPaths(): Promise<void>;
    outputConfigs(): Promise<void>;
    build(): Promise<void>;
    md5Bundle(): Promise<void>;
    /**
     * 对 bundle 内的资源文件进行 md5 处理
     * @returns
     */
    createAssetsMd5(): Promise<void>;
    zipBundle(): Promise<void>;
    compress(): void;
    /**
     * 整理 JSON 分组以及资源路径数据到 config 内
     */
    genPackedAssetsConfig(): Promise<void>;
    /**
     * 指定的 uuid 资源是否包含在构建资源中
     * @param deep 是否深度查找，指定 uuid 的关联资源存在即视为存在 Bundle 包含该资源，例如未生成图集序列化资源但是合图 Image 存在的情况
     */
    containsAsset(uuid: string, deep?: boolean): boolean;
}
