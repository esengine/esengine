/**
 * @zh EditorBundle - 编辑器虚拟资源包系统
 * @en EditorBundle - Editor virtual bundle system
 *
 * 通过创建一个 ccesengine Bundle 并正确配置其 config，
 * 让 assetManager.loadAny({ uuid }) 能够自动加载项目资源。
 *
 * Creates a ccesengine Bundle with proper config,
 * so assetManager.loadAny({ uuid }) can automatically load project assets.
 */

import { invoke } from '@tauri-apps/api/core';
import type { IEngineAdapter, DeserializeDetails } from './EngineAdapter';
import { getEngineAdapter } from './EngineAdapter';
import type { Scene, SceneAsset, Asset } from 'cc';

interface MetaFile {
    ver: string;
    importer: string;
    imported: boolean;
    uuid: string;
    files: string[];
    subMetas?: Record<string, MetaSubAsset>;
}

interface MetaSubAsset {
    importer: string;
    uuid: string;
    id?: string;
    subMetas?: Record<string, MetaSubAsset>;
}

interface DirectoryEntry {
    name: string;
    path: string;
    is_dir: boolean;
}

interface AssetRef {
    __uuid__: string;
    __expectedType__?: string;
}

type PartialDetails = Partial<DeserializeDetails>;

/**
 * @zh ccesengine Cache 接口
 * @en ccesengine Cache interface
 * @see engine/cocos/asset/asset-manager/cache.ts
 */
interface ICache<T> {
    add(key: string, val: T): T;
    get(key: string): T | undefined | null;
    has(key: string): boolean;
    remove(key: string): T | undefined | null;
    readonly count: number;
}

/**
 * @zh ccesengine 资源信息
 * @en ccesengine asset info
 * @see engine/cocos/asset/asset-manager/config.ts
 */
interface IAssetInfo {
    uuid: string;
    extension?: string;
    ver?: string;
    nativeVer?: string;
}

/**
 * @zh ccesengine Config 类接口
 * @en ccesengine Config class interface
 * @see engine/cocos/asset/asset-manager/config.ts
 */
interface IConfig {
    name: string;
    base: string;
    importBase: string;
    nativeBase: string;
    assetInfos: ICache<IAssetInfo>;
    getAssetInfo(uuid: string): IAssetInfo | null;
}

/**
 * @zh ccesengine Bundle config 选项
 * @en ccesengine Bundle config options
 * @see engine/cocos/asset/asset-manager/config.ts IConfigOption
 */
interface IConfigOption {
    name: string;
    base: string;
    importBase: string;
    nativeBase: string;
    deps: string[];
    uuids: string[];
    paths: Record<string, unknown[]>;
    scenes: Record<string, string>;
    packs: Record<string, string[]>;
    versions: { import: string[]; native: string[] };
    redirect: string[];
    debug: boolean;
    types: string[];
    extensionMap: Record<string, string[]>;
}

/**
 * @zh ccesengine Bundle 类接口
 * @en ccesengine Bundle class interface
 * @see engine/cocos/asset/asset-manager/bundle.ts
 */
interface IBundle {
    readonly name: string;
    readonly config: IConfig;
    init(options: IConfigOption): void;
    getAssetInfo(uuid: string): IAssetInfo | null;
}

/**
 * @zh 编辑器虚拟资源包
 * @en Editor virtual bundle
 *
 * 核心功能：
 * 1. 扫描项目 library 目录，收集所有 UUID
 * 2. 创建一个 ccesengine Bundle 并注册到 bundles
 * 3. 让 assetManager.loadAny({ uuid }) 自动工作
 *
 * Core features:
 * 1. Scan project library directory, collect all UUIDs
 * 2. Create a ccesengine Bundle and register to bundles
 * 3. Let assetManager.loadAny({ uuid }) work automatically
 */
class EditorBundle {
    private _adapter: IEngineAdapter;
    private _projectPath: string | null = null;
    private _initialized = false;
    private _bundleName = 'editor-project';

    // UUID to source path mapping (for editor UI)
    private _uuidToSourcePath: Map<string, string> = new Map();

    // All UUIDs found in library
    private _libraryUuids: Set<string> = new Set();

    constructor() {
        this._adapter = getEngineAdapter();
    }

