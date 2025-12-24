/**
 * Engine service for managing Rust engine lifecycle.
 * 管理Rust引擎生命周期的服务。
 *
 * 使用统一的 GameRuntime 架构
 * Uses the unified GameRuntime architecture
 */

import { GizmoRegistry, EntityStoreService, MessageHub, SceneManagerService, ProjectService, PluginManager, IPluginManager, AssetRegistryService, GizmoInteractionService, GizmoInteractionServiceToken, type SystemContext } from '@esengine/editor-core';
import { Core, Scene, Entity, SceneSerializer, ProfilerSDK, createLogger, PluginServiceRegistry } from '@esengine/ecs-framework';
import {
    CameraConfig,
    RenderSystemToken,
    EngineIntegrationToken,
    TextureServiceToken,
    DynamicAtlasServiceToken,
    CoordinateServiceToken,
    RenderConfigServiceToken,
    EngineBridgeToken
} from '@esengine/ecs-engine-bindgen';
import { TransformComponent, TransformTypeToken, CanvasElementToken } from '@esengine/engine-core';
import { SpriteComponent, SpriteAnimatorComponent, SpriteAnimatorSystemToken } from '@esengine/sprite';
import { ParticleSystemComponent } from '@esengine/particle';
import {
    FGUIRenderSystemToken,
    getFGUIRenderSystem,
    FGUIRenderDataProvider,
    setGlobalTextureService,
    createTextureResolver,
    Stage,
    getDOMTextRenderer
} from '@esengine/fairygui';
import { SettingsService } from './SettingsService';
import * as esEngine from '@esengine/engine';
import {
    AssetManager,
    EngineIntegration,
    AssetPathResolver,
    AssetPlatform,
    SceneResourceManager,
    AssetType,
    AssetManagerToken,
    isValidGUID,
    setGlobalAssetDatabase,
    setGlobalEngineBridge,
    setGlobalAssetFileLoader
} from '@esengine/asset-system';
import { EditorAssetFileLoader } from './EditorAssetFileLoader';
import {
    GameRuntime,
    createGameRuntime,
    EditorPlatformAdapter,
    RuntimeMode,
    type GameRuntimeConfig
} from '@esengine/runtime-core';
import { BehaviorTreeSystemToken } from '@esengine/behavior-tree';
import { Physics2DSystemToken } from '@esengine/physics-rapier2d';
import { getMaterialManager } from '@esengine/material-system';
import { WebInputSubsystem } from '@esengine/platform-web';
import { resetEngineState } from '../hooks/useEngine';
import { convertFileSrc } from '@tauri-apps/api/core';
import { IdGenerator } from '../utils/idGenerator';

import { TauriAssetReader } from './TauriAssetReader';

const logger = createLogger('EngineService');

/**
 * Engine service singleton for editor integration.
 * 用于编辑器集成的引擎服务单例。
 *
 * 内部使用 GameRuntime，对外保持原有 API 兼容
 * Internally uses GameRuntime, maintains original API compatibility externally
 */
export class EngineService {
    private static _instance: EngineService | null = null;

    private _runtime: GameRuntime | null = null;
    private _initialized = false;
    private _modulesInitialized = false;
    private _running = false;
    private _canvasId: string | null = null;
    private _gizmoInteractionService: GizmoInteractionService | null = null;

    // 资产系统相关
    private _assetManager: AssetManager | null = null;
    private _engineIntegration: EngineIntegration | null = null;
    private _sceneResourceManager: SceneResourceManager | null = null;
    private _assetPathResolver: AssetPathResolver | null = null;
    private _assetSystemInitialized = false;
    private _initializationError: Error | null = null;

    // 编辑器相机状态（用于恢复）
    private _editorCameraState = { x: 0, y: 0, zoom: 1 };

    // 当前选中的实体 IDs（用于高亮）| Currently selected entity IDs (for highlighting)
    private _selectedEntityIds: number[] = [];

    private constructor() {}

    /**
     * Get singleton instance.
     * 获取单例实例。
     */
    static getInstance(): EngineService {
        if (!EngineService._instance) {
            EngineService._instance = new EngineService();
        }
        return EngineService._instance;
    }

    /**
     * 等待引擎初始化完成
     */
    async waitForInitialization(timeout = 10000): Promise<boolean> {
        if (this._initialized) {
            return true;
        }

        const startTime = Date.now();
        while (!this._initialized && Date.now() - startTime < timeout) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return this._initialized;
    }

    /**
     * Initialize the engine with canvas.
     * 使用canvas初始化引擎。
     */
    async initialize(canvasId: string): Promise<void> {
        if (this._initialized) {
            return;
        }

        this._canvasId = canvasId;

        try {
            // 创建路径转换函数
            const pathTransformer = (path: string) => {
                if (path.startsWith('http://') ||
                    path.startsWith('https://') ||
                    path.startsWith('data:') ||
                    path.startsWith('asset://')) {
                    return path;
                }
                return convertFileSrc(path);
            };

            // 创建编辑器平台适配器
            // Create editor platform adapter
            const platform = new EditorPlatformAdapter({
                wasmModule: esEngine,
                pathTransformer,
                gizmoDataProvider: (component, entity, isSelected) =>
                    GizmoRegistry.getGizmoData(component, entity, isSelected),
                hasGizmoProvider: (component) =>
                    GizmoRegistry.hasProvider(component.constructor as any),
                // 提供输入子系统用于 Play 模式下的游戏输入
                // Provide input subsystem for game input in Play mode
                inputSubsystemFactory: () => new WebInputSubsystem()
            });

            // 创建统一运行时
            // 编辑器模式下跳过内部插件加载，由 editor-core 的 PluginManager 管理
            this._runtime = createGameRuntime({
                platform,
                canvasId,
                autoStartRenderLoop: true,
                uiCanvasSize: { width: 1920, height: 1080 },
                skipPluginLoading: true  // 编辑器自己管理插件
            });

            await this._runtime.initialize();

            // 设置 MaterialManager 的引擎桥接（上传内置 shader 到 GPU）
            // Set engine bridge for MaterialManager (upload built-in shaders to GPU)
            const materialManager = getMaterialManager();
            if (materialManager && this._runtime.bridge) {
                materialManager.setEngineBridge(this._runtime.bridge);
            }

            // 启用性能分析器（编辑器模式默认启用）
            ProfilerSDK.setEnabled(true);

            // 设置 Gizmo 注册表
            this._runtime.setGizmoRegistry(
                (component, entity, isSelected) =>
                    GizmoRegistry.getGizmoData(component, entity, isSelected),
                (component) =>
                    GizmoRegistry.hasProvider(component.constructor as any)
            );

            // 初始化 Gizmo 交互服务
            // Initialize Gizmo Interaction Service
            this._gizmoInteractionService = new GizmoInteractionService();
            Core.pluginServices.register(GizmoInteractionServiceToken, this._gizmoInteractionService);

            // 设置 Gizmo 交互函数到渲染系统
            // Set gizmo interaction functions to render system
            if (this._runtime.renderSystem) {
                this._runtime.renderSystem.setGizmoInteraction(
                    (entityId: number, baseColor: { r: number; g: number; b: number; a: number }, isSelected: boolean) =>
                        this._gizmoInteractionService!.getHighlightColor(entityId, baseColor, isSelected),
                    () => this._gizmoInteractionService!.getHoveredEntityId()
                );
            }

            // 初始化资产系统
            await this._initializeAssetSystem();

            // 设置资产路径解析器（用于 GUID 到路径的转换）
            // Set asset path resolver (for GUID to path conversion)
            this._setupAssetPathResolver();

            // 同步视口尺寸
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
            if (canvas && canvas.parentElement) {
                const rect = canvas.parentElement.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;

                canvas.width = Math.floor(rect.width * dpr);
                canvas.height = Math.floor(rect.height * dpr);
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;

                this._runtime.resize(canvas.width, canvas.height);
            }

            this._initialized = true;
        } catch (error) {
            console.error('Failed to initialize engine:', error);
            throw error;
        }
    }

