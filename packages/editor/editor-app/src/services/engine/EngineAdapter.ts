/**
 * @zh 引擎适配器 - 封装 ccesengine 底层 API
 * @en Engine Adapter - Encapsulates ccesengine low-level API
 *
 * 使用 PREVIEW 模式的引擎构建，无需任何 Node.js polyfill。
 * Uses PREVIEW mode engine build, no Node.js polyfills required.
 */

import type {
    Game,
    Director,
    AssetManager,
    Node,
    Scene,
    Component,
    Vec3,
    Quat,
    Material,
    EffectAsset,
    Texture2D,
    SpriteFrame,
    Color,
    _decorator,
} from 'cc';

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
 * @zh 反序列化详情
 * @en Deserialize details
 */
export interface DeserializeDetails {
    uuidList: string[];
    uuidObjList: Array<Record<string, unknown>>;
    uuidPropList: string[];
    uuidTypeList?: string[];
    init(): void;
    reset(): void;
    push(obj: Record<string, unknown>, propName: string, uuid: string): void;
    assignAssetsBy?(getter: (uuid: string, options: {
        type: unknown;
        owner: Record<string, unknown>;
        prop: string;
    }) => unknown): void;
}

/**
 * @zh 反序列化函数类型
 * @en Deserialize function type
 */
export interface DeserializeFunction {
    (data: unknown, details?: DeserializeDetails, options?: unknown): unknown;
    reportMissingClass?(id: string): void;
    Details: new () => DeserializeDetails;
}

/**
 * @zh BuiltinResMgr 类型
 * @en BuiltinResMgr type
 */
export interface BuiltinResMgr {
    addAsset(uuid: string, asset: unknown): void;
    get<T>(uuid: string): T | null;
}

/**
 * @zh CC 全局对象类型（运行时暴露）
 * @en CC global object type (exposed at runtime)
 */
export interface CCGlobal {
    game: Game;
    director: Director;
    assetManager: AssetManager;
    builtinResMgr: BuiltinResMgr;
    deserialize: DeserializeFunction;
    Vec3: typeof Vec3;
    Quat: typeof Quat;
    Material: typeof Material;
    EffectAsset: typeof EffectAsset;
    Texture2D: typeof Texture2D;
    SpriteFrame: typeof SpriteFrame;
    color: (hex: string) => Color;
    Color: typeof Color;
    Node: typeof Node;
    Scene: typeof Scene;
    Component: typeof Component;
    Game: typeof Game;
    _decorator: typeof _decorator;
    js: {
        setClassName(name: string, cls: unknown): void;
        getClassName(cls: unknown): string;
        getClassByName(name: string): unknown;
        _setClassId?(id: string, constructor: unknown): void;
        _registeredClassIds?: Record<string, unknown>;
    };
    rendering?: {
        enableEffectImport?: boolean;
    };
}

export interface IEngineAdapter {
    readonly game: Game | null;
    readonly director: Director | null;
    readonly assetManager: AssetManager | null;
    readonly builtinResMgr: BuiltinResMgr | null;
    readonly Vec3: typeof Vec3 | null;
    readonly Quat: typeof Quat | null;
    readonly Material: typeof Material | null;
    readonly EffectAsset: typeof EffectAsset | null;
    readonly Texture2D: typeof Texture2D | null;
    readonly SpriteFrame: typeof SpriteFrame | null;
    readonly color: ((hex: string) => Color) | null;

    loadModules(modules: EngineModule[]): Promise<void>;
    loadModule(module: EngineModule): Promise<void>;
    isModuleLoaded(module: EngineModule): boolean;

    deserialize(data: unknown, details?: DeserializeDetails): unknown;
    createDeserializeDetails(): DeserializeDetails | null;

    getCC(): CCGlobal | null;
    exposeGlobal(): void;

    readonly isLoaded: boolean;
    readonly GameEvents: { EVENT_POST_SUBSYSTEM_INIT: string } | null;
}

class EngineAdapterImpl implements IEngineAdapter {
    private _cc: CCGlobal | null = null;
    private _moduleExports: Record<string, unknown> | null = null;
    private loadedModules: Set<EngineModule> = new Set();
    private moduleLoadPromises: Map<EngineModule, Promise<void>> = new Map();

    get game(): Game | null {
        return this._cc?.game ?? null;
    }

    get director(): Director | null {
        return this._cc?.director ?? null;
    }

    get assetManager(): AssetManager | null {
        return this._cc?.assetManager ?? null;
    }

    get builtinResMgr(): BuiltinResMgr | null {
        return this._cc?.builtinResMgr ?? null;
    }

    get Vec3(): typeof Vec3 | null {
        return this._cc?.Vec3 ?? null;
    }

    get Quat(): typeof Quat | null {
        return this._cc?.Quat ?? null;
    }

