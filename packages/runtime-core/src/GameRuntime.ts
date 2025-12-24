/**
 * Unified Game Runtime
 * 统一游戏运行时
 *
 * 这是编辑器预览和独立运行的统一入口点
 * This is the unified entry point for editor preview and standalone runtime
 */

import { Core, Scene, SceneSerializer, HierarchySystem, PluginServiceRegistry, createServiceToken } from '@esengine/ecs-framework';
import {
    EngineBridge,
    EngineRenderSystem,
    RenderSystemToken,
    EngineIntegrationToken,
    TextureServiceToken,
    DynamicAtlasServiceToken,
    CoordinateServiceToken,
    RenderConfigServiceToken,
    type IUIRenderDataProvider
} from '@esengine/ecs-engine-bindgen';
import {
    TransformComponent,
    TransformSystem,
    InputSystem,
    Input,
    TransformTypeToken,
    CanvasElementToken
} from '@esengine/engine-core';
import { AssetManager, EngineIntegration, AssetManagerToken, setGlobalAssetDatabase } from '@esengine/asset-system';

// ============================================================================
// 本地服务令牌定义 | Local Service Token Definitions
// ============================================================================
// 这些令牌使用 createServiceToken() 本地定义，而不是从源模块导入。
// 这是有意为之：
// 1. runtime-core 应保持与 ui/sprite/behavior-tree 等模块的松耦合
// 2. createServiceToken() 使用 Symbol.for()，确保相同名称在运行时匹配
// 3. 本地接口提供类型安全，无需引入模块依赖
//
// These tokens are defined locally using createServiceToken() instead of
// importing from source modules. This is intentional:
// 1. runtime-core should remain loosely coupled to ui/sprite/behavior-tree etc.
// 2. createServiceToken() uses Symbol.for(), ensuring same names match at runtime
// 3. Local interfaces provide type safety without introducing module dependencies
// ============================================================================

/**
 * 可启用/禁用的系统接口
 * Interface for systems that can be enabled/disabled
 */
interface IEnableableSystem {
    enabled: boolean;
}

/**
 * 行为树系统接口
 * Behavior tree system interface
 */
interface IBehaviorTreeSystem extends IEnableableSystem {
    startAllAutoStartTrees?(): void;
}

/**
 * 物理系统接口
 * Physics system interface
 */
interface IPhysicsSystem extends IEnableableSystem {
    reset?(): void;
}

/**
 * Tilemap 系统接口
 * Tilemap system interface
 */
interface ITilemapSystem {
    clearCache?(): void;
}

// UI 模块服务令牌 | UI module service tokens
const UIRenderProviderToken = createServiceToken<IUIRenderDataProvider>('uiRenderProvider');

// Sprite 模块服务令牌 | Sprite module service tokens
const SpriteAnimatorSystemToken = createServiceToken<IEnableableSystem>('spriteAnimatorSystem');

// BehaviorTree 模块服务令牌 | BehaviorTree module service tokens
const BehaviorTreeSystemToken = createServiceToken<IBehaviorTreeSystem>('behaviorTreeSystem');

// Physics 模块服务令牌 | Physics module service tokens
const Physics2DSystemToken = createServiceToken<IPhysicsSystem>('physics2DSystem');

// Tilemap 模块服务令牌 | Tilemap module service tokens
const TilemapSystemToken = createServiceToken<ITilemapSystem>('tilemapSystem');

import {
    runtimePluginManager,
    type SystemContext,
    type IRuntimeModule
} from './PluginManager';
import {
    PluginLoader,
    type PluginLoadConfig
} from './PluginLoader';
import {
    BUILTIN_PLUGIN_PACKAGES,
    mergeProjectConfig,
    convertToPluginLoadConfigs,
    type ProjectConfig
} from './ProjectConfig';
import type { IPlatformAdapter, PlatformAdapterConfig } from './IPlatformAdapter';
import {
    RuntimeMode,
    getRuntimeModeConfig,
    isEditorMode as checkIsEditorMode,
    shouldEnableGameLogic,
    type RuntimeModeConfig
} from './RuntimeMode';

/**
 * 运行时配置
 * Runtime configuration
 */
