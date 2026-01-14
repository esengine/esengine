import { IAsset } from '../../../../assets/@types/protected';
import { IModules, ITransformOptions } from '../../../@types/protected';
export { getBuildPath } from '../../../share/utils';
/**
 * 比对两个 options 选项是否一致，不一致的数据需要打印出来
 * @param oldOptions 旧选项
 * @param newOptions 新选项
 * @returns 如果两个选项一致返回 true，否则返回 false
 */
export declare function compareOptions(oldOptions: Record<string, any>, newOptions: Record<string, any>): boolean;
export declare function pickDifferentOptions(oldOptions: Record<string, any>, newOptions: Record<string, any>, path?: string, diff?: Record<string, {
    new: any;
    old: any;
}>): {
    isEqual: boolean;
    diff: Record<string, {
        new: any;
        old: any;
    }>;
};
export declare function copyPaths(paths: {
    src: string;
    dest: string;
}[]): Promise<void[]>;
/**
 * 递归遍历这个资源上的所有子资源
 * @param asset
 * @param handle
 */
export declare function recursively(asset: IAsset, handle: Function): void;
export declare function removeDbHeader(path: string): string;
/**
 * 将 db 开头的 url 转为项目里的实际 url
 * @param url db://
 */
export declare function dbUrlToRawPath(url: string): string;
/**
 * 获取相对路径，并且路径分隔符做转换处理
 * @param from
 * @param to
 */
export declare function relativeUrl(from: string, to: string): string;
/**
 * 检查是否安装了 node.js
 */
export declare function isInstallNodeJs(): Promise<boolean>;
/**
 * 获取文件夹或者文件大小
 */
export declare function getFileSizeDeep(path: string): number;
/**
 * 拷贝文件夹
 * @param path
 * @param dest
 */
export declare function copyDirSync(path: string, dest: string): void | 0;
export declare function compressUuid(uuid: string, min?: boolean): string;
export declare function decompressUuid(uuid: string): string;
/**
 * 从 library 路径获取 uuid
 * @param path
 */
export declare function getUuidFromPath(path: string): string;
/**
 * 获取某个名字对应的短 uuid
 * @param name
 * @returns
 */
export declare function nameToSubId(name: string): string;
/**
 * 拼接成 import 路径
 * @param dest
 * @param uuid
 * @param extName 指定 import 的文件格式，默认 .json
 */
export declare function getResImportPath(dest: string, uuid: string, extName?: string): string;
/**
 * 拼接成 raw-assets 路径
 * @param dest
 * @param uuid
 * @param extName 路径后缀
 */
export declare function getResRawAssetsPath(dest: string, uuid: string, extName: string): string;
export declare function toBabelModules(modules: IModules): string | false;
/**
 * 脚本编译
 * TODO 此类编译脚本相关逻辑，后续需要迁移到进程管理器内调用
 * @param code
 * @param options
 */
export declare function transformCode(code: string, options: ITransformOptions): Promise<string>;
/**
 * 编译脚本
 * @param contents
 * @param path
 */
export declare function compileJS(contents: Buffer, path: string): any;
interface ICreateBundleOptions {
    excludes?: string[];
    debug?: boolean;
    sourceMap?: boolean;
}
export declare function createBundle(src: string, dest: string, options?: ICreateBundleOptions): Promise<void>;
interface IAppendRes {
    hash: string;
    paths: string[];
}
/**
 * 给某些路径文件添加 md5 后缀
 * @param paths
 */
export declare function appendMd5ToPaths(paths: string[]): Promise<IAppendRes | null>;
/**
 * 计算某个数据的 md5 值
 * @param data
 */
export declare function calcMd5(data: (Buffer | string) | Array<Buffer | string>): string;
/**
 * 将某个 hash 值添加到某个路径上
 * @param targetPath
 * @param hash
 * @returns
 */
export declare function patchMd5ToPath(targetPath: string, hash: string): string;
/**
 * 获取一个资源 library 地址里的 library 文件夹绝对路径
 * @param libraryPath
 * @returns
 */
export declare function getLibraryDir(libraryPath: string): string;
export declare const quickSpawn: (command: string, cmdParams: string[], options?: import("../../../@types/protected").IQuickSpawnOption) => Promise<number | boolean>;
export declare function queryImageAssetFromSubAssetByUuid(subAssetUuid: string): string;
