import { IAssetInfo } from '../../../../assets/@types/protected';
import { Asset, VirtualAsset } from '@cocos/asset-db';
import { BundleFilterConfig } from '../../../@types';
export declare function checkAssetWithFilterConfig(assetInfo: Asset | VirtualAsset | IAssetInfo, bundleFilterConfig?: BundleFilterConfig[]): boolean;
/**
 * 返回资源是否匹配当前规则的布尔值
 * @param assetInfo
 * @param config
 * @returns
 */
export declare function matchFilterConfig(assetInfo: Asset | VirtualAsset | IAssetInfo, config: BundleFilterConfig): boolean;
export declare function filterAssetWithBundleConfig(assets: (Asset | VirtualAsset | IAssetInfo)[], bundleFilterConfig?: BundleFilterConfig[]): (IAssetInfo | VirtualAsset | Asset)[];