    /**
     * 初始化模块系统
     */
    async initializeModuleSystems(): Promise<void> {
        if (!this._initialized || !this._runtime) {
            console.error('Engine not initialized. Call initialize() first.');
            return;
        }

        if (this._modulesInitialized) {
            this.clearModuleSystems();
        }

        // 获取 PluginManager
        const pluginManager = Core.services.tryResolve<PluginManager>(IPluginManager);
        if (!pluginManager) {
            console.error('PluginManager not available.');
            return;
        }

        // 初始化所有插件的运行时模块
        await pluginManager.initializeRuntime(Core.services);

        // 创建服务注册表并注册核心服务
        // Create service registry and register core services
        const services = new PluginServiceRegistry();
        // 注册 EngineBridge（供 MeshRenderSystem 等系统使用）
        // Register EngineBridge (for systems like MeshRenderSystem)
        services.register(EngineBridgeToken, this._runtime.bridge);
        // 使用单一职责接口注册 EngineBridge | Register EngineBridge with single-responsibility interfaces
        services.register(TextureServiceToken, this._runtime.bridge);
        services.register(DynamicAtlasServiceToken, this._runtime.bridge);
        services.register(CoordinateServiceToken, this._runtime.bridge);
        services.register(RenderConfigServiceToken, this._runtime.bridge);
        services.register(RenderSystemToken, this._runtime.renderSystem);
        services.register(AssetManagerToken, this._assetManager);
        services.register(EngineIntegrationToken, this._engineIntegration);
        services.register(TransformTypeToken, TransformComponent);

        // 注册 Canvas 元素（用于坐标转换等）
        // Register canvas element (for coordinate conversion, etc.)
        const canvas = this._runtime.platform.getCanvas();
        if (canvas) {
            services.register(CanvasElementToken, canvas);
        }

        // 创建系统上下文
        const context: SystemContext = {
            isEditor: true,
            services
        };

        // 让插件为场景创建系统
        pluginManager.createSystemsForScene(this._runtime.scene!, context);

        // Re-sync assets after plugins registered their loaders
        // 插件注册完加载器后，重新同步资产（确保类型正确）
        await this._syncAssetRegistryToManager();

        // Subscribe to asset changes to sync new assets to runtime
        // 订阅资产变化以将新资产同步到运行时
        this._subscribeToAssetChanges();

        // 同步服务注册表到 GameRuntime（用于 start/stop 时启用/禁用系统）
        // Sync service registry to GameRuntime (for enabling/disabling systems on start/stop)
        const runtimeServices = this._runtime.getServiceRegistry();
        if (runtimeServices) {
            // 复制所有已注册的服务到 runtime 的服务注册表
            // 这样 runtime 的 start/stop 方法可以正确访问这些服务
            const animatorSystem = services.get(SpriteAnimatorSystemToken);
            const behaviorTreeSystem = services.get(BehaviorTreeSystemToken);
            const physicsSystem = services.get(Physics2DSystemToken);
            const fguiRenderSystem = getFGUIRenderSystem();

            if (animatorSystem) runtimeServices.register(SpriteAnimatorSystemToken, animatorSystem);
            if (behaviorTreeSystem) runtimeServices.register(BehaviorTreeSystemToken, behaviorTreeSystem);
            if (physicsSystem) runtimeServices.register(Physics2DSystemToken, physicsSystem);
            if (fguiRenderSystem) runtimeServices.register(FGUIRenderSystemToken, fguiRenderSystem);
        }

        // 设置 FairyGUI 渲染系统 | Set FairyGUI render system
        const fguiRenderSystem = getFGUIRenderSystem();
        const renderSystem = this._runtime?.renderSystem;
        if (fguiRenderSystem && this._runtime?.bridge && renderSystem) {
            const bridge = this._runtime.bridge;

            // Set global texture service for FGUI
            // 设置 FGUI 的全局纹理服务
            setGlobalTextureService({
                loadTextureByPath: (url: string) => bridge.loadTextureByPath(url),
                getTextureIdByPath: (url: string) => bridge.getTextureIdByPath(url)
            });

            // Create render data provider to convert FGUI primitives to engine format
            // 创建渲染数据提供者，将 FGUI 图元转换为引擎格式
            const fguiRenderDataProvider = new FGUIRenderDataProvider();
            fguiRenderDataProvider.setCollector(fguiRenderSystem.collector);
            fguiRenderDataProvider.setSorting('UI', 1000);

            // Use the centralized texture resolver from FGUITextureManager
            // 使用 FGUITextureManager 的集中式纹理解析器
            fguiRenderDataProvider.setTextureResolver(createTextureResolver());

            // Initialize DOM text renderer for text fallback
            // 初始化 DOM 文本渲染器作为文本回退
            const domTextRenderer = getDOMTextRenderer();
            const canvas = document.getElementById('viewport-canvas') as HTMLCanvasElement;
            if (canvas) {
                domTextRenderer.initialize(canvas);
            }

            // Create UI render data provider adapter for EngineRenderSystem
            // 为 EngineRenderSystem 创建 UI 渲染数据提供者适配器
            // This adapter updates FGUI and returns render data in the format expected by the engine
            // 此适配器更新 FGUI 并以引擎期望的格式返回渲染数据
            const runtime = this._runtime;
            const uiRenderProvider = {
                getRenderData: () => {
                    // Update canvas size for coordinate conversion
                    // FGUI uses top-left origin, engine uses center origin
                    // 更新画布尺寸用于坐标转换（FGUI 使用左上角原点，引擎使用中心原点）
                    const canvasSize = renderSystem.getUICanvasSize();
                    const canvasWidth = canvasSize.width > 0 ? canvasSize.width : 1920;
                    const canvasHeight = canvasSize.height > 0 ? canvasSize.height : 1080;
                    fguiRenderDataProvider.setCanvasSize(canvasWidth, canvasHeight);

                    // Update DOM text renderer settings
                    // 更新 DOM 文本渲染器设置
                    domTextRenderer.setDesignSize(canvasWidth, canvasHeight);
                    domTextRenderer.setPreviewMode(renderSystem.isPreviewMode());

                    // In editor mode, sync camera state for world-space text rendering
                    // 在编辑器模式下，同步相机状态以进行世界空间文本渲染
                    if (!renderSystem.isPreviewMode() && runtime?.bridge) {
                        const camera = runtime.bridge.getCamera();
                        domTextRenderer.setCamera({
                            x: camera.x,
                            y: camera.y,
                            zoom: camera.zoom,
                            rotation: camera.rotation
                        });
                    }

                    // Update FGUI system to collect render primitives
                    // 更新 FGUI 系统以收集渲染图元
                    fguiRenderSystem.update();

                    // Render text using DOM (fallback until MSDF text is fully integrated)
                    // 使用 DOM 渲染文本（作为回退，直到 MSDF 文本完全集成）
                    domTextRenderer.beginFrame();
                    domTextRenderer.renderPrimitives(fguiRenderSystem.collector.getPrimitives());
                    domTextRenderer.endFrame();

                    // Get render data from provider
                    // 从提供者获取渲染数据
                    fguiRenderDataProvider.setCollector(fguiRenderSystem.collector);
                    return fguiRenderDataProvider.getRenderData();
                },

                getMeshRenderData: () => {
                    // Get mesh render data for complex shapes (ellipses, polygons, etc.)
                    // 获取复杂形状（椭圆、多边形等）的网格渲染数据
                    return fguiRenderDataProvider.getMeshRenderData();
                }
            };

            // Register with EngineRenderSystem
            // 注册到 EngineRenderSystem
            renderSystem.setUIRenderDataProvider(uiRenderProvider);

            fguiRenderSystem.enabled = true;
            logger.info('FairyGUI render system connected to engine via UI render provider');
        }

        // 在编辑器模式下，禁用游戏逻辑系统
        const animatorSystem = services.get(SpriteAnimatorSystemToken);
        const behaviorTreeSystem = services.get(BehaviorTreeSystemToken);
        const physicsSystem = services.get(Physics2DSystemToken);

        if (animatorSystem) {
            animatorSystem.enabled = false;
        }
        if (behaviorTreeSystem) {
            behaviorTreeSystem.enabled = false;
        }
        if (physicsSystem) {
            physicsSystem.enabled = false;
        }

        this._modulesInitialized = true;
    }

