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
import { getDynamicFontManager, COMMON_ASCII_CHARS } from '../text/DynamicFont';

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

        // Initialize dynamic font system with system default font
        // 使用系统默认字体初始化动态字体系统
        this.initDynamicFonts();

        // Initialize the render system
        this._renderSystem.initialize();

        // Store global reference
        setFGUIRenderSystem(this._renderSystem);
    }

    /**
     * Initialize dynamic font system
     * 初始化动态字体系统
     *
     * Creates a default dynamic font using system fonts.
     * This allows text rendering without preloaded MSDF fonts.
     *
     * 创建使用系统字体的默认动态字体。
     * 这允许在没有预加载 MSDF 字体的情况下渲染文本。
     */
    private initDynamicFonts(): void {
        const fontManager = getDynamicFontManager();

        // Create default font using system fonts (cross-platform, no licensing issues)
        // 使用系统字体创建默认字体（跨平台，无许可问题）
        // Font stack: system-ui for modern browsers, then common fallbacks
        const defaultFont = fontManager.createFont('default', {
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", sans-serif',
            fontSize: 32,
            atlasWidth: 1024,
            atlasHeight: 1024,
            padding: 2,
            preloadChars: COMMON_ASCII_CHARS
        });

        // Also create Arial alias using system sans-serif
        // 为 Arial 创建别名，使用系统 sans-serif
        fontManager.createFont('Arial', {
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", sans-serif',
            fontSize: 32,
            atlasWidth: 1024,
            atlasHeight: 1024,
            padding: 2,
            preloadChars: COMMON_ASCII_CHARS
        });

        // Register as MSDF-compatible fonts
        // 注册为 MSDF 兼容字体
        defaultFont.registerAsMSDFFont();
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
