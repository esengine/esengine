/**
 * FGUIRenderSystem
 *
 * ECS system for rendering FairyGUI components.
 * Collects render data from all FGUI components and submits to the engine.
 *
 * 用于渲染 FairyGUI 组件的 ECS 系统，收集所有 FGUI 组件的渲染数据并提交到引擎
 */

import type { IAssetManager } from '@esengine/asset-system';
import { createServiceToken } from '@esengine/ecs-framework';

/**
 * Service token for FGUI render system
 * FGUI 渲染系统的服务令牌
 */
export const FGUIRenderSystemToken = createServiceToken<FGUIRenderSystem>('fguiRenderSystem');
import { FGUIComponent } from './FGUIComponent';
import { RenderCollector } from '../render/RenderCollector';
import { Timer } from '../core/Timer';

/**
 * Render submit callback type
 * 渲染提交回调类型
 */
export type RenderSubmitCallback = (collector: RenderCollector) => void;

/**
 * FGUIRenderSystem
 *
 * Manages rendering for all FairyGUI components in the scene.
 * 管理场景中所有 FairyGUI 组件的渲染
 */
export class FGUIRenderSystem {
    /** System update order | 系统更新顺序 */
    public readonly updateOrder: number = 1000;

    /** Render collector | 渲染收集器 */
    private _collector: RenderCollector;

    /** All registered FGUI components | 所有已注册的 FGUI 组件 */
    private _components: Set<FGUIComponent> = new Set();

    /** Render submit callback | 渲染提交回调 */
    private _onSubmit: RenderSubmitCallback | null = null;

    /** Whether the system is enabled | 系统是否启用 */
    private _enabled: boolean = true;

    /** Last update time | 上次更新时间 */
    private _lastTime: number = 0;

    /** Asset manager for loading FUI packages | 用于加载 FUI 包的资产管理器 */
    private _assetManager: IAssetManager | null = null;

    constructor() {
        this._collector = new RenderCollector();
    }

    /**
     * Set asset manager for loading FUI packages
     * 设置用于加载 FUI 包的资产管理器
     */
    public setAssetManager(assetManager: IAssetManager): void {
        this._assetManager = assetManager;
    }

    /**
     * Get asset manager
     * 获取资产管理器
     */
    public get assetManager(): IAssetManager | null {
        return this._assetManager;
    }

    /**
     * Set render submit callback
     * 设置渲染提交回调
     */
    public set onSubmit(callback: RenderSubmitCallback | null) {
        this._onSubmit = callback;
    }

    /**
     * Get render collector
     * 获取渲染收集器
     */
    public get collector(): RenderCollector {
        return this._collector;
    }

    /**
     * Enable or disable the system
     * 启用或禁用系统
     */
    public set enabled(value: boolean) {
        this._enabled = value;
    }

    public get enabled(): boolean {
        return this._enabled;
    }

    /**
     * Register a FGUI component
     * 注册 FGUI 组件
     */
    public registerComponent(component: FGUIComponent): void {
        this._components.add(component);
    }

    /**
     * Unregister a FGUI component
     * 注销 FGUI 组件
     */
    public unregisterComponent(component: FGUIComponent): void {
        this._components.delete(component);
    }

    /**
     * Get all registered components
     * 获取所有已注册的组件
     */
    public getComponents(): ReadonlySet<FGUIComponent> {
        return this._components;
    }

    /**
     * Initialize the system
     * 初始化系统
     */
    public initialize(): void {
        this._lastTime = performance.now() / 1000;
    }

    /**
     * Update all FGUI components
     * 更新所有 FGUI 组件
     */
    public update(deltaTime?: number): void {
        if (!this._enabled) return;

        // Calculate delta time in seconds if not provided
        const currentTime = performance.now() / 1000;
        const dt = deltaTime ?? (currentTime - this._lastTime);
        this._lastTime = currentTime;

        // Update timers - Timer expects milliseconds
        Timer.inst.update(dt * 1000);

        // Clear collector for new frame
        this._collector.clear();

        // Sort components by sorting order
        const sortedComponents = Array.from(this._components)
            .filter(c => c.isReady && c.visible)
            .sort((a, b) => a.sortingOrder - b.sortingOrder);

        // Collect render data from each component
        for (const component of sortedComponents) {
            if (component.root) {
                component.syncProperties();
                component.root.collectRenderData(this._collector);
            }
        }

        // Submit render data
        if (this._onSubmit) {
            this._onSubmit(this._collector);
        }
    }

    /**
     * Dispose the system
     * 释放系统
     */
    public dispose(): void {
        for (const component of this._components) {
            component.dispose();
        }
        this._components.clear();
        this._onSubmit = null;
    }
}

/**
 * Default FGUI render system instance
 * 默认 FGUI 渲染系统实例
 */
let _defaultSystem: FGUIRenderSystem | null = null;

/**
 * Get default FGUI render system
 * 获取默认 FGUI 渲染系统
 */
export function getFGUIRenderSystem(): FGUIRenderSystem {
    if (!_defaultSystem) {
        _defaultSystem = new FGUIRenderSystem();
    }
    return _defaultSystem;
}

/**
 * Set default FGUI render system
 * 设置默认 FGUI 渲染系统
 */
export function setFGUIRenderSystem(system: FGUIRenderSystem): void {
    _defaultSystem = system;
}
