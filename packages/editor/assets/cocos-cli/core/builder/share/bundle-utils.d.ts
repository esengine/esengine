import { IAsset } from '../../assets/@types/protected';
import { BundleCompressionType } from '../@types';
import { PlatformBundleConfig, CustomBundleConfig, CustomBundleConfigItem, BundleConfigItem } from '../@types/protected';
export declare enum BundleCompressionTypes {
    NONE = "none",
    MERGE_DEP = "merge_dep",
    MERGE_ALL_JSON = "merge_all_json",
    SUBPACKAGE = "subpackage",
    ZIP = "zip"
}
export declare enum BuiltinBundleName {
    RESOURCES = "resources",
    MAIN = "main",
    START_SCENE = "start-scene",
    INTERNAL = "internal"
}
export declare function getBundleDefaultName(assetInfo: IAsset): string;
export declare const BundlecompressionTypeMap: {
    none: string;
    subpackage: string;
    merge_dep: string;
    merge_all_json: string;
    zip: string;
};
export declare const BundlePlatformTypes: {
    native: {
        icon: string;
        displayName: string;
    };
    web: {
        icon: string;
        displayName: string;
    };
    miniGame: {
        icon: string;
        displayName: string;
    };
};
export declare const DefaultBundleConfig: CustomBundleConfig;
export declare function transformPlatformSettings(config: CustomBundleConfigItem, platformConfigs: Record<string, PlatformBundleConfig>): Record<string, Required<BundleConfigItem>>;
export declare function checkRemoteDisabled(compressionType: BundleCompressionType): compressionType is "subpackage" | "zip";
export declare function getInvalidRemote(compressionType: BundleCompressionType, isRemote?: boolean): boolean;
