/**
 * @zh ccesengine 类型定义
 * @en ccesengine type definitions
 *
 * 封装所有 ccesengine 相关的类型定义，提供类型安全的接口。
 * Encapsulates all ccesengine-related type definitions for type-safe interfaces.
 */

// Core Types

/**
 * @zh ccesengine Game 实例
 * @en ccesengine Game instance
 */
export interface CCESGame {
    init(options: CCESGameInitOptions): Promise<void>;
    run(): void;
    pause(): void;
    resume(): void;
    end(): void;
    canvas: HTMLCanvasElement | null;
    frame: HTMLElement | null;
    frameRate: number;
    on(event: string, callback: () => void): void;
    once(event: string, callback: () => void): void;
}

export interface CCESGameInitOptions {
    id?: string;
    debugMode?: number;
    showFPS?: boolean;
    frameRate?: number;
    overrideSettings?: {
        rendering?: {
            renderMode?: number;
        };
    };
}

/**
 * @zh ccesengine Director
 * @en ccesengine Director
 */
export interface CCESDirector {
    loadScene(sceneName: string): boolean;
    runScene(scene: unknown): void;
    runSceneImmediate(scene: unknown, onBeforeLoad?: () => void, onLaunched?: () => void): void;
    getScene(): CCESScene | null;
    startAnimation(): void;
    stopAnimation(): void;
    root?: {
        resize(width: number, height: number, windowId?: number): void;
    };
}

/**
 * @zh ccesengine Scene
 * @en ccesengine Scene
 */
export interface CCESScene {
    children: CCESNode[];
    getChildByName(name: string): CCESNode | null;
    _globals?: {
        _skybox?: {
            _enabled: boolean;
        };
    };
}

/**
 * @zh ccesengine Node
 * @en ccesengine Node
 */
export interface CCESNode {
    name: string;
    uuid: string;
    active: boolean;
    position: CCESVec3Value;
    rotation: CCESQuatValue;
    scale: CCESVec3Value;
    children: CCESNode[];
    parent: CCESNode | null;
    // ccesengine Node API
    components: readonly CCESComponent[];
    getComponent<T>(type: string | { new(): T }): T | null;
    getComponents<T>(type?: string | { new(): T }): T[];
    getChildByName(name: string): CCESNode | null;
    setPosition?(position: CCESVec3Value): void;
    setRotation?(x: number, y: number, z: number, w: number): void;
    setScale?(scale: CCESVec3Value): void;
    // Legacy internal properties (fallback)
    _id?: string;
    _components?: CCESComponent[];
}

/**
 * @zh ccesengine Component 基类
 * @en ccesengine Component base
 */
export interface CCESComponent {
    enabled: boolean;
    node: CCESNode;
    name?: string;
    constructor: { name: string };
    // Legacy internal property
    __classname__?: string;
}

// Math Types

export interface CCESVec3Value {
    x: number;
    y: number;
    z: number;
}

export interface CCESQuatValue {
    x: number;
    y: number;
    z: number;
    w: number;
}

export interface CCESVec3Constructor {
    new(x?: number, y?: number, z?: number): CCESVec3Value;
}

export interface CCESQuatConstructor {
    new(x?: number, y?: number, z?: number, w?: number): CCESQuatValue;
    fromEuler(out: CCESQuatValue, x: number, y: number, z: number): CCESQuatValue;
}

// Asset Types

export interface CCESAssetManager {
    assets: CCESAssetCache;
    loadRemote<T>(
        url: string,
        options?: Record<string, unknown> | null,
        onComplete?: (err: Error | null, asset: T) => void
    ): void;
}

export interface CCESAssetCache {
    add(uuid: string, asset: unknown): void;
    get(uuid: string): unknown;
    has?(uuid: string): boolean;
}

export interface CCESBuiltinResMgr {
    addAsset(uuid: string, asset: unknown): void;
    get<T>(uuid: string): T | null;
}

// Material/Effect Types

export interface CCESMaterial {
    _uuid: string;
    initialize(options: CCESMaterialInitOptions): void;
    setProperty(name: string, value: unknown): void;
    passes: CCESPass[];
}

export interface CCESMaterialInitOptions {
    defines?: Record<string, unknown>;
    effectName: string;
}

export interface CCESPass {
    tryCompile(): void;
}

export interface CCESMaterialConstructor {
    new(): CCESMaterial;
}

