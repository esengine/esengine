import { Asset, VirtualAsset } from '@cocos/asset-db/index';
import type { Asset as CCAsset, Details } from 'cc';
import { IAsset, IExportData, ISerializedOptions, SerializedAsset } from './@types/private';
export declare function url2path(url: string): string;
/**
* 将时间戳转为可阅读的时间信息
*/
export declare function getCurrentLocalTime(): string;
/**
 * 获取当前内存占用
 */
export declare function getMemorySize(): string;
/**
 * 将 url 转成 uuid
 * @param url
 */
export declare function url2uuid(url: string): string;
/**
 * assetDB 内 asset 资源自带的 library 是一个数组，需要转成对象
 * @param asset
 */
export declare function libArr2Obj(asset: IAsset): {
    [key: string]: string;
};
export declare function getExtendsFromCCType(ccType: string): any[];
export declare function tranAssetInfo(asset: Asset | VirtualAsset): {
    file: string;
    uuid: string;
    library: {
        [key: string]: string;
    };
    importer: string;
};
export declare const PROMISE_STATE: {
    PENDING: string;
    FULFILLED: string;
    REJECTED: string;
};
export declare function decidePromiseState(promise: Promise<any>): Promise<string>;
/**
 * 删除文件
 * @param file
 */
export declare function removeFile(file: string): Promise<boolean>;
export declare function serializeCompiledWithInstance(instance: any, options: ISerializedOptions & {
    useCCONB?: boolean;
    useCCON?: boolean;
}): SerializedAsset | null;
export declare function getRawInstanceFromImportFile(path: string, assetInfo: {
    uuid: string;
    url: string;
}): Promise<{
    asset: CCAsset | null;
    detail: Details | null;
} | undefined>;
export declare function serializeCompiled(asset: IAsset, options: ISerializedOptions): Promise<any>;
export declare function ensureOutputData(asset: IAsset): IExportData;
