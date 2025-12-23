/**
 * @esengine/mesh-3d - 3D Mesh Rendering Module
 * 3D 网格渲染模块
 *
 * Provides components and systems for rendering GLTF/GLB 3D models.
 * 提供用于渲染 GLTF/GLB 3D 模型的组件和系统。
 */

// Components
// 组件
export { MeshComponent } from './MeshComponent';
export { Animation3DComponent, AnimationPlayState, AnimationWrapMode } from './Animation3DComponent';
export { SkeletonComponent, type BoneTransform } from './SkeletonComponent';

// Systems
// 系统
export { MeshRenderSystem } from './systems/MeshRenderSystem';
export { MeshAssetLoaderSystem } from './systems/MeshAssetLoaderSystem';
export { Animation3DSystem } from './systems/Animation3DSystem';
export { SkeletonBakingSystem } from './systems/SkeletonBakingSystem';

// Animation utilities
// 动画工具
export { AnimationEvaluator } from './animation/AnimationEvaluator';

// Tokens
// 令牌
export { MeshRenderSystemToken } from './tokens';

// Plugin
// 插件
export {
    Mesh3DPlugin,
    Mesh3DRuntimeModule,
    type SystemContext,
    type ModuleManifest,
    type IRuntimeModule,
    type IRuntimePlugin
} from './Mesh3DRuntimeModule';