    get Material(): typeof Material | null {
        return this._cc?.Material ?? null;
    }

    get EffectAsset(): typeof EffectAsset | null {
        return this._cc?.EffectAsset ?? null;
    }

    get Texture2D(): typeof Texture2D | null {
        return this._cc?.Texture2D ?? null;
    }

    get SpriteFrame(): typeof SpriteFrame | null {
        return this._cc?.SpriteFrame ?? null;
    }

    get color(): ((hex: string) => Color) | null {
        return this._cc?.color ?? null;
    }

    get isLoaded(): boolean {
        return this.loadedModules.has('base');
    }

    async loadModules(modules: EngineModule[]): Promise<void> {
        for (const module of modules) {
            await this.loadModule(module);
        }
    }

    async loadModule(module: EngineModule): Promise<void> {
        if (this.loadedModules.has(module)) {
            return;
        }

        const existingPromise = this.moduleLoadPromises.get(module);
        if (existingPromise) {
            return existingPromise;
        }

        const loadPromise = this.doLoadModule(module);
        this.moduleLoadPromises.set(module, loadPromise);

        try {
            await loadPromise;
            this.loadedModules.add(module);
        } finally {
            this.moduleLoadPromises.delete(module);
        }
    }

    isModuleLoaded(module: EngineModule): boolean {
        return this.loadedModules.has(module);
    }

    private async doLoadModule(module: EngineModule): Promise<void> {
        const modulePath = `/ccesengine/${module}.js`;

        try {
            /* @vite-ignore */
            const imported = await import(modulePath);
            this._moduleExports = imported as Record<string, unknown>;

            if (module === 'base') {
                this.initializeFromBaseModule(imported);
            } else {
                this.mergeModuleExports(imported);
            }

        } catch (error) {
            console.error(`[EngineAdapter] Failed to load module ${module}:`, error);
            throw error;
        }
    }

    /**
     * @zh 将模块导出合并到 cc 对象
     * @en Merge module exports into cc object
     */
    private mergeModuleExports(moduleExports: Record<string, unknown>): void {
        if (!this._cc) return;

        for (const [key, value] of Object.entries(moduleExports)) {
            if (key.startsWith('_') || key === 'default' || key === 'cclegacy') {
                continue;
            }
            if (typeof value === 'function' || (typeof value === 'object' && value !== null)) {
                if (!(key in this._cc)) {
                    (this._cc as unknown as Record<string, unknown>)[key] = value;
                }
            }
        }
    }

    /**
     * @zh 从 base 模块初始化
     * @en Initialize from base module
     */
    private initializeFromBaseModule(baseModule: Record<string, unknown>): void {
        const cclegacy = baseModule.cclegacy as CCGlobal | undefined;

        if (cclegacy) {
            this._cc = cclegacy;

            // Add named exports to cc object
            const namedExports = ['_decorator', 'deserialize', 'Details'] as const;
            for (const name of namedExports) {
                const exportValue = baseModule[name];
                if (exportValue !== undefined) {
                    (this._cc as unknown as Record<string, unknown>)[name] = exportValue;
                }
            }
        }
    }

    deserialize(data: unknown, details?: DeserializeDetails): unknown {
        const deserializeFn = this._cc?.deserialize;
        if (!deserializeFn) {
            throw new Error('[EngineAdapter] Deserialize not available. Load base module first.');
        }
        return deserializeFn(data, details);
    }

    createDeserializeDetails(): DeserializeDetails | null {
        const deserializeFn = this._cc?.deserialize as DeserializeFunction | undefined;
        if (!deserializeFn?.Details) {
            return null;
        }
        return new deserializeFn.Details();
    }

    getCC(): CCGlobal | null {
        return this._cc;
    }

    /**
     * @zh 将 cc 暴露为全局变量
     * @en Expose cc as global variable
     */
    exposeGlobal(): void {
        if (!this._cc) {
            return;
        }

        // Ensure named exports are on cc object
        if (this._moduleExports) {
            const requiredExports = ['_decorator', 'deserialize'] as const;
            for (const name of requiredExports) {
                const exportValue = this._moduleExports[name];
                if (exportValue !== undefined && !(name in this._cc)) {
                    (this._cc as unknown as Record<string, unknown>)[name] = exportValue;
                }
            }
        }

        // Expose to globalThis.cc
        (globalThis as unknown as { cc: CCGlobal }).cc = this._cc;

    }

    get GameEvents(): { EVENT_POST_SUBSYSTEM_INIT: string } | null {
        return this._cc?.Game as { EVENT_POST_SUBSYSTEM_INIT: string } | null;
    }
}

let instance: EngineAdapterImpl | null = null;

export function getEngineAdapter(): IEngineAdapter {
    if (!instance) {
        instance = new EngineAdapterImpl();
    }
    return instance;
}

export function resetEngineAdapter(): void {
    instance = null;
}
