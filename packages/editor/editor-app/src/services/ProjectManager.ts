/**
 * @zh 项目管理器 - 管理 Cocos 项目的加载和资源管线
 * @en Project Manager - Manages Cocos project loading and resource pipeline
 */

import { parseSceneJson, type ParsedScene, type ParsedNode } from './SceneParser';

interface CCSettings {
    init(path: string, overrides?: Record<string, unknown>): Promise<void>;
    querySettings<T>(category: string, name: string): T | null;
    overrideSettings(category: string, name: string, value: unknown): void;
}

interface CCAssetManager {
    init(options?: {
        server?: string;
        bundleVers?: Record<string, string>;
        remoteBundles?: string[];
        importBase?: string;
        nativeBase?: string;
    }): void;
    loadBundle(
        nameOrUrl: string,
        options: { version?: string } | null,
        onComplete: (err: Error | null, bundle?: CCBundle) => void
    ): void;
    getBundle(name: string): CCBundle | null;
    loadAny(
        requests: unknown,
        options: unknown,
        onProgress: unknown,
        onComplete: (err: Error | null, assets?: unknown) => void
    ): void;
}

interface CCBundle {
    name: string;
    loadScene(
        sceneName: string,
        options: unknown,
        onProgress: unknown,
        onComplete: (err: Error | null, scene?: CCSceneAsset) => void
    ): void;
    load<T>(
        paths: string | string[],
        type: unknown,
        onProgress: unknown,
        onComplete: (err: Error | null, asset?: T) => void
    ): void;
}

interface CCDeserialize {
    (data: unknown, details?: unknown, options?: unknown): unknown;
}

interface CCSceneAsset {
    scene: unknown;
}

interface CCDirector {
    runScene(scene: unknown): void;
    runSceneImmediate(
        scene: unknown,
        onBeforeLoad?: () => void,
        onLaunched?: () => void
    ): void;
    getScene(): { children: CCNode[] } | null;
}

interface CCNode {
    name: string;
    uuid: string;
    active: boolean;
    children: CCNode[];
    _components?: Array<{ __classname__?: string }>;
}

interface CCJS {
    setClassName(className: string, constructor: unknown): void;
    _setClassId(classId: string, constructor: unknown): void;
    getClassByName(className: string): unknown;
    getClassById(classId: string): unknown;
    _registeredClassIds: Record<string, unknown>;
    _registeredClassNames: Record<string, unknown>;
}

export interface ProjectConfig {
    /** @zh 项目根目录 @en Project root directory */
    projectPath: string;
    /** @zh 构建输出目录 @en Build output directory */
    buildPath?: string;
    /** @zh 构建平台 @en Build platform */
    platform?: 'web-desktop' | 'web-mobile';
    /** @zh 使用编辑器模式（从 temp 目录加载） @en Use editor mode (load from temp directory) */
    editorMode?: boolean;
}

export interface ProjectInfo {
    name: string;
    projectPath: string;
    buildPath: string;
    settingsPath: string;
    hasValidBuild: boolean;
    /** @zh 是否有编辑器编译缓存 @en Whether has editor compiled cache */
    hasEditorCache: boolean;
    /** @zh 编辑器脚本路径 @en Editor scripts path */
    editorScriptsPath: string;
    bundles: string[];
    scenes: string[];
}

export interface SceneInfo {
    uuid: string;
    name: string;
    url: string;
}

/**
 * @zh 项目管理器单例
 * @en Project Manager singleton
 */
class ProjectManagerImpl {
    private static instance: ProjectManagerImpl | null = null;

    private settings: CCSettings | null = null;
    private assetManager: CCAssetManager | null = null;
    private director: CCDirector | null = null;
    private js: CCJS | null = null;

    private currentProject: ProjectInfo | null = null;
    private isInitialized = false;
    private loadedBundles: Set<string> = new Set();

    private onProjectLoadedCallbacks: Array<(project: ProjectInfo) => void> = [];
    private onSceneLoadedCallbacks: Array<(sceneName: string) => void> = [];

