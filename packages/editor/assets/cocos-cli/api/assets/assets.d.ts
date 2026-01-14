import { TDbDirResult, TDirOrDbPath, TUrlOrUUIDOrPath, TDataKeys, TQueryAssetsOption, TSupportCreateType, TAssetOperationOption, TAssetData, TAssetInfoResult, TAssetMetaResult, TCreateMapResult, TAssetInfosResult, TAssetDBInfosResult, TCreatedAssetResult, TImportedAssetResult, TReimportResult, TSaveAssetResult, TRefreshDirResult, TBaseName, TCreateAssetByTypeOptions, TCreateAssetOptions, TUUIDResult, TPathResult, TUrlResult, TQueryAssetType, TFilterPluginOptions, TPluginScriptInfo, TAssetMoveOptions, TAssetRenameOptions, TUserDataHandler, TUpdateAssetUserDataPath, TUpdateAssetUserDataValue, TUpdateAssetUserDataResult, TAssetConfigMapResult } from './schema';
import { CommonResultType } from '../base/schema-base';
export declare class AssetsApi {
    /**
     * Delete Asset // 删除资源
     */
    deleteAsset(dbPath: TDirOrDbPath): Promise<CommonResultType<TDbDirResult>>;
    /**
     * Refresh Asset Directory // 刷新资源目录
     */
    refresh(dir: TDirOrDbPath): Promise<CommonResultType<TRefreshDirResult>>;
    /**
     * Query Asset Info // 查询资源信息
     */
    queryAssetInfo(urlOrUUIDOrPath: TUrlOrUUIDOrPath, dataKeys?: TDataKeys): Promise<CommonResultType<TAssetInfoResult>>;
    /**
     * Query Asset Metadata // 查询资源元数据
     */
    queryAssetMeta(urlOrUUIDOrPath: TUrlOrUUIDOrPath): Promise<CommonResultType<TAssetMetaResult>>;
    /**
     * Query Creatable Asset Map // 查询可创建资源映射表
     */
    queryCreateMap(): Promise<CommonResultType<TCreateMapResult>>;
    /**
     * Batch Query Asset Info // 批量查询资源信息
     */
    queryAssetInfos(options?: TQueryAssetsOption): Promise<CommonResultType<TAssetInfosResult>>;
    /**
     * Query All Asset Database Info // 查询所有资源数据库信息
     */
    queryAssetDBInfos(): Promise<CommonResultType<TAssetDBInfosResult>>;
    /**
     * Create Asset By Type // 按类型创建资源
     */
    createAssetByType(ccType: TSupportCreateType, dirOrUrl: TDirOrDbPath, baseName: TBaseName, options?: TCreateAssetByTypeOptions): Promise<CommonResultType<TCreatedAssetResult>>;
    createAsset(options: TCreateAssetOptions): Promise<CommonResultType<TCreatedAssetResult>>;
    /**
     * Import Asset // 导入资源
     */
    importAsset(source: TDirOrDbPath, target: TDirOrDbPath, options?: TAssetOperationOption): Promise<CommonResultType<TImportedAssetResult>>;
    /**
     * Reimport Asset // 重新导入资源
     */
    reimportAsset(pathOrUrlOrUUID: TUrlOrUUIDOrPath): Promise<CommonResultType<TReimportResult>>;
    /**
     * Save Asset // 保存资源
     */
    saveAsset(pathOrUrlOrUUID: TUrlOrUUIDOrPath, data: TAssetData): Promise<CommonResultType<TSaveAssetResult>>;
    /**
     * Query Asset UUID // 查询资源 UUID
     */
    queryUUID(urlOrPath: TUrlOrUUIDOrPath): Promise<CommonResultType<TUUIDResult>>;
    /**
     * Query Asset Path // 查询资源路径
     */
    queryPath(urlOrUuid: TUrlOrUUIDOrPath): Promise<CommonResultType<TPathResult>>;
    /**
     * Query Asset URL // 查询资源 URL
     */
    queryUrl(uuidOrPath: TUrlOrUUIDOrPath): Promise<CommonResultType<TUrlResult>>;
    /**
     * Query Asset Dependencies // 查询资源依赖
     */
    queryAssetDependencies(uuidOrUrl: TUrlOrUUIDOrPath, type?: TQueryAssetType): Promise<CommonResultType<string[]>>;
    /**
     * Query Asset Users // 查询资源使用者
     */
    queryAssetUsers(uuidOrUrl: TUrlOrUUIDOrPath, type?: TQueryAssetType): Promise<CommonResultType<string[]>>;
    /**
     * Query Sorted Plugin Scripts // 查询排序后的插件脚本
     */
    querySortedPlugins(filterOptions?: TFilterPluginOptions): Promise<CommonResultType<TPluginScriptInfo[]>>;
    /**
     * Rename Asset // 重命名资源
     */
    renameAsset(source: TDirOrDbPath, target: TDirOrDbPath, options?: TAssetRenameOptions): Promise<CommonResultType<TAssetInfoResult>>;
    /**
     * Move Asset // 移动资源
     */
    moveAsset(source: TDirOrDbPath, target: TDirOrDbPath, options?: TAssetMoveOptions): Promise<CommonResultType<TAssetInfoResult>>;
    /**
     * Update Default User Data // 更新默认用户数据
     */
    updateDefaultUserData(handler: TUserDataHandler, path: TUpdateAssetUserDataPath, value: TUpdateAssetUserDataValue): Promise<CommonResultType<null>>;
    /**
     * Query Asset User Data Config // 查询资源用户数据配置
     */
    queryAssetUserDataConfig(urlOrUuidOrPath: TUrlOrUUIDOrPath): Promise<CommonResultType<any>>;
    /**
     * Update Asset User Data // 更新资源用户数据
     */
    updateAssetUserData(urlOrUuidOrPath: TUrlOrUUIDOrPath, path: TUpdateAssetUserDataPath, value: TUpdateAssetUserDataValue): Promise<CommonResultType<TUpdateAssetUserDataResult>>;
    /**
     * Query Asset Config Map // 查询资源配置映射表
     */
    queryAssetConfigMap(): Promise<CommonResultType<TAssetConfigMapResult>>;
}
