/**
 * 提供给 Bundle 一些接口查询的方法
 */
import { IAssetPathInfo, IImportAssetPathInfo } from '../../../../@types';
import { BundleFilterConfig, IBundle } from '../../../../@types/protected';
/**
 * 获取指定 uuid 资源的路径相关信息
 * @return {raw?: string | string[]; json?: string; groupIndex?: number;}
 * @return.raw: 该资源源文件的实际存储位置，存在多个为数组，不存在则为空
 * @return.json: 该资源序列化 json 的实际存储位置，不存在为空
 * @return.groupIndex: 若该资源的序列化 json 在某个 json 分组内，这里标识在分组内的 index，不存在为空
 */
export declare function getAssetPathInfo(uuid: string, bundle: IBundle): IAssetPathInfo | null;
export declare function getJsonPath(uuid: string, bundle: IBundle): string;
/**
 * 指定 uuid 资源的序列化 json 在 bundle 构建后的信息
 * @param uuid
 * @param bundle
 */
export declare function getImportPathInfo(uuid: string, bundle: IBundle): IImportAssetPathInfo | null;
export declare function resolveImportPath(name: string, bundle: IBundle, extName?: string): string;
export declare function resolveNativePath(libraryPath: string, extName: string, bundle: IBundle): string;
/**
 * 获取指定 uuid 原始资源的存放路径（不包括序列化 json）
 * 自动图集的小图 uuid 和自动图集的 uuid 都将会查询到合图大图的生成路径
 * 实际返回多个路径的情况：查询 uuid 为自动图集资源，且对应图集生成多张大图，纹理压缩会有多个图片格式路径
 */
export declare function getRawAssetPaths(uuid: string, bundle: IBundle): string[];
/**
 * 由于资源支持文件夹、以及一些特殊的父资源，需要先转换一下配置再走常规的过滤确认方法，常规的过滤方法目前有单元测试保障正确性
 * @param bundleConfigs
 * @returns
 */
export declare function initBundleConfig(bundleConfigs?: BundleFilterConfig[]): BundleFilterConfig[];
