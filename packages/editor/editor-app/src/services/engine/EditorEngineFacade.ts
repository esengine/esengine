/**
 * @zh 编辑器引擎门面 - 兼容层
 * @en Editor Engine Facade - Compatibility Layer
 *
 * 将新服务架构封装为与旧 EditorEngineManager 兼容的 API。
 * Wraps new service architecture into an API compatible with old EditorEngineManager.
 *
 * 这允许渐进式迁移：
 * 1. 现有消费者可以继续使用 getEditorEngine()
 * 2. 新代码可以直接使用各个服务
 * 3. 逐步将消费者迁移到直接使用服务
 */

import type { ComponentInfo, SceneNodeInfo, TransformInfo, Vec2 } from './types';
import type { IEngineLifecycle, EngineInitConfig, InitResult } from './EngineLifecycle';
import type { ISceneService } from './SceneService';
import type { ISelectionService } from './SelectionService';
import type { ITransformService } from './TransformService';
import type { ICameraService } from './CameraService';
import type { IAssetService } from './AssetService';
import { getEngineLifecycle } from './EngineLifecycle';
import { getSceneService } from './SceneService';
import { getSelectionService } from './SelectionService';
import { getTransformService } from './TransformService';
import { getCameraService } from './CameraService';
import { getAssetService } from './AssetService';

/**
 * @zh 编辑器相机信息
 * @en Editor camera info
 */
export interface EditorCamera {
    x: number;
    y: number;
    zoom: number;
}

/**
 * @zh 编辑器引擎门面接口
 * @en Editor engine facade interface
 */
export interface IEditorEngineFacade {
    // Initialization
    init(config?: EngineInitConfig): Promise<boolean>;
    destroy(): void;

    // Canvas Management
    attachToContainer(container: HTMLElement): void;
    getCanvas(): HTMLCanvasElement | null;
    getCanvasWrapper(): HTMLDivElement | null;
    resize(width: number, height: number): void;

    // View Management
    setActiveView(view: 'scene' | 'game'): void;
    getActiveView(): 'scene' | 'game';

    // Engine Source
    setEngineSourcePath(path: string): void;
    getEngineSourcePath(): string | null;

    // Scene Loading
    loadSceneFromFile(filePath: string): Promise<boolean>;
    getCurrentScenePath(): string | null;

    // Game Loop
    play(): void;
    pause(): void;
    stop(): void;

    // Scene Tree
    getSceneTree(): SceneNodeInfo[];
    findNodeById(nodeId: string): unknown | null;

    // Selection
    selectNode(nodeId: string | null): void;
    getSelectedNodeId(): string | null;
    getSelectedNodeInfo(): { name: string; active: boolean; components: ComponentInfo[] } | null;
    getSelectedNodeTransform(): TransformInfo | null;
    getSelectedNodeComponents(): ComponentInfo[];

    // Transform
    setSelectedNodePosition(x: number, y: number): void;
    setSelectedNodeRotation(degrees: number): void;
    setSelectedNodeScale(sx: number, sy: number): void;

    // Hit Testing
    hitTestNode(screenX: number, screenY: number, viewportWidth: number, viewportHeight: number): string | null;

    // Camera
    getEditorCamera(): EditorCamera;
    setEditorCameraPosition(x: number, y: number): void;
    panEditorCamera(dx: number, dy: number): void;
    zoomEditorCamera(delta: number, centerX?: number, centerY?: number): void;
    resetEditorCamera(): void;
    screenToWorld(screenX: number, screenY: number, viewportWidth: number, viewportHeight: number): Vec2;
    worldToScreen(worldX: number, worldY: number, viewportWidth: number, viewportHeight: number): Vec2;

    // Events
    onSceneLoaded(callback: () => void): void;
    offSceneLoaded(callback: () => void): void;
    onSelectionChanged(callback: (nodeId: string | null) => void): void;
    offSelectionChanged(callback: (nodeId: string | null) => void): void;

    // State
    getIsInitialized(): boolean;
    getIsRunning(): boolean;
}

class EditorEngineFacadeImpl implements IEditorEngineFacade {
    private _lifecycle: IEngineLifecycle;
    private _scene: ISceneService;
    private _selection: ISelectionService;
    private _transform: ITransformService;
    private _camera: ICameraService;
    private _assets: IAssetService;

    private _activeView: 'scene' | 'game' = 'scene';
    private _engineSourcePath: string | null = null;
    private _sceneLoadedCallbacks: Array<() => void> = [];
    private _selectionUnsubscribes: Map<(nodeId: string | null) => void, () => void> = new Map();

    constructor() {
        this._lifecycle = getEngineLifecycle();
        this._scene = getSceneService();
        this._selection = getSelectionService();
        this._transform = getTransformService();
        this._camera = getCameraService();
        this._assets = getAssetService();

        // Forward scene loaded events
        this._scene.onSceneLoaded(() => {
            for (const cb of this._sceneLoadedCallbacks) {
                cb();
            }
        });
    }

    async init(config?: EngineInitConfig): Promise<boolean> {
        if (config?.engineSourcePath) {
            this._engineSourcePath = config.engineSourcePath;
        }
        // Merge stored engineSourcePath into config if not provided
        const mergedConfig: EngineInitConfig = {
            ...config,
            engineSourcePath: config?.engineSourcePath ?? this._engineSourcePath ?? undefined,
        };
        const result = await this._lifecycle.init(mergedConfig);
        return result.success;
    }

    destroy(): void {
        this._lifecycle.shutdown();
    }

    attachToContainer(container: HTMLElement): void {
        this._lifecycle.attachToContainer(container);
    }

    getCanvas(): HTMLCanvasElement | null {
        return this._lifecycle.getCanvas();
    }

