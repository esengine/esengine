/**
 * settings.js 里定义的数据
 */
import { ICustomJointTextureLayout, ISplashSetting } from '../../../engine/@types/public';
import { UUID, IPhysicsConfig, IOrientation } from './options';
import { ITextureCompressType, ITextureCompressFormatType, ICustomConfig } from './texture-compress';
export interface ISettings {
    CocosEngine: string;
    engine: {
        debug: boolean;
        macros: Record<string, any>;
        customLayers: {
            name: string;
            bit: number;
        }[];
        sortingLayers: {
            id: number;
            name: string;
            value: number;
        }[];
        platform: string;
        engineModules?: string[];
        builtinAssets: string[];
    };
    physics?: IPhysicsConfig;
    rendering: {
        renderPipeline: string;
        renderMode?: number;
        effectSettingsPath?: string;
        customPipeline?: boolean;
    };
    assets: {
        server: string;
        remoteBundles: string[];
        bundleVers: Record<string, string>;
        preloadBundles: {
            bundle: string;
            version?: string;
        }[];
        importBase?: string;
        nativeBase?: string;
        subpackages: string[];
        preloadAssets: string[];
        jsbDownloaderMaxTasks?: number;
        jsbDownloaderTimeout?: number;
        projectBundles: string[];
        downloadMaxConcurrency?: number;
    };
    plugins: {
        jsList: string[];
    };
    scripting: {
        scriptPackages?: string[];
    };
    launch: {
        launchScene: string;
    };
    screen: {
        frameRate?: number;
        exactFitScreen: boolean;
        orientation?: IOrientation;
        designResolution: ISettingsDesignResolution;
    };
    splashScreen?: ISplashSetting;
    animation: {
        customJointTextureLayouts?: ICustomJointTextureLayout[];
    };
    profiling?: {
        showFPS: boolean;
    };
}
export interface IPackageInfo {
    name: string;
    path: string;
    uuids: UUID[];
}
export interface ISettingsDesignResolution {
    width: number;
    height: number;
    policy: number;
}
interface IAssetPathBase {
    bundleName?: string;
    redirect?: string;
}
export interface IRawAssetPathInfo extends IAssetPathBase {
    raw: string[];
}
export declare interface IAssetPathInfo extends IAssetPathBase {
    raw?: string[];
    import?: string;
    /**
     * @deprecated please use `import` instead
     */
    json?: string;
    /**
     * @deprecated please use `import` instead
     */
    bin?: string;
    groupIndex?: number;
}
/**
 * @deprecated please use `IImportAssetPathInfo` instead
 */
export type IJsonPathInfo = IImportAssetPathInfo;
export interface IImportAssetPathInfo extends IAssetPathBase {
    import?: string;
    /**
     * @deprecated please use `import` instead
     */
    json?: string;
    /**
     * @deprecated please use `import` instead
     */
    bin?: string;
    groupIndex?: number;
}
export interface IBuildPaths {
    dir: string;
    readonly output: string;
    effectBin?: string;
    settings: string;
    systemJs?: string;
    engineDir?: string;
    polyfillsJs?: string;
    assets: string;
    subpackages: string;
    remote: string;
    bundleScripts: string;
    applicationJS: string;
    compileConfig: string;
    importMap: string;
    engineMeta: string;
    tempDir: string;
    plugins: Record<string, string>;
    hashedMap: Record<string, string>;
    projectRoot: string;
}
export declare class IBuildResult {
    dest: string;
    paths: IBuildPaths;
    settings?: ISettings;
    /**
     * 指定的 uuid 资源是否包含在构建资源中
     */
    containsAsset: (uuid: string) => boolean;
    /**
     * 获取指定 uuid 原始资源的存放路径（不包括序列化 json）
     * 自动图集的小图 uuid 和自动图集的 uuid 都将会查询到合图大图的生成路径
     * 实际返回多个路径的情况：查询 uuid 为自动图集资源，且对应图集生成多张大图，纹理压缩会有多个图片格式路径
     */
    getRawAssetPaths: (uuid: string) => IRawAssetPathInfo[];
    /**
     * @deprecated please use getImportAssetPaths instead
     * 获取指定 uuid 资源的序列化 json 路径信息
     */
    getJsonPathInfo: (uuid: string) => IImportAssetPathInfo[];
    getImportAssetPaths: (uuid: string) => IImportAssetPathInfo[];
    /**
     * 获取指定 uuid 资源的路径相关信息
     * @return Array<{raw?: string | string[]; import?: string; groupIndex?: number;}>
     * @return.raw: 该资源源文件的实际存储位置，存在多个为数组，不存在则为空
     * @return.import: 该资源序列化数据的实际存储位置，不存在为空，可能是 .bin 或者 .json 格式
     * @return.groupIndex: 若该资源的序列化数据在某个分组内，这里标识在分组内的 index，不存在为空
     */
    getAssetPathInfo: (uuid: string) => IAssetPathInfo[];
}
export interface IBundleConfig {
    importBase: string;
    nativeBase: string;
    name: string;
    deps: string[];
    uuids: UUID[];
    paths: Record<string, any[]>;
    scenes: Record<string, UUID | number>;
    packs: Record<UUID, Array<UUID | number>>;
    versions: {
        import: Array<UUID | number>;
        native: Array<UUID | number>;
    };
    redirect: Array<string | number>;
    debug: boolean;
    types?: string[];
    encrypted?: boolean;
    isZip?: boolean;
    zipVersion?: string;
    extensionMap: Record<string, Array<UUID | number>>;
    /**
     * 是否有需要预加载的脚本，默认为 `true`。
     */
    hasPreloadScript: boolean;
    dependencyRelationships: Record<string, Array<UUID | number>>;
}
export interface ICompressConfig {
    src: string;
    mipmapFiles?: string[];
    dest: string;
    compressOptions: Record<string, any>;
    format: ITextureCompressType;
    customConfig?: ICustomConfig;
    uuid: string;
    suffix: string;
    formatType: ITextureCompressFormatType;
}
export {};