    private constructor() {}

    static getInstance(): ProjectManagerImpl {
        if (!ProjectManagerImpl.instance) {
            ProjectManagerImpl.instance = new ProjectManagerImpl();
        }
        return ProjectManagerImpl.instance;
    }

    /**
     * @zh 初始化项目管理器（需要在引擎初始化后调用）
     * @en Initialize project manager (must be called after engine init)
     */
    async init(): Promise<boolean> {
        if (this.isInitialized) {
            return true;
        }

        try {
            // 获取 ccesengine 全局对象
            const cc = (window as unknown as { cc: {
                settings: CCSettings;
                assetManager: CCAssetManager;
                director: CCDirector;
                js: CCJS;
            } }).cc;

            if (!cc) {
                console.error('[ProjectManager] ccesengine not found');
                return false;
            }

            this.settings = cc.settings;
            this.assetManager = cc.assetManager;
            this.director = cc.director;
            this.js = cc.js;

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('[ProjectManager] Failed to initialize:', error);
            return false;
        }
    }

    /**
     * @zh 打开项目
     * @en Open project
     */
    async openProject(config: ProjectConfig): Promise<ProjectInfo | null> {
        if (!this.isInitialized) {
            await this.init();
        }

        const { projectPath, platform = 'web-desktop' } = config;
        const buildPath = config.buildPath || `${projectPath}/build/${platform}`;
        const editorScriptsPath = `${projectPath}/temp/programming/packer-driver/targets/editor`;


        try {
            // 检查编辑器缓存和构建目录
            const hasEditorCache = await this.checkEditorCacheExists(projectPath);
            const hasValidBuild = await this.checkBuildExists(buildPath);


            const projectInfo: ProjectInfo = {
                name: this.extractProjectName(projectPath),
                projectPath,
                buildPath,
                settingsPath: `${buildPath}/settings.json`,
                hasValidBuild,
                hasEditorCache,
                editorScriptsPath,
                bundles: [],
                scenes: []
            };

            // 脚本编译由 Vite Dev Server 处理（Game 模式）
            // Scene 模式暂时不需要编译脚本
            // Script compilation is handled by Vite Dev Server (Game mode)
            // Scene mode doesn't require script compilation for now

            // 获取场景列表
            projectInfo.scenes = await this.getProjectScenesFromAssets(projectInfo);

            // 如果有构建目录，也加载构建配置（用于发布模式）
            if (hasValidBuild) {
                await this.loadProjectSettings(projectInfo);
                await this.loadProjectBundles(projectInfo);
            }

            this.currentProject = projectInfo;
            this.notifyProjectLoaded(projectInfo);

            return projectInfo;
        } catch (error) {
            console.error('[ProjectManager] Failed to open project:', error);
            return null;
        }
    }

    /**
     * @zh 检查编辑器缓存是否存在
     * @en Check if editor cache exists
     */
    private async checkEditorCacheExists(projectPath: string): Promise<boolean> {
        try {
            const { invoke } = await import('@tauri-apps/api/core');
            const importMapPath = `${projectPath}/temp/programming/packer-driver/targets/editor/import-map.json`;
            return await invoke<boolean>('path_exists', { path: importMapPath });
        } catch {
            return false;
        }
    }

    /**
     * @zh 检查构建目录是否存在
     * @en Check if build directory exists
     */
    private async checkBuildExists(buildPath: string): Promise<boolean> {
        try {
            const { invoke } = await import('@tauri-apps/api/core');
            const exists = await invoke<boolean>('path_exists', { path: `${buildPath}/settings.json` });
            return exists;
        } catch {
            return false;
        }
    }

    /**
     * @zh 加载项目设置
     * @en Load project settings
     */
    private async loadProjectSettings(project: ProjectInfo): Promise<void> {
        if (!this.settings) return;


        // 使用相对路径或 file:// URL
        // 注意: 在 Tauri 中需要转换为可访问的 URL
        const settingsUrl = await this.convertToAccessibleUrl(project.settingsPath);

        await this.settings.init(settingsUrl);
    }

