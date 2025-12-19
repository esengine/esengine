/**
 * Main bridge between TypeScript ECS and Rust Engine.
 * TypeScript ECS与Rust引擎之间的主桥接层。
 */

import type { SpriteRenderData, TextureLoadRequest, EngineStats, CameraConfig } from '../types';
import type { ITextureEngineBridge } from '@esengine/asset-system';
import type { GameEngine } from '../wasm/es_engine';

/**
 * Engine bridge configuration.
 * 引擎桥接配置。
 */
export interface EngineBridgeConfig {
    /** Canvas element ID. | Canvas元素ID。 */
    canvasId: string;
    /** Initial canvas width. | 初始画布宽度。 */
    width?: number;
    /** Initial canvas height. | 初始画布高度。 */
    height?: number;
    /** Maximum sprites per batch. | 每批次最大精灵数。 */
    maxSprites?: number;
    /** Enable debug mode. | 启用调试模式。 */
    debug?: boolean;
}

/**
 * Bridge for communication between ECS Framework and Rust Engine.
 * ECS框架与Rust引擎之间的通信桥接。
 *
 * This class manages data transfer between the TypeScript ECS layer
 * and the WebAssembly-based Rust rendering engine.
 * 此类管理TypeScript ECS层与基于WebAssembly的Rust渲染引擎之间的数据传输。
 *
 * @example
 * ```typescript
 * const bridge = new EngineBridge({ canvasId: 'game-canvas' });
 * await bridge.initialize();
 *
 * // In game loop | 在游戏循环中
 * bridge.clear(0, 0, 0, 1);
 * bridge.submitSprites(spriteDataArray);
 * bridge.render();
 * ```
 */
export class EngineBridge implements ITextureEngineBridge {
    private engine: GameEngine | null = null;
    private config: Required<EngineBridgeConfig>;
    private initialized = false;

    // Path resolver for converting file paths to URLs
    // 用于将文件路径转换为URL的路径解析器
    private pathResolver: ((path: string) => string) | null = null;

    // Pre-allocated typed arrays for batch submission
    // 预分配的类型数组用于批量提交
    private transformBuffer: Float32Array;
    private textureIdBuffer: Uint32Array;
    private uvBuffer: Float32Array;
    private colorBuffer: Uint32Array;
    private materialIdBuffer: Uint32Array;

    // Statistics | 统计信息
    private stats: EngineStats = {
        fps: 0,
        drawCalls: 0,
        spriteCount: 0,
        frameTime: 0
    };

    private lastFrameTime = 0;
    private frameCount = 0;
    private fpsAccumulator = 0;

    /**
     * Create a new engine bridge.
     * 创建新的引擎桥接。
     *
     * @param config - Bridge configuration | 桥接配置
     */
    constructor(config: EngineBridgeConfig) {
        this.config = {
            canvasId: config.canvasId,
            width: config.width ?? 800,
            height: config.height ?? 600,
            maxSprites: config.maxSprites ?? 10000,
            debug: config.debug ?? false
        };

        // Pre-allocate buffers | 预分配缓冲区
        const maxSprites = this.config.maxSprites;
        this.transformBuffer = new Float32Array(maxSprites * 7); // x, y, rot, sx, sy, ox, oy
        this.textureIdBuffer = new Uint32Array(maxSprites);
        this.uvBuffer = new Float32Array(maxSprites * 4); // u0, v0, u1, v1
        this.colorBuffer = new Uint32Array(maxSprites);
        this.materialIdBuffer = new Uint32Array(maxSprites);
    }

    /**
     * Initialize the engine bridge with WASM module.
     * 使用WASM模块初始化引擎桥接。
     *
     * @param wasmModule - Pre-imported WASM module | 预导入的WASM模块
     */
    async initializeWithModule(wasmModule: any): Promise<void> {
        if (this.initialized) {
            console.warn('EngineBridge already initialized | EngineBridge已初始化');
            return;
        }

        try {
            // Initialize WASM | 初始化WASM
            if (wasmModule.default) {
                await wasmModule.default();
            }

            // Create engine instance | 创建引擎实例
            this.engine = new wasmModule.GameEngine(this.config.canvasId);
            this.initialized = true;

            if (this.config.debug) {
                console.log('EngineBridge initialized | EngineBridge初始化完成');
            }
        } catch (error) {
            throw new Error(`Failed to initialize engine: ${error} | 引擎初始化失败: ${error}`);
        }
    }

    /**
     * Initialize the engine bridge.
     * 初始化引擎桥接。
     *
     * Loads the WASM module and creates the engine instance.
     * 加载WASM模块并创建引擎实例。
     *
     * @param wasmPath - Path to WASM package | WASM包路径
     * @deprecated Use initializeWithModule instead | 请使用 initializeWithModule 代替
     */
    async initialize(wasmPath = '@esengine/engine'): Promise<void> {
        if (this.initialized) {
            console.warn('EngineBridge already initialized | EngineBridge已初始化');
            return;
        }

        try {
            // Dynamic import of WASM module | 动态导入WASM模块
            const wasmModule = await import(/* @vite-ignore */ wasmPath);
            await this.initializeWithModule(wasmModule);
        } catch (error) {
            throw new Error(`Failed to initialize engine: ${error} | 引擎初始化失败: ${error}`);
        }
    }