export interface GameRuntimeConfig {
    /** 平台适配器 */
    platform: IPlatformAdapter;
    /** 项目配置 */
    projectConfig?: Partial<ProjectConfig>;
    /** Canvas ID */
    canvasId: string;
    /** 初始宽度 */
    width?: number;
    /** 初始高度 */
    height?: number;
    /** 是否自动启动渲染循环 */
    autoStartRenderLoop?: boolean;
    /** UI 画布尺寸 */
    uiCanvasSize?: { width: number; height: number };
    /**
     * 跳过内部插件加载
     * 编辑器模式下，插件由 editor-core 的 PluginManager 管理
     * Skip internal plugin loading - editor mode uses editor-core's PluginManager
     */
    skipPluginLoading?: boolean;
}

/**
 * 运行时状态
 * Runtime state
 */
export interface RuntimeState {
    initialized: boolean;
    running: boolean;
    paused: boolean;
    mode: RuntimeMode;
}

/**
 * 统一游戏运行时
 * Unified Game Runtime
 *
 * 提供编辑器预览和独立运行的统一实现
 * Provides unified implementation for editor preview and standalone runtime
 */
export class GameRuntime {
    private _platform: IPlatformAdapter;
    private _bridge: EngineBridge | null = null;
    private _scene: Scene | null = null;
    private _renderSystem: EngineRenderSystem | null = null;
    private _inputSystem: InputSystem | null = null;
    private _assetManager: AssetManager | null = null;
    private _engineIntegration: EngineIntegration | null = null;
    private _projectConfig: ProjectConfig;
    private _config: GameRuntimeConfig;

    private _state: RuntimeState = {
        initialized: false,
        running: false,
        paused: false,
        mode: RuntimeMode.EditorStatic
    };

    private _animationFrameId: number | null = null;
    private _lastTime = 0;

    // 系统上下文，供插件使用
    private _systemContext: SystemContext | null = null;

    // 场景快照（用于编辑器预览后恢复）
    // 支持二进制格式以提升性能
    private _sceneSnapshot: string | Uint8Array | null = null;

    // Gizmo 注册表注入函数
    private _gizmoDataProvider?: (component: any, entity: any, isSelected: boolean) => any;
    private _hasGizmoProvider?: (component: any) => boolean;

    constructor(config: GameRuntimeConfig) {
        this._config = config;
        this._platform = config.platform;
        this._projectConfig = mergeProjectConfig(config.projectConfig || {});
    }

    /**
     * 获取运行时状态
     */
    get state(): RuntimeState {
        return { ...this._state };
    }

    /**
     * @zh 获取当前运行模式
     * @en Get current runtime mode
     */
    get mode(): RuntimeMode {
        return this._state.mode;
    }

    /**
     * 获取场景
     */
    get scene(): Scene | null {
        return this._scene;
    }

    /**
     * 获取引擎桥接
     */
    get bridge(): EngineBridge | null {
        return this._bridge;
    }

    /**
     * 获取渲染系统
     */
    get renderSystem(): EngineRenderSystem | null {
        return this._renderSystem;
    }

    /**
     * 获取资产管理器
     */
    get assetManager(): AssetManager | null {
        return this._assetManager;
    }

    /**
     * 获取引擎集成
     */
    get engineIntegration(): EngineIntegration | null {
        return this._engineIntegration;
    }

    /**
     * 获取系统上下文
     */
    get systemContext(): SystemContext | null {
        return this._systemContext;
    }

    /**
     * 获取服务注册表（用于编辑器模式下注册外部创建的系统）
     * Get service registry (for registering externally created systems in editor mode)
     */
    getServiceRegistry(): PluginServiceRegistry | null {
        return this._systemContext?.services ?? null;
    }

    /**
     * 获取平台适配器
     */
    get platform(): IPlatformAdapter {
        return this._platform;
    }