    /**
     * @zh 加载项目资源包
     * @en Load project bundles
     */
    private async loadProjectBundles(project: ProjectInfo): Promise<void> {
        if (!this.settings || !this.assetManager) return;

        // 初始化 assetManager
        const bundleVers = this.settings.querySettings<Record<string, string>>('assets', 'bundleVers') || {};
        const server = this.settings.querySettings<string>('assets', 'server') || '';
        const importBase = this.settings.querySettings<string>('assets', 'importBase') || '';
        const nativeBase = this.settings.querySettings<string>('assets', 'nativeBase') || '';

        this.assetManager.init({
            server,
            bundleVers,
            importBase,
            nativeBase
        });

        // 获取预加载的 bundle 列表
        const preloadBundles = this.settings.querySettings<Array<{ bundle: string; version?: string }>>('assets', 'preloadBundles');
        if (!preloadBundles || preloadBundles.length === 0) {
            return;
        }


        for (const { bundle, version } of preloadBundles) {
            try {
                await this.loadBundle(bundle, version);
                project.bundles.push(bundle);
            } catch (error) {
                console.error('[ProjectManager] Failed to load bundle:', bundle, error);
            }
        }
    }

    /**
     * @zh 加载单个资源包
     * @en Load a single bundle
     */
    private loadBundle(bundleName: string, version?: string): Promise<CCBundle> {
        return new Promise((resolve, reject) => {
            if (!this.assetManager) {
                reject(new Error('AssetManager not initialized'));
                return;
            }

            if (this.loadedBundles.has(bundleName)) {
                const bundle = this.assetManager.getBundle(bundleName);
                if (bundle) {
                    resolve(bundle);
                    return;
                }
            }

            const opts = version ? { version } : null;
            this.assetManager.loadBundle(bundleName, opts, (err, bundle) => {
                if (err) {
                    reject(err);
                } else if (bundle) {
                    this.loadedBundles.add(bundleName);
                    resolve(bundle);
                } else {
                    reject(new Error(`Bundle ${bundleName} not found`));
                }
            });
        });
    }

    /**
     * @zh 从资源包加载场景
     * @en Load scene from bundle
     */
    async loadScene(sceneName: string, bundleName?: string): Promise<boolean> {
        if (!this.assetManager || !this.director) {
            console.error('[ProjectManager] Engine not initialized');
            return false;
        }

        try {
            // 确定使用哪个 bundle
            const targetBundle = bundleName || 'main';
            const bundle = this.assetManager.getBundle(targetBundle);

            if (!bundle) {
                console.error('[ProjectManager] Bundle not found:', targetBundle);
                return false;
            }


            return new Promise((resolve) => {
                bundle.loadScene(sceneName, null, null, (err, sceneAsset) => {
                    if (err) {
                        console.error('[ProjectManager] Failed to load scene:', err);
                        resolve(false);
                        return;
                    }

                    if (sceneAsset?.scene && this.director) {
                        this.director.runSceneImmediate(
                            sceneAsset.scene,
                            async () => {
                                this.notifySceneLoaded(sceneName);
                                resolve(true);
                            }
                        );
                    } else if (!this.director) {
                        console.error('[ProjectManager] Director not available');
                        resolve(false);
                    } else {
                        console.error('[ProjectManager] Invalid scene asset');
                        resolve(false);
                    }
                });
            });
        } catch (error) {
            console.error('[ProjectManager] Failed to load scene:', error);
            return false;
        }
    }

    /**
     * @zh 注册缺失类的占位符（用于部分加载）
     * @en Register placeholder for missing class (for partial loading)
     */
    registerMissingClassPlaceholder(classId: string, className?: string): void {
        if (!this.js) return;

        // 创建一个空的占位类
        const PlaceholderClass = function(this: { __classId__: string; __className__?: string }) {
            this.__classId__ = classId;
            if (className) this.__className__ = className;
        };

        // 注册到类映射
        this.js._setClassId(classId, PlaceholderClass);
        if (className) {
            this.js.setClassName(className, PlaceholderClass);
        }

    }

