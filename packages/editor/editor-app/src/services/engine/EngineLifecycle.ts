/**
 * @zh 引擎生命周期服务 - 管理引擎初始化和生命周期
 * @en Engine Lifecycle Service - Manages engine initialization and lifecycle
 *
 * Layer 1: 依赖 EngineAdapter，负责引擎启动、关闭和状态管理。
 * Layer 1: Depends on EngineAdapter, responsible for engine startup, shutdown and state management.
 */

import type { Unsubscribe } from './types';
import type { IEngineAdapter } from './EngineAdapter';
import type { renderer } from 'cc';
import { getEngineAdapter } from './EngineAdapter';
import { getEffectCompiler, type CompiledEffect } from '../EffectCompiler';
import { builtinEffects } from '../builtinEffectsData';

/**
 * @zh 引擎状态
 * @en Engine state
 */
export type EngineState =
    | 'uninitialized'
    | 'initializing'
    | 'ready'
    | 'running'
    | 'paused'
    | 'error';

/**
 * @zh 初始化阶段
 * @en Initialization phase
 */
export type InitPhase =
    | 'loading-modules'
    | 'creating-canvas'
    | 'game-init'
    | 'game-run'
    | 'waiting-ready'
    | 'registering-effects'
    | 'creating-materials'
    | 'compiling-materials'
    | 'complete';

/**
 * @zh 初始化配置
 * @en Initialization config
 */
export interface EngineInitConfig {
    canvasId?: string;
    debugMode?: number;
    showFPS?: boolean;
    frameRate?: number;
    engineSourcePath?: string;
}

/**
 * @zh 阶段结果
 * @en Phase result
 */
export interface PhaseResult {
    phase: InitPhase;
    success: boolean;
    durationMs: number;
    error?: string;
}

/**
 * @zh 初始化结果
 * @en Initialization result
 */
export interface InitResult {
    success: boolean;
    error?: string;
    durationMs: number;
    phases: PhaseResult[];
}

/**
 * @zh 引擎生命周期服务接口
 * @en Engine lifecycle service interface
 */
export interface IEngineLifecycle {
    // State
    readonly state: EngineState;
    readonly isInitialized: boolean;
    readonly isRunning: boolean;
    readonly currentPhase: InitPhase | null;

    // Initialization
    init(config?: EngineInitConfig): Promise<InitResult>;
    shutdown(): Promise<void>;

    // Game Loop Control
    play(): void;
    pause(): void;
    resume(): void;
    stop(): void;

    // Canvas
    getCanvas(): HTMLCanvasElement | null;
    getCanvasWrapper(): HTMLDivElement | null;
    attachToContainer(container: HTMLElement): void;
    detachFromContainer(): void;
    resize(width: number, height: number): void;

    // Events
    onStateChange(callback: (state: EngineState) => void): Unsubscribe;
    onInitPhase(callback: (phase: InitPhase) => void): Unsubscribe;
}

const DEFAULT_CONFIG: Required<EngineInitConfig> = {
    canvasId: 'GameCanvas',
    debugMode: 1,
    showFPS: false,
    frameRate: 60,
    engineSourcePath: '',
};

const READY_TIMEOUT_MS = 5000;

/**
 * @zh 引擎生命周期服务实现
 * @en Engine lifecycle service implementation
 */
class EngineLifecycleImpl implements IEngineLifecycle {
    private _state: EngineState = 'uninitialized';
    private _currentPhase: InitPhase | null = null;
    private _canvas: HTMLCanvasElement | null = null;
    private _canvasWrapper: HTMLDivElement | null = null;
    private _adapter: IEngineAdapter;
    private _config: Required<EngineInitConfig> = { ...DEFAULT_CONFIG };
    private _compiledEffects: CompiledEffect[] | null = null;
    private _effectsRegisteredWithPath: string | null = null; // Track if effects were registered with a valid path

    private _stateCallbacks: Array<(state: EngineState) => void> = [];
    private _phaseCallbacks: Array<(phase: InitPhase) => void> = [];