    /**
     * 清理模块系统
     */
    clearModuleSystems(): void {
        // Unsubscribe from asset change events
        // 取消订阅资产变化事件
        this._unsubscribeFromAssetChanges();

        const pluginManager = Core.services.tryResolve<PluginManager>(IPluginManager);
        if (pluginManager) {
            pluginManager.clearSceneSystems();
        }

        // 清理 FairyGUI 渲染系统 | Clean up FairyGUI render system
        const fguiRenderSystem = getFGUIRenderSystem();
        if (fguiRenderSystem) {
            fguiRenderSystem.enabled = false;
        }

        // 清理 viewport | Clear viewport
        this.unregisterViewport('editor-viewport');

        // 重置 useEngine 的模块级状态 | Reset useEngine module-level state
        resetEngineState();

        this._modulesInitialized = false;
        this._initialized = false;
    }

    /**
     * 检查模块系统是否已初始化
     */
    isModulesInitialized(): boolean {
        return this._modulesInitialized;
    }

    /**
     * Check if engine is initialized.
     */
    isInitialized(): boolean {
        return this._initialized;
    }

    /**
     * Check if engine is running.
     */
    isRunning(): boolean {
        return this._running;
    }

    /**
     * Start the game loop (preview mode).
     */
    start(): void {
        if (!this._initialized || !this._runtime || this._running) {
            return;
        }

        this._running = true;
        this._runtime.start();

        // 启动自动播放动画
        this._startAutoPlayAnimations();
    }

    /**
     * Stop the game loop.
     */
    stop(): void {
        if (!this._runtime) return;

        this._running = false;
        this._runtime.stop();

        // 停止所有动画
        this._stopAllAnimations();
    }

    /**
     * Start all auto-play animations.
     */
    private _startAutoPlayAnimations(): void {
        const scene = this._runtime?.scene;
        if (!scene) return;

        const entities = scene.entities.findEntitiesWithComponent(SpriteAnimatorComponent);
        for (const entity of entities) {
            const animator = entity.getComponent(SpriteAnimatorComponent);
            if (animator && animator.autoPlay && animator.defaultAnimation) {
                animator.play();
            }
        }
    }

    /**
     * Stop all animations.
     */
    private _stopAllAnimations(): void {
        const scene = this._runtime?.scene;
        if (!scene) return;

        const entities = scene.entities.findEntitiesWithComponent(SpriteAnimatorComponent);
        for (const entity of entities) {
            const animator = entity.getComponent(SpriteAnimatorComponent);
            if (animator) {
                animator.stop();

                const sprite = entity.getComponent(SpriteComponent);
                if (sprite && animator.clips && animator.clips.length > 0) {
                    const firstClip = animator.clips[0];
                    if (firstClip && firstClip.frames && firstClip.frames.length > 0) {
                        const firstFrame = firstClip.frames[0];
                        if (firstFrame && firstFrame.textureGuid) {
                            sprite.textureGuid = firstFrame.textureGuid;
                        }
                    }
                }
            }
        }
    }