    /**
     * @zh 转换为可访问的 URL
     * @en Convert to accessible URL
     */
    private async convertToAccessibleUrl(filePath: string): Promise<string> {
        // 在 Tauri 中，需要使用 convertFileSrc 或自定义协议
        try {
            const { convertFileSrc } = await import('@tauri-apps/api/core');
            return convertFileSrc(filePath);
        } catch {
            // 回退到 file:// 协议
            return `file://${filePath.replace(/\\/g, '/')}`;
        }
    }

    /**
     * @zh 从 assets 目录获取场景列表
     * @en Get scene list from assets directory
     */
    private async getProjectScenesFromAssets(project: ProjectInfo): Promise<string[]> {
        try {
            const { invoke } = await import('@tauri-apps/api/core');
            const scenesDir = `${project.projectPath}/assets/scenes`;

            // 检查 scenes 目录是否存在
            const exists = await invoke<boolean>('path_exists', { path: scenesDir });
            if (!exists) {
                // 尝试在 assets 根目录查找
                return await this.findScenesInDirectory(`${project.projectPath}/assets`);
            }

            return await this.findScenesInDirectory(scenesDir);
        } catch (error) {
            console.error('[ProjectManager] Failed to get scenes from assets:', error);
            return [];
        }
    }

    /**
     * @zh 在目录中查找场景文件
     * @en Find scene files in directory
     */
    private async findScenesInDirectory(dirPath: string): Promise<string[]> {
        try {
            const { invoke } = await import('@tauri-apps/api/core');

            interface DirectoryEntry {
                name: string;
                path: string;
                is_dir: boolean;
            }

            const entries = await invoke<DirectoryEntry[]>('list_directory', { path: dirPath });
            const scenes: string[] = [];

            for (const entry of entries) {
                if (entry.is_dir) {
                    // 递归查找子目录
                    const subScenes = await this.findScenesInDirectory(entry.path);
                    scenes.push(...subScenes);
                } else if (entry.name.endsWith('.scene')) {
                    scenes.push(entry.name.replace('.scene', ''));
                }
            }

            return scenes;
        } catch {
            return [];
        }
    }

    private parsedScene: ParsedScene | null = null;

    /**
     * @zh 从 library 加载场景（编辑器模式）- 仅加载层级结构
     * @en Load scene from library (editor mode) - hierarchy only
     *
     * 不运行 Cocos 场景生命周期，仅解析 JSON 获取节点树
     * Does not run Cocos scene lifecycle, only parses JSON to get node tree
     */
    async loadSceneFromLibrary(sceneName: string): Promise<boolean> {
        const project = this.currentProject;
        if (!project) {
            console.error('[ProjectManager] No project loaded');
            return false;
        }

        try {
            const { invoke } = await import('@tauri-apps/api/core');

            // 查找场景的 UUID
            const sceneUuid = await this.findSceneUuid(project.projectPath, sceneName);
            if (!sceneUuid) {
                console.error('[ProjectManager] Scene UUID not found:', sceneName);
                return false;
            }

            // 从 library 加载场景 JSON
            const uuidPrefix = sceneUuid.substring(0, 2);
            const scenePath = `${project.projectPath}/library/${uuidPrefix}/${sceneUuid}.json`;

            const sceneContent = await invoke<string>('read_file_content', { path: scenePath });
            if (!sceneContent) {
                console.error('[ProjectManager] Failed to read scene file:', scenePath);
                return false;
            }

            const sceneData = JSON.parse(sceneContent);

            // 解析场景 JSON 获取节点层级（不运行 Cocos 生命周期）
            this.parsedScene = parseSceneJson(sceneData);

            // 通知场景加载完成
            this.notifySceneLoaded(sceneName);

            // 通知 engine facade

            return true;
        } catch (error) {
            console.error('[ProjectManager] Failed to load scene from library:', error);
            return false;
        }
    }