    constructor() {
        this._adapter = getEngineAdapter();
    }

    get state(): EngineState {
        return this._state;
    }

    get isInitialized(): boolean {
        return this._state === 'ready' || this._state === 'running' || this._state === 'paused';
    }

    get isRunning(): boolean {
        return this._state === 'running';
    }

    get currentPhase(): InitPhase | null {
        return this._currentPhase;
    }

    /**
     * @zh 初始化引擎
     * @en Initialize engine
     */
    async init(config?: EngineInitConfig): Promise<InitResult> {
        // If already initialized, check if we need to register effects with new engineSourcePath
        if (this.isInitialized) {
            const newEnginePath = config?.engineSourcePath;
            if (newEnginePath && newEnginePath !== this._effectsRegisteredWithPath) {
                this._config.engineSourcePath = newEnginePath;
                await this.registerEffects();
                await this.createMaterials();
                await this.compileMaterials();
            }
            return {
                success: true,
                durationMs: 0,
                phases: [],
            };
        }

        if (this._state === 'initializing') {
            // Wait for existing initialization to complete instead of failing
            return new Promise((resolve) => {
                const checkState = () => {
                    if (this._state !== 'initializing') {
                        resolve({
                            success: this.isInitialized,
                            durationMs: 0,
                            phases: [],
                        });
                    } else {
                        setTimeout(checkState, 100);
                    }
                };
                checkState();
            });
        }

        this._config = { ...DEFAULT_CONFIG, ...config };
        const startTime = performance.now();
        const phases: PhaseResult[] = [];

        this.setState('initializing');

        try {
            // Phase 1: Create canvas (MUST be before loading modules - ScreenAdapter needs DOM)
            phases.push(await this.runPhase('creating-canvas', () => this.createCanvas()));

            // Phase 2: Load modules (ScreenAdapter requires canvas to exist)
            phases.push(await this.runPhase('loading-modules', () => this.loadModules()));

            // Phase 3: Initialize game
            phases.push(await this.runPhase('game-init', () => this.initGame()));

            // Phase 4: Run game
            phases.push(await this.runPhase('game-run', () => this.runGame()));

            // Phase 5: Wait for ready state (replaces 2-frame delay)
            phases.push(await this.runPhase('waiting-ready', () => this.waitForReadyState()));

            // Phase 6: Register effects
            phases.push(await this.runPhase('registering-effects', () => this.registerEffects()));

            // Phase 7: Create materials
            phases.push(await this.runPhase('creating-materials', () => this.createMaterials()));

            // Phase 8: Compile materials
            phases.push(await this.runPhase('compiling-materials', () => this.compileMaterials()));

            // Resume director after all initialization is complete
            const director = this._adapter.director;
            if (director) {
                director.resume();
            }

            // Complete
            this.setPhase('complete');
            this.setState('ready');

            const totalDuration = performance.now() - startTime;

            return {
                success: true,
                durationMs: totalDuration,
                phases,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('[EngineLifecycle] Initialization failed:', errorMessage);

            this.setState('error');

            return {
                success: false,
                error: errorMessage,
                durationMs: performance.now() - startTime,
                phases,
            };
        }
    }

    /**
     * @zh 关闭引擎
     * @en Shutdown engine
     */
    async shutdown(): Promise<void> {
        if (!this.isInitialized) {
            return;
        }

        this.stop();

        // Remove canvas from DOM
        if (this._canvasWrapper?.parentElement) {
            this._canvasWrapper.parentElement.removeChild(this._canvasWrapper);
        }

        this._canvas = null;
        this._canvasWrapper = null;
        this._compiledEffects = null;

        this.setState('uninitialized');
    }

    play(): void {
        const game = this._adapter.game;
        if (game && this._state === 'ready') {
            game.run();
            this.setState('running');
        }
    }

    pause(): void {
        const game = this._adapter.game;
        if (game && this._state === 'running') {
            game.pause();
            this.setState('paused');
        }
    }

    resume(): void {
        const game = this._adapter.game;
        if (game && this._state === 'paused') {
            game.resume();
            this.setState('running');
        }
    }

    stop(): void {
        const director = this._adapter.director;
        if (director) {
            director.stopAnimation();
        }
        this.setState('ready');
    }

    getCanvas(): HTMLCanvasElement | null {
        return this._canvas;
    }

    getCanvasWrapper(): HTMLDivElement | null {
        return this._canvasWrapper;
    }

    attachToContainer(container: HTMLElement): void {
        if (!this._canvasWrapper) return;

        container.appendChild(this._canvasWrapper);
        this._canvasWrapper.style.visibility = 'visible';
        this._canvasWrapper.style.pointerEvents = 'auto';
    }

    detachFromContainer(): void {
        if (!this._canvasWrapper) return;

        this._canvasWrapper.style.visibility = 'hidden';
        this._canvasWrapper.style.pointerEvents = 'none';
    }

    resize(width: number, height: number): void {
        if (!this._canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const physicalWidth = Math.floor(width * dpr);
        const physicalHeight = Math.floor(height * dpr);

        this._canvas.width = physicalWidth;
        this._canvas.height = physicalHeight;
        this._canvas.style.width = `${width}px`;
        this._canvas.style.height = `${height}px`;

        const director = this._adapter.director;
        director?.root?.resize(physicalWidth, physicalHeight);
    }

    onStateChange(callback: (state: EngineState) => void): Unsubscribe {
        this._stateCallbacks.push(callback);
        return () => {
            const index = this._stateCallbacks.indexOf(callback);
            if (index >= 0) this._stateCallbacks.splice(index, 1);
        };
    }

    onInitPhase(callback: (phase: InitPhase) => void): Unsubscribe {
        this._phaseCallbacks.push(callback);
        return () => {
            const index = this._phaseCallbacks.indexOf(callback);
            if (index >= 0) this._phaseCallbacks.splice(index, 1);
        };
    }

    private async runPhase(phase: InitPhase, fn: () => Promise<void>): Promise<PhaseResult> {
        this.setPhase(phase);
        const start = performance.now();

        try {
            await fn();
            return {
                phase,
                success: true,
                durationMs: performance.now() - start,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                phase,
                success: false,
                durationMs: performance.now() - start,
                error: errorMessage,
            };
        }
    }

    private setState(state: EngineState): void {
        if (this._state !== state) {
            this._state = state;
            for (const cb of this._stateCallbacks) {
                cb(state);
            }
        }
    }

    private setPhase(phase: InitPhase): void {
        this._currentPhase = phase;
        for (const cb of this._phaseCallbacks) {
            cb(phase);
        }
    }

    private async loadModules(): Promise<void> {
        // Note: 'graphics' module is required for cc.Graphics component (used by GizmoRenderService)
        const modules = ['base', 'gfx-webgl2', 'legacy-pipeline', '2d', 'ui', '3d', 'primitive', 'graphics'] as const;
        await this._adapter.loadModules([...modules]);
        this._adapter.exposeGlobal();
    }

    private async createCanvas(): Promise<void> {
        // Create canvas wrapper with ccesengine required structure
        this._canvasWrapper = document.createElement('div');
        this._canvasWrapper.id = 'GameDiv';
        this._canvasWrapper.className = 'engine-canvas-wrapper';
        this._canvasWrapper.style.cssText = 'width: 100%; height: 100%; position: absolute; top: 0; left: 0; visibility: hidden; pointer-events: none;';

        const gameContainer = document.createElement('div');
        gameContainer.id = 'Cocos3dGameContainer';
        gameContainer.style.cssText = 'width: 100%; height: 100%;';

        this._canvas = document.createElement('canvas');
        this._canvas.id = this._config.canvasId;
        this._canvas.style.cssText = 'width: 100%; height: 100%; display: block;';

        gameContainer.appendChild(this._canvas);
        this._canvasWrapper.appendChild(gameContainer);

        // Temporarily attach to body for ccesengine init (hidden)
        document.body.appendChild(this._canvasWrapper);
    }

    private async initGame(): Promise<void> {
        const game = this._adapter.game;
        if (!game) {
            throw new Error('Game not available');
        }

        await game.init({
            debugMode: this._config.debugMode,
            showFPS: this._config.showFPS,
            frameRate: this._config.frameRate,
            overrideSettings: {
                rendering: {
                    renderMode: 2,
                    // Use legacy pipeline (not custom pipeline)
                    customPipeline: false,
                },
            },
        });

        // Update canvas reference from game
        this._canvas = game.canvas || this._canvas;
    }

    private async runGame(): Promise<void> {
        const game = this._adapter.game;
        if (!game) {
            throw new Error('Game not available');
        }

        // Pause the director to prevent rendering before everything is ready
        const cc = this._adapter.getCC();
        const director = cc?.director;
        if (director) {
            director.pause();
        }

        game.run();
    }

    /**
     * @zh 等待引擎就绪状态（替代2帧延迟）
     * @en Wait for engine ready state (replaces 2-frame delay)
     *
     * 检测 director.root 和 pipeline 是否有效。
     * Detects if director.root and pipeline are valid.
     */
    private async waitForReadyState(): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Engine ready timeout'));
            }, READY_TIMEOUT_MS);

