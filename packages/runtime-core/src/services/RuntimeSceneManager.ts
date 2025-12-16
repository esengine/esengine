/**
 * 运行时场景管理器
 * Runtime Scene Manager
 *
 * 提供场景加载和切换 API，供用户脚本使用
 * Provides scene loading and transition API for user scripts
 *
 * @example
 * ```typescript
 * // 在用户脚本中获取场景管理器
 * // Get scene manager in user script
 * const sceneManager = services.get(RuntimeSceneManagerToken);
 *
 * // 加载场景（按名称）
 * // Load scene by name
 * await sceneManager.loadScene('GameScene');
 *
 * // 加载场景（按路径）
 * // Load scene by path
 * await sceneManager.loadSceneByPath('./scenes/Level1.ecs');
 * ```
 */

import { createServiceToken } from '@esengine/ecs-framework';

/**
 * 场景信息
 * Scene info
 */
export interface SceneInfo {
    /** 场景名称 | Scene name */
    name: string;
    /** 场景路径（相对于构建输出目录）| Scene path (relative to build output) */
    path: string;
}

/**
 * 场景加载选项
 * Scene load options
 */
export interface SceneLoadOptions {
    /**
     * 是否显示加载界面
     * Whether to show loading screen
     */
    showLoading?: boolean;

    /**
     * 过渡效果类型
     * Transition effect type
     */
    transition?: 'none' | 'fade' | 'slide';

    /**
     * 过渡持续时间（毫秒）
     * Transition duration in milliseconds
     */
    transitionDuration?: number;
}

/**
 * 场景加载器函数类型
 * Scene loader function type
 */
export type SceneLoader = (url: string) => Promise<void>;

/**
 * 运行时场景管理器接口
 * Runtime Scene Manager Interface
 *
 * 继承 IService 的 dispose 模式以兼容 ServiceContainer。
 * Follows IService dispose pattern for ServiceContainer compatibility.
 */
export interface IRuntimeSceneManager {
    /**
     * 获取当前场景名称
     * Get current scene name
     */
    readonly currentSceneName: string | null;

    /**
     * 获取可用场景列表
     * Get available scene list
     */
    readonly availableScenes: readonly SceneInfo[];

    /**
     * 是否正在加载场景
     * Whether a scene is currently loading
     */
    readonly isLoading: boolean;

    /**
     * 注册可用场景
     * Register available scenes
     */
    registerScenes(scenes: SceneInfo[]): void;

    /**
     * 按名称加载场景
     * Load scene by name
     */
    loadScene(sceneName: string, options?: SceneLoadOptions): Promise<void>;

    /**
     * 按路径加载场景
     * Load scene by path
     */
    loadSceneByPath(path: string, options?: SceneLoadOptions): Promise<void>;

    /**
     * 重新加载当前场景
     * Reload current scene
     */
    reloadCurrentScene(options?: SceneLoadOptions): Promise<void>;

    /**
     * 添加场景加载开始监听器
     * Add scene load start listener
     */
    onLoadStart(callback: (sceneName: string) => void): () => void;

    /**
     * 添加场景加载完成监听器
     * Add scene load complete listener
     */
    onLoadComplete(callback: (sceneName: string) => void): () => void;

    /**
     * 添加场景加载错误监听器
     * Add scene load error listener
     */
    onLoadError(callback: (error: Error, sceneName: string) => void): () => void;

    /**
     * 释放资源（IService 兼容）
     * Dispose resources (IService compatible)
     */
    dispose(): void;
}

/**
 * 运行时场景管理器服务令牌
 * Runtime Scene Manager Service Token
 */
export const RuntimeSceneManagerToken = createServiceToken<IRuntimeSceneManager>('runtimeSceneManager');

/**
 * 运行时场景管理器实现
 * Runtime Scene Manager Implementation
 *
 * 实现 IService 接口以兼容 ServiceContainer。
 * Implements IService for ServiceContainer compatibility.
 */
export class RuntimeSceneManager implements IRuntimeSceneManager {
    private _scenes = new Map<string, SceneInfo>();
    private _currentSceneName: string | null = null;
    private _currentScenePath: string | null = null;
    private _isLoading = false;
    private _sceneLoader: SceneLoader | null = null;
    private _baseUrl: string;
    private _disposed = false;

    // 事件监听器 | Event listeners
    private _loadStartListeners = new Set<(sceneName: string) => void>();
    private _loadCompleteListeners = new Set<(sceneName: string) => void>();
    private _loadErrorListeners = new Set<(error: Error, sceneName: string) => void>();

    /**
     * 创建运行时场景管理器
     * Create runtime scene manager
     *
     * @param sceneLoader 场景加载函数 | Scene loader function
     * @param baseUrl 场景文件基础 URL | Scene files base URL
     */
    constructor(sceneLoader: SceneLoader, baseUrl: string = './scenes') {
        this._sceneLoader = sceneLoader;
        this._baseUrl = baseUrl;
    }

    get currentSceneName(): string | null {
        return this._currentSceneName;
    }

    get availableScenes(): readonly SceneInfo[] {
        return Array.from(this._scenes.values());
    }

    get isLoading(): boolean {
        return this._isLoading;
    }

    /**
     * 设置场景加载器
     * Set scene loader
     */
    setSceneLoader(loader: SceneLoader): void {
        this._sceneLoader = loader;
    }

    /**
     * 设置基础 URL
     * Set base URL
     */
    setBaseUrl(baseUrl: string): void {
        this._baseUrl = baseUrl;
    }