    /**
     * Check if bridge is initialized.
     * 检查桥接是否已初始化。
     */
    get isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Get canvas width.
     * 获取画布宽度。
     */
    get width(): number {
        return this.engine?.width ?? 0;
    }

    /**
     * Get canvas height.
     * 获取画布高度。
     */
    get height(): number {
        return this.engine?.height ?? 0;
    }

    /**
     * Get engine instance (throws if not initialized)
     * 获取引擎实例（未初始化时抛出异常）
     */
    private getEngine(): GameEngine {
        if (!this.engine) {
            throw new Error('Engine not initialized. Call initialize() first.');
        }
        return this.engine;
    }

    /**
     * Clear the screen.
     * 清除屏幕。
     *
     * @param r - Red (0-1) | 红色
     * @param g - Green (0-1) | 绿色
     * @param b - Blue (0-1) | 蓝色
     * @param a - Alpha (0-1) | 透明度
     */
    clear(r: number, g: number, b: number, a: number): void {
        if (!this.initialized) return;
        this.getEngine().clear(r, g, b, a);
    }

    /**
     * Submit sprite data for rendering.
     * 提交精灵数据进行渲染。
     *
     * @param sprites - Array of sprite render data | 精灵渲染数据数组
     */
    submitSprites(sprites: SpriteRenderData[]): void {
        if (!this.initialized || sprites.length === 0) return;

        const count = Math.min(sprites.length, this.config.maxSprites);

        // Fill typed arrays | 填充类型数组
        for (let i = 0; i < count; i++) {
            const sprite = sprites[i];
            const tOffset = i * 7;
            const uvOffset = i * 4;

            // Transform data | 变换数据
            this.transformBuffer[tOffset] = sprite.x;
            this.transformBuffer[tOffset + 1] = sprite.y;
            this.transformBuffer[tOffset + 2] = sprite.rotation;
            this.transformBuffer[tOffset + 3] = sprite.scaleX;
            this.transformBuffer[tOffset + 4] = sprite.scaleY;
            this.transformBuffer[tOffset + 5] = sprite.originX;
            this.transformBuffer[tOffset + 6] = sprite.originY;

            // Texture ID | 纹理ID
            this.textureIdBuffer[i] = sprite.textureId;

            // UV coordinates | UV坐标
            this.uvBuffer[uvOffset] = sprite.uv[0];
            this.uvBuffer[uvOffset + 1] = sprite.uv[1];
            this.uvBuffer[uvOffset + 2] = sprite.uv[2];
            this.uvBuffer[uvOffset + 3] = sprite.uv[3];

            // Color | 颜色
            this.colorBuffer[i] = sprite.color;

            // Material ID (0 = default) | 材质ID（0 = 默认）
            this.materialIdBuffer[i] = sprite.materialId ?? 0;
        }

        // Submit to engine (single WASM call) | 提交到引擎（单次WASM调用）
        this.getEngine().submitSpriteBatch(
            this.transformBuffer.subarray(0, count * 7),
            this.textureIdBuffer.subarray(0, count),
            this.uvBuffer.subarray(0, count * 4),
            this.colorBuffer.subarray(0, count),
            this.materialIdBuffer.subarray(0, count)
        );

        this.stats.spriteCount = count;
    }

    /**
     * Render the current frame.
     * 渲染当前帧。
     */
    render(): void {
        if (!this.initialized) return;

        const startTime = performance.now();
        this.getEngine().render();
        const endTime = performance.now();

        // Update statistics | 更新统计信息
        this.stats.frameTime = endTime - startTime;
        this.stats.drawCalls = 1; // Currently single batch | 当前单批次

        // Calculate FPS | 计算FPS
        this.frameCount++;
        this.fpsAccumulator += endTime - this.lastFrameTime;
        this.lastFrameTime = endTime;

        if (this.fpsAccumulator >= 1000) {
            this.stats.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsAccumulator = 0;
        }
    }

    /**
     * Render sprites as overlay without clearing the screen.
     * 渲染精灵作为叠加层，不清除屏幕。
     *
     * This is used for UI rendering on top of world content.
     * 用于在世界内容上渲染 UI。
     */
    renderOverlay(): void {
        if (!this.initialized) return;
        this.getEngine().renderOverlay();
    }

    /**
     * Load a texture.
     * 加载纹理。
     *
     * @param id - Texture ID | 纹理ID
     * @param url - Image URL | 图片URL
     */
    loadTexture(id: number, url: string): Promise<void> {
        if (!this.initialized) return Promise.resolve();
        this.getEngine().loadTexture(id, url);
        // Currently synchronous, but return Promise for interface compatibility
        // 目前是同步的，但返回Promise以兼容接口
        return Promise.resolve();
    }

    /**
     * Load multiple textures.
     * 加载多个纹理。
     *
     * @param requests - Texture load requests | 纹理加载请求
     */
    async loadTextures(requests: Array<{ id: number; url: string }>): Promise<void> {
        for (const req of requests) {
            await this.loadTexture(req.id, req.url);
        }
    }

    /**
     * Load texture by path, returning texture ID.
     * 按路径加载纹理，返回纹理ID。
     *
     * @param path - Image path/URL | 图片路径/URL
     * @returns Texture ID | 纹理ID
     */
    loadTextureByPath(path: string): number {
        if (!this.initialized) return 0;
        return this.getEngine().loadTextureByPath(path);
    }

