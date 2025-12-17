/**
 * Dynamic Atlas Module
 * 动态图集模块
 *
 * Provides runtime texture atlasing for UI batching optimization.
 * 提供运行时纹理图集，用于 UI 合批优化。
 */

export { BinPacker, type PackedRect } from './BinPacker';
export {
    DynamicAtlasManager,
    getDynamicAtlasManager,
    setDynamicAtlasManager,
    AtlasExpansionStrategy,
    type AtlasEntry,
    type IAtlasEngineBridge,
    type DynamicAtlasConfig
} from './DynamicAtlasManager';
export {
    DynamicAtlasService,
    getDynamicAtlasService,
    setDynamicAtlasService,
    initializeDynamicAtlasService,
    reinitializeDynamicAtlasService,
    registerTexturePathMapping,
    getTexturePathByGuid,
    clearTexturePathMappings,
    type TextureInfo
} from './DynamicAtlasService';
