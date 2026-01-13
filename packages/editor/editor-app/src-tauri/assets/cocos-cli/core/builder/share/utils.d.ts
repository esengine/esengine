import { IBuildOptionBase, IDisplayOptions } from '../@types';
import { IBuilderConfigItem } from '../@types/protected';
export declare function compareNumeric(lhs: string, rhs: string): number;
export { compareNumeric as compareUUID };
/**
 * 解析配置 options 内的默认值
 * @param options
 */
export declare function getOptionsDefault(options: IDisplayOptions): Record<string, any>;
export declare function checkCompressOptions(configs: any): boolean;
export declare function warnModuleFallBack(moduleToFallBack: Record<string, string>, platform: string): Promise<void>;
/**
 * 将路径名称的时间转为时间戳
 * @param time
 * @returns
 */
export declare function transTimeToNumber(time: string): number;
/**
 * 获取一个可作为构建任务日志的路径(project://temp/builder/log/xxx2019-3-20 16-00.log)
 * @param taskName
 * @param time
 * @returns
 */
export declare function getTaskLogDest(taskName: string, time: number | string): string;
/**
 * 获取可阅读的最新时间信息（2023-4-24 17:31:54）
 */
export declare function getCurrentTime(): string;
/**
 * 将时间戳转为可阅读的时间信息（2023-4-24 17:31:54）
 * @param t
 */
export declare function changeToLocalTime(t: number | string, len?: number): string;
/**
 * 检查传递的 errorMap 内是否包含错误字符串信息
 * @param errorMap
 * @returns boolean true：存在错误
 */
export declare function checkHasError(errorMap?: Record<string, any>): boolean;
/**
 * 从命令中提取参数
 * @param command
 * @returns
 */
export declare function getParamsFromCommand(command: string): string[];
export declare function checkConfigDefault(config: IBuilderConfigItem): any;
export declare function defaultsDeep(data: any, defaultData: any): any;
export declare function defaultMerge(target: Record<string, any>, ...sources: Record<string, any>[]): Record<string, any>;
export declare function getBuildPath(options: IBuildOptionBase): string;
/**
 * 执行某个模块的方法或者获取某个模块的属性值
 * @param module
 * @param key
 * @param args
 */
export declare function requestModule(module: any, key: string, ...args: any[]): Promise<any>;
/**
 * 将毫秒时间转换为时分秒
 * @param msTime
 */
export declare function formatMSTime(msTime: number): string;
export declare function resolveToRaw(urlOrPath: string, root: string): string;