    /**
     * @zh 初始化 EditorBundle
     * @en Initialize EditorBundle
     */
    async initialize(projectPath: string): Promise<void> {
        if (this._initialized && this._projectPath === projectPath) {
            return;
        }

        this._projectPath = projectPath;
        this._uuidToSourcePath.clear();
        this._libraryUuids.clear();

        // Step 1: Scan assets folder for source -> UUID mapping
        await this.scanAssetsFolder(`${projectPath}/assets`);

        // Step 2: Scan library folder for all UUIDs
        await this.scanLibraryFolder(`${projectPath}/library`);

        // Step 3: Create and register Bundle
        this.createEditorBundle(projectPath);

        this._initialized = true;
    }

    /**
     * @zh 加载场景
     * @en Load scene
     */
    async loadScene(scenePath: string): Promise<SceneAsset | null> {

        // Step 1: Read scene file
        const sceneJson = await this.readJsonFile(scenePath);
        if (!sceneJson) {
            console.error(`[EditorBundle] Failed to read scene: ${scenePath}`);
            return null;
        }

        // Step 2: Get scene UUID
        const sceneUuid = await this.getSceneUuid(scenePath);

        // Step 3: Extract and preload dependencies using standard API
        const uuids = this.extractDependencies(sceneJson);

        if (uuids.length > 0) {
            await this.preloadAssets(uuids);
        }

        // Step 4: Deserialize scene
        const sceneAsset = this.deserializeScene(sceneJson, sceneUuid);

        return sceneAsset;
    }

    /**
     * @zh 加载单个资源（使用直接反序列化）
     * @en Load a single asset (using direct deserialization)
     */
    async loadAsset<T extends Asset>(uuid: string): Promise<T | null> {
        const cc = this._adapter.getCC();
        if (!cc?.assetManager) return null;

        // Check cache first
        const cached = cc.assetManager.assets.get(uuid);
        if (cached) {
            return cached as T;
        }

        try {
            const result = await this.deserializeAssetJson(uuid);
            if (result) {
                cc.assetManager.assets.add(uuid, result.asset);
                // Resolve dependencies immediately for single asset load
                if (result.details.uuidList && result.details.uuidObjList && result.details.uuidPropList) {
                    const { uuidList, uuidObjList, uuidPropList } = result.details;
                    for (let i = 0; i < uuidList.length; i++) {
                        const depUuid = uuidList[i];
                        const obj = uuidObjList[i] as Record<string, unknown>;
                        const prop = uuidPropList[i];
                        if (!obj || !prop || !depUuid) continue;

                        let depAsset = cc.assetManager.assets.get(depUuid);
                        if (!depAsset) {
                            // Try to load the dependency
                            depAsset = await this.loadAsset(depUuid);
                        }
                        if (depAsset) {
                            obj[prop] = depAsset;
                        }
                    }
                }
                return result.asset as T;
            }
            return null;
        } catch {
            return null;
        }
    }

    /**
     * @zh 获取源文件路径
     * @en Get source file path
     */
    getSourcePath(uuid: string): string | null {
        return this._uuidToSourcePath.get(uuid) ?? null;
    }

    /**
     * @zh 获取项目路径
     * @en Get project path
     */
    get projectPath(): string | null {
        return this._projectPath;
    }

    /**
     * @zh 获取 library 路径
     * @en Get library path
     */
    get libraryPath(): string | null {
        return this._projectPath ? `${this._projectPath}/library` : null;
    }

    /**
     * @zh 创建并注册编辑器 Bundle
     * @en Create and register editor Bundle
     *
     * 这是核心方法：创建一个 ccesengine Bundle 并正确配置其 config，
     * 这样 assetManager.loadAny({ uuid }) 就能自动找到资源路径。
     *
     * This is the core method: creates a ccesengine Bundle with proper config,
     * so assetManager.loadAny({ uuid }) can automatically find asset paths.
     */
    private createEditorBundle(projectPath: string): void {
        const cc = this._adapter.getCC();
        if (!cc?.assetManager) {
            return;
        }

        // Get Bundle class from ccesengine
        // AssetManager.Bundle is assigned in asset-manager.ts:840
        const AssetManagerClass = (cc as { AssetManager?: { Bundle?: new () => IBundle } }).AssetManager;
        const BundleClass = AssetManagerClass?.Bundle;
        if (!BundleClass) {
            this.configureGeneralBase(projectPath);
            return;
        }

        // bundles is a Cache<Bundle>, see asset-manager.ts:162
        const bundles = cc.assetManager.bundles as unknown as ICache<IBundle>;
        if (bundles.has(this._bundleName)) {
            bundles.remove(this._bundleName);
        }

        // Build bundle config matching IConfigOption
        const libraryUrl = this.pathToUrl(`${projectPath}/library`);
        const config: IConfigOption = {
            name: this._bundleName,
            base: '',
            importBase: libraryUrl,
            nativeBase: libraryUrl,
            deps: [],
            uuids: Array.from(this._libraryUuids),
            paths: {},
            scenes: {},
            packs: {},
            versions: { import: [], native: [] },
            redirect: [],
            debug: true,
            types: [],
            extensionMap: {}
        };

        try {
            const bundle = new BundleClass();

            // bundle.init() registers itself to bundles automatically
            bundle.init(config);

            // Add extension to each assetInfo for URL generation
            // url-transformer.ts:74 uses info.extension to build the final URL
            const assetInfos = bundle.config.assetInfos;
            for (const uuid of this._libraryUuids) {
                assetInfos.add(uuid, { uuid, extension: '.json' });
            }
        } catch (error) {
            console.error('[EditorBundle] Failed to create bundle:', error);
            this.configureGeneralBase(projectPath);
        }
    }

