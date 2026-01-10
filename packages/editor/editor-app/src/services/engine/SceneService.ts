/**
 * @zh 场景服务 - 场景加载和管理
 * @en Scene Service - Scene loading and management
 */

import type { SceneNodeInfo, Unsubscribe } from './types';
import type { CCESScene, CCESNode } from './types/ccesengine';
import type { IEngineAdapter } from './EngineAdapter';
import { getEngineAdapter } from './EngineAdapter';
import { getEditorBundle } from './EditorBundle';
import { getCameraService } from './CameraService';

export interface SceneLoadResult {
    success: boolean;
    error?: string;
    scenePath: string;
    loadTimeMs: number;
}

export interface ISceneService {
    loadScene(scenePath: string): Promise<SceneLoadResult>;
    unloadScene(): Promise<void>;
    reloadScene(): Promise<SceneLoadResult>;
    readonly currentScenePath: string | null;
    readonly isLoading: boolean;
    getScene(): CCESScene | null;
    getSceneTree(): SceneNodeInfo[];
    findNodeById(nodeId: string): CCESNode | null;
    findNodeByName(name: string): CCESNode | null;
    setNodeActive(nodeId: string, active: boolean): void;
    onSceneLoaded(callback: (scenePath: string) => void): Unsubscribe;
    onSceneUnloaded(callback: () => void): Unsubscribe;
    onSceneTreeChanged(callback: () => void): Unsubscribe;
}

class SceneServiceImpl implements ISceneService {
    private _adapter: IEngineAdapter;
    private _currentScenePath: string | null = null;
    private _isLoading = false;
    private _loadedCallbacks: Array<(scenePath: string) => void> = [];
    private _unloadedCallbacks: Array<() => void> = [];
    private _treeChangedCallbacks: Array<() => void> = [];

    constructor() {
        this._adapter = getEngineAdapter();
    }

    get currentScenePath(): string | null {
        return this._currentScenePath;
    }

    get isLoading(): boolean {
        return this._isLoading;
    }

    getScene(): CCESScene | null {
        return this._adapter.director?.getScene() as CCESScene | null;
    }

    async loadScene(scenePath: string): Promise<SceneLoadResult> {
        const startTime = performance.now();

        if (this._isLoading) {
            return { success: false, error: 'Already loading a scene', scenePath, loadTimeMs: 0 };
        }

        this._isLoading = true;

        try {
            const projectPath = this.extractProjectPath(scenePath);
            if (!projectPath) {
                return {
                    success: false,
                    error: 'Could not determine project path from scene path',
                    scenePath,
                    loadTimeMs: performance.now() - startTime,
                };
            }

            const editorBundle = getEditorBundle();
            await editorBundle.initialize(projectPath);

            const sceneAsset = await editorBundle.loadScene(scenePath);
            if (!sceneAsset) {
                return {
                    success: false,
                    error: 'Failed to load scene',
                    scenePath,
                    loadTimeMs: performance.now() - startTime,
                };
            }

            await editorBundle.runScene(sceneAsset);

            const cameraService = getCameraService();
            if (!await cameraService.createGizmoCamera()) {
                console.warn('[SceneService] Failed to create gizmo camera');
            }

            this._currentScenePath = scenePath;
            this.notifyLoaded(scenePath);

            return { success: true, scenePath, loadTimeMs: performance.now() - startTime };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('[SceneService] Failed to load scene:', errorMessage);
            return {
                success: false,
                error: errorMessage,
                scenePath,
                loadTimeMs: performance.now() - startTime,
            };
        } finally {
            this._isLoading = false;
        }
    }

    async unloadScene(): Promise<void> {
        if (!this._currentScenePath) return;
        getCameraService().destroyGizmoCamera();
        this._currentScenePath = null;
        this.notifyUnloaded();
    }

