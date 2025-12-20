/**
 * FGUIRuntimeModule
 *
 * Runtime module for FairyGUI integration with the ECS framework.
 * Registers components and asset loaders.
 *
 * FairyGUI ECS 集成的运行时模块，注册组件和资产加载器
 */

import type { IComponentRegistry, IScene } from '@esengine/ecs-framework';
import type { IRuntimeModule, IRuntimePlugin, ModuleManifest, SystemContext } from '@esengine/engine-core';
import { CanvasElementToken } from '@esengine/engine-core';
import { AssetManagerToken, type IAssetManager } from '@esengine/asset-system';
import { FGUIComponent } from './FGUIComponent';
import { FGUIRenderSystem, setFGUIRenderSystem } from './FGUIRenderSystem';
import { FGUIUpdateSystem } from './FGUIUpdateSystem';
import { FUIAssetLoader, FUI_ASSET_TYPE } from '../asset/FUIAssetLoader';
import { Stage } from '../core/Stage';

/**
 * FGUIRuntimeModule
 *
 * Implements IRuntimeModule for FairyGUI integration.
 *
 * 实现 IRuntimeModule 的 FairyGUI 集成模块
 */
export class FGUIRuntimeModule implements IRuntimeModule {
    private _renderSystem: FGUIRenderSystem | null = null;
    private _loaderRegistered = false;

    /**
     * Register components to ComponentRegistry
     * 注册组件到 ComponentRegistry
     */
    registerComponents(registry: IComponentRegistry): void {
        registry.register(FGUIComponent);
    }

    /**
     * Create systems for scene
     * 为场景创建系统
     */
    createSystems(scene: IScene, context: SystemContext): void {
        // Get asset manager from service registry
        const assetManager = context.services.get(AssetManagerToken);

        // Register FUI asset loader
        if (!this._loaderRegistered && assetManager) {
            const loader = new FUIAssetLoader();
            (assetManager as IAssetManager).registerLoader(FUI_ASSET_TYPE, loader);
            this._loaderRegistered = true;
        }

        // Create and add FGUIUpdateSystem
        const updateSystem = new FGUIUpdateSystem();
        if (assetManager) {
            updateSystem.setAssetManager(assetManager as IAssetManager);
        }
        scene.addSystem(updateSystem);
    }

    /**
     * Called after all systems are created
     * 所有系统创建完成后调用
     */
    onSystemsCreated(_scene: IScene, context: SystemContext): void {
        // Create render system (not an EntitySystem, handles its own update)
        this._renderSystem = new FGUIRenderSystem();

        // Set asset manager for the render system
        const assetManager = context.services.get(AssetManagerToken);
        if (assetManager) {
            this._renderSystem.setAssetManager(assetManager as IAssetManager);
        }

        // Bind Stage to canvas for input events
        const canvas = context.services.get(CanvasElementToken);
        if (canvas) {
            Stage.inst.bindToCanvas(canvas);
        }

        // Initialize the render system
        this._renderSystem.initialize();

        // Store global reference
        setFGUIRenderSystem(this._renderSystem);
    }

    /**
     * Get the render system
     * 获取渲染系统
     */
    get renderSystem(): FGUIRenderSystem | null {
        return this._renderSystem;
    }
}

/**
 * Module manifest
 * 模块清单
 */
const manifest: ModuleManifest = {
    id: 'fairygui',
    name: '@esengine/fairygui',
    displayName: 'FairyGUI',
    version: '1.0.0',
    description: 'FairyGUI UI system for ECS framework',
    category: 'Other',
    icon: 'Layout',
    isCore: false,
    defaultEnabled: true,
    isEngineModule: true,
    canContainContent: true,
    dependencies: ['core', 'math', 'asset-system'],
    exports: {
        components: ['FGUIComponent'],
        systems: ['FGUIRenderSystem'],
        loaders: ['FUIAssetLoader']
    },
    editorPackage: '@esengine/fairygui-editor',
    assetExtensions: {
        '.fui': 'fui'
    }
};

/**
 * FairyGUI Plugin
 * FairyGUI 插件
 */
export const FGUIPlugin: IRuntimePlugin = {
    manifest,
    runtimeModule: new FGUIRuntimeModule()
};
