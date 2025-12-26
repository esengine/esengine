/**
 * FairyGUI Asset Loaders
 *
 * Asset loaders for FairyGUI package files.
 *
 * FairyGUI 包文件的资产加载器
 */

export {
    FUIAssetLoader,
    fuiAssetLoader,
    FUI_ASSET_TYPE
} from './FUIAssetLoader';

export type { IFUIAsset } from './FUIAssetLoader';

// Texture management | 纹理管理
export {
    FGUITextureManager,
    getFGUITextureManager,
    createTextureResolver,
    setGlobalTextureService,
    getGlobalTextureService
} from './FGUITextureManager';

export type { ITextureService } from './FGUITextureManager';

// Re-export types from asset-system for convenience
export type {
    IAssetLoader,
    IAssetContent,
    IAssetParseContext,
    AssetContentType
} from '@esengine/asset-system';