    /**
     * Initialize asset system
     */
    private async _initializeAssetSystem(): Promise<void> {
        try {
            // Create a new AssetManager instance for this editor session
            // 为此编辑器会话创建新的 AssetManager 实例
            this._assetManager = new AssetManager();

            // Set up asset reader for Tauri environment.
            // 为 Tauri 环境设置资产读取器。
            const assetReader = new TauriAssetReader();
            this._assetManager.setReader(assetReader);

            // Set project root when project is open.
            // 当项目打开时设置项目根路径。
            const projectService = Core.services.tryResolve<ProjectService>(ProjectService);
            if (projectService && projectService.isProjectOpen()) {
                const projectInfo = projectService.getCurrentProject();
                if (projectInfo) {
                    this._assetManager.setProjectRoot(projectInfo.path);
                }
            }

            // Sync AssetRegistryService data to assetManager's database
            // 将 AssetRegistryService 的数据同步到 assetManager 的数据库
            await this._syncAssetRegistryToManager();

            // 设置全局资产数据库（供渲染系统查询 sprite 元数据）
            // Set global asset database (for render systems to query sprite metadata)
            setGlobalAssetDatabase(this._assetManager.getDatabase());

            // 设置全局资产文件加载器（供动态图集服务等使用）
            // Set global asset file loader (for DynamicAtlasService etc.)
            const editorAssetFileLoader = new EditorAssetFileLoader(assetReader, {
                getProjectPath: () => {
                    if (projectService && projectService.isProjectOpen()) {
                        return projectService.getCurrentProject()?.path ?? null;
                    }
                    return null;
                }
            });
            setGlobalAssetFileLoader(editorAssetFileLoader);

            const pathTransformerFn = (path: string) => {
                if (!path.startsWith('http://') && !path.startsWith('https://') &&
                    !path.startsWith('data:') && !path.startsWith('asset://')) {
                    // Normalize path separators to forward slashes first
                    // 首先将路径分隔符规范化为正斜杠
                    path = path.replace(/\\/g, '/');

                    if (!path.startsWith('/') && !path.match(/^[a-zA-Z]:/)) {
                        if (projectService && projectService.isProjectOpen()) {
                            const projectInfo = projectService.getCurrentProject();
                            if (projectInfo) {
                                // Normalize project path to forward slashes
                                // 将项目路径规范化为正斜杠
                                const projectPath = projectInfo.path.replace(/\\/g, '/');
                                path = `${projectPath}/${path}`;
                            }
                        }
                    }
                    // Use convertFileSrc which handles the asset protocol correctly
                    // 使用 convertFileSrc 正确处理 asset 协议
                    const result = convertFileSrc(path);
                    console.log(`[pathTransformer] ${path} -> ${result}`);
                    return result;
                }
                return path;
            };

            this._assetPathResolver = new AssetPathResolver({
                platform: AssetPlatform.Editor,
                pathTransformer: pathTransformerFn
            });

            if (this._runtime?.bridge) {
                // 为 EngineBridge 设置路径解析器（用于 getTextureInfoByPath 等方法）
                // Set path resolver for EngineBridge (for getTextureInfoByPath etc.)
                this._runtime.bridge.setPathResolver((assetPath: string) => {
                    // 空路径直接返回
                    if (!assetPath) return assetPath;

                    // 已经是 URL 则直接返回
                    if (assetPath.startsWith('http://') ||
                        assetPath.startsWith('https://') ||
                        assetPath.startsWith('data:') ||
                        assetPath.startsWith('asset://')) {
                        return assetPath;
                    }

                    // 使用 pathTransformerFn 转换路径为 Tauri URL
                    let fullPath = assetPath;
                    // 如果路径不以 'assets/' 开头，添加前缀
                    if (!assetPath.startsWith('assets/') && !assetPath.startsWith('assets\\')) {
                        fullPath = `assets/${assetPath}`;
                    }
                    return pathTransformerFn(fullPath);
                });

                // 设置全局引擎桥（供渲染系统查询纹理尺寸 - 唯一事实来源）
                // Set global engine bridge (for render systems to query texture dimensions - single source of truth)
                setGlobalEngineBridge(this._runtime.bridge);

                this._engineIntegration = new EngineIntegration(this._assetManager, this._runtime.bridge);

                // 为 EngineIntegration 设置使用 Tauri URL 转换的 PathResolver
                // Set PathResolver for EngineIntegration that uses Tauri URL conversion
                this._engineIntegration.setPathResolver({
                    catalogToRuntime: (catalogPath: string): string => {
                        // 空路径直接返回
                        if (!catalogPath) return catalogPath;

                        // 已经是 URL 则直接返回
                        if (catalogPath.startsWith('http://') ||
                            catalogPath.startsWith('https://') ||
                            catalogPath.startsWith('data:') ||
                            catalogPath.startsWith('asset://')) {
                            return catalogPath;
                        }

                        // 使用 pathTransformerFn 转换路径为 Tauri URL
                        // 路径应该是相对于项目目录的，如 'assets/sparkle_yellow.png'
                        let fullPath = catalogPath;
                        // 如果路径不以 'assets/' 开头，添加前缀
                        if (!catalogPath.startsWith('assets/') && !catalogPath.startsWith('assets\\')) {
                            fullPath = `assets/${catalogPath}`;
                        }
                        return pathTransformerFn(fullPath);
                    },
                    editorToCatalog: (editorPath: string, projectRoot: string): string => {
                        return editorPath; // 不需要在此上下文中使用
                    },
                    setBaseUrl: () => {},
                    getBaseUrl: () => '',
                    normalize: (path: string) => path.replace(/\\/g, '/'),
                    isAbsoluteUrl: (path: string) =>
                        path.startsWith('http://') ||
                        path.startsWith('https://') ||
                        path.startsWith('data:') ||
                        path.startsWith('asset://')
                });

                this._sceneResourceManager = new SceneResourceManager();
                this._sceneResourceManager.setResourceLoader(this._engineIntegration);

                const sceneManagerService = Core.services.tryResolve<SceneManagerService>(SceneManagerService);
                if (sceneManagerService) {
                    sceneManagerService.setSceneResourceManager(this._sceneResourceManager);
                }
            }

            // Set asset manager for MaterialManager.
            // 为 MaterialManager 设置 asset manager。
            const materialManager = getMaterialManager();
            if (materialManager) {
                materialManager.setAssetManager(this._assetManager);
            }

            this._assetSystemInitialized = true;
            this._initializationError = null;
        } catch (error) {
            this._assetSystemInitialized = false;
            this._initializationError = error instanceof Error ? error : new Error(String(error));
            console.error('Failed to initialize asset system:', error);
            throw this._initializationError;
        }
    }