    /**
     * @zh 配置 generalImportBase（回退方案）
     * @en Configure generalImportBase (fallback)
     */
    private configureGeneralBase(projectPath: string): void {
        const cc = this._adapter.getCC();
        if (!cc?.assetManager) return;

        const libraryUrl = this.pathToUrl(`${projectPath}/library`);
        cc.assetManager.generalImportBase = libraryUrl;
        cc.assetManager.generalNativeBase = libraryUrl;

    }

    /**
     * @zh 将本地路径转换为 URL
     * @en Convert local path to URL
     */
    private pathToUrl(localPath: string): string {
        const normalized = localPath.replace(/\\/g, '/');
        const urlPath = normalized.replace(/^([A-Za-z]):\//, '$1/');
        return `/__project__/${urlPath}`;
    }

    private async scanAssetsFolder(dirPath: string): Promise<void> {
        let entries: DirectoryEntry[];
        try {
            entries = await invoke<DirectoryEntry[]>('list_directory', { path: dirPath });
        } catch {
            return;
        }

        for (const entry of entries) {
            if (entry.is_dir) {
                await this.scanAssetsFolder(entry.path);
            } else if (entry.name.endsWith('.meta')) {
                await this.processMetaFile(entry.path);
            }
        }
    }

    private async processMetaFile(metaPath: string): Promise<void> {
        try {
            const content = await invoke<string>('read_file_content', { path: metaPath });
            const meta = JSON.parse(content) as MetaFile;

            if (!meta.uuid) return;

            const sourcePath = metaPath.slice(0, -5); // Remove .meta
            this._uuidToSourcePath.set(meta.uuid, sourcePath);

            if (meta.subMetas) {
                this.processSubMetas(meta.subMetas, sourcePath);
            }
        } catch {
            // Ignore parse errors
        }
    }

    private processSubMetas(subMetas: Record<string, MetaSubAsset>, parentPath: string): void {
        for (const [, subMeta] of Object.entries(subMetas)) {
            if (subMeta.uuid) {
                this._uuidToSourcePath.set(subMeta.uuid, parentPath);
            }
            if (subMeta.subMetas) {
                this.processSubMetas(subMeta.subMetas, parentPath);
            }
        }
    }

    /**
     * @zh 扫描 library 目录，收集所有 UUID
     * @en Scan library directory, collect all UUIDs
     */
    private async scanLibraryFolder(libraryPath: string): Promise<void> {
        let entries: DirectoryEntry[];
        try {
            entries = await invoke<DirectoryEntry[]>('list_directory', { path: libraryPath });
        } catch {
            return;
        }

        for (const entry of entries) {
            if (entry.is_dir) {
                // Check if it's a 2-char prefix folder (like "ab", "cd", etc.)
                if (entry.name.length === 2) {
                    await this.scanLibraryPrefixFolder(entry.path);
                }
            }
        }
    }

    private async scanLibraryPrefixFolder(prefixPath: string): Promise<void> {
        let entries: DirectoryEntry[];
        try {
            entries = await invoke<DirectoryEntry[]>('list_directory', { path: prefixPath });
        } catch {
            return;
        }

        for (const entry of entries) {
            if (!entry.is_dir && entry.name.endsWith('.json')) {
                // Extract UUID from filename (remove .json)
                const uuid = entry.name.slice(0, -5);
                this._libraryUuids.add(uuid);
            }
        }
    }

    private async readJsonFile(filePath: string): Promise<unknown[] | null> {
        try {
            const content = await invoke<string>('read_file_content', { path: filePath });
            return JSON.parse(content) as unknown[];
        } catch (error) {
            console.error(`[EditorBundle] Failed to read JSON: ${filePath}`, error);
            return null;
        }
    }

    private async getSceneUuid(scenePath: string): Promise<string | undefined> {
        try {
            const metaPath = `${scenePath}.meta`;
            const content = await invoke<string>('read_file_content', { path: metaPath });
            const meta = JSON.parse(content) as { uuid?: string };
            return meta.uuid;
        } catch {
            return undefined;
        }
    }

    private extractDependencies(json: unknown): string[] {
        const uuids = new Set<string>();

        const traverse = (obj: unknown): void => {
            if (!obj || typeof obj !== 'object') return;

            if (Array.isArray(obj)) {
                obj.forEach(traverse);
                return;
            }

            const record = obj as Record<string, unknown>;

            if ('__uuid__' in record) {
                const ref = record as unknown as AssetRef;
                if (ref.__uuid__) {
                    uuids.add(ref.__uuid__);
                }
            }

            for (const value of Object.values(record)) {
                traverse(value);
            }
        };

        traverse(json);
        return Array.from(uuids);
    }

    /**
     * @zh 预加载资源（两阶段加载：先反序列化所有资源，再解析依赖）
     * @en Preload assets (two-phase: deserialize all assets first, then resolve dependencies)
     *
     * 策略：
     * 1. 第一阶段：读取JSON并反序列化所有资源，放入缓存（不解析依赖）
     * 2. 第二阶段：解析所有资源的依赖关系（此时依赖项已在缓存中）
     *
     * Strategy:
     * 1. Phase 1: Read JSON and deserialize all assets, add to cache (no dependency resolution)
     * 2. Phase 2: Resolve dependencies for all assets (dependencies are already in cache)
     *
     * 这样可以避免 ccesengine 的 URL 问题，因为所有资源在解析依赖时已在缓存中。
     * This avoids ccesengine's URL issue because all assets are in cache before dependency resolution.
     */
    private async preloadAssets(uuids: string[]): Promise<void> {
        const cc = this._adapter.getCC();
        if (!cc?.assetManager || !cc?.deserialize) return;


        // Filter to only load assets that exist in library
        const validUuids = uuids.filter(uuid => this._libraryUuids.has(uuid));

        // Phase 1: Deserialize all assets (without dep resolution)
        const assetDataMap = new Map<string, { asset: Asset; details: PartialDetails }>();

        for (const uuid of validUuids) {
            try {
                const result = await this.deserializeAssetJson(uuid);
                if (result) {
                    // Use the asset's actual _uuid if available
                    const actualUuid = (result.asset as { _uuid?: string })._uuid || uuid;

                    // Add to assetManager.assets cache with actual UUID
                    cc.assetManager.assets.add(actualUuid, result.asset);
                    assetDataMap.set(actualUuid, result);

                    // Also add with requested UUID if different (for lookups)
                    if (actualUuid !== uuid) {
                        cc.assetManager.assets.add(uuid, result.asset);
                    }
                }
            } catch (error) {
            }
        }


        // Phase 2: Load transitive dependencies
        // Collect all dependencies that need to be loaded
        const pendingDeps = new Set<string>();
        for (const { details } of assetDataMap.values()) {
            if (details.uuidList) {
                for (const depUuid of details.uuidList) {
                    if (depUuid && !cc.assetManager.assets.has(depUuid)) {
                        pendingDeps.add(depUuid);
                    }
                }
            }
        }

        // Iteratively load dependencies until no more are needed
        let iteration = 0;
        const maxIterations = 10;
        while (pendingDeps.size > 0 && iteration < maxIterations) {
            iteration++;

            const depsToLoad = Array.from(pendingDeps);
            pendingDeps.clear();

            for (const depUuid of depsToLoad) {
                if (cc.assetManager.assets.has(depUuid)) continue;

                try {
                    const result = await this.deserializeAssetJson(depUuid);
                    if (result) {
                        // Use the asset's actual _uuid if available
                        const actualUuid = (result.asset as { _uuid?: string })._uuid || depUuid;
                        cc.assetManager.assets.add(actualUuid, result.asset);
                        assetDataMap.set(actualUuid, result);

                        // Also add any new dependencies
                        if (result.details.uuidList) {
                            for (const newDep of result.details.uuidList) {
                                if (newDep && !cc.assetManager.assets.has(newDep)) {
                                    pendingDeps.add(newDep);
                                }
                            }
                        }
                    }
                } catch {
                    // Dependency might not exist in library
                }
            }
        }


        // Phase 2.5: Load native data for ImageAssets
        for (const [uuid, { asset }] of assetDataMap) {
            if (asset?.constructor?.name === 'ImageAsset') {
                try {
                    await this.loadImageAssetNative(uuid, asset);
                } catch {
                    // Native load may fail for some formats
                }
            }
        }

        // Phase 3a: Resolve dependencies for non-SpriteFrame assets first
        const deferredSpriteFrameDeps: Array<{ uuid: string; details: PartialDetails; asset: Asset }> = [];

        for (const [uuid, { asset, details }] of assetDataMap) {
            const typeName = asset?.constructor?.name;

            // Defer SpriteFrame dependency resolution until after Texture2D.onLoaded
            if (typeName === 'SpriteFrame') {
                deferredSpriteFrameDeps.push({ uuid, details, asset });
                continue;
            }

            if (details.uuidList && details.uuidObjList && details.uuidPropList) {
                const uuidList = details.uuidList;
                const objList = details.uuidObjList;
                const propList = details.uuidPropList;

                for (let i = 0; i < uuidList.length; i++) {
                    const depUuid = uuidList[i];
                    const obj = objList[i] as Record<string, unknown>;
                    const prop = propList[i];

                    if (!obj || !prop || !depUuid) continue;

                    const depAsset = cc.assetManager.assets.get(depUuid);
                    if (depAsset) {
                        obj[prop] = depAsset;
                        if (typeof (depAsset as { addRef?: () => void }).addRef === 'function') {
                            (depAsset as { addRef: () => void }).addRef();
                        }
                    }
                }
            }
        }

        // Phase 3b: Call onLoaded for ImageAsset, Texture2D, TextureCube first
        // Pre-load native data for Texture2D mipmaps BEFORE calling onLoaded
        // This is critical because Texture2D._setMipmapParams() uses mipmap.data to upload to GPU
        for (const [, { asset }] of assetDataMap) {
            if (asset?.constructor?.name === 'Texture2D') {
                const tex = asset as unknown as { _mipmaps: { _uuid?: string; data?: unknown; _nativeData?: unknown }[] };
                if (tex._mipmaps) {
                    for (const mipmap of tex._mipmaps) {
                        // Check if mipmap needs native data
                        if (mipmap && mipmap._uuid && !mipmap.data && !mipmap._nativeData) {
                            try {
                                await this.loadImageAssetNative(mipmap._uuid, mipmap as unknown as Asset);
                            } catch {
                                // Mipmap native load may fail for some formats
                            }
                        }
                    }
                }
            }
        }

        // Sort assets by type to ensure correct initialization order
        const assetOrder = ['ImageAsset', 'Texture2D', 'TextureCube'];
        const textureAssets = Array.from(assetDataMap.entries())
            .filter(([, { asset }]) => {
                const typeName = asset?.constructor?.name;
                return typeName && assetOrder.includes(typeName);
            })
            .sort(([, a], [, b]) => {
                const typeA = a.asset?.constructor?.name || 'Unknown';
                const typeB = b.asset?.constructor?.name || 'Unknown';
                return assetOrder.indexOf(typeA) - assetOrder.indexOf(typeB);
            });

        for (const [, { asset }] of textureAssets) {
            if (typeof (asset as { onLoaded?: () => void }).onLoaded === 'function') {
                try {
                    (asset as { onLoaded: () => void }).onLoaded();
                } catch {
                    // Ignore errors during onLoaded
                }
            }
        }


        // Phase 3c: Resolve SpriteFrame dependencies (textures are ready)
        for (const { details, asset } of deferredSpriteFrameDeps) {
            if (details.uuidList && details.uuidObjList && details.uuidPropList) {
                const uuidList = details.uuidList;
                const objList = details.uuidObjList;
                const propList = details.uuidPropList;

                for (let i = 0; i < uuidList.length; i++) {
                    const depUuid = uuidList[i];
                    const obj = objList[i] as Record<string, unknown>;
                    const prop = propList[i];

                    if (!obj || !prop || !depUuid) continue;

                    const depAsset = cc.assetManager.assets.get(depUuid);
                    if (depAsset) {
                        obj[prop] = depAsset;
                        if (typeof (depAsset as { addRef?: () => void }).addRef === 'function') {
                            (depAsset as { addRef: () => void }).addRef();
                        }
                    }
                }
            }

            // Call onLoaded for SpriteFrame
            if (typeof (asset as { onLoaded?: () => void }).onLoaded === 'function') {
                try {
                    (asset as { onLoaded: () => void }).onLoaded();
                } catch {
                    // Ignore errors during onLoaded
                }
            }
        }

        // Phase 3d: Call onLoaded for remaining assets
        const processedTypes = new Set([...assetOrder, 'SpriteFrame']);
        for (const [, { asset }] of assetDataMap) {
            const typeName = asset?.constructor?.name;
            if (typeName && processedTypes.has(typeName)) continue;

            if (typeof (asset as { onLoaded?: () => void }).onLoaded === 'function') {
                try {
                    (asset as { onLoaded: () => void }).onLoaded();
                } catch {
                    // Ignore errors during onLoaded
                }
            }
        }

        // Log loaded asset types
        const typeCounts = new Map<string, number>();
        for (const { asset } of assetDataMap.values()) {
            const typeName = asset?.constructor?.name || 'Unknown';
            typeCounts.set(typeName, (typeCounts.get(typeName) || 0) + 1);
        }
    }

    /**
     * @zh 反序列化单个资源JSON（不解析依赖）
     * @en Deserialize single asset JSON (without dependency resolution)
     *
     * 子资源 UUID 格式：`mainUuid@subId` 或 `mainUuid@subId@nestedId`
     * Sub-asset UUID format: `mainUuid@subId` or `mainUuid@subId@nestedId`
     */
    private async deserializeAssetJson(uuid: string): Promise<{ asset: Asset; details: PartialDetails } | null> {
        const cc = this._adapter.getCC();
        if (!cc?.assetManager || !cc?.deserialize) {
            return null;
        }

        // Check if already in cache
        const cached = cc.assetManager.assets.get(uuid);
        if (cached) {
            return { asset: cached, details: {} as PartialDetails };
        }

        // Determine the JSON file path
        // Sub-asset UUIDs contain @ symbols, but the file might be:
        // 1. library/{prefix}/{fullUuidWithAt}.json (e.g., library/bd/bd1bcaba-bd7d-4a71-b143-997c882383e4@6c48a.json)
        // 2. Or stored differently
        const libraryPath = `${this._projectPath}/library`;

        // Extract the first 2 chars of the base UUID (before any @)
        const baseUuid = uuid.split('@')[0] ?? uuid;
        const prefix = baseUuid.slice(0, 2);

        // Try full UUID first (including @ parts)
        let jsonPath = `${libraryPath}/${prefix}/${uuid}.json`;
        let json: unknown;

        try {
            const content = await invoke<string>('read_file_content', { path: jsonPath });
            json = JSON.parse(content);
        } catch {
            // If full UUID path fails, try base UUID (for assets where sub-assets are embedded)
            if (uuid.includes('@')) {
                jsonPath = `${libraryPath}/${prefix}/${baseUuid}.json`;
                try {
                    const content = await invoke<string>('read_file_content', { path: jsonPath });
                    json = JSON.parse(content);
                } catch {
                    throw new Error(`Failed to read ${uuid} from library`);
                }
            } else {
                throw new Error(`Failed to read ${jsonPath}`);
            }
        }

        // Use cc.deserialize with details to collect dependency info
        const deserializeModule = cc.deserialize as {
            Details?: { pool?: { get?: () => PartialDetails } };
        };
        const detailsPool = deserializeModule.Details?.pool;
        const details = detailsPool?.get?.() || ({} as PartialDetails);

        if (details.init) {
            details.init();
        }

        const asset = cc.deserialize(json, details as DeserializeDetails) as Asset;

        if (asset) {
            // Preserve the asset's _uuid if it already has one (from deserialization)
            // Otherwise use the requested UUID
            const existingUuid = (asset as unknown as { _uuid?: string })._uuid;
            if (!existingUuid) {
                (asset as unknown as { _uuid?: string })._uuid = uuid;
            }
        }

        // Also extract UUID dependencies from content fields (ccesengine uses flat format)
        // e.g., SpriteFrame has { content: { texture: "uuid@subId" } }
        this.extractContentDependencies(json, details, asset);

        return { asset, details };
    }

    /**
     * @zh 从 content 字段提取 UUID 依赖（ccesengine 使用扁平格式）
     * @en Extract UUID dependencies from content fields (ccesengine uses flat format)
     *
     * ccesengine 资源 JSON 格式中，某些引用以字符串形式存储而非 { "__uuid__": "..." }
     * 例如 SpriteFrame: { content: { texture: "uuid@subId" } }
     *
     * In ccesengine asset JSON format, some references are stored as strings instead of { "__uuid__": "..." }
     * For example SpriteFrame: { content: { texture: "uuid@subId" } }
     */
    private extractContentDependencies(json: unknown, details: PartialDetails, asset: Asset): void {
        const jsonObj = json as Record<string, unknown>;

        // Handle SpriteFrame's texture field
        // NOTE: cc.deserialize may already extract _textureSource via SpriteFrame._deserialize()
        // We only add it if not already present to avoid duplicates
        if (jsonObj.__type__ === 'cc.SpriteFrame' && jsonObj.content) {
            const content = jsonObj.content as Record<string, unknown>;
            if (typeof content.texture === 'string' && this.isUuidFormat(content.texture)) {
                // Check if already added by cc.deserialize
                const alreadyAdded = details.uuidPropList?.includes('_textureSource');
                if (!alreadyAdded) {
                    // Add to details.uuidList for dependency resolution
                    if (!details.uuidList) details.uuidList = [];
                    if (!details.uuidObjList) details.uuidObjList = [];
                    if (!details.uuidPropList) details.uuidPropList = [];

                    details.uuidList.push(content.texture);
                    details.uuidObjList.push(asset as unknown as Record<string, unknown>);
                    details.uuidPropList.push('_textureSource');
                }
            }
        }

        // Handle TextureCube's faces (front, back, left, right, top, bottom)
        if (jsonObj.__type__ === 'cc.TextureCube' && jsonObj.content) {
            const content = jsonObj.content as Record<string, unknown>;
            const faces = ['front', 'back', 'left', 'right', 'top', 'bottom'];
            for (const face of faces) {
                if (typeof content[face] === 'string' && this.isUuidFormat(content[face] as string)) {
                    if (!details.uuidList) details.uuidList = [];
                    if (!details.uuidObjList) details.uuidObjList = [];
                    if (!details.uuidPropList) details.uuidPropList = [];

                    details.uuidList.push(content[face] as string);
                    details.uuidObjList.push(asset as unknown as Record<string, unknown>);
                    details.uuidPropList.push(face);
                }
            }
        }

        // NOTE: Texture2D's mipmaps are handled by the standard deserializer via _deserialize()
        // which uses handle.result.push(this._mipmaps, "${i}", mipmapUUID, ...)
        // The deserializer correctly adds entries to uuidList, uuidObjList, and uuidPropList.
        // We must NOT add extra entries to uuidList here, as it would corrupt the parallel arrays!
        //
        // The mipmap UUIDs are already in details.uuidList from the deserializer,
        // so Phase 2 will load them automatically.
    }

    /**
     * @zh 检查字符串是否是 UUID 格式
     * @en Check if string is UUID format
     */
    private isUuidFormat(str: string): boolean {
        // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx or with @suffix
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(@[0-9a-f]+)*$/i.test(str);
    }

    /**
     * @zh 为 ImageAsset 加载原生图片数据
     * @en Load native image data for ImageAsset
     *
     * ImageAsset 的 JSON 只包含元数据，实际图片数据存储在同名的 .png/.jpg 文件中
     * ImageAsset JSON only contains metadata, actual image data is stored in .png/.jpg file with same name
     *
     * 文件命名规则 / File naming convention:
     * - 主资源: {uuid}.png (e.g., bd1bcaba-bd7d-4a71-b143-997c882383e4.png)
     * - 子资源: {uuid}@{subId}.png (e.g., d032ac98@b47c0@e9a6d.png for cubemap faces)
     */
    private async loadImageAssetNative(uuid: string, asset: Asset): Promise<void> {
        const libraryPath = `${this._projectPath}/library`;

        // Use base UUID (first part before @) for the folder prefix
        const baseUuid = uuid.split('@')[0] ?? uuid;
        const prefix = baseUuid.slice(0, 2);

        // Try common image extensions - try to load each directly
        const extensions = ['.png', '.jpg', '.jpeg', '.webp'];

        for (const ext of extensions) {
            const nativePath = `${libraryPath}/${prefix}/${uuid}${ext}`;
            const imageUrl = this.pathToUrl(nativePath);

            try {
                await this.loadImageFromUrl(imageUrl, asset);
                return;
            } catch {
                // Try next extension
            }
        }

        if (uuid.includes('@')) {
            for (const ext of extensions) {
                const nativePath = `${libraryPath}/${prefix}/${baseUuid}${ext}`;
                const imageUrl = this.pathToUrl(nativePath);

                try {
                    await this.loadImageFromUrl(imageUrl, asset);
                    return;
                } catch {
                    // Try next extension
                }
            }
        }
    }

    /**
     * @zh 从 URL 加载图片并设置到 ImageAsset
     * @en Load image from URL and set to ImageAsset
     */
    private loadImageFromUrl(imageUrl: string, asset: Asset): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                try {
                    // Set the native asset using ccesengine's reset API
                    const imageAsset = asset as unknown as {
                        _nativeData: unknown;
                        reset: (data: unknown) => void;
                    };

                    if (typeof imageAsset.reset === 'function') {
                        imageAsset.reset(img);
                    } else {
                        // Fallback: set _nativeData directly (like _nativeAsset setter does)
                        imageAsset._nativeData = img;
                    }

                    resolve();
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error(`Failed to load image: ${imageUrl}`));
            };

