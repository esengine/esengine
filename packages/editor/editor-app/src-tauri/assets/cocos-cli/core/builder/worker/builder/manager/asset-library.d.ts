import { CCON } from 'cc/editor/serialization';
import { Asset as CCAsset } from 'cc';
import { IAssetInfo, ISerializedOptions } from '../../../@types/protected';
import { IAsset, QueryAssetsOption, IAssetInfo as IAssetInfoFromDB } from '../../../../assets/@types/protected';
/**
 * 资源管理器，主要负责资源的缓存更新
 * TODO 需要迁移到 asset-db 里面
 */
declare class BuildAssetLibrary {
    private assetMap;
    get assets(): IAsset[];
    private depend;
    private dependedMap;
    private meta;
    private cacheTempDir;
    private assetMtimeCache;
    private assetMtimeCacheFile;
    useCache: boolean;
    private hasMissingClassUuids;
    private hasMissingAssetsUuids;
    pathToUuid: Record<string, string>;
    private defaultSerializedOptions;
    initMtimeCache(): Promise<void>;
    saveMtimeCache(): Promise<void>;
    /**
     * 资源管理器初始化
     */
    init(): Promise<void>;
    /**
     * 查询全部资源，包括子资源
     * @returns
     */
    queryAllAssets(): IAsset[];
    /**
     * 获取资源的缓存目录
     * @param uuid
     */
    getAssetTempDirByUuid(uuid: string): string;
    /**
     * 删除一个资源的缓存
     * @param uuid
     */
    clearAsset(uuid: string): void;
    /**
     * 查询一个资源的 meta 数据
     * @param uuid
     */
    getMeta(uuid: string): any;
    addMeta(uuid: string, meta: any): void;
    getAsset(uuid: string): IAsset;
    queryAssetsByOptions(options: QueryAssetsOption): IAsset[];
    queryAssetUsers(uuid: string): Promise<string[]>;
    /**
 * 获取一个资源的 asset info 数据
 * @param uuid
 */
    getAssetInfo(uuid: string, dataKeys?: (keyof IAssetInfoFromDB)[]): IAssetInfo;
    /**
     * 查询一个资源依赖的其他资源的方法
     * @param uuid
     */
    getDependUuids(uuid: string): Promise<string[]>;
    /**
     * 深度获取指定 uuid 资源的依赖资源 uuid 列表
     * @param uuid
     */
    getDependUuidsDeep(uuid: string): Promise<string[]>;
    /**
     * 获取某个资源的反序列化对象
     * @param uuid
     */
    getInstance(asset: IAsset): Promise<any>;
    /**
     * 获取重新序列化后的即将输出的 JSON 数据
     * @param uuid
     * @param options
     * @returns
     */
    getSerializedJSON(uuid: string, options: ISerializedOptions): Promise<any | null>;
    /**
     * 直接生成某个资源的构建后数据
     * @param uuid
     * @param debug
     */
    outputAssets(uuid: string, dest: string, debug: boolean): Promise<void>;
    outputCCONAsset(uuid: string, dest: string, options: ISerializedOptions): Promise<void>;
    /**
     * 获取某个资源的构建后序列化数据
     * @param uuid
     */
    serialize(instance: any, options: ISerializedOptions): any;
    /**
     * 获取反序列化后的原始对象
     * @param uuid
     */
    private getRawInstance;
    getRawInstanceFromData(data: CCON | Object, asset: IAsset): {
        asset: CCAsset | null;
        detail: string | null;
    };
    /**
     * 重置
     */
    reset(): void;
    private checkUseCache;
    private checkCanSaveCache;
    getAssetProperty: (asset: IAsset, property: (keyof IAssetInfoFromDB | "depends" | "dependScripts" | "dependedScripts")) => any;
    url2uuid: (url: string) => string;
}
export declare const buildAssetLibrary: BuildAssetLibrary;
export {};