    getCanvasWrapper(): HTMLDivElement | null {
        return this._lifecycle.getCanvasWrapper();
    }

    resize(width: number, height: number): void {
        this._lifecycle.resize(width, height);
    }

    setActiveView(view: 'scene' | 'game'): void {
        this._activeView = view;
    }

    getActiveView(): 'scene' | 'game' {
        return this._activeView;
    }

    setEngineSourcePath(path: string): void {
        this._engineSourcePath = path;
    }

    getEngineSourcePath(): string | null {
        return this._engineSourcePath;
    }

    async loadSceneFromFile(filePath: string): Promise<boolean> {
        const result = await this._scene.loadScene(filePath);
        return result.success;
    }

    getCurrentScenePath(): string | null {
        return this._scene.currentScenePath;
    }

    play(): void {
        this._lifecycle.play();
    }

    pause(): void {
        this._lifecycle.pause();
    }

    stop(): void {
        this._lifecycle.stop();
    }

    getSceneTree(): SceneNodeInfo[] {
        return this._scene.getSceneTree();
    }

    findNodeById(nodeId: string): unknown | null {
        return this._scene.findNodeById(nodeId);
    }

    selectNode(nodeId: string | null): void {
        if (nodeId) {
            this._selection.select(nodeId);
        } else {
            this._selection.clearSelection();
        }
    }

    getSelectedNodeId(): string | null {
        return this._selection.primarySelectedId;
    }

    getSelectedNodeInfo(): { name: string; active: boolean; components: ComponentInfo[] } | null {
        const info = this._selection.getSelectedNodeInfo();
        if (!info) return null;
        return {
            name: info.name,
            active: info.active,
            components: info.components,
        };
    }

    getSelectedNodeTransform(): TransformInfo | null {
        const nodeId = this._selection.primarySelectedId;
        if (!nodeId) return null;
        return this._transform.getTransform(nodeId);
    }

    getSelectedNodeComponents(): ComponentInfo[] {
        return this._selection.getSelectedComponents();
    }

    setSelectedNodePosition(x: number, y: number): void {
        const nodeId = this._selection.primarySelectedId;
        if (!nodeId) return;
        this._transform.setPosition(nodeId, { x, y, z: 0 });
    }

    setSelectedNodeRotation(degrees: number): void {
        const nodeId = this._selection.primarySelectedId;
        if (!nodeId) return;
        this._transform.setRotation(nodeId, degrees);
    }

    setSelectedNodeScale(sx: number, sy: number): void {
        const nodeId = this._selection.primarySelectedId;
        if (!nodeId) return;
        this._transform.setScale(nodeId, { x: sx, y: sy, z: 1 });
    }

    hitTestNode(screenX: number, screenY: number, viewportWidth: number, viewportHeight: number): string | null {
        return this._selection.hitTestNode(screenX, screenY, viewportWidth, viewportHeight);
    }

    getEditorCamera(): EditorCamera {
        return {
            x: this._camera.position.x,
            y: this._camera.position.y,
            zoom: this._camera.zoom,
        };
    }

    setEditorCameraPosition(x: number, y: number): void {
        this._camera.setPosition(x, y);
    }

    panEditorCamera(dx: number, dy: number): void {
        this._camera.pan(dx, dy);
    }

    zoomEditorCamera(delta: number, centerX?: number, centerY?: number): void {
        if (centerX !== undefined && centerY !== undefined) {
            this._camera.zoomAt(delta, centerX, centerY);
        } else {
            this._camera.setZoom(this._camera.zoom + delta);
        }
    }

    resetEditorCamera(): void {
        this._camera.reset();
    }

    screenToWorld(screenX: number, screenY: number, viewportWidth: number, viewportHeight: number): Vec2 {
        return this._camera.screenToWorld(screenX, screenY, viewportWidth, viewportHeight);
    }

    worldToScreen(worldX: number, worldY: number, viewportWidth: number, viewportHeight: number): Vec2 {
        return this._camera.worldToScreen(worldX, worldY, viewportWidth, viewportHeight);
    }

    onSceneLoaded(callback: () => void): void {
        this._sceneLoadedCallbacks.push(callback);
    }

    offSceneLoaded(callback: () => void): void {
        const index = this._sceneLoadedCallbacks.indexOf(callback);
        if (index >= 0) this._sceneLoadedCallbacks.splice(index, 1);
    }

    onSelectionChanged(callback: (nodeId: string | null) => void): void {
        const unsubscribe = this._selection.onSelectionChanged((nodeIds) => {
            callback(nodeIds[0] ?? null);
        });
        this._selectionUnsubscribes.set(callback, unsubscribe);
    }

    offSelectionChanged(callback: (nodeId: string | null) => void): void {
        const unsubscribe = this._selectionUnsubscribes.get(callback);
        if (unsubscribe) {
            unsubscribe();
            this._selectionUnsubscribes.delete(callback);
        }
    }

    getIsInitialized(): boolean {
        return this._lifecycle.isInitialized;
    }

    getIsRunning(): boolean {
        return this._lifecycle.isRunning;
    }
}

let instance: EditorEngineFacadeImpl | null = null;

/**
 * @zh 获取编辑器引擎门面
 * @en Get editor engine facade
 *
 * 这是与旧 API 兼容的入口点。新代码应该直接使用各个服务。
 * This is the compatibility entry point with old API. New code should use individual services directly.
 */
export function getEditorEngine(): IEditorEngineFacade {
    if (!instance) {
        instance = new EditorEngineFacadeImpl();
    }
    return instance;
}

/**
 * @zh 重置门面（仅用于测试）
 * @en Reset facade (for testing only)
 */
export function resetEditorEngineFacade(): void {
    instance = null;
}

// Re-export types for compatibility
export type { ComponentInfo, SceneNodeInfo };
