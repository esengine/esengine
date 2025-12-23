/**
 * ECS Engine Bindgen - Bridge layer between ECS Framework and Rust Engine.
 * ECS引擎桥接层 - ECS框架与Rust引擎之间的桥接层。
 *
 * @packageDocumentation
 */

// Service tokens and interfaces (谁定义接口，谁导出 Token)
export {
    RenderSystemToken,
    EngineIntegrationToken,
    EngineBridgeToken,
    // 新的单一职责服务令牌 | New single-responsibility service tokens
    TextureServiceToken,
    DynamicAtlasServiceToken,
    CoordinateServiceToken,
    RenderConfigServiceToken,
    // 接口类型 | Interface types
    type IRenderSystem,
    type IEngineIntegration,
    type IRenderDataProvider,
    type ITextureService,
    type IDynamicAtlasService,
    type ICoordinateService,
    type IRenderConfigService
} from './tokens';

export { EngineBridge } from './core/EngineBridge';
export type { EngineBridgeConfig } from './core/EngineBridge';
export { RenderBatcher } from './core/RenderBatcher';
export { SpriteRenderHelper } from './core/SpriteRenderHelper';
export type { ITransformComponent } from './core/SpriteRenderHelper';
export { EngineRenderSystem, type TransformComponentType, type IUIRenderDataProvider, type GizmoDataProviderFn, type HasGizmoProviderFn, type ProviderRenderData, type AssetPathResolverFn } from './systems/EngineRenderSystem';
export * from './types';
