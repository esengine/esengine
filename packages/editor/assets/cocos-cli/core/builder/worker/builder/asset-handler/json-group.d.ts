import { IAsset } from '../../../../assets/@types/protected';
import { IBundle } from '../../../@types/protected';
/**
 * 分组重新划分
 * 将所有分组内，重复的数据，单独提取成新的分组
 *
 * @param groups 传入一个分组数组（二维数组）
 * @param checkResult 是否检查结果
 */
export declare function splitGroups(groups: string[][], checkResult?: boolean): string[][];
/**
 * 爬取某个资源依赖的 json 资源的分组数据
 * @param uuid
 */
export declare function walk(asset: IAsset, bundle: IBundle): Promise<string[]>;
/**
 * 检查一个 uuid 是否已经在其他分组里
 * @param uuid
 * @param groups
 */
export declare function hasGroups(uuid: string, groups: string[][]): boolean;
