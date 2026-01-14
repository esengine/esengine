import { EventEmitter } from 'stream';
import { Asset, VirtualAsset } from '@cocos/asset-db/libs/asset';
import { ICustomConfig, ITextureCompressFormatType, AllTextureCompressConfig, UserCompressConfig, ICompressConfig } from '../../../../@types';
import { IImageTaskInfo } from '../../../../@types/protected';
interface CompressCacheInfo {
    option: {
        mtime: number | string;
        src: string;
        compressOptions: Record<string, Record<string, string | number>>;
    };
    mipmapFiles: string[] | undefined;
    customConfigs: Record<string, ICustomConfig>;
    dest?: string[];
}
interface CompressExecuteInfo {
    busyFormatType: Partial<Record<ITextureCompressFormatType | string, number>>;
    busyAsset: Set<string>;
    resolve: Function;
    reject: Function;
    state: 'progress' | 'success' | 'failed';
    complete: number;
    total: number;
    childProcess: number;
}
export declare class TextureCompress extends EventEmitter {
    _taskMap: Record<string, IImageTaskInfo>;
    platform: string;
    static overwriteFormats: Record<string, string>;
    static _presetIdToCompressOption: Record<string, Record<string, Record<string, number | string>>>;
    static allTextureCompressConfig: AllTextureCompressConfig;
    static userCompressConfig: UserCompressConfig;
    static compressCacheDir: string;
    static storedCompressInfo: Record<string, CompressCacheInfo>;
    static storedCompressInfoPath: string;
    static enableMipMaps: boolean;
    _waitingCompressQueue: Set<ICompressConfig>;
    _compressAssetLen: number;
    _compressExecuteInfo: CompressExecuteInfo | null;
    textureCompress: boolean;
    constructor(platform: string, textureCompress?: boolean);
    static initCommonOptions(): Promise<void>;
    init(): Promise<void>;
    /**
     * 更新缓存的纹理压缩项目配置
     */
    updateUserConfig(): Promise<void>;
    static queryTextureCompressCache(uuid: string): CompressCacheInfo;
    /**
     * 根据资源信息返回资源的纹理压缩任务，无压缩任务的返回 null
     * @param assetInfo
     * @returns IImageTaskInfo | null
     */
    addTask(uuid: string, task: IImageTaskInfo): IImageTaskInfo;
    /**
     * 根据 Image 信息添加资源的压缩任务
     * @param assetInfo （不支持自动图集）
     * @returns
     */
    addTaskWithAssetInfo(assetInfo: Asset | VirtualAsset): IImageTaskInfo | {
        src: string;
        presetId: any;
        compressOptions: Record<string, Record<string, string | number>>;
        hasAlpha: any;
        mtime: any;
        hasMipmaps: boolean;
        dest: never[];
        suffix: never[];
    } | undefined;
    /**
     * 根据图集或者 Image 资源信息返回资源的纹理压缩任务，无压缩任务的返回 null
     */
    genTaskInfoFromAssetInfo(assetInfo: Asset | VirtualAsset): IImageTaskInfo | {
        src: string;
        presetId: any;
        compressOptions: Record<string, Record<string, string | number>>;
        hasAlpha: any;
        mtime: any;
        hasMipmaps: boolean;
        dest: never[];
        suffix: never[];
    } | null | undefined;
    /**
     * 根据纹理压缩配置 id 获取对应的纹理压缩选项
     * @param presetId
     * @returns Record<string, number | string> | null
     */
    getCompressOptions(presetId: string): (Record<string, Record<string, number | string>>) | null;
    /**
     * 查询某个指定 uuid 资源的纹理压缩任务
     * @param uuid
     * @returns
     */
    queryTask(uuid: string): IImageTaskInfo;
    removeTask(uuid: string): void;
    /**
     * 执行所有纹理压缩任务，支持限定任务，否则将执行收集的所有纹理压缩任务
     */
    run(taskMap?: Record<string, IImageTaskInfo>): Promise<Record<string, IImageTaskInfo> | undefined>;
    /**
     * 筛选整理压缩任务中缓存失效的实际需要压缩的任务队列
     * @param taskMap
     * @returns
     */
    private sortImageTask;
    executeCompressQueue(): Promise<unknown> | undefined;
    _getNextTask(): ICompressConfig | null;
    _checkTaskCanExecute(taskConfig: ICompressConfig): boolean;
    _compressImage(config: ICompressConfig): Promise<void>;
    /**
     * 检查压缩任务是否已经完成，如未完成，则继续执行剩下的任务
     * @returns
     */
    _step(): Promise<any>;
    private customCompressImage;
    compressImageByConfig(optionItem: ICompressConfig): Promise<void>;
}
export declare function previewCompressImage(assetUuid: string, platform?: string): Promise<IImageTaskInfo | {
    src: string;
    presetId: any;
    compressOptions: Record<string, Record<string, string | number>>;
    hasAlpha: any;
    mtime: any;
    hasMipmaps: boolean;
    dest: never[];
    suffix: never[];
} | undefined>;
export declare function queryCompressCache(uuid: string): Promise<CompressCacheInfo>;
export declare function queryAllCompressConfig(): Promise<AllTextureCompressConfig>;
export {};
