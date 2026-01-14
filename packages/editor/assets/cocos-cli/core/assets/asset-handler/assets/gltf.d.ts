import { Asset } from '@cocos/asset-db';
import { AssetHandlerBase } from '../../@types/protected';
export declare const GltfHandler: AssetHandlerBase;
export default GltfHandler;
/**
 * 3.7.0 引入了新的减面算法，选项与之前完全不同，需要对字段存储做调整
 * @param asset
 */
export declare function migrateMeshOptimizerOption(asset: Asset): void;
export declare function migrateFbxMatchMeshNames(asset: Asset): void;
/**
 * 3.8.1 引入了新的减面选项，需要对字段存储做调整
 */
export declare function migrateMeshSimplifyOption(asset: Asset): void;
