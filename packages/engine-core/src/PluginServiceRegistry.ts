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
// 渲染服务接口 | Render Service Interfaces
// ============================================================================

/**
 * 纹理服务接口
 * Texture service interface
 *
 * 负责纹理的加载、状态查询和管理。
 * Responsible for texture loading, state querying, and management.
 */
export interface ITextureService {
    /** 加载纹理 | Load texture */
    loadTexture(id: number, url: string): Promise<void>;

    /** 获取纹理加载状态 | Get texture loading state */
    getTextureState(id: number): string;

    /** 检查纹理是否就绪 | Check if texture is ready */
    isTextureReady(id: number): boolean;

    /** 获取正在加载的纹理数量 | Get loading texture count */
    getTextureLoadingCount(): number;

    /** 异步加载纹理（等待完成）| Load texture async (wait for completion) */
    loadTextureAsync(id: number, url: string): Promise<void>;

    /** 等待所有加载中的纹理完成 | Wait for all textures to load */
    waitForAllTextures(timeout?: number): Promise<void>;
}

/**
 * 动态图集服务接口
 * Dynamic atlas service interface
 */
export interface IDynamicAtlasService {
    /** 创建空白纹理 | Create blank texture */
    createBlankTexture(width: number, height: number): number;

    /** 更新纹理区域 | Update texture region */
    updateTextureRegion(
        id: number,
        x: number,
        y: number,
        width: number,
        height: number,
        pixels: Uint8Array
    ): void;
}

/**
 * 坐标转换服务接口
 * Coordinate transform service interface
 */
export interface ICoordinateService {
    /** 屏幕坐标转世界坐标 | Screen to world */
    screenToWorld(screenX: number, screenY: number): { x: number; y: number };

    /** 世界坐标转屏幕坐标 | World to screen */
    worldToScreen(worldX: number, worldY: number): { x: number; y: number };
}

/**
 * 渲染配置服务接口
 * Render config service interface
 */
export interface IRenderConfigService {
    /** 设置清除颜色 | Set clear color */
    setClearColor(r: number, g: number, b: number, a: number): void;
}

// ============================================================================
// 服务令牌 | Service Tokens
// ============================================================================

/** 纹理服务令牌 | Texture service token */
export const TextureServiceToken = createServiceToken<ITextureService>('textureService');

/** 动态图集服务令牌 | Dynamic atlas service token */
export const DynamicAtlasServiceToken = createServiceToken<IDynamicAtlasService>('dynamicAtlasService');

/** 坐标转换服务令牌 | Coordinate service token */
export const CoordinateServiceToken = createServiceToken<ICoordinateService>('coordinateService');

/** 渲染配置服务令牌 | Render config service token */
export const RenderConfigServiceToken = createServiceToken<IRenderConfigService>('renderConfigService');
