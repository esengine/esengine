/**
 * 校验构建通用配置参数
 */
import { IBuildSceneItem, IBuildTaskOption } from '../@types';
import { IInternalBuildSceneItem } from '../@types/options';
import { BuildCheckResult, BundleCompressionType, IInternalBuildOptions, IInternalBundleBuildOptions } from '../@types/protected';
interface ModuleConfig {
    match: (module: string) => boolean;
    default: string | boolean;
}
export declare const overwriteModuleConfig: Record<string, ModuleConfig>;
/**
 * 校验场景数据
 * @returns 校验结果
 * @param scenes
 */
export declare function checkScenes(scenes: IBuildSceneItem[]): boolean | Error;
/**
  * 确认初始场景对错
  * @param uuidOrUrl
  */
export declare function checkStartScene(uuidOrUrl: string): boolean | Error;
/**
  * 根据输入的文件夹和目标名称计算不和本地冲突的文件地址
  * @param root
  * @param dirName
  */
export declare function calcValidOutputName(root: string, dirName: string, platform: string, id?: string): Promise<string>;
export declare function checkConflict(buildPath: string, outputName: string, buildPathDict: Record<string, string[]>): boolean;
export declare function generateNewOutputName(buildPath: string, platform: string, buildPathDict: Record<string, string[]>): string;
/**
 * 检查路径是否无效
 * @param path
 * @returns
 */
export declare function checkBuildPathIsInvalid(path: string): boolean;
export declare function getDefaultScenes(): IInternalBuildSceneItem[];
export declare function getDefaultStartScene(): string;
export declare function checkBuildCommonOptionsByKey(key: string, value: any, options: IBuildTaskOption): Promise<BuildCheckResult | null>;
export declare function checkBuildCommonOptions(options: any): Promise<Record<string, BuildCheckResult>>;
export declare function checkBundleCompressionSetting(value: BundleCompressionType, supportedCompressionTypes: BundleCompressionType[]): {
    error: string;
    newValue: BundleCompressionType;
};
/**
 * 整合构建配置的引擎模块配置
 * 规则：
 *   字段值为布尔值，则当前值作为此模块的开关
 *   字段值为字符串，则根据 overwriteModuleConfig 配置值进行剔除替换
 * @param options
 */
export declare function handleOverwriteProjectSettings(options: IBuildTaskOption): void;
export declare function checkProjectSetting(options: IInternalBuildOptions | IInternalBundleBuildOptions): Promise<void>;
export {};
