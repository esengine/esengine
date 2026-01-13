import { IAsset } from '../../../../assets/@types/protected';
import { IBuildSceneItem } from '../../../@types';
import { IBuilder, ISerializedOptions, IInternalBuildOptions, BuilderCache as IBuilderCache } from '../../../@types/protected';
/**
 * 资源管理器，主要负责资源的缓存查询缓存等
 * 所有 __ 开头的属性方法都不对外公开
 */
export declare class BuilderAssetCache implements IBuilderCache {
    readonly scenes: Array<IBuildSceneItem>;
    readonly scriptUuids: Array<string>;
    assetUuids: Array<string>;
    private readonly instanceMap;
    private readonly _task?;
    constructor(task?: IBuilder);
    /**
     * 初始化
     */
    init(): Promise<void>;
    /**
     * 查询某个 uuid 是否存在
     * @param uuid
     * @returns
     */
    hasAsset(uuid: string): Promise<boolean>;
    /**
     * 添加一个资源到缓存
     * @param asset
     */
    addAsset(asset: IAsset, type?: string): void;
    /**
     * 删除一个资源的缓存
     */
    removeAsset(uuid: string, type?: string): void;
    /**
     * 查询指定 uuid 的资源信息
     * @param uuid
     */
    getAssetInfo(uuid: string): import("../../../@types/protected").IAssetInfo;
    /**
     * 添加或修改一个实例化对象到缓存
     * @param instance
     */
    addInstance(instance: any): void;
    /**
     * 删除一个资源的缓存
     * @param uuid
     */
    clearAsset(uuid: string): void;
    /**
     * 查询一个资源的 meta 数据
     * @param uuid
     */
    getMeta(uuid: string): Promise<any>;
    addMeta(uuid: string, meta: any): Promise<void>;
    /**
     * 获取指定 uuid 资源的依赖资源 uuid 列表
     * @param uuid
     */
    getDependUuids(uuid: string): Promise<readonly string[]>;
    /**
     * 深度获取指定 uuid 资源的依赖资源 uuid 列表
     * @param uuid
     */
    getDependUuidsDeep(uuid: string): Promise<string[]>;
    /**
     *
     * 获取指定 uuid 资源在 library 内的序列化 JSON 内容
     * @param uuid
     */
    getLibraryJSON(uuid: string): Promise<any>;
    /**
     * 获取指定 uuid 资源的重新序列化后的 JSON 内容（最终输出）
     * @param uuid
     * @param options
     */
    getSerializedJSON(uuid: string, options: ISerializedOptions): Promise<any>;
    /**
     * 直接输出某个资源序列化 JSON 到指定包内
     * @param uuid
     * @param destDir
     * @param options
     */
    outputAssetJson(uuid: string, destDir: string, options: IInternalBuildOptions): Promise<void>;
    /**
     * 循环一种数据
     * @param type
     * @param handle
     */
    forEach(type: string, handle: Function): Promise<undefined>;
    /**
     * 查询一个资源反序列化后的实例
     * @param uuid
     */
    getInstance(uuid: string): Promise<any>;
}
