/**
 * FUI Asset Loader
 *
 * Asset loader for FairyGUI package files (.fui).
 *
 * FairyGUI 包文件资产加载器
 */

import type {
    IAssetLoader,
    IAssetParseContext,
    IAssetContent,
    AssetContentType
} from '@esengine/asset-system';
import { UIPackage } from '../package/UIPackage';

/**
 * FUI asset interface
 * FUI 资产接口
 */
export interface IFUIAsset {
    /** Loaded UIPackage instance | 加载的 UIPackage 实例 */
    package: UIPackage;
    /** Package ID | 包 ID */
    id: string;
    /** Package name | 包名称 */
    name: string;
    /** Resource key used for loading | 加载时使用的资源键 */
    resKey: string;
}

/**
 * FUI asset type constant
 * FUI 资产类型常量
 */
export const FUI_ASSET_TYPE = 'fui';

/**
 * FUIAssetLoader
 *
 * Loads FairyGUI package files (.fui) and creates UIPackage instances.
 *
 * 加载 FairyGUI 包文件并创建 UIPackage 实例
 */
export class FUIAssetLoader implements IAssetLoader<IFUIAsset> {
    readonly supportedType = FUI_ASSET_TYPE;
    readonly supportedExtensions = ['.fui'];
    readonly contentType: AssetContentType = 'binary';

    /**
     * Parse FUI package from binary content
     * 从二进制内容解析 FUI 包
     */
    async parse(content: IAssetContent, context: IAssetParseContext): Promise<IFUIAsset> {
        if (!content.binary) {
            throw new Error('FUIAssetLoader: Binary content is empty');
        }

        // Use path as resource key
        const resKey = context.metadata.path;

        // Load package from binary data
        const pkg = UIPackage.addPackageFromBuffer(resKey, content.binary);

        return {
            package: pkg,
            id: pkg.id,
            name: pkg.name,
            resKey
        };
    }

    /**
     * Dispose loaded FUI asset
     * 释放已加载的 FUI 资产
     */
    dispose(asset: IFUIAsset): void {
        if (asset.package) {
            UIPackage.removePackage(asset.resKey);
        }
    }
}

/**
 * Default FUI asset loader instance
 * 默认 FUI 资产加载器实例
 */
export const fuiAssetLoader = new FUIAssetLoader();

// Re-export types from asset-system for convenience
export type { IAssetLoader, IAssetContent, IAssetParseContext, AssetContentType };