    /**
     * @zh 设置运行模式
     * @en Set runtime mode
     *
     * @zh 根据模式自动配置系统启用状态、UI 显示等
     * @en Automatically configures system enabling, UI visibility, etc. based on mode
     *
     * @param mode - @zh 目标模式 @en Target mode
     * @param options - @zh 可选覆盖配置 @en Optional override configuration
     */
    setMode(mode: RuntimeMode, options?: Partial<RuntimeModeConfig>): void {
        if (!this._state.initialized) {
            console.warn('[GameRuntime] Cannot set mode before initialization');
            return;
        }

        const previousMode = this._state.mode;
        this._state.mode = mode;

        // 获取模式配置并应用覆盖
        const config = { ...getRuntimeModeConfig(mode), ...options };

        console.log(`[GameRuntime] Mode: ${previousMode} → ${mode}`);

        // 1. 配置场景编辑器模式
        if (this._scene) {
            this._scene.isEditorMode = !config.triggerLifecycle;
        }

        // 2. 配置渲染系统
        if (this._renderSystem) {
            this._renderSystem.setPreviewMode(mode !== RuntimeMode.EditorStatic);
            this._renderSystem.setShowGizmos(config.showGizmos);
        }

        // 3. 配置引擎桥接
        if (this._bridge) {
            this._bridge.setShowGrid(config.showGrid);
            this._bridge.setEditorMode(config.isEditorEnvironment);
        }

        // 4. 配置输入系统
        if (this._inputSystem) {
            this._inputSystem.enabled = config.enableInput;
        }

        // 5. 配置游戏逻辑系统
        this._applySystemConfig(config);

        // 6. 触发生命周期（从静态模式进入其他模式时）
        if (previousMode === RuntimeMode.EditorStatic && config.triggerLifecycle) {
            this._scene?.begin();
        }

        // 7. 更新运行状态
        this._state.running = shouldEnableGameLogic(mode);
        this._state.paused = false;
    }

    /**
     * @zh 应用系统配置
     * @en Apply system configuration
     */
    private _applySystemConfig(config: RuntimeModeConfig): void {
        const services = this._systemContext?.services;
        if (!services) return;

        // 物理系统
        const physicsSystem = services.get(Physics2DSystemToken);
        if (physicsSystem) {
            physicsSystem.enabled = config.enablePhysics;
        }

        // 行为树系统
        const behaviorTreeSystem = services.get(BehaviorTreeSystemToken);
        if (behaviorTreeSystem) {
            behaviorTreeSystem.enabled = config.enableBehaviorTree;
            if (config.enableBehaviorTree) {
                behaviorTreeSystem.startAllAutoStartTrees?.();
            }
        }

        // 动画系统
        const animatorSystem = services.get(SpriteAnimatorSystemToken);
        if (animatorSystem) {
            animatorSystem.enabled = config.enableAnimation;
        }
    }

