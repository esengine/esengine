/**
 * 插件服务令牌（engine-core 特定）
 * Plugin Service Tokens (engine-core specific)
 *
 * 核心类型 (PluginServiceRegistry, createServiceToken, ServiceToken) 从 @esengine/ecs-framework 导入。
 * 这里只定义 engine-core 特有的服务令牌。
 *
 * Core types (PluginServiceRegistry, createServiceToken, ServiceToken) are imported from @esengine/ecs-framework.
 * This file only defines engine-core specific service tokens.
 */

import { createServiceToken } from '@esengine/ecs-framework';

// Re-export from ecs-framework for backwards compatibility
export { PluginServiceRegistry, createServiceToken, type ServiceToken } from '@esengine/ecs-framework';

// ============================================================================
// engine-core 内部 Token | engine-core Internal Tokens
// ============================================================================

/**
 * Transform 组件类型 | Transform component type
 *
 * 使用 any 类型以允许各模块使用自己的 ITransformComponent 接口定义。
 * Using any type to allow modules to use their own ITransformComponent interface definition.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TransformTypeToken = createServiceToken<new (...args: any[]) => any>('transformType');

/**
 * Canvas 元素的服务令牌
 * Service token for the canvas element
 */
export const CanvasElementToken = createServiceToken<HTMLCanvasElement>('canvasElement');

// ============================================================================
// 引擎桥接接口 | Engine Bridge Interface
// ============================================================================

/**
 * 引擎桥接接口
 * Engine bridge interface
 *
 * 定义 WASM 引擎桥接的核心契约，供各模块使用。
 * Defines the core contract of WASM engine bridge for modules to use.
 */
export interface IEngineBridge {
    /** 加载纹理 | Load texture */
    loadTexture(id: number, url: string): Promise<void>;

    /**
     * 屏幕坐标转世界坐标
     * Screen to world coordinate conversion
     */
    screenToWorld(screenX: number, screenY: number): { x: number; y: number };

    /**
     * 世界坐标转屏幕坐标
     * World to screen coordinate conversion
     */
    worldToScreen(worldX: number, worldY: number): { x: number; y: number };

    /**
     * 设置清除颜色
     * Set clear color
     */
    setClearColor(r: number, g: number, b: number, a: number): void;

    // ===== Texture State API (Optional) =====
    // ===== 纹理状态 API（可选）=====

    /**
     * 获取纹理加载状态
     * Get texture loading state
     *
     * @param id 纹理 ID | Texture ID
     * @returns 状态字符串: 'loading', 'ready', 或 'failed:reason'
     *          State string: 'loading', 'ready', or 'failed:reason'
     */
    getTextureState?(id: number): string;

    /**
     * 检查纹理是否就绪
     * Check if texture is ready for rendering
     *
     * @param id 纹理 ID | Texture ID
     * @returns 纹理数据已加载则返回 true | true if texture data is loaded
     */
    isTextureReady?(id: number): boolean;

    /**
     * 获取正在加载的纹理数量
     * Get count of textures currently loading
     *
     * @returns 处于加载状态的纹理数量 | Number of textures in loading state
     */
    getTextureLoadingCount?(): number;

    /**
     * 异步加载纹理（等待完成）
     * Load texture asynchronously (wait for completion)
     *
     * 与 loadTexture 不同，此方法会等待纹理实际加载完成。
     * Unlike loadTexture, this method waits until texture is actually loaded.
     *
     * @param id 纹理 ID | Texture ID
     * @param url 图片 URL | Image URL
     * @returns 纹理就绪时解析的 Promise | Promise that resolves when texture is ready
     */
    loadTextureAsync?(id: number, url: string): Promise<void>;

    /**
     * 等待所有加载中的纹理完成
     * Wait for all loading textures to complete
     *
     * @param timeout 最大等待时间（毫秒，默认30000）| Max wait time in ms (default 30000)
     * @returns 所有纹理加载完成时解析 | Resolves when all textures are loaded
     */
    waitForAllTextures?(timeout?: number): Promise<void>;

    // ===== Dynamic Atlas API (Optional) =====
    // ===== 动态图集 API（可选）=====

    /**
     * 创建空白纹理（用于动态图集）
     * Create blank texture (for dynamic atlas)
     *
     * @param width 宽度 | Width
     * @param height 高度 | Height
     * @returns 纹理 ID | Texture ID
     */
    createBlankTexture?(width: number, height: number): number;

    /**
     * 更新纹理区域
     * Update texture region
     *
     * @param id 纹理 ID | Texture ID
     * @param x X 坐标 | X coordinate
     * @param y Y 坐标 | Y coordinate
     * @param width 宽度 | Width
     * @param height 高度 | Height
     * @param pixels RGBA 像素数据 | RGBA pixel data
     */
    updateTextureRegion?(
        id: number,
        x: number,
        y: number,
        width: number,
        height: number,
        pixels: Uint8Array
    ): void;
}

/**
 * 引擎桥接服务令牌
 * Engine bridge service token
 */
export const EngineBridgeToken = createServiceToken<IEngineBridge>('engineBridge');
