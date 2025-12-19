/**
 * UI Texture Utilities
 * UI 纹理工具
 *
 * Unified texture handling for UI components.
 * 统一的 UI 组件纹理处理。
 */

import { isValidGUID } from '@esengine/asset-system';

/**
 * Texture descriptor for UI components
 * UI 组件的纹理描述符
 *
 * Provides a unified way to describe texture resources across UI components.
 * 为 UI 组件提供统一的纹理资源描述方式。
 */
export interface UITextureDescriptor {
    /** Asset GUID (from asset system) | 资产 GUID（来自资产系统） */
    guid?: string;

    /** Runtime texture ID | 运行时纹理 ID */
    textureId?: number;

    /** Texture file path (for dynamic atlas loading) | 纹理文件路径（用于动态图集加载） */
    path?: string;

    /** Source texture width | 源纹理宽度 */
    width?: number;

    /** Source texture height | 源纹理高度 */
    height?: number;

    /** UV coordinates [u0, v0, u1, v1] | UV 坐标 */
    uv?: [number, number, number, number];
}

/**
 * Nine-patch texture descriptor
 * 九宫格纹理描述符
 */
export interface UINinePatchDescriptor extends UITextureDescriptor {
    /** Nine-patch margins [top, right, bottom, left] | 九宫格边距 */
    margins: [number, number, number, number];
}

/**
 * Check if a texture descriptor is valid
 * 检查纹理描述符是否有效
 */
export function isValidTexture(texture: UITextureDescriptor | undefined | null): boolean {
    if (!texture) return false;
    return !!(texture.guid || texture.textureId || texture.path);
}

/**
 * Check if a GUID string is a valid asset GUID
 * 检查 GUID 字符串是否是有效的资产 GUID
 */
export function isValidTextureGuid(guid: string | undefined | null): boolean {
    if (!guid) return false;
    return isValidGUID(guid);
}

/**
 * Get texture key for batching (atlas or direct texture)
 * 获取用于合批的纹理键（图集或直接纹理）
 */
export function getTextureKey(texture: UITextureDescriptor | undefined): string {
    if (!texture) return 'solid';
    if (texture.guid) return texture.guid;
    if (texture.textureId) return `id:${texture.textureId}`;
    if (texture.path) return `path:${texture.path}`;
    return 'solid';
}

/**
 * Create default UV coordinates
 * 创建默认 UV 坐标
 */
export function defaultUV(): [number, number, number, number] {
    return [0, 0, 1, 1];
}

/**
 * Normalize texture descriptor from various input formats
 * 从各种输入格式规范化纹理描述符
 *
 * @param input - String (GUID), number (textureId), or descriptor
 * @returns Normalized texture descriptor
 */
export function normalizeTextureDescriptor(
    input: string | number | UITextureDescriptor | undefined | null
): UITextureDescriptor | undefined {
    if (input === undefined || input === null) return undefined;

    if (typeof input === 'string') {
        if (!input) return undefined;
        return { guid: input };
    }

    if (typeof input === 'number') {
        if (input <= 0) return undefined;
        return { textureId: input };
    }

    return input;
}

/**
 * Extract texture GUID from various sources
 * 从各种来源提取纹理 GUID
 */
export function extractTextureGuid(
    source: string | number | UITextureDescriptor | undefined | null
): string | undefined {
    const descriptor = normalizeTextureDescriptor(source);
    return descriptor?.guid;
}

/**
 * Merge texture descriptors (later values override earlier)
 * 合并纹理描述符（后面的值覆盖前面的）
 */
export function mergeTextureDescriptors(
    ...descriptors: (UITextureDescriptor | undefined | null)[]
): UITextureDescriptor {
    const result: UITextureDescriptor = {};

    for (const d of descriptors) {
        if (!d) continue;
        if (d.guid !== undefined) result.guid = d.guid;
        if (d.textureId !== undefined) result.textureId = d.textureId;
        if (d.path !== undefined) result.path = d.path;
        if (d.width !== undefined) result.width = d.width;
        if (d.height !== undefined) result.height = d.height;
        if (d.uv !== undefined) result.uv = [...d.uv];
    }

    return result;
}

/**
 * Check if nine-patch margins are valid
 * 检查九宫格边距是否有效
 */
export function isValidNinePatchMargins(margins: [number, number, number, number] | undefined): boolean {
    if (!margins) return false;
    return margins.some(m => m > 0);
}

/**
 * Calculate nine-patch minimum size based on margins
 * 根据边距计算九宫格最小尺寸
 */
export function getNinePatchMinSize(margins: [number, number, number, number]): { width: number; height: number } {
    const [top, right, bottom, left] = margins;
    return {
        width: left + right,
        height: top + bottom
    };
}