    /**
     * Get texture ID by path.
     * 按路径获取纹理ID。
     *
     * @param path - Image path | 图片路径
     * @returns Texture ID or undefined | 纹理ID或undefined
     */
    getTextureIdByPath(path: string): number | undefined {
        if (!this.initialized) return undefined;
        return this.getEngine().getTextureIdByPath(path);
    }

    /**
     * Set path resolver for converting file paths to URLs.
     * 设置路径解析器用于将文件路径转换为URL。
     *
     * @param resolver - Function to resolve paths | 解析路径的函数
     */
    setPathResolver(resolver: (path: string) => string): void {
        this.pathResolver = resolver;
    }

    /**
     * Get or load texture by path.
     * 按路径获取或加载纹理。
     *
     * @param path - Image path/URL | 图片路径/URL
     * @returns Texture ID | 纹理ID
     */
    getOrLoadTextureByPath(path: string): number {
        if (!this.initialized) return 0;

        // Resolve path if resolver is set
        // 如果设置了解析器，则解析路径
        const resolvedPath = this.pathResolver ? this.pathResolver(path) : path;
        return this.getEngine().getOrLoadTextureByPath(resolvedPath);
    }

    /**
     * Unload texture from GPU.
     * 从GPU卸载纹理。
     *
     * @param id - Texture ID | 纹理ID
     */
    unloadTexture(id: number): void {
        if (!this.initialized) return;
        // TODO: Implement in Rust engine
        // TODO: 在Rust引擎中实现
        console.warn('unloadTexture not yet implemented in engine');
    }

    /**
     * Get texture info by path.
     * 通过路径获取纹理信息。
     *
     * This is the primary API for getting texture dimensions.
     * The Rust engine is the single source of truth for texture dimensions.
     * 这是获取纹理尺寸的主要 API。
     * Rust 引擎是纹理尺寸的唯一事实来源。
     *
     * @param path - Image path/URL | 图片路径/URL
     * @returns Texture info or null if not loaded | 纹理信息或未加载则为 null
     */
    getTextureInfoByPath(path: string): { width: number; height: number } | null {
        if (!this.initialized) return null;

        // Resolve path if resolver is set
        // 如果设置了解析器，则解析路径
        const resolvedPath = this.pathResolver ? this.pathResolver(path) : path;

        // Query Rust engine for texture size
        // 向 Rust 引擎查询纹理尺寸
        const result = this.getEngine().getTextureSizeByPath(resolvedPath);
        if (!result) return null;

        return {
            width: result[0],
            height: result[1]
        };
    }

    /**
     * Check if a key is pressed.
     * 检查按键是否按下。
     *
     * @param keyCode - Key code | 键码
     */
    isKeyDown(keyCode: string): boolean {
        if (!this.initialized) return false;
        return this.getEngine().isKeyDown(keyCode);
    }

    /**
     * Update input state (call once per frame).
     * 更新输入状态（每帧调用一次）。
     */
    updateInput(): void {
        if (!this.initialized) return;
        this.getEngine().updateInput();
    }

    /**
     * Get engine statistics.
     * 获取引擎统计信息。
     */
    getStats(): EngineStats {
        return { ...this.stats };
    }

    /**
     * Resize the viewport.
     * 调整视口大小。
     *
     * @param width - New width | 新宽度
     * @param height - New height | 新高度
     */
    resize(width: number, height: number): void {
        if (!this.initialized) return;
        const engine = this.getEngine();
        if (engine.resize) {
            engine.resize(width, height);
        }
    }

    /**
     * Set camera position, zoom, and rotation.
     * 设置相机位置、缩放和旋转。
     *
     * @param config - Camera configuration | 相机配置
     */
    setCamera(config: CameraConfig): void {
        if (!this.initialized) return;
        this.getEngine().setCamera(config.x, config.y, config.zoom, config.rotation);
    }

    /**
     * Get camera state.
     * 获取相机状态。
     */
    getCamera(): CameraConfig {
        if (!this.initialized) {
            return { x: 0, y: 0, zoom: 1, rotation: 0 };
        }
        const state = this.getEngine().getCamera();
        return {
            x: state[0],
            y: state[1],
            zoom: state[2],
            rotation: state[3]
        };
    }