    /**
     * Sync AssetRegistryService data to AssetManager's database.
     * 将 AssetRegistryService 的数据同步到 AssetManager 的数据库。
     *
     * This enables GUID-based asset loading through the global assetManager.
     * Components like ParticleSystemComponent use the global assetManager to load assets by GUID.
     *
     * Asset type resolution order:
     * 1. loaderType from .meta file (explicit user override)
     * 2. loaderFactory.getAssetTypeByPath (plugin-registered loaders)
     * 3. Extension-based fallback (built-in types)
     *
     * 资产类型解析顺序：
     * 1. .meta 文件中的 loaderType（用户显式覆盖）
     * 2. loaderFactory.getAssetTypeByPath（插件注册的加载器）
     * 3. 基于扩展名的回退（内置类型）
     */
    private async _syncAssetRegistryToManager(): Promise<void> {
        if (!this._assetManager) return;

        const assetRegistry = Core.services.tryResolve(AssetRegistryService) as AssetRegistryService | null;
        if (!assetRegistry || !assetRegistry.isReady) {
            console.warn('[EngineService] AssetRegistryService not ready, skipping sync');
            return;
        }

        const database = this._assetManager.getDatabase();
        const allAssets = assetRegistry.getAllAssets();
        const metaManager = assetRegistry.metaManager;

        logger.debug(`Syncing ${allAssets.length} assets from AssetRegistry to AssetManager`);

        // Use loaderFactory to determine asset type from path
        // This allows plugins to register their own loaders and types
        // 使用 loaderFactory 根据路径确定资产类型
        // 这允许插件注册自己的加载器和类型
        const loaderFactory = this._assetManager.getLoaderFactory();

        for (const asset of allAssets) {
            let assetType: string | null = null;

            // 1. Check for explicit loaderType in .meta file (user override)
            // 1. 检查 .meta 文件中的显式 loaderType（用户覆盖）
            const meta = metaManager.getMetaByGUID(asset.guid);

            // Debug: log meta for textures with importSettings
            // 调试：记录有 importSettings 的纹理 meta
            if (meta?.importSettings?.spriteSettings) {
                console.log(`[EngineService] Syncing asset with spriteSettings: ${asset.path}`, meta.importSettings.spriteSettings);
            }

            if (meta?.loaderType) {
                assetType = meta.loaderType;
            }

            // 2. Try to get type from registered loaders
            // 2. 尝试从已注册的加载器获取类型
            if (!assetType) {
                assetType = loaderFactory?.getAssetTypeByPath?.(asset.path) ?? null;
            }

            // 3. Fallback: determine type from extension for basic types
            // 3. 回退：根据扩展名确定基本类型
            if (!assetType) {
                const ext = asset.path.substring(asset.path.lastIndexOf('.')).toLowerCase();
                if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'].includes(ext)) {
                    assetType = AssetType.Texture;
                } else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
                    assetType = AssetType.Audio;
                } else if (['.json'].includes(ext)) {
                    assetType = AssetType.Json;
                } else if (['.txt', '.md', '.xml', '.yaml'].includes(ext)) {
                    assetType = AssetType.Text;
                } else {
                    // Use Custom type - the plugin's loader should handle it
                    // 使用 Custom 类型 - 插件的加载器应该处理它
                    assetType = AssetType.Custom;
                }
            }

