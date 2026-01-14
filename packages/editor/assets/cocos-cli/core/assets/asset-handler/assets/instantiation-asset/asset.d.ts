import { AssetHandlerBase } from '../../../@types/protected';
export declare const InstantiationAssetHandler: AssetHandlerBase;
export default InstantiationAssetHandler;
/**
 * 创建指定的实例化资源
 * @param target 生成到哪个位置
 * @param files 打包的文件数组
 */
export declare function zip(target: string, files: string[]): void;
