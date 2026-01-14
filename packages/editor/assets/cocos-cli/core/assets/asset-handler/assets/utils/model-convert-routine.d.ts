import { Asset, AssetDB } from '@cocos/asset-db';
export interface IAbstractConverter<T> {
    readonly options?: unknown;
    convert(asset: Asset, outputDir: string): Promise<boolean>;
    printLogs?(asset: Asset, outputDir: string): void | Promise<void>;
    get(asset: Asset, outputDir: string): T | Promise<T>;
}
/**
 * @param converterId
 * @param asset
 * @param assetDB
 * @param version
 * @param converter
 */
export declare function modelConvertRoutine<T>(converterId: string, asset: Asset, assetDB: AssetDB, version: string, converter: IAbstractConverter<T>): Promise<T | undefined>;
