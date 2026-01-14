import { PacInfo } from './pac-info';
import { IAsset } from '../../../../../assets/@types/protected';
import { IPackOptions, PreviewPackResult } from '../../../../@types/protected';
export declare class TexturePacker {
    pacInfos: PacInfo[];
    /**
     * 是否使用缓存
     */
    static useCache: boolean;
    private static getCacheDirWithUuid;
    static packSingle(pacAsset: IAsset, option?: Partial<IPackOptions>): Promise<PacInfo>;
    static queryPacStoredPath(pacInfo: PacInfo): string;
    init(pacAssets: Array<IAsset>, assetsRange?: string[]): Promise<this>;
    pack(): Promise<PacInfo[]>;
    private static internalPack;
    private static getStoredPacInfo;
    private static genNewStoredInfo;
    private static getPacResFromCache;
    static queryPacCache(pacUuid: string): Promise<PreviewPackResult | null>;
}
export declare function packAutoAtlas(pacUuid: string, option?: Partial<IPackOptions>): Promise<PreviewPackResult | null>;
/**
 * 查询某个图集的预览缓存
 * @param pacUuid
 */
export declare function queryAutoAtlasFileCache(pacUuid: string): Promise<PreviewPackResult | null>;
export declare function querySpriteToAutoAtlas(spriteUuid: string): Promise<{
    url: string;
    uuid: string;
} | null>;