export interface CCESEffectAsset {
    techniques: unknown[];
    shaders: unknown[];
    combinations: unknown[];
    hideInEditor: boolean;
    name: string;
    onLoaded(): void;
}

export interface CCESEffectAssetConstructor {
    new(): CCESEffectAsset;
    getAll?(): Record<string, CCESEffectAsset>;
}

// Texture Types

export interface CCESTexture2D {
    _uuid: string;
    image: CCESImageAsset | null;
    _minFilter: number;
    _magFilter: number;
    _wrapS: number;
    _wrapT: number;
    reset(info: { width: number; height: number; format?: number }): void;
    uploadData(source: HTMLImageElement | ImageBitmap | HTMLCanvasElement): void;
}

export interface CCESTexture2DConstructor {
    new(): CCESTexture2D;
}

export interface CCESImageAsset {
    _uuid: string;
    _nativeUrl: string;
    _nativeAsset: HTMLImageElement | ImageBitmap;
    width: number;
    height: number;
}

export interface CCESSpriteFrame {
    _uuid: string;
    texture: CCESTexture2D | null;
    rect: { x: number; y: number; width: number; height: number };
    offset: { x: number; y: number };
    originalSize: { width: number; height: number };
    rotated: boolean;
    reset(info: {
        texture?: CCESTexture2D;
        rect?: unknown;
        originalSize?: unknown;
        offset?: unknown;
        isRotate?: boolean;
    }): void;
}

export interface CCESSpriteFrameConstructor {
    new(): CCESSpriteFrame;
}

// Deserialization Types

export interface CCESDeserializeDetails {
    uuidList: string[];
    uuidObjList: Array<{ _uuid?: string }>;
    uuidPropList: string[];
    init(): void;
    reset(): void;
    push(obj: { _uuid?: string }, propName: string, uuid: string): void;
}

export interface CCESDeserialize {
    (data: unknown, details?: CCESDeserializeDetails, options?: CCESDeserializeOptions): unknown;
    reportMissingClass(id: string): void;
    Details: new () => CCESDeserializeDetails;
}

export interface CCESDeserializeOptions {
    createAssetRefs?: boolean;
    customEnv?: unknown;
}

export interface CCESSceneAsset {
    scene: CCESScene;
}

// Color Type

export interface CCESColor {
    (hex: string): unknown;
}

// Module Types

/**
 * @zh 可加载的引擎模块
 * @en Loadable engine modules
 */
export type EngineModule =
    | 'base'
    | 'gfx-webgl2'
    | 'legacy-pipeline'
    | '2d'
    | 'ui'
    | '3d'
    | 'primitive'
    | 'animation'
    | 'physics'
    | 'audio'
    | 'graphics'
    | 'geometry-renderer';

/**
 * @zh cclegacy 全局对象
 * @en cclegacy global object
 */
export interface CCLegacy {
    game: CCESGame;
    director: CCESDirector;
    assetManager: CCESAssetManager;
    deserialize: CCESDeserialize;
    Vec3: CCESVec3Constructor;
    Quat: CCESQuatConstructor;
    Material: CCESMaterialConstructor;
    EffectAsset: CCESEffectAssetConstructor;
    Texture2D: CCESTexture2DConstructor;
    SpriteFrame: CCESSpriteFrameConstructor;
    builtinResMgr: CCESBuiltinResMgr;
    color: CCESColor;
    Game: { EVENT_POST_SUBSYSTEM_INIT: string };
    js: {
        setClassName(name: string, cls: unknown): void;
        getClassName(cls: unknown): string;
    };
    rendering?: {
        enableEffectImport?: boolean;
    };
    Asset?: {
        prototype?: {
            destroy?: () => void;
        };
    };
}

// Base Module Exports

/**
 * @zh base.js 模块导出
 * @en base.js module exports
 */
export interface CCESBaseModule {
    game: CCESGame;
    director: CCESDirector;
    deserialize: CCESDeserialize;
    Vec3: CCESVec3Constructor;
    Quat: CCESQuatConstructor;
    Material: CCESMaterialConstructor;
    EffectAsset: CCESEffectAssetConstructor;
    builtinResMgr: CCESBuiltinResMgr;
    color: CCESColor;
    Game: { EVENT_POST_SUBSYSTEM_INIT: string };
    cclegacy: CCLegacy;
}
