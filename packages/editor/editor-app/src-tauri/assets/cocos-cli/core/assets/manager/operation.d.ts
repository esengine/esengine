/**
 * 资源操作类，会调用 assetManager/assetDB/assetHandler 等模块
 */
import { Asset } from '@cocos/asset-db';
import { IMoveOptions } from '../@types/private';
import { IAsset, CreateAssetOptions, IExportOptions, IExportData, CreateAssetByTypeOptions } from '../@types/protected';
import { AssetOperationOption, AssetUserDataMap, IAssetInfo, IAssetMeta, ISupportCreateType } from '../@types/public';
import EventEmitter from 'events';
declare class AssetOperation extends EventEmitter {
    /**
     * 检查一个资源文件夹是否为只读
     */
    _checkReadonly(asset: IAsset): void;
    _checkExists(path: string): void;
    /**
     * 检查是否存在文件，如果存在则根据选项决定是否覆盖或重命名
     * @param path
     * @param option
     * @returns 返回新的文件路径
     */
    _checkOverwrite(path: string, option?: AssetOperationOption): string;
    saveAssetMeta(uuid: string, meta: IAssetMeta, asset?: IAsset): Promise<void>;
    updateUserData<T extends keyof AssetUserDataMap = 'unknown'>(uuidOrURLOrPath: string, path: string, value: any): Promise<AssetUserDataMap[T]>;
    saveAsset(uuidOrURLOrPath: string, content: string | Buffer): Promise<IAssetInfo>;
    checkValidUrl(urlOrPath: string): boolean;
    createAsset(options: CreateAssetOptions): Promise<IAssetInfo>;
    /**
     * 根据类型创建资源
     * @param type
     * @param dirOrUrl 目标目录
     * @param baseName 基础名称
     * @param options
     * @returns
     */
    createAssetByType(type: ISupportCreateType, dirOrUrl: string, baseName: string, options?: CreateAssetByTypeOptions): Promise<IAssetInfo>;
    /**
     * 从项目外拷贝导入资源进来
     * @param source
     * @param target
     * @param options
     */
    importAsset(source: string, target: string, options?: AssetOperationOption): Promise<IAssetInfo[]>;
    /**
     * 生成导出数据接口，主要用于：预览、构建阶段
     * @param asset
     * @param options
     * @returns
     */
    generateExportData(asset: Asset, options?: IExportOptions): Promise<IExportData | null>;
    /**
     * 拷贝生成导入文件到最终目标地址，主要用于：构建阶段
     * @param handler
     * @param src
     * @param dest
     * @returns
     */
    outputExportData(handler: string, src: IExportData, dest: IExportData): Promise<void>;
    /**
     * 刷新某个资源或是资源目录
     * @param pathOrUrlOrUUID
     * @returns boolean
     */
    refreshAsset(pathOrUrlOrUUID: string): Promise<number>;
    private _refreshAsset;
    /**
     * 重新导入某个资源
     * @param pathOrUrlOrUUID
     * @returns
     */
    reimportAsset(pathOrUrlOrUUID: string): Promise<IAssetInfo>;
    private _reimportAsset;
    /**
     * 移动资源
     * @param source 源文件的 url 或者绝对路径 db://assets/abc.txt
     * @param target 目标 url 或者绝对路径 db://assets/a.txt
     * @param option 导入资源的参数 { overwrite, xxx, rename }
     * @returns {Promise<IAssetInfo | null>}
     */
    moveAsset(source: string, target: string, option?: AssetOperationOption): Promise<any>;
    private _moveAsset;
    /**
     * 重命名某个资源
     * @param source
     * @param target
     */
    renameAsset(source: string, target: string, option?: AssetOperationOption): Promise<any>;
    private _renameAsset;
    /**
     * 移除资源
     * @param path
     * @returns
     */
    removeAsset(uuidOrURLOrPath: string): Promise<IAssetInfo | null>;
    private _removeAsset;
}
export declare const assetOperation: AssetOperation;
export default assetOperation;
/**
 * 移动文件
 * @param file
 */
export declare function moveFile(source: string, target: string, options?: IMoveOptions): Promise<void>;
