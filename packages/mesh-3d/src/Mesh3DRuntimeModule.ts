/**
 * Mesh3D Runtime Module - Plugin for 3D mesh rendering.
 * Mesh3D 运行时模块 - 3D 网格渲染插件。
 */

import type { IComponentRegistry, IScene } from '@esengine/ecs-framework';
import type { IRuntimeModule, IRuntimePlugin, ModuleManifest, SystemContext } from '@esengine/engine-core';
import { EngineBridgeToken } from '@esengine/ecs-engine-bindgen';
import { AssetManagerToken } from '@esengine/asset-system';
import { MeshComponent } from './MeshComponent';
import { Animation3DComponent } from './Animation3DComponent';
import { SkeletonComponent } from './SkeletonComponent';
import { MeshRenderSystem } from './systems/MeshRenderSystem';
import { MeshAssetLoaderSystem } from './systems/MeshAssetLoaderSystem';
import { Animation3DSystem } from './systems/Animation3DSystem';
import { SkeletonBakingSystem } from './systems/SkeletonBakingSystem';
import { MeshRenderSystemToken } from './tokens';

export type { SystemContext, ModuleManifest, IRuntimeModule, IRuntimePlugin };

// Re-export tokens
// 重新导出令牌
export { MeshRenderSystemToken } from './tokens';

/**
 * Runtime module for 3D mesh rendering.
 * 3D 网格渲染的运行时模块。
 */
class Mesh3DRuntimeModule implements IRuntimeModule {
    registerComponents(registry: IComponentRegistry): void {
        registry.register(MeshComponent);
        registry.register(Animation3DComponent);
        registry.register(SkeletonComponent);
    }

    createSystems(scene: IScene, context: SystemContext): void {
        // Get engine bridge from services
        // 从服务获取引擎桥接
        const bridge = context.services.get(EngineBridgeToken) ?? null;
        if (!bridge) {
            console.warn('[Mesh3D] EngineBridge not found, MeshRenderSystem will be disabled');
        }

        // Get asset manager
        // 获取资产管理器
        const assetManager = context.services.get(AssetManagerToken);

        // Create asset loader system
        // 创建资产加载器系统
        const loaderSystem = new MeshAssetLoaderSystem();
        if (assetManager) {
            loaderSystem.setAssetManager(assetManager);
        } else {
            console.warn('[Mesh3D] AssetManager not found, mesh loading will be disabled');
        }
        scene.addSystem(loaderSystem);

        // Create animation system (runs before rendering to update bone transforms)
        // 创建动画系统（在渲染前运行以更新骨骼变换）
        const animationSystem = new Animation3DSystem();
        scene.addSystem(animationSystem);

        // Create skeleton baking system (computes final bone matrices)
        // 创建骨骼烘焙系统（计算最终骨骼矩阵）
        const skeletonSystem = new SkeletonBakingSystem();
        scene.addSystem(skeletonSystem);

        // Create render system with bridge
        // 使用桥接创建渲染系统
        const renderSystem = new MeshRenderSystem(bridge);

        // Add to scene
        // 添加到场景
        scene.addSystem(renderSystem);

        // Register service
        // 注册服务
        context.services.register(MeshRenderSystemToken, renderSystem);
    }
}

/**
 * Module manifest.
 * 模块清单。
 */
const manifest: ModuleManifest = {
    id: 'mesh-3d',
    name: '@esengine/mesh-3d',
    displayName: 'Mesh 3D',
    version: '1.0.0',
    description: '3D mesh rendering with GLTF/GLB support',
    category: 'Rendering',
    icon: 'Box',
    isCore: false,
    defaultEnabled: true,
    isEngineModule: true,
    canContainContent: true,
    dependencies: ['core', 'math', 'asset-system'],
    exports: {
        components: ['MeshComponent', 'Animation3DComponent', 'SkeletonComponent']
    },
    editorPackage: '@esengine/mesh-3d-editor',
    requiresWasm: true
};

/**
 * Mesh3D Plugin export.
 * Mesh3D 插件导出。
 */
export const Mesh3DPlugin: IRuntimePlugin = {
    manifest,
    runtimeModule: new Mesh3DRuntimeModule()
};

export { Mesh3DRuntimeModule };