    /**
     * 初始化运行时
     * Initialize runtime
     */
    async initialize(): Promise<void> {
        if (this._state.initialized) {
            return;
        }

        try {
            // 1. 初始化平台
            await this._platform.initialize({
                canvasId: this._config.canvasId,
                width: this._config.width,
                height: this._config.height,
                isEditor: this._platform.isEditorMode()
            });

            // 2. 获取 WASM 模块并创建引擎桥接
            const wasmModule = await this._platform.getWasmModule();
            this._bridge = new EngineBridge({
                canvasId: this._config.canvasId,
                width: this._config.width,
                height: this._config.height
            });
            await this._bridge.initializeWithModule(wasmModule);

            // 3. 设置路径解析器
            this._bridge.setPathResolver((path: string) => {
                return this._platform.pathResolver.resolve(path);
            });

            // 4. 初始化 ECS Core
            if (!Core.Instance) {
                Core.create({ debug: false });
            }

            // 5. 创建或获取场景
            if (Core.scene) {
                this._scene = Core.scene as Scene;
            } else {
                this._scene = new Scene({ name: 'GameScene' });
                Core.setScene(this._scene);
            }

            // 编辑器模式下设置 isEditorMode，延迟组件生命周期回调
            // Set isEditorMode in editor mode to defer component lifecycle callbacks
            if (this._platform.isEditorMode()) {
                this._scene.isEditorMode = true;
            }

            // 6. 添加基础系统
            this._scene.addSystem(new HierarchySystem());
            this._scene.addSystem(new TransformSystem());

            // 7. 添加输入系统（最先更新，以便其他系统可以读取输入状态）
            // Add input system (updates first so other systems can read input state)
            this._inputSystem = new InputSystem({
                disableInEditor: true // 编辑器模式下禁用，避免与编辑器输入冲突
            });
            this._scene.addSystem(this._inputSystem);

            // 设置平台输入子系统 | Set platform input subsystem
            const inputSubsystem = this._platform.getInputSubsystem?.();
            if (inputSubsystem) {
                this._inputSystem.setInputSubsystem(inputSubsystem);
            }

            // CameraSystem 由 CameraPlugin 通过插件系统创建
            // CameraSystem is created by CameraPlugin via plugin system

            this._renderSystem = new EngineRenderSystem(this._bridge, TransformComponent);

            // 7. 设置 UI 画布尺寸
            if (this._config.uiCanvasSize) {
                this._renderSystem.setUICanvasSize(
                    this._config.uiCanvasSize.width,
                    this._config.uiCanvasSize.height
                );
            } else {
                this._renderSystem.setUICanvasSize(1920, 1080);
            }

            // 8. 创建资产系统
            this._assetManager = new AssetManager();
            this._engineIntegration = new EngineIntegration(this._assetManager, this._bridge);

            // 设置全局资产数据库（供渲染系统查询 sprite 元数据）
            // Set global asset database (for render systems to query sprite metadata)
            setGlobalAssetDatabase(this._assetManager.getDatabase());

            // 9. 加载并初始化插件（编辑器模式下跳过，由 editor-core 的 PluginManager 处理）
            if (!this._config.skipPluginLoading) {
                await this._initializePlugins();
            }

            // 10. 创建系统上下文（使用 PluginServiceRegistry）
            const services = new PluginServiceRegistry();

            // 注册核心服务 | Register core services
            // 使用单一职责接口注册 EngineBridge | Register EngineBridge with single-responsibility interfaces
            services.register(TextureServiceToken, this._bridge);
            services.register(DynamicAtlasServiceToken, this._bridge);
            services.register(CoordinateServiceToken, this._bridge);
            services.register(RenderConfigServiceToken, this._bridge);
            services.register(RenderSystemToken, this._renderSystem);
            services.register(EngineIntegrationToken, this._engineIntegration);
            services.register(AssetManagerToken, this._assetManager);
            services.register(TransformTypeToken, TransformComponent);

            // 注册 Canvas 元素（用于坐标转换等）
            // Register canvas element (for coordinate conversion, etc.)
            const canvas = this._platform.getCanvas();
            if (canvas) {
                services.register(CanvasElementToken, canvas);
            }

            this._systemContext = {
                isEditor: this._platform.isEditorMode(),
                services
            };

            // 11. 让插件创建系统（编辑器模式下跳过，由 EngineService.initializeModuleSystems 处理）
            if (!this._config.skipPluginLoading) {
                runtimePluginManager.createSystemsForScene(this._scene, this._systemContext);
            }

            // 11. 设置 UI 渲染数据提供者（如果有）
            const uiRenderProvider = this._systemContext.services.get(UIRenderProviderToken);
            if (uiRenderProvider) {
                this._renderSystem.setUIRenderDataProvider(uiRenderProvider);
            }

            // 12. 添加渲染系统（在所有其他系统之后）
            this._scene.addSystem(this._renderSystem);

            // 13. 启动默认 world
            const defaultWorld = Core.worldManager.getWorld('__default__');
            if (defaultWorld && !defaultWorld.isActive) {
                defaultWorld.start();
            }

            this._state.initialized = true;

            // 14. 设置初始模式
            const initialMode = this._platform.isEditorMode()
                ? RuntimeMode.EditorStatic
                : RuntimeMode.Standalone;
            this._state.mode = initialMode;

            // 应用初始模式配置（不触发 setMode 的完整流程，因为刚初始化）
            const modeConfig = getRuntimeModeConfig(initialMode);
            this._applySystemConfig(modeConfig);

            // 15. 自动启动渲染循环
            if (this._config.autoStartRenderLoop !== false) {
                this._startRenderLoop();
            }
        } catch (error) {
            console.error('[GameRuntime] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * @zh 加载并初始化插件
     * @en Load and initialize plugins
     */
    private async _initializePlugins(): Promise<void> {
        const hasPlugins = runtimePluginManager.getPlugins().length > 0;

        if (!hasPlugins) {
            const configs = convertToPluginLoadConfigs(this._projectConfig, BUILTIN_PLUGIN_PACKAGES);
            const loader = new PluginLoader({ plugins: configs });

            await loader.loadAll();

            const loaded = loader.getLoaded();
            const failed = loader.getFailed();

            if (loaded.length > 0) {
                console.log(`[GameRuntime] Loaded: ${loaded.map(p => p.packageId).join(', ')}`);
            }
            if (failed.length > 0) {
                for (const p of failed) {
                    console.warn(`[GameRuntime] Failed: ${p.packageId} - ${p.error}`);
                }
            }
        }

        await runtimePluginManager.initializeRuntime(Core.services);
    }

    /**
     * 禁用游戏逻辑系统（编辑器模式）
     */
    private _disableGameLogicSystems(): void {
        const services = this._systemContext?.services;
        if (!services) return;

        // 这些系统由插件创建，通过服务注册表获取引用
        const animatorSystem = services.get(SpriteAnimatorSystemToken);
        if (animatorSystem) {
            animatorSystem.enabled = false;
        }

        const behaviorTreeSystem = services.get(BehaviorTreeSystemToken);
        if (behaviorTreeSystem) {
            behaviorTreeSystem.enabled = false;
        }

        const physicsSystem = services.get(Physics2DSystemToken);
        if (physicsSystem) {
            physicsSystem.enabled = false;
        }
    }

    /**
     * 启用游戏逻辑系统（预览/运行模式）
     */
    private _enableGameLogicSystems(): void {
        const services = this._systemContext?.services;
        if (!services) return;

        const animatorSystem = services.get(SpriteAnimatorSystemToken);
        if (animatorSystem) {
            animatorSystem.enabled = true;
        }

        const behaviorTreeSystem = services.get(BehaviorTreeSystemToken);
        if (behaviorTreeSystem) {
            behaviorTreeSystem.enabled = true;
            behaviorTreeSystem.startAllAutoStartTrees?.();
        }

        const physicsSystem = services.get(Physics2DSystemToken);
        if (physicsSystem) {
            physicsSystem.enabled = true;
        }
    }

    /**
     * 启动渲染循环
     */
    private _startRenderLoop(): void {
        if (this._animationFrameId !== null) {
            return;
        }
        this._lastTime = performance.now();
        this._renderLoop();
    }

    /**
     * 渲染循环
     */
    private _renderLoop = (): void => {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this._lastTime) / 1000;
        this._lastTime = currentTime;

        // 更新 ECS
        Core.update(deltaTime);

        this._animationFrameId = requestAnimationFrame(this._renderLoop);
    };

    /**
     * 停止渲染循环
     */
    private _stopRenderLoop(): void {
        if (this._animationFrameId !== null) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }
    }

    /**
     * @zh 开始运行（切换到预览模式）
     * @en Start running (switch to preview mode)
     *
     * @zh 在编辑器中，从 EditorStatic 切换到 EditorPreview
     * @en In editor, switches from EditorStatic to EditorPreview
     */
    start(): void {
        if (!this._state.initialized || this._state.running) {
            return;
        }

        // 根据平台选择目标模式
        const targetMode = this._platform.isEditorMode()
            ? RuntimeMode.EditorPreview
            : RuntimeMode.Standalone;

        this.setMode(targetMode);

        // 确保渲染循环在运行
        this._startRenderLoop();
    }

    /**
     * 暂停运行
     * Pause running
     */
    pause(): void {
        if (!this._state.running || this._state.paused) {
            return;
        }
        this._state.paused = true;
    }

    /**
     * 恢复运行
     * Resume running
     */
    resume(): void {
        if (!this._state.running || !this._state.paused) {
            return;
        }
        this._state.paused = false;
    }

    /**
     * @zh 停止运行（切换回静态模式）
     * @en Stop running (switch back to static mode)
     *
     * @zh 在编辑器中，从 EditorPreview 切换回 EditorStatic
     * @en In editor, switches from EditorPreview back to EditorStatic
     */
    stop(): void {
        if (!this._state.running) {
            return;
        }

        // 在编辑器中切换回静态模式（setMode 会处理系统禁用）
        if (this._platform.isEditorMode()) {
            this.setMode(RuntimeMode.EditorStatic);
        }

        // 重置物理系统状态
        const physicsSystem = this._systemContext?.services.get(Physics2DSystemToken);
        if (physicsSystem) {
            physicsSystem.reset?.();
        }
    }

    /**
     * 单步执行
     * Step forward one frame
     */
    step(): void {
        if (!this._state.initialized) {
            return;
        }

        // 启用系统执行一帧
        this._enableGameLogicSystems();
        Core.update(1 / 60);
        this._disableGameLogicSystems();
    }

    /**
     * 加载场景数据
     * Load scene data
     */
    async loadScene(sceneData: string | object): Promise<void> {
        if (!this._scene) {
            throw new Error('Scene not initialized');
        }

        const jsonStr = typeof sceneData === 'string'
            ? sceneData
            : JSON.stringify(sceneData);

        SceneSerializer.deserialize(this._scene, jsonStr, {
            strategy: 'replace',
            preserveIds: true
        });
    }

    /**
     * 从 URL 加载场景
     * Load scene from URL
     */
    async loadSceneFromUrl(url: string): Promise<void> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load scene from ${url}: ${response.status}`);
        }
        const sceneJson = await response.text();
        await this.loadScene(sceneJson);
    }

    /**
     * 从数据对象加载场景（用于单文件模式）
     * Load scene from data object (for single-file mode)
     */
    async loadSceneFromData(sceneData: unknown): Promise<void> {
        const sceneJson = JSON.stringify(sceneData);
        await this.loadScene(sceneJson);
    }

    /**
     * 调整视口大小
     * Resize viewport
     */
    resize(width: number, height: number): void {
        if (this._bridge) {
            this._bridge.resize(width, height);
        }
        this._platform.resize(width, height);
    }

    /**
     * 设置相机
     * Set camera
     */
    setCamera(config: { x: number; y: number; zoom: number; rotation?: number }): void {
        if (this._bridge) {
            this._bridge.setCamera({
                x: config.x,
                y: config.y,
                zoom: config.zoom,
                rotation: config.rotation ?? 0
            });
        }
    }

    /**
     * 获取相机状态
     * Get camera state
     */
    getCamera(): { x: number; y: number; zoom: number; rotation: number } {
        if (this._bridge) {
            return this._bridge.getCamera();
        }
        return { x: 0, y: 0, zoom: 1, rotation: 0 };
    }

    /**
     * 设置网格显示
     * Set grid visibility
     */
    setShowGrid(show: boolean): void {
        if (this._bridge) {
            this._bridge.setShowGrid(show);
        }
    }

    /**
     * 设置 Gizmo 显示
     * Set gizmo visibility
     */
    setShowGizmos(show: boolean): void {
        if (this._renderSystem) {
            this._renderSystem.setShowGizmos(show);
        }
    }

    /**
     * 设置编辑器模式
     * Set editor mode
     *
     * When false (runtime mode), editor-only UI like grid, gizmos,
     * and axis indicator are automatically hidden.
     * 当为 false（运行时模式）时，编辑器专用 UI 会自动隐藏。
     */
    setEditorMode(isEditor: boolean): void {
        if (this._bridge) {
            this._bridge.setEditorMode(isEditor);
        }
    }

    /**
     * 获取编辑器模式
     * Get editor mode
     */
    isEditorMode(): boolean {
        if (this._bridge) {
            return this._bridge.isEditorMode();
        }
        return true;
    }

    /**
     * 设置清除颜色
     * Set clear color
     */
    setClearColor(r: number, g: number, b: number, a: number = 1.0): void {
        if (this._bridge) {
            this._bridge.setClearColor(r, g, b, a);
        }
    }

    /**
     * 获取统计信息
     * Get stats
     */
    getStats(): { fps: number; drawCalls: number; spriteCount: number } {
        if (!this._renderSystem) {
            return { fps: 0, drawCalls: 0, spriteCount: 0 };
        }

        const engineStats = this._renderSystem.getStats();
        return {
            fps: engineStats?.fps ?? 0,
            drawCalls: engineStats?.drawCalls ?? 0,
            spriteCount: this._renderSystem.spriteCount
        };
    }

    // ===== 编辑器特有功能 =====
    // ===== Editor-specific features =====

    /**
     * 设置 Gizmo 注册表（编辑器模式）
     * Set gizmo registry (editor mode)
     */
    setGizmoRegistry(
        gizmoDataProvider: (component: any, entity: any, isSelected: boolean) => any,
        hasGizmoProvider: (component: any) => boolean
    ): void {
        this._gizmoDataProvider = gizmoDataProvider;
        this._hasGizmoProvider = hasGizmoProvider;

        if (this._renderSystem) {
            this._renderSystem.setGizmoRegistry(gizmoDataProvider, hasGizmoProvider);
        }
    }

    /**
     * 设置选中的实体 ID（编辑器模式）
     * Set selected entity IDs (editor mode)
     */
    setSelectedEntityIds(ids: number[]): void {
        if (this._renderSystem) {
            this._renderSystem.setSelectedEntityIds(ids);
        }
    }

    /**
     * 设置变换工具模式（编辑器模式）
     * Set transform tool mode (editor mode)
     */
    setTransformMode(mode: 'select' | 'move' | 'rotate' | 'scale'): void {
        if (this._renderSystem) {
            this._renderSystem.setTransformMode(mode);
        }
    }

    /**
     * 获取变换工具模式
     * Get transform tool mode
     */
    getTransformMode(): 'select' | 'move' | 'rotate' | 'scale' {
        return this._renderSystem?.getTransformMode() ?? 'select';
    }

    /**
     * 设置 UI 画布尺寸
     * Set UI canvas size
     */
    setUICanvasSize(width: number, height: number): void {
        if (this._renderSystem) {
            this._renderSystem.setUICanvasSize(width, height);
        }
    }

    /**
     * 获取 UI 画布尺寸
     * Get UI canvas size
     */
    getUICanvasSize(): { width: number; height: number } {
        return this._renderSystem?.getUICanvasSize() ?? { width: 0, height: 0 };
    }

    /**
     * 设置 UI 画布边界显示
     * Set UI canvas boundary visibility
     */
    setShowUICanvasBoundary(show: boolean): void {
        if (this._renderSystem) {
            this._renderSystem.setShowUICanvasBoundary(show);
        }
    }

    /**
     * 获取 UI 画布边界显示状态
     * Get UI canvas boundary visibility
     */
    getShowUICanvasBoundary(): boolean {
        return this._renderSystem?.getShowUICanvasBoundary() ?? true;
    }

    // ===== 场景快照 API =====
    // ===== Scene Snapshot API =====

    /**
     * 保存场景快照
     * Save scene snapshot
     *
     * 使用二进制格式提升序列化性能，并支持 EntityRef 的正确序列化。
     * 使用路径稳定 ID 后，不再需要清除纹理缓存。
     *
     * Uses binary format for better serialization performance and supports proper
     * EntityRef serialization. With path-stable IDs, no need to clear texture cache.
     *
     * @param options 可选配置
     * @param options.useJson 是否使用 JSON 格式（用于调试），默认 false 使用二进制
     */
    saveSceneSnapshot(options?: { useJson?: boolean }): boolean {
        if (!this._scene) {
            console.warn('[GameRuntime] Cannot save snapshot: no scene');
            return false;
        }

        try {
            // 使用路径稳定 ID 后，不再清除纹理缓存
            // 组件保存的 textureId 在 Play/Stop 后仍然有效
            // With path-stable IDs, no longer clear texture cache
            // Component's saved textureId remains valid after Play/Stop

            // 使用二进制格式提升性能（默认）或 JSON 用于调试
            // Use binary format for performance (default) or JSON for debugging
            const format = options?.useJson ? 'json' : 'binary';

            this._sceneSnapshot = SceneSerializer.serialize(this._scene, {
                format,
                pretty: false,
                includeMetadata: false
            });
            return true;
        } catch (error) {
            console.error('[GameRuntime] Failed to save snapshot:', error);
            return false;
        }
    }

    /**
     * 恢复场景快照
     * Restore scene snapshot
     *
     * 使用两阶段反序列化确保 EntityRef 引用正确恢复：
     * 1. 创建所有实体和组件
     * 2. 解析所有 EntityRef 引用
     *
     * 使用路径稳定 ID 后，不再需要清除纹理缓存。
     * 组件保存的 textureId 在恢复后仍然有效。
     *
     * Uses two-phase deserialization to ensure EntityRef references are properly restored:
     * 1. Create all entities and components
     * 2. Resolve all EntityRef references
     *
     * With path-stable IDs, no need to clear texture cache.
     * Component's saved textureId remains valid after restore.
     */
    async restoreSceneSnapshot(): Promise<boolean> {
        if (!this._scene || !this._sceneSnapshot) {
            console.warn('[GameRuntime] Cannot restore: no scene or snapshot');
            return false;
        }

        try {
            // 清除 Tilemap 缓存（Tilemap 使用独立的缓存机制）
            // Clear Tilemap cache (Tilemap uses its own cache mechanism)
            const tilemapSystem = this._systemContext?.services.get(TilemapSystemToken);
            if (tilemapSystem) {
                tilemapSystem.clearCache?.();
            }

            // 使用路径稳定 ID 后，不再清除纹理缓存
            // 组件保存的 textureId 在 Play/Stop 后仍然有效
            // With path-stable IDs, no longer clear texture cache
            // Component's saved textureId remains valid after Play/Stop

            // 反序列化场景（SceneSerializer 内部使用 SerializationContext 处理 EntityRef）
            // Deserialize scene (SceneSerializer internally uses SerializationContext for EntityRef)
            SceneSerializer.deserialize(this._scene, this._sceneSnapshot, {
                strategy: 'replace',
                preserveIds: true
            });

            this._sceneSnapshot = null;
            return true;
        } catch (error) {
            console.error('[GameRuntime] Failed to restore snapshot:', error);
            return false;
        }
    }

    /**
     * 检查是否有快照
     * Check if snapshot exists
     */
    hasSnapshot(): boolean {
        return this._sceneSnapshot !== null;
    }

    /**
     * 获取快照大小（用于调试）
     * Get snapshot size (for debugging)
     */
    getSnapshotSize(): number {
        if (!this._sceneSnapshot) {
            return 0;
        }
        if (typeof this._sceneSnapshot === 'string') {
            return this._sceneSnapshot.length;
        }
        return this._sceneSnapshot.byteLength;
    }

    // ===== 多视口 API =====
    // ===== Multi-viewport API =====

    /**
     * 注册视口
     * Register viewport
     */
    registerViewport(id: string, canvasId: string): void {
        if (this._bridge) {
            this._bridge.registerViewport(id, canvasId);
        }
    }

    /**
     * 注销视口
     * Unregister viewport
     */
    unregisterViewport(id: string): void {
        if (this._bridge) {
            this._bridge.unregisterViewport(id);
        }
    }

    /**
     * 设置活动视口
     * Set active viewport
     */
    setActiveViewport(id: string): boolean {
        if (this._bridge) {
            return this._bridge.setActiveViewport(id);
        }
        return false;
    }

    /**
     * 释放资源
     * Dispose resources
     */
    dispose(): void {
        this.stop();
        this._stopRenderLoop();

        if (this._assetManager) {
            this._assetManager.dispose();
            this._assetManager = null;
            // 清除全局资产数据库引用 | Clear global asset database reference
            setGlobalAssetDatabase(null);
        }

        this._engineIntegration = null;
        this._scene = null;

        if (this._bridge) {
            this._bridge.dispose();
            this._bridge = null;
        }

        this._renderSystem = null;
        this._inputSystem = null;
        this._systemContext = null;
        this._platform.dispose();

        this._state.initialized = false;
    }
}

/**
 * 创建游戏运行时实例
 * Create game runtime instance
 */
export function createGameRuntime(config: GameRuntimeConfig): GameRuntime {
    return new GameRuntime(config);
}