            const check = () => {
                const director = this._adapter.director;
                const root = director?.root;

                if (root) {
                    clearTimeout(timeout);
                    resolve();
                } else {
                    requestAnimationFrame(check);
                }
            };

            requestAnimationFrame(check);
        });
    }

    private async registerEffects(): Promise<void> {
        const EffectAsset = this._adapter.EffectAsset;
        if (!EffectAsset) {
            return;
        }

        // Check if effects are already registered (skip only if we've already registered with a valid path)
        const existingEffects = EffectAsset.getAll?.();
        if (existingEffects && Object.keys(existingEffects).length > 0 && this._effectsRegisteredWithPath) {
            return;
        }

        // Try to compile effects from engine source
        let effectsToRegister: Array<{ name: string; techniques: unknown[]; shaders: unknown[] }> = [];

        if (this._config.engineSourcePath) {
            try {
                const compiler = getEffectCompiler();
                compiler.setEnginePath(this._config.engineSourcePath);
                this._compiledEffects = await compiler.compileBuiltinEffects();
                effectsToRegister = this._compiledEffects as unknown as typeof effectsToRegister;
                this._effectsRegisteredWithPath = this._config.engineSourcePath;
            } catch (error) {
                effectsToRegister = builtinEffects as unknown as typeof effectsToRegister;
            }
        } else {
            effectsToRegister = builtinEffects as unknown as typeof effectsToRegister;
        }

        // Register effects
        for (const effectData of effectsToRegister) {
            try {
                const effect = Object.assign(new EffectAsset(), effectData);
                effect.shaders.forEach((shaderInfo: unknown, index: number) => {
                    const sourceData = effectData.shaders[index] as { glsl4?: unknown } | undefined;
                    if (sourceData?.glsl4) {
                        (shaderInfo as Record<string, unknown>)['glsl4'] = sourceData.glsl4;
                    }
                });
                effect.hideInEditor = true;
                effect.onLoaded();
            } catch (e) {
                console.error(`[EngineLifecycle] Failed to register effect ${effectData.name}:`, e);
            }
        }
    }

    private async createMaterials(): Promise<void> {
        const Material = this._adapter.Material;
        const builtinResMgr = this._adapter.builtinResMgr;
        const color = this._adapter.color;

        if (!Material || !builtinResMgr || !color) {
            return;
        }

        const createMaterial = (uuid: string, effectName: string, defines?: renderer.MacroRecord) => {
            try {
                const mtl = new Material();
                mtl._uuid = uuid;
                mtl.initialize({ defines, effectName });
                builtinResMgr.addAsset(uuid, mtl);
                return mtl;
            } catch (e) {
                return null;
            }
        };

        // Create essential built-in materials
        // NOTE: Do NOT set USE_LOCAL in defines - it's only used for local-space rendering
        // When USE_LOCAL=true but useLocalData is null, batcher-2d won't bind CCLocal UBO,
        // causing WebGL error: "unbound uniform buffer"
        const materials: Array<{ uuid: string; effect: string; defines?: renderer.MacroRecord }> = [
            { uuid: 'missing-effect-material', effect: 'builtin-unlit', defines: { USE_COLOR: true } },
            { uuid: 'missing-material', effect: 'builtin-unlit', defines: { USE_COLOR: true } },
            { uuid: 'default-clear-stencil', effect: 'builtin-clear-stencil', defines: { USE_TEXTURE: false } },
            { uuid: 'ui-base-material', effect: 'builtin-sprite', defines: { USE_TEXTURE: false } },
            { uuid: 'ui-sprite-material', effect: 'builtin-sprite', defines: { USE_TEXTURE: true, CC_USE_EMBEDDED_ALPHA: false, IS_GRAY: false } },
            { uuid: 'ui-sprite-gray-material', effect: 'builtin-sprite', defines: { USE_TEXTURE: true, CC_USE_EMBEDDED_ALPHA: false, IS_GRAY: true } },
            { uuid: 'ui-sprite-alpha-sep-material', effect: 'builtin-sprite', defines: { USE_TEXTURE: true, CC_USE_EMBEDDED_ALPHA: true, IS_GRAY: false } },
            { uuid: 'ui-sprite-gray-alpha-sep-material', effect: 'builtin-sprite', defines: { USE_TEXTURE: true, CC_USE_EMBEDDED_ALPHA: true, IS_GRAY: true } },
            { uuid: 'ui-graphics-material', effect: 'builtin-graphics' },
            { uuid: 'ui-alpha-test-material', effect: 'builtin-sprite', defines: { USE_TEXTURE: true, USE_ALPHA_TEST: true, CC_USE_EMBEDDED_ALPHA: false, IS_GRAY: false } },
            { uuid: 'default-sprite-material', effect: 'builtin-sprite', defines: { USE_TEXTURE: true } },
        ];

        for (const mat of materials) {
            createMaterial(mat.uuid, mat.effect, mat.defines);
        }
    }

    private async compileMaterials(): Promise<void> {
        const cc = this._adapter.getCC();
        if (!cc?.builtinResMgr) {
            return;
        }

        const materialUuids = [
            'missing-effect-material',
            'missing-material',
            'default-clear-stencil',
            'ui-base-material',
            'ui-sprite-material',
            'ui-sprite-gray-material',
            'ui-sprite-alpha-sep-material',
            'ui-sprite-gray-alpha-sep-material',
            'ui-graphics-material',
            'ui-alpha-test-material',
            'default-sprite-material',
        ];

        for (const uuid of materialUuids) {
            try {
                const mtl = cc.builtinResMgr.get(uuid) as { passes?: Array<{ tryCompile?: () => void }> } | null;
                if (mtl?.passes?.[0]?.tryCompile) {
                    mtl.passes[0].tryCompile();
                }
            } catch {
                // Compilation may fail for some materials
            }
        }

        // Ensure global descriptor set is updated
        const director = this._adapter.director;
        const root = director?.root;
        const pipeline = root?.pipeline;
        if (pipeline?.descriptorSet) {
            pipeline.descriptorSet.update();
        }
    }
}

let instance: EngineLifecycleImpl | null = null;

/**
 * @zh 获取引擎生命周期服务单例
 * @en Get engine lifecycle service singleton
 */
export function getEngineLifecycle(): IEngineLifecycle {
    if (!instance) {
        instance = new EngineLifecycleImpl();
    }
    return instance;
}

/**
 * @zh 重置引擎生命周期服务（仅用于测试）
 * @en Reset engine lifecycle service (for testing only)
 */
export function resetEngineLifecycle(): void {
    instance = null;
}