    /**
     * @zh 获取已解析的场景数据
     * @en Get parsed scene data
     */
    getParsedScene(): ParsedScene | null {
        return this.parsedScene;
    }

    /**
     * @zh 获取场景节点树（用于层级面板）
     * @en Get scene node tree (for hierarchy panel)
     */
    getSceneNodes(): ParsedNode[] {
        return this.parsedScene?.nodes || [];
    }

    /**
     * @zh 查找场景的 UUID
     * @en Find scene UUID
     */
    private async findSceneUuid(projectPath: string, sceneName: string): Promise<string | null> {
        try {
            const { invoke } = await import('@tauri-apps/api/core');

            // 查找 .scene.meta 文件
            const scenesDir = `${projectPath}/assets/scenes`;
            const metaPath = `${scenesDir}/${sceneName}.scene.meta`;

            let metaContent = await invoke<string>('read_file_content', { path: metaPath }).catch(() => null);

            // 如果在 scenes 目录没找到，递归搜索
            if (!metaContent) {
                const uuid = await this.searchSceneMetaRecursive(`${projectPath}/assets`, sceneName);
                return uuid;
            }

            const meta = JSON.parse(metaContent);
            return meta.uuid || null;
        } catch {
            return null;
        }
    }

    /**
     * @zh 递归搜索场景 meta 文件
     * @en Recursively search for scene meta file
     */
    private async searchSceneMetaRecursive(dirPath: string, sceneName: string): Promise<string | null> {
        try {
            const { invoke } = await import('@tauri-apps/api/core');

            interface DirectoryEntry {
                name: string;
                path: string;
                is_dir: boolean;
            }

            const entries = await invoke<DirectoryEntry[]>('list_directory', { path: dirPath });

            for (const entry of entries) {
                if (entry.is_dir) {
                    const result = await this.searchSceneMetaRecursive(entry.path, sceneName);
                    if (result) return result;
                } else if (entry.name === `${sceneName}.scene.meta`) {
                    const metaContent = await invoke<string>('read_file_content', { path: entry.path });
                    const meta = JSON.parse(metaContent);
                    return meta.uuid || null;
                }
            }

            return null;
        } catch {
            return null;
        }
    }

    /**
     * @zh 提取项目名称
     * @en Extract project name
     */
    private extractProjectName(projectPath: string): string {
        const parts = projectPath.replace(/\\/g, '/').split('/');
        return parts[parts.length - 1] || 'Untitled';
    }

    onProjectLoaded(callback: (project: ProjectInfo) => void): void {
        this.onProjectLoadedCallbacks.push(callback);
    }

    offProjectLoaded(callback: (project: ProjectInfo) => void): void {
        const index = this.onProjectLoadedCallbacks.indexOf(callback);
        if (index >= 0) this.onProjectLoadedCallbacks.splice(index, 1);
    }

    onSceneLoaded(callback: (sceneName: string) => void): void {
        this.onSceneLoadedCallbacks.push(callback);
    }

    offSceneLoaded(callback: (sceneName: string) => void): void {
        const index = this.onSceneLoadedCallbacks.indexOf(callback);
        if (index >= 0) this.onSceneLoadedCallbacks.splice(index, 1);
    }

    private notifyProjectLoaded(project: ProjectInfo): void {
        this.onProjectLoadedCallbacks.forEach(cb => cb(project));
    }

    private notifySceneLoaded(sceneName: string): void {
        this.onSceneLoadedCallbacks.forEach(cb => cb(sceneName));
    }

    getCurrentProject(): ProjectInfo | null {
        return this.currentProject;
    }

    getIsInitialized(): boolean {
        return this.isInitialized;
    }

    getLoadedBundles(): string[] {
        return Array.from(this.loadedBundles);
    }
}

// 导出单例获取函数
export function getProjectManager(): ProjectManagerImpl {
    return ProjectManagerImpl.getInstance();
}

export type { ProjectManagerImpl as ProjectManager };
