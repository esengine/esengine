import type { AssetInfo, IAssetMeta, QueryAssetsOption } from '../../assets/@types/public';
import { TypeScriptAssetInfoCache } from '../shared/cache';
import { AssetActionEnum } from '@cocos/asset-db/libs/asset';
import { DBInfo } from '../@types/config-export';
export interface QueryAllAssetOption<T = {
    assetInfo: AssetInfo;
}> {
    assetDbOptions?: QueryAssetsOption;
    filter?: (assetInfo: AssetInfo, meta?: IAssetMeta) => boolean;
    mapper?: (assetInfo: AssetInfo, meta?: IAssetMeta) => T;
}
export declare class AssetDbInterop {
    protected readonly _tsScriptInfoCache: Map<string, TypeScriptAssetInfoCache>;
    removeTsScriptInfoCache(dbTarget: string): TypeScriptAssetInfoCache[];
    destroyed(): Promise<void>;
    queryAssetDomains(dbInfos: DBInfo[]): Promise<AssetDatabaseDomain[]>;
    /**
     * 因为时间累计而缓存的资源更改。
     */
    private _changeQueue;
    /**
     * 当收到资源更改消息后触发。我们会更新资源更改计时器。
     */
    onAssetChange(changeInfo: AssetChangeInfo): void;
    getAssetChangeQueue(): AssetChange[];
    resetAssetChangeQueue(): void;
}
export type AssetChangeType = AssetActionEnum;
export declare enum DBChangeType {
    add = 0,
    remove = 1
}
export interface AssetChangeInfo {
    type: AssetChangeType;
    uuid: string;
    filePath: string;
    importer: string;
    userData: Object;
}
export interface AssetChange {
    type: AssetChangeType;
    uuid: UUID;
    filePath: FilePath;
    importer: string;
    url: URL;
    isPluginScript: boolean;
}
export interface ModifiedAssetChange extends AssetChange {
    type: AssetActionEnum.change;
    oldFilePath?: FilePath;
    newFilePath?: FilePath;
}
export interface AssetDatabaseDomain {
    /**
     * 此域的根 URL。
     */
    root: URL;
    /**
     * 此域的物理路径。
     */
    physical: string;
    /**
     * 此域的物理根路径。如果未指定则为文件系统根路径。
     * 在执行 npm 算法时会使用此字段。
     */
    jail?: string;
}