            database.addAsset({
                guid: asset.guid,
                path: asset.path,
                type: assetType,
                name: asset.name,
                size: asset.size,
                hash: asset.hash || '',
                dependencies: [],
                labels: meta?.labels || [],
                tags: new Map(),
                lastModified: asset.lastModified,
                version: 1,
                // 包含 importSettings（包含 spriteSettings 等）用于渲染系统查询
                // Include importSettings (contains spriteSettings etc.) for render systems to query
                importSettings: meta?.importSettings as Record<string, unknown> | undefined
            });
        }

        logger.debug('Asset sync complete');
    }

    /** Unsubscribe function for assets:changed event | assets:changed 事件的取消订阅函数 */
    private _assetsChangedUnsubscribe: (() => void) | null = null;

    /**
     * Subscribe to assets:changed events and sync new assets to runtime AssetManager.
     * 订阅 assets:changed 事件，将新资产同步到运行时 AssetManager。
     */
    private _subscribeToAssetChanges(): void {
        if (this._assetsChangedUnsubscribe) return; // Already subscribed

        const messageHub = Core.services.tryResolve(MessageHub);
        if (!messageHub || !this._assetManager) return;

        const database = this._assetManager.getDatabase();
        const assetRegistry = Core.services.tryResolve(AssetRegistryService) as AssetRegistryService | null;
        const loaderFactory = this._assetManager.getLoaderFactory();

        this._assetsChangedUnsubscribe = messageHub.subscribe(
            'assets:changed',
            async (data: { type: string; path: string; relativePath: string; guid: string }) => {
                if (data.type === 'add' || data.type === 'modify') {
                    // Get full asset info from registry
                    // 从注册表获取完整资产信息
                    const asset = assetRegistry?.getAsset(data.guid);
                    if (!asset) return;

                    // Determine asset type
                    // 确定资产类型
                    let assetType: string | null = null;

                    // 1. Try to get type from meta file
                    const meta = assetRegistry?.metaManager.getMetaByGUID(data.guid);
                    if (meta?.loaderType) {
                        assetType = meta.loaderType;
                    }

                    // 2. Try to get type from registered loaders
                    if (!assetType) {
                        assetType = loaderFactory?.getAssetTypeByPath?.(asset.path) ?? null;
                    }

                    // 3. Fallback by extension
                    if (!assetType) {
                        const ext = asset.path.substring(asset.path.lastIndexOf('.')).toLowerCase();
                        if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'].includes(ext)) {
                            assetType = AssetType.Texture;
                        } else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
                            assetType = AssetType.Audio;
                        } else if (['.json'].includes(ext)) {
                            assetType = AssetType.Json;
                        } else if (['.txt', '.md', '.xml', '.yaml'].includes(ext)) {
                            assetType = AssetType.Text;
                        } else {
                            assetType = AssetType.Custom;
                        }
                    }

                    // Add to runtime database
                    // 添加到运行时数据库
                    database.addAsset({
                        guid: asset.guid,
                        path: asset.path,
                        type: assetType,
                        name: asset.name,
                        size: asset.size,
                        hash: asset.hash || '',
                        dependencies: [],
                        labels: meta?.labels || [],
                        tags: new Map(),
                        lastModified: asset.lastModified,
                        version: 1,
                        // 包含 importSettings（包含 spriteSettings 等）用于渲染系统查询
                        // Include importSettings (contains spriteSettings etc.) for render systems to query
                        importSettings: meta?.importSettings as Record<string, unknown> | undefined
                    });

                    logger.debug(`Asset synced to runtime: ${asset.path} (${data.guid})`);
                } else if (data.type === 'remove') {
                    // Remove from runtime database
                    // 从运行时数据库移除
                    database.removeAsset(data.guid);
                    logger.debug(`Asset removed from runtime: ${data.guid}`);
                }
            }
        );

        logger.debug('Subscribed to assets:changed events');
    }

    /**
     * Unsubscribe from assets:changed events.
     * 取消订阅 assets:changed 事件。
     */
    private _unsubscribeFromAssetChanges(): void {
        if (this._assetsChangedUnsubscribe) {
            this._assetsChangedUnsubscribe();
            this._assetsChangedUnsubscribe = null;
        }
    }

    /**
     * Setup asset path resolver for EngineRenderSystem.
     * 为 EngineRenderSystem 设置资产路径解析器。
     *
     * This enables GUID-based asset references. When a component stores a GUID,
     * the resolver converts it to an actual file path for loading.
     * 这启用了基于 GUID 的资产引用。当组件存储 GUID 时，
     * 解析器将其转换为实际文件路径以进行加载。
     */
    private _setupAssetPathResolver(): void {
        const renderSystem = this._runtime?.renderSystem;
        if (!renderSystem) return;

        renderSystem.setAssetPathResolver((guidOrPath: string): string => {
            // Skip if already a valid URL
            // 如果已经是有效的 URL 则跳过
            if (!guidOrPath || guidOrPath.startsWith('http') || guidOrPath.startsWith('asset://') || guidOrPath.startsWith('data:')) {
                return guidOrPath;
            }

            // Check if this is a GUID using the unified validation function
            // 使用统一的验证函数检查是否为 GUID
            if (isValidGUID(guidOrPath)) {
                const assetRegistry = Core.services.tryResolve(AssetRegistryService) as AssetRegistryService | null;
                if (assetRegistry) {
                    const relativePath = assetRegistry.getPathByGuid(guidOrPath);
                    if (relativePath) {
                        // Convert relative path to absolute
                        // 将相对路径转换为绝对路径
                        const absolutePath = assetRegistry.relativeToAbsolute(relativePath);
                        if (absolutePath) {
                            // Convert to Tauri asset URL for WebView loading
                            // 转换为 Tauri 资产 URL 以便 WebView 加载
                            return convertFileSrc(absolutePath);
                        }
                        return relativePath;
                    } else {
                        // GUID not found in registry - this could be a timing issue where asset
                        // was just added but not yet registered. Log for debugging.
                        // GUID 在注册表中未找到 - 可能是资源刚添加但尚未注册的时序问题
                        console.warn(`[AssetPathResolver] GUID not found in registry: ${guidOrPath}. Asset may not be registered yet.`);
                    }
                }
                // GUID not found, return original value (will result in white block)
                // 未找到 GUID，返回原值（会显示白块）
                return guidOrPath;
            }

            // Not a GUID, treat as file path and convert
            // 不是 GUID，当作文件路径处理并转换
            return convertFileSrc(guidOrPath);
        });
    }

    /**
     * Create entity with sprite and transform.
     */
    createSpriteEntity(name: string, options?: {
        x?: number;
        y?: number;
        textureId?: number;
        width?: number;
        height?: number;
    }): Entity | null {
        const scene = this._runtime?.scene;
        if (!scene) return null;

        const entity = scene.createEntity(name);

        const transform = new TransformComponent();
        if (options) {
            transform.position.x = options.x ?? 0;
            transform.position.y = options.y ?? 0;
        }
        entity.addComponent(transform);

        const sprite = new SpriteComponent();
        if (options) {
            sprite.textureId = options.textureId ?? 0;
            sprite.width = options.width ?? 64;
            sprite.height = options.height ?? 64;
        }
        entity.addComponent(sprite);

        return entity;
    }

    /**
     * Load texture.
     */
    loadTexture(id: number, url: string): void {
        this._runtime?.renderSystem?.loadTexture(id, url);
    }

    /**
     * 通过相对路径加载纹理资产（用户脚本使用）
     * Load texture asset by relative path (for user scripts)
     */
    async loadTextureAsset(path: string): Promise<number> {
        if (!this._assetSystemInitialized || this._initializationError) {
            console.warn('Asset system not initialized, using fallback texture loading');
            const textureId = IdGenerator.nextId('texture-fallback');
            this.loadTexture(textureId, path);
            return textureId;
        }

        if (!this._engineIntegration) {
            const textureId = IdGenerator.nextId('texture');
            this.loadTexture(textureId, path);
            return textureId;
        }

        try {
            return await this._engineIntegration.loadTextureForComponent(path);
        } catch (error) {
            console.error('Failed to load texture asset:', error);
            const fallbackId = IdGenerator.nextId('texture-fallback');
            return fallbackId;
        }
    }

    /**
     * 通过 GUID 加载纹理资产（内部引用使用）
     * Load texture asset by GUID (for internal references)
     */
    async loadTextureAssetByGuid(guid: string): Promise<number> {
        if (!this._assetSystemInitialized || this._initializationError) {
            console.warn('Asset system not initialized');
            return 0;
        }

        if (!this._engineIntegration) {
            console.warn('Engine integration not available');
            return 0;
        }

        try {
            return await this._engineIntegration.loadTextureByGuid(guid);
        } catch (error) {
            console.error('Failed to load texture asset by GUID:', guid, error);
            return 0;
        }
    }

    /**
     * Get asset manager
     */
    getAssetManager(): AssetManager | null {
        return this._assetManager;
    }

    /**
     * Get engine integration
     */
    getEngineIntegration(): EngineIntegration | null {
        return this._engineIntegration;
    }

    /**
     * Get asset path resolver
     */
    getAssetPathResolver(): AssetPathResolver | null {
        return this._assetPathResolver;
    }

    /**
     * Get engine statistics.
     */
    getStats(): { fps: number; drawCalls: number; spriteCount: number } {
        return this._runtime?.getStats() ?? { fps: 0, drawCalls: 0, spriteCount: 0 };
    }

    /**
     * Get the ECS scene.
     */
    getScene(): Scene | null {
        return this._runtime?.scene ?? null;
    }

    /**
     * Enable animation preview in editor mode.
     */
    enableAnimationPreview(): void {
        if (this._running) return;

        const runtimeServices = this._runtime?.getServiceRegistry();
        if (runtimeServices) {
            const animatorSystem = runtimeServices.get(SpriteAnimatorSystemToken);
            if (animatorSystem) {
                // 如果有 clearEntityCache 方法则调用
                // Call clearEntityCache if available
                const system = animatorSystem as { clearEntityCache?: () => void; enabled: boolean };
                system.clearEntityCache?.();
                system.enabled = true;
            }
        }
    }

    /**
     * Disable animation preview in editor mode.
     */
    disableAnimationPreview(): void {
        if (this._running) return;

        const runtimeServices = this._runtime?.getServiceRegistry();
        if (runtimeServices) {
            const animatorSystem = runtimeServices.get(SpriteAnimatorSystemToken);
            if (animatorSystem) {
                animatorSystem.enabled = false;
            }
        }
    }

    /**
     * Check if animation preview is enabled.
     */
    isAnimationPreviewEnabled(): boolean {
        const runtimeServices = this._runtime?.getServiceRegistry();
        if (runtimeServices) {
            const animatorSystem = runtimeServices.get(SpriteAnimatorSystemToken);
            return animatorSystem?.enabled ?? false;
        }
        return false;
    }

    /**
     * Get the engine bridge.
     */
    getBridge() {
        return this._runtime?.bridge ?? null;
    }

    /**
     * Resize the engine viewport.
     */
    resize(width: number, height: number): void {
        this._runtime?.resize(width, height);
    }

    /**
     * Set camera position, zoom, and rotation.
     */
    setCamera(config: CameraConfig): void {
        this._runtime?.setCamera(config);
    }

    /**
     * Get camera state.
     */
    getCamera(): CameraConfig {
        return this._runtime?.getCamera() ?? { x: 0, y: 0, zoom: 1, rotation: 0 };
    }

    /**
     * Set grid visibility.
     */
    setShowGrid(show: boolean): void {
        this._runtime?.setShowGrid(show);
    }

    /**
     * Set clear color (background color).
     */
    setClearColor(r: number, g: number, b: number, a: number = 1.0): void {
        this._runtime?.setClearColor(r, g, b, a);
    }

    /**
     * Set gizmo visibility.
     */
    setShowGizmos(show: boolean): void {
        this._runtime?.setShowGizmos(show);
    }

    /**
     * Get gizmo visibility.
     */
    getShowGizmos(): boolean {
        return this._runtime?.renderSystem?.getShowGizmos() ?? true;
    }

    /**
     * Set editor mode.
     * 设置编辑器模式。
     *
     * When false (runtime mode), editor-only UI like grid, gizmos,
     * and axis indicator are automatically hidden.
     * 当为 false（运行时模式）时，编辑器专用 UI 会自动隐藏。
     */
    setEditorMode(isEditor: boolean): void {
        this._runtime?.setEditorMode(isEditor);
    }

    /**
     * Get editor mode.
     * 获取编辑器模式。
     */
    isEditorMode(): boolean {
        return this._runtime?.isEditorMode() ?? true;
    }

    /**
     * Set UI canvas size for boundary display.
     * Also syncs with FGUI Stage design size for coordinate conversion.
     *
     * 设置 UI 画布尺寸用于边界显示，同时同步到 FGUI Stage 设计尺寸用于坐标转换
     */
    setUICanvasSize(width: number, height: number): void {
        this._runtime?.setUICanvasSize(width, height);

        // Sync to FGUI Stage design size for coordinate conversion
        // 同步到 FGUI Stage 设计尺寸用于坐标转换
        Stage.inst.setDesignSize(width, height);
    }

    /**
     * Get UI canvas size.
     */
    getUICanvasSize(): { width: number; height: number } {
        return this._runtime?.getUICanvasSize() ?? { width: 0, height: 0 };
    }

    /**
     * Set UI canvas boundary visibility.
     */
    setShowUICanvasBoundary(show: boolean): void {
        this._runtime?.setShowUICanvasBoundary(show);
    }

    /**
     * Get UI canvas boundary visibility.
     */
    getShowUICanvasBoundary(): boolean {
        return this._runtime?.getShowUICanvasBoundary() ?? true;
    }

    // ===== Scene Snapshot API =====

    /**
     * Save a snapshot of the current scene state.
     */
    saveSceneSnapshot(): boolean {
        const success = this._runtime?.saveSceneSnapshot() ?? false;

        if (success) {
            // 场景快照保存成功
            // Scene snapshot saved successfully
        }

        return success;
    }

    /**
     * Restore scene state from saved snapshot.
     */
    async restoreSceneSnapshot(): Promise<boolean> {
        if (!this._runtime) return false;

        const success = await this._runtime.restoreSceneSnapshot();

        if (success) {
            // Reset particle component textureIds before loading resources
            // 在加载资源前重置粒子组件的 textureId
            // This ensures ParticleUpdateSystem will reload textures
            // 这确保 ParticleUpdateSystem 会重新加载纹理
            if (this._runtime.scene) {
                for (const entity of this._runtime.scene.entities.buffer) {
                    const particleComponent = entity.getComponent(ParticleSystemComponent);
                    if (particleComponent) {
                        particleComponent.textureId = 0;
                    }
                }
            }

            // 加载场景资源
            if (this._sceneResourceManager && this._runtime.scene) {
                await this._sceneResourceManager.loadSceneResources(this._runtime.scene);
            }

            // 同步 EntityStore
            const entityStore = Core.services.tryResolve(EntityStoreService);
            const messageHub = Core.services.tryResolve(MessageHub);
            if (entityStore && messageHub) {
                const selectedEntity = entityStore.getSelectedEntity();
                const selectedId = selectedEntity?.id;

                entityStore.syncFromScene();

                if (selectedId !== undefined) {
                    const newEntity = entityStore.getEntity(selectedId);
                    if (newEntity) {
                        entityStore.selectEntity(newEntity);
                    }
                }

                messageHub.publish('scene:restored', {});
            }
        }

        return success;
    }

    /**
     * Load scene resources (textures, audio, etc.)
     * 加载场景资源（纹理、音频等）
     *
     * Used by runtime scene switching in play mode.
     * 用于 Play 模式下的运行时场景切换。
     */
    async loadSceneResources(): Promise<void> {
        const scene = this._runtime?.scene;
        if (!this._sceneResourceManager || !scene) {
            return;
        }
        await this._sceneResourceManager.loadSceneResources(scene);
    }

    /**
     * Check if a snapshot exists.
     */
    hasSnapshot(): boolean {
        return this._runtime?.hasSnapshot() ?? false;
    }

    /**
     * Set selected entity IDs for gizmo display.
     * 设置选中的实体 ID 用于 Gizmo 显示。
     */
    setSelectedEntityIds(ids: number[]): void {
        this._selectedEntityIds = [...ids];
        this._runtime?.setSelectedEntityIds(ids);
    }

    /**
     * Get currently selected entity IDs.
     * 获取当前选中的实体 IDs。
     */
    getSelectedEntityIds(): number[] {
        return [...this._selectedEntityIds];
    }

    /**
     * Get gizmo interaction service.
     * 获取 Gizmo 交互服务。
     */
    getGizmoInteractionService(): GizmoInteractionService | null {
        return this._gizmoInteractionService;
    }

    /**
     * Set transform tool mode.
     */
    setTransformMode(mode: 'select' | 'move' | 'rotate' | 'scale'): void {
        this._runtime?.setTransformMode(mode);
    }

    /**
     * Get transform tool mode.
     */
    getTransformMode(): 'select' | 'move' | 'rotate' | 'scale' {
        return this._runtime?.getTransformMode() ?? 'select';
    }

    /**
     * Render a 3D gizmo at the specified world position.
     * 在指定的世界位置渲染 3D Gizmo。
     *
     * Only works in 3D render mode.
     * 仅在 3D 渲染模式下有效。
     */
    render3DGizmo(x: number, y: number, z: number, scale: number = 1.0): void {
        this._runtime?.bridge?.render3DGizmo(x, y, z, scale);
    }

    // ===== Multi-viewport API =====

    /**
     * Register a new viewport.
     */
    registerViewport(id: string, canvasId: string): void {
        this._runtime?.registerViewport(id, canvasId);
    }

    /**
     * Unregister a viewport.
     */
    unregisterViewport(id: string): void {
        this._runtime?.unregisterViewport(id);
    }

    /**
     * Set the active viewport.
     */
    setActiveViewport(id: string): boolean {
        return this._runtime?.setActiveViewport(id) ?? false;
    }

    /**
     * Set camera for a specific viewport.
     */
    setViewportCamera(viewportId: string, config: CameraConfig): void {
        this._runtime?.bridge?.setViewportCamera(viewportId, config);
    }

    /**
     * Get camera for a specific viewport.
     */
    getViewportCamera(viewportId: string): CameraConfig | null {
        return this._runtime?.bridge?.getViewportCamera(viewportId) ?? null;
    }

    /**
     * Set viewport configuration.
     */
    setViewportConfig(viewportId: string, showGrid: boolean, showGizmos: boolean): void {
        this._runtime?.bridge?.setViewportConfig(viewportId, showGrid, showGizmos);
    }

    /**
     * Resize a specific viewport.
     */
    resizeViewport(viewportId: string, width: number, height: number): void {
        this._runtime?.bridge?.resizeViewport(viewportId, width, height);
    }

    /**
     * Render to a specific viewport.
     */
    renderToViewport(viewportId: string): void {
        this._runtime?.bridge?.renderToViewport(viewportId);
    }

    /**
     * Get all registered viewport IDs.
     */
    getViewportIds(): string[] {
        return this._runtime?.bridge?.getViewportIds() ?? [];
    }

    /**
     * Get the underlying GameRuntime instance.
     * 获取底层 GameRuntime 实例。
     */
    getRuntime(): GameRuntime | null {
        return this._runtime;
    }

    // ===== 3D Camera API =====

    /**
     * Get render mode (0 = 2D, 1 = 3D).
     * 获取渲染模式（0 = 2D, 1 = 3D）。
     */
    getRenderMode(): number {
        return this._runtime?.bridge?.getRenderMode() ?? 0;
    }

    /**
     * Set render mode (0 = 2D, 1 = 3D).
     * 设置渲染模式（0 = 2D, 1 = 3D）。
     */
    setRenderMode(mode: number): void {
        this._runtime?.bridge?.setRenderMode(mode);
    }

    /**
     * Check if 3D renderer is available.
     * 检查 3D 渲染器是否可用。
     */
    has3DRenderer(): boolean {
        return this._runtime?.bridge?.has3DRenderer() ?? false;
    }

    /**
     * Get 3D camera position.
     * 获取 3D 相机位置。
     */
    getCamera3DPosition(): { x: number; y: number; z: number } | null {
        return this._runtime?.bridge?.getCamera3DPosition() ?? null;
    }

    /**
     * Set 3D camera position.
     * 设置 3D 相机位置。
     */
    setCamera3DPosition(x: number, y: number, z: number): void {
        this._runtime?.bridge?.setCamera3DPosition(x, y, z);
    }

    /**
     * Get 3D camera rotation (Euler angles in degrees).
     * 获取 3D 相机旋转（欧拉角，度数）。
     */
    getCamera3DRotation(): { pitch: number; yaw: number; roll: number } | null {
        return this._runtime?.bridge?.getCamera3DRotation() ?? null;
    }

    /**
     * Set 3D camera rotation (Euler angles in degrees).
     * 设置 3D 相机旋转（欧拉角，度数）。
     */
    setCamera3DRotation(pitch: number, yaw: number, roll: number): void {
        this._runtime?.bridge?.setCamera3DRotation(pitch, yaw, roll);
    }

    /**
     * Get 3D camera field of view.
     * 获取 3D 相机视场角。
     */
    getCamera3DFov(): number | null {
        return this._runtime?.bridge?.getCamera3DFov() ?? null;
    }

    /**
     * Set 3D camera field of view.
     * 设置 3D 相机视场角。
     */
    setCamera3DFov(fov: number): void {
        this._runtime?.bridge?.setCamera3DFov(fov);
    }

    /**
     * Set 3D camera projection type.
     * 设置 3D 相机投影类型。
     * @param type 0 = Perspective, 1 = Orthographic
     * @param orthoSize Orthographic size (default 5.0)
     */
    setCamera3DProjection(type: number, orthoSize: number = 5.0): void {
        this._runtime?.bridge?.setCamera3DProjection(type, orthoSize);
    }

    /**
     * Make 3D camera look at a target point.
     * 让 3D 相机看向目标点。
     */
    camera3DLookAt(targetX: number, targetY: number, targetZ: number): void {
        this._runtime?.bridge?.camera3DLookAt(targetX, targetY, targetZ);
    }

    /**
     * Set 3D camera clip planes.
     * 设置 3D 相机裁剪平面。
     */
    setCamera3DClipPlanes(near: number, far: number): void {
        this._runtime?.bridge?.setCamera3DClipPlanes(near, far);
    }

    /**
     * Resize 3D renderer.
     * 调整 3D 渲染器尺寸。
     */
    resize3D(width: number, height: number): void {
        this._runtime?.bridge?.resize3D(width, height);
    }

    /**
     * Render 3D frame (for editor manual rendering).
     * 渲染 3D 帧（用于编辑器手动渲染）。
     */
    render3D(): void {
        this._runtime?.bridge?.render3D();
    }

    /**
     * Dispose engine resources.
     */
    dispose(): void {
        this.stop();

        // Don't dispose the global assetManager, just clear the reference
        // 不要 dispose 全局 assetManager，只是清除引用
        if (this._assetManager) {
            // Clear the database to free memory when switching projects
            // 切换项目时清空数据库以释放内存
            this._assetManager.getDatabase().clear();
            this._assetManager = null;
            // 清除全局资产数据库引用 | Clear global asset database reference
            setGlobalAssetDatabase(null);
        }

        // 清除全局引擎桥引用 | Clear global engine bridge reference
        setGlobalEngineBridge(null);

        this._engineIntegration = null;

        if (this._runtime) {
            this._runtime.dispose();
            this._runtime = null;
        }

        this._initialized = false;
    }
}

export default EngineService;
