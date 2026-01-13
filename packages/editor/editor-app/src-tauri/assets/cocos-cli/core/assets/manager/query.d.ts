import { QueryAssetType, IAsset } from '../@types/protected';
import { IAssetInfo, IAssetMeta, QueryAssetsOption } from '../@types/public';
import { FilterPluginOptions, IPluginScriptInfo } from '../../scripting/interface';
declare global {
    var assetQuery: AssetQueryManager;
}
declare class AssetQueryManager {
    /**
     * 1. 资源/脚本 uuid, asset -> uuid 依赖的普通资源列表
     * 2. 资源 uuid, script -> uuid 依赖的脚本列表
     * 3. 脚本 uuid, script -> uuid 脚本依赖的脚本列表
     * @param uuidOrURL
     * @param type
     * @returns
     */
    queryAssetDependencies(uuidOrURL: string, type?: QueryAssetType): Promise<string[]>;
    /**
     * 1. 资源/脚本 uuid, asset -> 使用 uuid 的普通资源列表
     * 2. 资源 uuid, script -> 使用 uuid 的脚本列表
     * 3. 脚本 uuid，script -> 使用此 uuid 脚本的脚本列表
     * @param uuidOrURL
     * @param type
     * @returns
     */
    queryAssetUsers(uuidOrURL: string, type?: QueryAssetType): Promise<string[]>;
    /**
     * 传入一个 uuid 或者 url 或者绝对路径，查询指向的资源
     * @param uuidOrURLOrPath
     */
    queryAsset(uuidOrURLOrPath: string): IAsset | null;
    queryAssetInfo(urlOrUUIDOrPath: string, dataKeys?: (keyof IAssetInfo)[]): IAssetInfo | null;
    /**
     * 查询指定资源的信息
     * @param uuid 资源的唯一标识符
     * @param dataKeys 资源输出可选项
     */
    queryAssetInfoByUUID(uuid: string, dataKeys?: (keyof IAssetInfo)[]): IAssetInfo | null;
    /**
     * 根据提供的 options 查询对应的资源数组(不包含数据库对象)
     * @param options 搜索配置
     * @param dataKeys 指定需要的资源信息字段
     */
    queryAssetInfos(options?: QueryAssetsOption, dataKeys?: (keyof IAssetInfo)[]): IAssetInfo[];
    queryAssets(options?: QueryAssetsOption): IAsset[];
    /**
     * 查询符合某个筛选规则的排序后的插件脚本列表
     * @param filterOptions
     * @returns
     */
    querySortedPlugins(filterOptions?: FilterPluginOptions): IPluginScriptInfo[];
    /**
     * 将一个 Asset 转成 info 对象
     * @param database
     * @param asset
     * @param invalid 是否是无效的资源，例如已被删除的资源
     */
    encodeAsset(asset: IAsset, dataKeys?: (keyof IAssetInfo)[], invalid?: boolean): IAssetInfo;
    queryAssetProperty(asset: IAsset, property: (keyof IAssetInfo | 'depends' | 'dependScripts' | 'dependedScripts')): any;
    /**
     * 查询指定的资源的 meta
     * @param uuidOrURLOrPath 资源的唯一标识符
     */
    queryAssetMeta(uuidOrURLOrPath: string): IAssetMeta | null;
    /**
     * 查询指定的资源以及对应 meta 的 mtime
     * @param uuid 资源的唯一标识符
     */
    queryAssetMtime(uuid: string): number | null;
    queryUUID(urlOrPath: string): string | null;
    /**
     * db 根节点不是有效的 asset 类型资源
     * 这里伪造一份它的数据信息
     * @param name db name
     */
    queryDBAssetInfo(name: string): IAssetInfo | null;
    queryUrl(uuidOrPath: string): string;
    queryPath(urlOrUuid: string): string;
    generateAvailableURL(url: string): string;
}
declare const assetQuery: AssetQueryManager;
export default assetQuery;
export declare function searchAssets(filterHandlerInfos: FilterHandlerInfo[], assets: IAsset[], resultAssets?: IAsset[]): IAsset[];
interface FilterHandlerInfo {
    name: keyof QueryAssetsOption;
    handler: (value: any, assets: IAsset) => boolean;
    resolve?: (value: any) => any | undefined;
    value?: any;
}