    async reloadScene(): Promise<SceneLoadResult> {
        const currentPath = this._currentScenePath;
        if (!currentPath) {
            return { success: false, error: 'No scene loaded', scenePath: '', loadTimeMs: 0 };
        }
        await this.unloadScene();
        return this.loadScene(currentPath);
    }

    getSceneTree(): SceneNodeInfo[] {
        const scene = this.getScene();
        return scene ? this.buildSceneTree(scene.children) : [];
    }

    findNodeById(nodeId: string): CCESNode | null {
        const scene = this.getScene();
        if (!scene) return null;
        return this.findNodeRecursive(scene.children, (node) => (node.uuid ?? node._id) === nodeId);
    }

    findNodeByName(name: string): CCESNode | null {
        const scene = this.getScene();
        if (!scene) return null;
        return this.findNodeRecursive(scene.children, (node) => node.name === name);
    }

    setNodeActive(nodeId: string, active: boolean): void {
        const node = this.findNodeById(nodeId);
        if (node) {
            node.active = active;
            this.notifyTreeChanged();
        }
    }

    onSceneLoaded(callback: (scenePath: string) => void): Unsubscribe {
        this._loadedCallbacks.push(callback);
        return () => {
            const idx = this._loadedCallbacks.indexOf(callback);
            if (idx >= 0) this._loadedCallbacks.splice(idx, 1);
        };
    }

    onSceneUnloaded(callback: () => void): Unsubscribe {
        this._unloadedCallbacks.push(callback);
        return () => {
            const idx = this._unloadedCallbacks.indexOf(callback);
            if (idx >= 0) this._unloadedCallbacks.splice(idx, 1);
        };
    }

    onSceneTreeChanged(callback: () => void): Unsubscribe {
        this._treeChangedCallbacks.push(callback);
        return () => {
            const idx = this._treeChangedCallbacks.indexOf(callback);
            if (idx >= 0) this._treeChangedCallbacks.splice(idx, 1);
        };
    }

    private extractProjectPath(scenePath: string): string | null {
        const assetsIndex = scenePath.indexOf('/assets/');
        const backslashIndex = scenePath.indexOf('\\assets\\');
        const index = assetsIndex !== -1 ? assetsIndex : backslashIndex;
        return index !== -1 ? scenePath.substring(0, index) : null;
    }

    private buildSceneTree(nodes: CCESNode[]): SceneNodeInfo[] {
        return nodes.map((node) => this.nodeToInfo(node));
    }

    private nodeToInfo(node: CCESNode): SceneNodeInfo {
        const components = node._components?.map((comp) => {
            const typeName = comp?.constructor?.name ?? comp?.__classname__ ?? 'Unknown';
            return typeName.replace(/^cc\./, '');
        }) ?? [];

        return {
            id: node.uuid ?? node._id ?? '',
            name: node.name,
            active: node.active,
            children: node.children ? this.buildSceneTree(node.children) : [],
            components,
        };
    }

    private findNodeRecursive(
        nodes: CCESNode[],
        predicate: (node: CCESNode) => boolean
    ): CCESNode | null {
        for (const node of nodes) {
            if (predicate(node)) return node;
            if (node.children) {
                const found = this.findNodeRecursive(node.children, predicate);
                if (found) return found;
            }
        }
        return null;
    }

    private notifyLoaded(scenePath: string): void {
        for (const cb of this._loadedCallbacks) {
            try { cb(scenePath); } catch (e) { console.error('[SceneService] Callback error:', e); }
        }
    }

    private notifyUnloaded(): void {
        for (const cb of this._unloadedCallbacks) {
            try { cb(); } catch (e) { console.error('[SceneService] Callback error:', e); }
        }
    }

    private notifyTreeChanged(): void {
        for (const cb of this._treeChangedCallbacks) {
            try { cb(); } catch (e) { console.error('[SceneService] Callback error:', e); }
        }
    }
}

let instance: SceneServiceImpl | null = null;

export function getSceneService(): ISceneService {
    if (!instance) {
        instance = new SceneServiceImpl();
    }
    return instance;
}