    /**
     * Convert screen coordinates to world coordinates.
     * 将屏幕坐标转换为世界坐标。
     *
     * Screen coordinates: (0,0) at top-left of canvas, Y-down
     * World coordinates: Y-up, camera position at center of view
     *
     * @param screenX - Screen X coordinate (relative to canvas left edge)
     * @param screenY - Screen Y coordinate (relative to canvas top edge)
     * @returns World coordinates { x, y }
     */
    screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
        if (!this.initialized) {
            return { x: screenX, y: screenY };
        }
        const result = this.getEngine().screenToWorld(screenX, screenY);
        return { x: result[0], y: result[1] };
    }

    /**
     * Convert world coordinates to screen coordinates.
     * 将世界坐标转换为屏幕坐标。
     *
     * @param worldX - World X coordinate
     * @param worldY - World Y coordinate
     * @returns Screen coordinates { x, y } (relative to canvas)
     */
    worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
        if (!this.initialized) {
            return { x: worldX, y: worldY };
        }
        const result = this.getEngine().worldToScreen(worldX, worldY);
        return { x: result[0], y: result[1] };
    }

    /**
     * Set grid visibility.
     * 设置网格可见性。
     */
    setShowGrid(show: boolean): void {
        if (!this.initialized) return;
        this.getEngine().setShowGrid(show);
    }

    /**
     * Set clear color (background color).
     * 设置清除颜色（背景颜色）。
     *
     * @param r - Red component (0.0-1.0) | 红色分量
     * @param g - Green component (0.0-1.0) | 绿色分量
     * @param b - Blue component (0.0-1.0) | 蓝色分量
     * @param a - Alpha component (0.0-1.0) | 透明度分量
     */
    setClearColor(r: number, g: number, b: number, a: number): void {
        if (!this.initialized) return;
        this.getEngine().setClearColor(r, g, b, a);
    }

    /**
     * Add a rectangle gizmo outline.
     * 添加矩形Gizmo边框。
     *
     * @param x - Center X position | 中心X位置
     * @param y - Center Y position | 中心Y位置
     * @param width - Rectangle width | 矩形宽度
     * @param height - Rectangle height | 矩形高度
     * @param rotation - Rotation in radians | 旋转角度（弧度）
     * @param originX - Origin X (0-1) | 原点X (0-1)
     * @param originY - Origin Y (0-1) | 原点Y (0-1)
     * @param r - Red (0-1) | 红色
     * @param g - Green (0-1) | 绿色
     * @param b - Blue (0-1) | 蓝色
     * @param a - Alpha (0-1) | 透明度
     * @param showHandles - Whether to show transform handles | 是否显示变换手柄
     */
    addGizmoRect(
        x: number,
        y: number,
        width: number,
        height: number,
        rotation: number,
        originX: number,
        originY: number,
        r: number,
        g: number,
        b: number,
        a: number,
        showHandles: boolean = true
    ): void {
        if (!this.initialized) return;
        this.getEngine().addGizmoRect(x, y, width, height, rotation, originX, originY, r, g, b, a, showHandles);
    }

    /**
     * Add a circle outline gizmo (native rendering).
     * 添加圆形边框Gizmo（原生渲染）。
     */
    addGizmoCircle(
        x: number,
        y: number,
        radius: number,
        r: number,
        g: number,
        b: number,
        a: number
    ): void {
        if (!this.initialized) return;
        this.getEngine().addGizmoCircle(x, y, radius, r, g, b, a);
    }

    /**
     * Add a line gizmo (native rendering).
     * 添加线条Gizmo（原生渲染）。
     */
    addGizmoLine(
        points: number[],
        r: number,
        g: number,
        b: number,
        a: number,
        closed: boolean
    ): void {
        if (!this.initialized) return;
        this.getEngine().addGizmoLine(new Float32Array(points), r, g, b, a, closed);
    }

    /**
     * Add a capsule outline gizmo (native rendering).
     * 添加胶囊边框Gizmo（原生渲染）。
     */
    addGizmoCapsule(
        x: number,
        y: number,
        radius: number,
        halfHeight: number,
        rotation: number,
        r: number,
        g: number,
        b: number,
        a: number
    ): void {
        if (!this.initialized) return;
        this.getEngine().addGizmoCapsule(x, y, radius, halfHeight, rotation, r, g, b, a);
    }

    /**
     * Set transform tool mode.
     * 设置变换工具模式。
     *
     * @param mode - 0=Select, 1=Move, 2=Rotate, 3=Scale
     */
    setTransformMode(mode: number): void {
        if (!this.initialized) return;
        this.getEngine().setTransformMode(mode);
    }

    /**
     * Set gizmo visibility.
     * 设置辅助工具可见性。
     */
    setShowGizmos(show: boolean): void {
        if (!this.initialized) return;
        this.getEngine().setShowGizmos(show);
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
        if (!this.initialized) return;
        this.getEngine().setEditorMode(isEditor);
    }

    /**
     * Get editor mode.
     * 获取编辑器模式。
     */
    isEditorMode(): boolean {
        if (!this.initialized) return true;
        return this.getEngine().isEditorMode();
    }

    // ===== Multi-viewport API =====
    // ===== 多视口 API =====

    /**
     * Register a new viewport.
     * 注册新视口。
     *
     * @param id - Unique viewport identifier | 唯一视口标识符
     * @param canvasId - HTML canvas element ID | HTML canvas元素ID
     */
    registerViewport(id: string, canvasId: string): void {
        if (!this.initialized) return;
        this.getEngine().registerViewport(id, canvasId);
    }

    /**
     * Unregister a viewport.
     * 注销视口。
     */
    unregisterViewport(id: string): void {
        if (!this.initialized) return;
        this.getEngine().unregisterViewport(id);
    }

    /**
     * Set the active viewport.
     * 设置活动视口。
     */
    setActiveViewport(id: string): boolean {
        if (!this.initialized) return false;
        return this.getEngine().setActiveViewport(id);
    }

    /**
     * Set camera for a specific viewport.
     * 为特定视口设置相机。
     */
    setViewportCamera(viewportId: string, config: CameraConfig): void {
        if (!this.initialized) return;
        this.getEngine().setViewportCamera(viewportId, config.x, config.y, config.zoom, config.rotation);
    }

    /**
     * Get camera for a specific viewport.
     * 获取特定视口的相机。
     */
    getViewportCamera(viewportId: string): CameraConfig | null {
        if (!this.initialized) return null;
        const state = this.getEngine().getViewportCamera(viewportId);
        if (!state) return null;
        return {
            x: state[0],
            y: state[1],
            zoom: state[2],
            rotation: state[3]
        };
    }

    /**
     * Set viewport configuration.
     * 设置视口配置。
     */
    setViewportConfig(viewportId: string, showGrid: boolean, showGizmos: boolean): void {
        if (!this.initialized) return;
        this.getEngine().setViewportConfig(viewportId, showGrid, showGizmos);
    }

    /**
     * Resize a specific viewport.
     * 调整特定视口大小。
     */
    resizeViewport(viewportId: string, width: number, height: number): void {
        if (!this.initialized) return;
        this.getEngine().resizeViewport(viewportId, width, height);
    }

    /**
     * Render to a specific viewport.
     * 渲染到特定视口。
     */
    renderToViewport(viewportId: string): void {
        if (!this.initialized) return;
        this.getEngine().renderToViewport(viewportId);
    }

    /**
     * Get all registered viewport IDs.
     * 获取所有已注册的视口ID。
     */
    getViewportIds(): string[] {
        if (!this.initialized) return [];
        return this.getEngine().getViewportIds();
    }

    // ===== Screen Space Mode API =====
    // ===== 屏幕空间模式 API =====

    // Saved world space camera state
    // 保存的世界空间相机状态
    private savedWorldCamera: CameraConfig | null = null;

    /**
     * Push screen space rendering mode.
     * 进入屏幕空间渲染模式。
     *
     * Saves the current world camera and switches to a fixed orthographic projection
     * centered at (0, 0) with the specified canvas size.
     * 保存当前世界相机并切换到以 (0, 0) 为中心的固定正交投影。
     *
     * @param canvasWidth - UI canvas width (design resolution) | UI 画布宽度（设计分辨率）
     * @param canvasHeight - UI canvas height (design resolution) | UI 画布高度（设计分辨率）
     */
    pushScreenSpaceMode(canvasWidth: number, canvasHeight: number): void {
        if (!this.initialized) return;

        // Save current world camera state
        // 保存当前世界相机状态
        this.savedWorldCamera = this.getCamera();

        // Switch to screen space camera:
        // - Position at origin (0, 0)
        // - Zoom = 1 (1 pixel = 1 world unit)
        // - No rotation
        // 切换到屏幕空间相机：
        // - 位置在原点 (0, 0)
        // - 缩放 = 1（1 像素 = 1 世界单位）
        // - 无旋转
        //
        // For screen space UI, we want the camera to show exactly canvasWidth x canvasHeight pixels
        // centered at (0, 0). This means the visible area is:
        // X: [-canvasWidth/2, canvasWidth/2]
        // Y: [-canvasHeight/2, canvasHeight/2]
        // 对于屏幕空间 UI，我们希望相机精确显示 canvasWidth x canvasHeight 像素
        // 以 (0, 0) 为中心。这意味着可见区域是：
        // X: [-canvasWidth/2, canvasWidth/2]
        // Y: [-canvasHeight/2, canvasHeight/2]

        // Get current viewport size to calculate proper zoom
        // 获取当前视口尺寸以计算正确的缩放
        // Note: This assumes canvas.width/height match actual rendering size
        // 注意：这假设 canvas.width/height 与实际渲染尺寸匹配
        const canvas = document.getElementById(this.config.canvasId) as HTMLCanvasElement;
        if (canvas) {
            // Calculate zoom so that canvasWidth x canvasHeight fits exactly in the viewport
            // 计算缩放使 canvasWidth x canvasHeight 正好适合视口
            // zoom = viewport_size / world_visible_size
            // For UI, we want 1 UI unit = 1 pixel on screen when canvas matches viewport
            // 对于 UI，当画布与视口匹配时，我们希望 1 UI 单位 = 1 屏幕像素
            const viewportWidth = canvas.width;
            const viewportHeight = canvas.height;

            // Calculate zoom based on the design canvas size vs actual viewport
            // 根据设计画布尺寸与实际视口计算缩放
            // This scales UI to fit the viewport while maintaining aspect ratio
            const zoomX = viewportWidth / canvasWidth;
            const zoomY = viewportHeight / canvasHeight;

            // Use minimum to ensure entire canvas is visible (letterbox if needed)
            // 使用最小值确保整个画布可见（如需要则显示黑边）
            const zoom = Math.min(zoomX, zoomY);

            this.setCamera({
                x: 0,
                y: 0,
                zoom: zoom,
                rotation: 0
            });
        } else {
            // Fallback: use zoom = 1
            // 回退：使用 zoom = 1
            this.setCamera({
                x: 0,
                y: 0,
                zoom: 1,
                rotation: 0
            });
        }
    }

    /**
     * Pop screen space rendering mode.
     * 退出屏幕空间渲染模式。
     *
     * Restores the previously saved world camera.
     * 恢复之前保存的世界相机。
     */
    popScreenSpaceMode(): void {
        if (!this.initialized) return;

        // Restore world camera
        // 恢复世界相机
        if (this.savedWorldCamera) {
            this.setCamera(this.savedWorldCamera);
            this.savedWorldCamera = null;
        }
    }

    // ===== Texture Cache API =====
    // ===== 纹理缓存 API =====

    /**
     * Clear the texture path cache.
     * 清除纹理路径缓存。
     *
     * This should be called when restoring scene snapshots to ensure
     * textures are reloaded with correct IDs.
     * 在恢复场景快照时应调用此方法，以确保纹理使用正确的ID重新加载。
     */
    clearTexturePathCache(): void {
        if (!this.initialized) return;
        this.getEngine().clearTexturePathCache();
    }

    /**
     * Clear all textures and reset state.
     * 清除所有纹理并重置状态。
     *
     * This removes all loaded textures from GPU memory and resets
     * the ID counter. Use with caution as all texture references
     * will become invalid.
     * 这会从GPU内存中移除所有已加载的纹理并重置ID计数器。
     * 请谨慎使用，因为所有纹理引用都将变得无效。
     */
    clearAllTextures(): void {
        if (!this.initialized) return;
        this.getEngine().clearAllTextures();
    }

    // ===== Texture State API =====
    // ===== 纹理状态 API =====

    /**
     * Get texture loading state.
     * 获取纹理加载状态。
     *
     * @param id - Texture ID | 纹理ID
     * @returns State string: 'loading', 'ready', or 'failed:reason'
     *          状态字符串：'loading'、'ready' 或 'failed:reason'
     */
    getTextureState(id: number): string {
        if (!this.initialized) return 'loading';
        return this.getEngine().getTextureState(id);
    }

    /**
     * Check if texture is ready for rendering.
     * 检查纹理是否已就绪可渲染。
     *
     * @param id - Texture ID | 纹理ID
     * @returns true if texture data is fully loaded | 纹理数据完全加载则返回true
     */
    isTextureReady(id: number): boolean {
        if (!this.initialized) return false;
        return this.getEngine().isTextureReady(id);
    }

    /**
     * Get count of textures currently loading.
     * 获取当前正在加载的纹理数量。
     *
     * @returns Number of textures in 'loading' state | 处于加载状态的纹理数量
     */
    getTextureLoadingCount(): number {
        if (!this.initialized) return 0;
        return this.getEngine().getTextureLoadingCount();
    }

    /**
     * Load texture asynchronously with Promise.
     * 使用Promise异步加载纹理。
     *
     * Unlike loadTexture which returns immediately with a placeholder,
     * this method waits until the texture is actually loaded and ready.
     * 与loadTexture立即返回占位符不同，此方法会等待纹理实际加载完成。
     *
     * @param id - Texture ID | 纹理ID
     * @param url - Image URL | 图片URL
     * @returns Promise that resolves when texture is ready, rejects on failure
     *          纹理就绪时解析的Promise，失败时拒绝
     */
    loadTextureAsync(id: number, url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.initialized) {
                reject(new Error('Engine not initialized'));
                return;
            }

            // Start loading the texture
            // 开始加载纹理
            this.getEngine().loadTexture(id, url);

            // Poll for state changes
            // 轮询状态变化
            const checkInterval = 16; // ~60fps
            const maxWaitTime = 30000; // 30 seconds timeout
            let elapsed = 0;

            const checkState = () => {
                const state = this.getTextureState(id);

                if (state === 'ready') {
                    resolve();
                } else if (state.startsWith('failed:')) {
                    const reason = state.substring(7);
                    reject(new Error(`Texture load failed: ${reason}`));
                } else if (elapsed >= maxWaitTime) {
                    reject(new Error(`Texture load timeout after ${maxWaitTime}ms`));
                } else {
                    elapsed += checkInterval;
                    setTimeout(checkState, checkInterval);
                }
            };

            // Start checking after a small delay to allow initial state setup
            // 稍后开始检查，允许初始状态设置
            setTimeout(checkState, checkInterval);
        });
    }

    /**
     * Wait for all loading textures to complete.
     * 等待所有加载中的纹理完成。
     *
     * @param timeout - Maximum wait time in ms (default: 30000)
     *                  最大等待时间（毫秒，默认30000）
     * @returns Promise that resolves when all textures are loaded
     *          所有纹理加载完成时解析的Promise
     */
    waitForAllTextures(timeout: number = 30000): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.initialized) {
                reject(new Error('Engine not initialized'));
                return;
            }

            const checkInterval = 16;
            let elapsed = 0;

            const checkLoading = () => {
                const loadingCount = this.getTextureLoadingCount();

                if (loadingCount === 0) {
                    resolve();
                } else if (elapsed >= timeout) {
                    reject(new Error(`Timeout waiting for ${loadingCount} textures to load`));
                } else {
                    elapsed += checkInterval;
                    setTimeout(checkLoading, checkInterval);
                }
            };

            checkLoading();
        });
    }

    // ===== Shader API =====
    // ===== 着色器 API =====

    /**
     * Compile and register a custom shader program.
     * 编译并注册自定义着色器程序。
     *
     * @param vertexSource - Vertex shader GLSL source | 顶点着色器 GLSL 源代码
     * @param fragmentSource - Fragment shader GLSL source | 片段着色器 GLSL 源代码
     * @returns Promise resolving to shader ID | 解析为着色器 ID 的 Promise
     */
    async compileShader(vertexSource: string, fragmentSource: string): Promise<number> {
        if (!this.initialized) throw new Error('Engine not initialized');
        return this.getEngine().compileShader(vertexSource, fragmentSource);
    }

    /**
     * Compile and register a shader with a specific ID.
     * 使用特定 ID 编译并注册着色器。
     *
     * @param shaderId - Desired shader ID | 期望的着色器 ID
     * @param vertexSource - Vertex shader GLSL source | 顶点着色器 GLSL 源代码
     * @param fragmentSource - Fragment shader GLSL source | 片段着色器 GLSL 源代码
     */
    async compileShaderWithId(shaderId: number, vertexSource: string, fragmentSource: string): Promise<void> {
        if (!this.initialized) throw new Error('Engine not initialized');
        this.getEngine().compileShaderWithId(shaderId, vertexSource, fragmentSource);
    }

    /**
     * Check if a shader exists.
     * 检查着色器是否存在。
     *
     * @param shaderId - Shader ID to check | 要检查的着色器 ID
     */
    hasShader(shaderId: number): boolean {
        if (!this.initialized) return false;
        return this.getEngine().hasShader(shaderId);
    }

    /**
     * Remove a shader.
     * 移除着色器。
     *
     * @param shaderId - Shader ID to remove | 要移除的着色器 ID
     */
    removeShader(shaderId: number): boolean {
        if (!this.initialized) return false;
        return this.getEngine().removeShader(shaderId);
    }

    // ===== Material Management API =====
    // ===== 材质管理 API =====

    /**
     * Create a new material.
     * 创建新材质。
     *
     * @param name - Material name | 材质名称
     * @param shaderId - Shader ID to use | 使用的着色器 ID
     * @param blendMode - Blend mode | 混合模式
     * @returns Material ID | 材质 ID
     */
    createMaterial(name: string, shaderId: number, blendMode: number): number {
        if (!this.initialized) return -1;
        return this.getEngine().createMaterial(name, shaderId, blendMode);
    }

    /**
     * Create a material with a specific ID.
     * 使用特定 ID 创建材质。
     *
     * @param materialId - Desired material ID | 期望的材质 ID
     * @param name - Material name | 材质名称
     * @param shaderId - Shader ID to use | 使用的着色器 ID
     * @param blendMode - Blend mode | 混合模式
     */
    createMaterialWithId(materialId: number, name: string, shaderId: number, blendMode: number): void {
        if (!this.initialized) return;
        this.getEngine().createMaterialWithId(materialId, name, shaderId, blendMode);
    }

    /**
     * Check if a material exists.
     * 检查材质是否存在。
     *
     * @param materialId - Material ID to check | 要检查的材质 ID
     */
    hasMaterial(materialId: number): boolean {
        if (!this.initialized) return false;
        return this.getEngine().hasMaterial(materialId);
    }

    /**
     * Remove a material.
     * 移除材质。
     *
     * @param materialId - Material ID to remove | 要移除的材质 ID
     */
    removeMaterial(materialId: number): boolean {
        if (!this.initialized) return false;
        return this.getEngine().removeMaterial(materialId);
    }

    // ===== Material Uniform API =====
    // ===== 材质 Uniform API =====

    /**
     * Set a float uniform on a material.
     * 设置材质的浮点 uniform。
     *
     * @param materialId - Material ID | 材质 ID
     * @param name - Uniform name | Uniform 名称
     * @param value - Float value | 浮点值
     * @returns Whether the operation succeeded | 操作是否成功
     */
    setMaterialFloat(materialId: number, name: string, value: number): boolean {
        if (!this.initialized) return false;
        return this.getEngine().setMaterialFloat(materialId, name, value);
    }

    /**
     * Set a vec2 uniform on a material.
     * 设置材质的 vec2 uniform。
     *
     * @param materialId - Material ID | 材质 ID
     * @param name - Uniform name | Uniform 名称
     * @param x - X component | X 分量
     * @param y - Y component | Y 分量
     * @returns Whether the operation succeeded | 操作是否成功
     */
    setMaterialVec2(materialId: number, name: string, x: number, y: number): boolean {
        if (!this.initialized) return false;
        return this.getEngine().setMaterialVec2(materialId, name, x, y);
    }

    /**
     * Set a vec3 uniform on a material.
     * 设置材质的 vec3 uniform。
     *
     * @param materialId - Material ID | 材质 ID
     * @param name - Uniform name | Uniform 名称
     * @param x - X component | X 分量
     * @param y - Y component | Y 分量
     * @param z - Z component | Z 分量
     * @returns Whether the operation succeeded | 操作是否成功
     */
    setMaterialVec3(materialId: number, name: string, x: number, y: number, z: number): boolean {
        if (!this.initialized) return false;
        return this.getEngine().setMaterialVec3(materialId, name, x, y, z);
    }

    /**
     * Set a vec4 uniform on a material.
     * 设置材质的 vec4 uniform。
     *
     * @param materialId - Material ID | 材质 ID
     * @param name - Uniform name | Uniform 名称
     * @param x - X component | X 分量
     * @param y - Y component | Y 分量
     * @param z - Z component | Z 分量
     * @param w - W component | W 分量
     * @returns Whether the operation succeeded | 操作是否成功
     */
    setMaterialVec4(materialId: number, name: string, x: number, y: number, z: number, w: number): boolean {
        if (!this.initialized) return false;
        return this.getEngine().setMaterialVec4(materialId, name, x, y, z, w);
    }

    /**
     * Set a color uniform on a material.
     * 设置材质的颜色 uniform。
     *
     * @param materialId - Material ID | 材质 ID
     * @param name - Uniform name | Uniform 名称
     * @param r - Red component (0-1) | 红色分量 (0-1)
     * @param g - Green component (0-1) | 绿色分量 (0-1)
     * @param b - Blue component (0-1) | 蓝色分量 (0-1)
     * @param a - Alpha component (0-1) | Alpha 分量 (0-1)
     * @returns Whether the operation succeeded | 操作是否成功
     */
    setMaterialColor(materialId: number, name: string, r: number, g: number, b: number, a: number): boolean {
        if (!this.initialized) return false;
        return this.getEngine().setMaterialColor(materialId, name, r, g, b, a);
    }

    /**
     * Set a material's blend mode.
     * 设置材质的混合模式。
     *
     * @param materialId - Material ID | 材质 ID
     * @param blendMode - Blend mode (0=None, 1=Alpha, 2=Additive, 3=Multiply, 4=Screen, 5=PremultipliedAlpha)
     *                    混合模式 (0=无, 1=Alpha, 2=叠加, 3=正片叠底, 4=滤色, 5=预乘Alpha)
     * @returns Whether the operation succeeded | 操作是否成功
     */
    setMaterialBlendMode(materialId: number, blendMode: number): boolean {
        if (!this.initialized) return false;
        return this.getEngine().setMaterialBlendMode(materialId, blendMode);
    }

    // ===== Dynamic Atlas API =====
    // ===== 动态图集 API =====

    /**
     * Create a blank texture for dynamic atlas.
     * 为动态图集创建空白纹理。
     *
     * This creates a texture that can be filled later using `updateTextureRegion`.
     * Used for runtime atlas generation to batch UI elements with different textures.
     * 创建一个可以稍后使用 `updateTextureRegion` 填充的纹理。
     * 用于运行时图集生成，以批处理使用不同纹理的 UI 元素。
     *
     * @param width - Texture width in pixels (recommended: 2048) | 纹理宽度（推荐：2048）
     * @param height - Texture height in pixels (recommended: 2048) | 纹理高度（推荐：2048）
     * @returns Texture ID for the created blank texture | 创建的空白纹理ID
     */
    createBlankTexture(width: number, height: number): number {
        if (!this.initialized) return -1;
        return this.getEngine().createBlankTexture(width, height);
    }

    /**
     * Update a region of an existing texture with pixel data.
     * 使用像素数据更新现有纹理的区域。
     *
     * This is used for dynamic atlas to copy individual textures into the atlas.
     * 用于动态图集将单个纹理复制到图集纹理中。
     *
     * @param id - The texture ID to update | 要更新的纹理ID
     * @param x - X offset in the texture | 纹理中的X偏移
     * @param y - Y offset in the texture | 纹理中的Y偏移
     * @param width - Width of the region to update | 要更新的区域宽度
     * @param height - Height of the region to update | 要更新的区域高度
     * @param pixels - RGBA pixel data (Uint8Array, 4 bytes per pixel) | RGBA像素数据（每像素4字节）
     */
    updateTextureRegion(
        id: number,
        x: number,
        y: number,
        width: number,
        height: number,
        pixels: Uint8Array
    ): void {
        if (!this.initialized) return;
        this.getEngine().updateTextureRegion(id, x, y, width, height, pixels);
    }

    /**
     * Apply material overrides to a material.
     * 将材质覆盖应用到材质。
     *
     * @param materialId - Material ID | 材质 ID
     * @param overrides - Material property overrides | 材质属性覆盖
     */
    applyMaterialOverrides(materialId: number, overrides: Record<string, { type: string; value: number | number[] }>): void {
        if (!this.initialized || !overrides) return;

        for (const [name, override] of Object.entries(overrides)) {
            const { type, value } = override;

            switch (type) {
                case 'float':
                    this.setMaterialFloat(materialId, name, value as number);
                    break;
                case 'vec2':
                    {
                        const v = value as number[];
                        this.setMaterialVec2(materialId, name, v[0], v[1]);
                    }
                    break;
                case 'vec3':
                    {
                        const v = value as number[];
                        this.setMaterialVec3(materialId, name, v[0], v[1], v[2]);
                    }
                    break;
                case 'vec4':
                    {
                        const v = value as number[];
                        this.setMaterialVec4(materialId, name, v[0], v[1], v[2], v[3]);
                    }
                    break;
                case 'color':
                    {
                        const v = value as number[];
                        this.setMaterialColor(materialId, name, v[0], v[1], v[2], v[3] ?? 1.0);
                    }
                    break;
                case 'int':
                    // Int is passed as float | Int 作为 float 传递
                    this.setMaterialFloat(materialId, name, value as number);
                    break;
            }
        }
    }

    /**
     * Dispose the bridge and release resources.
     * 销毁桥接并释放资源。
     */
    dispose(): void {
        this.engine = null;
        this.initialized = false;
    }
}
