import EventEmitter from 'events';
import { IBuildPaths, ISettings, IBuildOptionBase, IBuildResult, IRawAssetPathInfo, IAssetPathInfo, IImportAssetPathInfo } from '../../../@types';
import { ICompressImageResult, ImportMapWithImports, IBuilder, IBuildSeparateEngineResult, InternalBuildResult as IInternalBuildResult } from '../../../@types/protected';
export declare class InternalBuildResult extends EventEmitter implements IInternalBuildResult {
    settings: ISettings;
    scriptPackages: string[];
    pluginVers: Record<string, string>;
    compressImageResult: ICompressImageResult;
    /**
     * @param name
     * @param options
     * 导入映射
     */
    importMap: ImportMapWithImports;
    rawOptions: IBuildOptionBase;
    paths: IBuildPaths;
    compileOptions: any;
    private __task;
    pluginScripts: Array<{
        uuid: string;
        url: string;
        file: string;
    }>;
    separateEngineResult?: IBuildSeparateEngineResult;
    get dest(): string;
    constructor(task: IBuilder, preview: boolean);
}
export declare class BuildResult implements IBuildResult {
    private readonly __task;
    settings?: ISettings;
    dest: string;
    get paths(): IBuildPaths;
    constructor(task: IBuilder);
    /**
     * 指定的 uuid 资源是否包含在构建资源中
     */
    containsAsset(uuid: string): boolean;
    /**
     * 获取指定 uuid 原始资源的存放路径（不包括序列化 json）
     * 自动图集的小图 uuid 和自动图集的 uuid 都将会查询到合图大图的生成路径
     * 实际返回多个路径的情况：查询 uuid 为自动图集资源，且对应图集生成多张大图，纹理压缩会有多个图片格式路径
     */
    getRawAssetPaths(uuid: string): IRawAssetPathInfo[];
    /**
     * 获取指定 uuid 资源的路径相关信息
     * @return Array<{raw?: string | string[]; import?: string; groupIndex?: number;}>
     * @return.raw: 该资源源文件的实际存储位置，存在多个为数组，不存在则为空
     * @return.import: 该资源序列化数据的实际存储位置，不存在为空，可能是 .bin 或者 .json 格式
     * @return.groupIndex: 若该资源的序列化数据在某个分组内，这里标识在分组内的 index，不存在为空
     */
    getAssetPathInfo(uuid: string): IAssetPathInfo[];
    /**
     * @deprecated please use getImportAssetPaths instead
     * @param uuid
     */
    getJsonPathInfo(uuid: string): IImportAssetPathInfo[];
    /**
     * 指定 uuid 资源的序列化信息在构建后的信息
     * @param uuid
     */
    getImportAssetPaths(uuid: string): IImportAssetPathInfo[];
}
