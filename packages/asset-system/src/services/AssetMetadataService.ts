/**
 * Asset Metadata Service
 * 资产元数据服务
 *
 * Provides global access to asset metadata without requiring asset loading.
 * This service is independent of the texture loading path, allowing
 * render systems to query sprite info regardless of how textures are loaded.
 *
 * 提供对资产元数据的全局访问，无需加载资产。
 * 此服务独立于纹理加载路径，允许渲染系统查询 sprite 信息，
 * 无论纹理是如何加载的。
 */

import { AssetDatabase, ITextureSpriteInfo } from '../core/AssetDatabase';
import type { AssetGUID } from '../types/AssetTypes';
import type { ITextureEngineBridge } from '../integration/EngineIntegration';

/**
 * Global asset database instance
 * 全局资产数据库实例
 */
let globalAssetDatabase: AssetDatabase | null = null;

/**
 * Global engine bridge instance
 * 全局引擎桥实例
 *
 * Used to query texture dimensions from Rust engine (single source of truth).
 * 用于从 Rust 引擎查询纹理尺寸（唯一事实来源）。
 */
let globalEngineBridge: ITextureEngineBridge | null = null;

/**
 * Set the global asset database
 * 设置全局资产数据库
 *
 * Should be called during engine initialization.
 * 应在引擎初始化期间调用。
 *
 * @param database - AssetDatabase instance | AssetDatabase 实例
 */
export function setGlobalAssetDatabase(database: AssetDatabase | null): void {
    globalAssetDatabase = database;
}

/**
 * Get the global asset database
 * 获取全局资产数据库
 *
 * @returns AssetDatabase instance or null | AssetDatabase 实例或 null
 */
export function getGlobalAssetDatabase(): AssetDatabase | null {
    return globalAssetDatabase;
}

/**
 * Set the global engine bridge
 * 设置全局引擎桥
 *
 * The engine bridge is used to query texture dimensions directly from Rust engine.
 * This is the single source of truth for texture dimensions.
 * 引擎桥用于直接从 Rust 引擎查询纹理尺寸。
 * 这是纹理尺寸的唯一事实来源。
 *
 * @param bridge - ITextureEngineBridge instance | ITextureEngineBridge 实例
 */
export function setGlobalEngineBridge(bridge: ITextureEngineBridge | null): void {
    globalEngineBridge = bridge;
}

/**
 * Get the global engine bridge
 * 获取全局引擎桥
 *
 * @returns ITextureEngineBridge instance or null | ITextureEngineBridge 实例或 null
 */
export function getGlobalEngineBridge(): ITextureEngineBridge | null {
    return globalEngineBridge;
}

/**
 * Get texture sprite info by GUID
 * 通过 GUID 获取纹理 Sprite 信息
 *
 * This is the primary API for render systems to query nine-patch/sprite info.
 * It combines data from:
 * - Asset metadata (sliceBorder, pivot) from AssetDatabase
 * - Texture dimensions (width, height) from Rust engine (single source of truth)
 *
 * 这是渲染系统查询九宫格/sprite 信息的主要 API。
 * 它合并来自：
 * - AssetDatabase 的资产元数据（sliceBorder, pivot）
 * - Rust 引擎的纹理尺寸（width, height）（唯一事实来源）
 *
 * @param guid - Texture asset GUID | 纹理资产 GUID
 * @returns Sprite info or undefined | Sprite 信息或 undefined
 */
export function getTextureSpriteInfo(guid: AssetGUID): ITextureSpriteInfo | undefined {
    // Get sprite settings from metadata
    // 从元数据获取 sprite 设置
    const metadataInfo = globalAssetDatabase?.getTextureSpriteInfo(guid);

    // Get texture dimensions from Rust engine (single source of truth)
    // 从 Rust 引擎获取纹理尺寸（唯一事实来源）
    let dimensions: { width: number; height: number } | undefined;

    if (globalEngineBridge?.getTextureInfoByPath && globalAssetDatabase) {
        // Get asset path from database
        // 从数据库获取资产路径
        const metadata = globalAssetDatabase.getMetadata(guid);
        if (metadata?.path) {
            const engineInfo = globalEngineBridge.getTextureInfoByPath(metadata.path);
            if (engineInfo) {
                dimensions = engineInfo;
            }
        }
    }

    // If no metadata and no dimensions, return undefined
    // 如果没有元数据也没有尺寸，返回 undefined
    if (!metadataInfo && !dimensions) {
        return undefined;
    }

    // Merge the two sources
    // 合并两个数据源
    return {
        sliceBorder: metadataInfo?.sliceBorder,
        pivot: metadataInfo?.pivot,
        width: dimensions?.width,
        height: dimensions?.height
    };
}

// Re-export type for convenience
// 为方便起见重新导出类型
export type { ITextureSpriteInfo };