            img.src = imageUrl;
        });
    }

    /**
     * @zh 反序列化场景
     * @en Deserialize scene
     */
    private deserializeScene(json: unknown[], sceneUuid?: string): SceneAsset | null {
        const cc = this._adapter.getCC();
        if (!cc?.deserialize) {
            console.error('[EditorBundle] deserialize not available');
            return null;
        }

        try {
            const deserializeModule = cc.deserialize as {
                Details?: { pool?: { get?: () => PartialDetails } };
            };
            const detailsPool = deserializeModule.Details?.pool;
            const details = detailsPool?.get?.();

            if (details?.init) {
                details.init();
            }

            const asset = cc.deserialize(json, details as DeserializeDetails) as SceneAsset;

            if (sceneUuid && asset) {
                (asset as unknown as { _uuid?: string })._uuid = sceneUuid;
            }

            // Resolve dependencies
            if (details && details.uuidList && details.uuidObjList && details.uuidPropList) {
                this.resolveAssetDependencies(details);
            }

            if (details?.reset) {
                details.reset();
            }

            return asset;
        } catch (error) {
            console.error('[EditorBundle] Deserialize failed:', error);
            return null;
        }
    }

    /**
     * @zh 解析资源依赖
     * @en Resolve asset dependencies
     */
    private resolveAssetDependencies(details: {
        uuidObjList?: unknown[];
        uuidPropList?: string[];
        uuidList?: (string | undefined)[];
    }): void {
        const cc = this._adapter.getCC();
        if (!cc?.assetManager?.assets) return;

        const uuidList = details.uuidList || [];
        const objList = details.uuidObjList || [];
        const propList = details.uuidPropList || [];

        for (let i = 0; i < uuidList.length; i++) {
            const uuid = uuidList[i];
            const obj = objList[i] as Record<string, unknown>;
            const prop = propList[i];

            if (!obj || !prop || !uuid) continue;

            const dependAsset = cc.assetManager.assets.get(uuid);
            if (dependAsset) {
                obj[prop] = dependAsset;
                if (typeof (dependAsset as { addRef?: () => void }).addRef === 'function') {
                    (dependAsset as { addRef: () => void }).addRef();
                }
            }
        }
    }

    /**
     * @zh 运行场景
     * @en Run scene
     */
    async runScene(sceneAsset: SceneAsset): Promise<void> {
        const director = this._adapter.director;
        if (!director) {
            throw new Error('[EditorBundle] Director not available');
        }

        const scene = (sceneAsset as unknown as { scene?: Scene }).scene ?? sceneAsset;

        return new Promise((resolve, reject) => {
            try {
                director.runSceneImmediate(
                    scene as Scene | SceneAsset,
                    () => { /* onBeforeLoad */ },
                    () => { resolve(); }
                );
            } catch (error) {
                reject(error);
            }
        });
    }
}

let instance: EditorBundle | null = null;

export function getEditorBundle(): EditorBundle {
    if (!instance) {
        instance = new EditorBundle();
    }
    return instance;
}

// Legacy export for compatibility
export const getEditorAssetConfig = getEditorBundle;

export type { EditorBundle };