    registerScenes(scenes: SceneInfo[]): void {
        for (const scene of scenes) {
            this._scenes.set(scene.name, scene);
        }
    }

    /**
     * 从目录或配置自动发现场景
     * Auto-discover scenes from catalog or config
     */
    registerScenesFromCatalog(
        catalog: { scenes?: Array<{ name: string; path: string }> }
    ): void {
        if (catalog.scenes) {
            this.registerScenes(catalog.scenes);
        }
    }

    async loadScene(sceneName: string, options?: SceneLoadOptions): Promise<void> {
        const sceneInfo = this._scenes.get(sceneName);
        if (!sceneInfo) {
            // 尝试使用场景名作为路径
            // Try using scene name as path
            const guessedPath = `${this._baseUrl}/${sceneName}.ecs`;
            return this.loadSceneByPath(guessedPath, options);
        }

        return this.loadSceneByPath(sceneInfo.path, options);
    }

    async loadSceneByPath(path: string, options?: SceneLoadOptions): Promise<void> {
        if (!this._sceneLoader) {
            throw new Error('[RuntimeSceneManager] Scene loader not set');
        }

        if (this._isLoading) {
            console.warn('[RuntimeSceneManager] Scene is already loading, ignoring request');
            return;
        }

        // 构建完整 URL | Build full URL
        // Check if path is already absolute (http, relative ./, Unix /, or Windows drive letter)
        // 检查路径是否已经是绝对路径（http、相对 ./、Unix /、或 Windows 驱动器号）
        let fullPath = path;
        const isAbsolutePath = path.startsWith('http') ||
            path.startsWith('./') ||
            path.startsWith('/') ||
            (path.length > 1 && path[1] === ':'); // Windows absolute path like C:\ or F:\

        if (!isAbsolutePath) {
            fullPath = `${this._baseUrl}/${path}`;
        }

        // 提取场景名称 | Extract scene name
        const sceneName = this._extractSceneName(path);

        this._isLoading = true;
        this._notifyLoadStart(sceneName);

        try {
            // TODO: 实现过渡效果 | TODO: Implement transition effects
            // if (options?.transition && options.transition !== 'none') {
            //     await this._startTransition(options.transition, options.transitionDuration);
            // }

            await this._sceneLoader(fullPath);

            this._currentSceneName = sceneName;
            this._currentScenePath = fullPath;
            this._isLoading = false;

            this._notifyLoadComplete(sceneName);

            console.log(`[RuntimeSceneManager] Scene loaded: ${sceneName}`);
        } catch (error) {
            this._isLoading = false;
            const err = error instanceof Error ? error : new Error(String(error));
            this._notifyLoadError(err, sceneName);
            throw err;
        }
    }

    async reloadCurrentScene(options?: SceneLoadOptions): Promise<void> {
        if (!this._currentScenePath) {
            throw new Error('[RuntimeSceneManager] No current scene to reload');
        }

        return this.loadSceneByPath(this._currentScenePath, options);
    }

    onLoadStart(callback: (sceneName: string) => void): () => void {
        this._loadStartListeners.add(callback);
        return () => this._loadStartListeners.delete(callback);
    }

    onLoadComplete(callback: (sceneName: string) => void): () => void {
        this._loadCompleteListeners.add(callback);
        return () => this._loadCompleteListeners.delete(callback);
    }

    onLoadError(callback: (error: Error, sceneName: string) => void): () => void {
        this._loadErrorListeners.add(callback);
        return () => this._loadErrorListeners.delete(callback);
    }

    /**
     * 检查场景是否已注册
     * Check if scene is registered
     */
    hasScene(sceneName: string): boolean {
        return this._scenes.has(sceneName);
    }

    /**
     * 获取场景路径
     * Get scene path
     */
    getScenePath(sceneName: string): string | null {
        return this._scenes.get(sceneName)?.path ?? null;
    }

    // ==================== 私有方法 | Private Methods ====================

    private _extractSceneName(path: string): string {
        // 从路径中提取场景名称 | Extract scene name from path
        // ./scenes/Level1.ecs -> Level1
        // scenes/GameScene.ecs -> GameScene
        const fileName = path.split('/').pop() || path;
        return fileName.replace(/\.ecs$/, '');
    }

    private _notifyLoadStart(sceneName: string): void {
        for (const listener of this._loadStartListeners) {
            try {
                listener(sceneName);
            } catch (e) {
                console.error('[RuntimeSceneManager] Error in load start listener:', e);
            }
        }
    }

    private _notifyLoadComplete(sceneName: string): void {
        for (const listener of this._loadCompleteListeners) {
            try {
                listener(sceneName);
            } catch (e) {
                console.error('[RuntimeSceneManager] Error in load complete listener:', e);
            }
        }
    }

    private _notifyLoadError(error: Error, sceneName: string): void {
        for (const listener of this._loadErrorListeners) {
            try {
                listener(error, sceneName);
            } catch (e) {
                console.error('[RuntimeSceneManager] Error in load error listener:', e);
            }
        }
    }

    // ==================== IService 实现 | IService Implementation ====================

    /**
     * 释放资源
     * Dispose resources
     *
     * 实现 IService 接口，清理所有监听器和状态。
     * Implements IService interface, cleans up all listeners and state.
     */
    dispose(): void {
        if (this._disposed) return;

        this._loadStartListeners.clear();
        this._loadCompleteListeners.clear();
        this._loadErrorListeners.clear();
        this._scenes.clear();
        this._sceneLoader = null;
        this._currentSceneName = null;
        this._currentScenePath = null;
        this._disposed = true;
    }
}
