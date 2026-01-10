/**
 * @zh 相机服务 - 编辑器相机控制
 * @en Camera Service - Editor camera control
 *
 * Scene 模式下的相机策略：
 * 1. 用户相机正常渲染场景内容
 * 2. 编辑器创建一个 Gizmo 相机（高 priority）
 * 3. Gizmo 相机只渲染 Gizmo 层，使用 DEPTH_ONLY clearFlags 叠加渲染
 * 4. 编辑器控制用户相机的位置和缩放来实现视口控制
 *
 * Camera strategy in Scene mode:
 * 1. User cameras render scene content normally
 * 2. Editor creates a Gizmo camera (high priority)
 * 3. Gizmo camera only renders Gizmo layer, uses DEPTH_ONLY clearFlags for overlay
 * 4. Editor controls user camera position and zoom for viewport control
 */

import type { Vec2, Rect, EditorCameraState, Unsubscribe } from './types';
import { getEngineAdapter } from './EngineAdapter';



/**
 * @zh ccesengine 层级常量
 * @en ccesengine layer constants
 */
const Layers = {
    DEFAULT: 1 << 30,
    UI_2D: 1 << 25,
    // Gizmo 使用单独的层，只有 Gizmo 相机能看到
    GIZMO: 1 << 22, // 使用一个未使用的层
};

/**
 * @zh ClearFlag 常量
 * @en ClearFlag constants
 */
const ClearFlags = {
    SOLID_COLOR: 7,      // 清除所有（颜色+深度+模板）
    DEPTH_ONLY: 6,       // 只清除深度和模板
    DONT_CLEAR: 0,       // 不清除
};



export interface ICameraService {
    // Camera State
    readonly position: Vec2;
    readonly zoom: number;
    readonly state: EditorCameraState;

    // Camera Control
    setPosition(x: number, y: number): void;
    pan(deltaX: number, deltaY: number): void;
    setZoom(zoom: number): void;
    zoomAt(delta: number, centerX: number, centerY: number): void;
    reset(): void;

    // Editor Camera Management
    createGizmoCamera(): Promise<boolean>;
    destroyGizmoCamera(): void;

    // Coordinate Conversion
    screenToWorld(screenX: number, screenY: number, viewportWidth: number, viewportHeight: number): Vec2;
    worldToScreen(worldX: number, worldY: number, viewportWidth: number, viewportHeight: number): Vec2;

    // Viewport
    setViewportSize(width: number, height: number): void;
    getViewportSize(): { width: number; height: number };
    getVisibleWorldBounds(viewportWidth: number, viewportHeight: number): Rect;

    // Events
    onCameraChanged(callback: () => void): Unsubscribe;
}



const DEFAULT_CAMERA_STATE: EditorCameraState = {
    x: 0,
    y: 0,
    zoom: 1,
};

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;



class CameraServiceImpl implements ICameraService {
    private _state: EditorCameraState = { ...DEFAULT_CAMERA_STATE };
    private _viewportWidth = 800;
    private _viewportHeight = 600;
    private _changeCallbacks: Array<() => void> = [];

    // Gizmo camera node and component (only for rendering gizmos)
    private _gizmoCameraNode: unknown = null;
    private _gizmoCamera: unknown = null;



    get position(): Vec2 {
        return { x: this._state.x, y: this._state.y };
    }

    get zoom(): number {
        return this._state.zoom;
    }

    get state(): EditorCameraState {
        return { ...this._state };
    }



    setPosition(x: number, y: number): void {
        if (this._state.x !== x || this._state.y !== y) {
            this._state.x = x;
            this._state.y = y;
            this.syncAllCameras();
            this.notifyChange();
        }
    }

    pan(deltaX: number, deltaY: number): void {
        this._state.x += deltaX / this._state.zoom;
        this._state.y -= deltaY / this._state.zoom;
        this.syncAllCameras();
        this.notifyChange();
    }

    setZoom(zoom: number): void {
        const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
        if (this._state.zoom !== clampedZoom) {
            this._state.zoom = clampedZoom;
            this.syncAllCameras();
            this.notifyChange();
        }
    }

    zoomAt(delta: number, centerX: number, centerY: number): void {
        const oldZoom = this._state.zoom;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, oldZoom * (1 + delta)));

        if (newZoom !== oldZoom) {
            const zoomRatio = newZoom / oldZoom;
            this._state.x = centerX - (centerX - this._state.x) * zoomRatio;
            this._state.y = centerY - (centerY - this._state.y) * zoomRatio;
            this._state.zoom = newZoom;
            this.syncAllCameras();
            this.notifyChange();
        }
    }

    reset(): void {
        this._state = { ...DEFAULT_CAMERA_STATE };
        this.syncAllCameras();
        this.notifyChange();
    }



    /**
     * @zh 创建 Gizmo 专用相机
     * @en Create Gizmo-only camera
     *
     * 这个相机只渲染 Gizmo 层，使用高 priority 和 DEPTH_ONLY clearFlags
     * 叠加在用户相机渲染结果之上。
     *
     * This camera only renders the Gizmo layer, using high priority and
     * DEPTH_ONLY clearFlags to overlay on top of user camera rendering.
     */
    async createGizmoCamera(): Promise<boolean> {
        const adapter = getEngineAdapter();
        const director = adapter.director;
        const cc = adapter.getCC();

        if (!director || !cc) {
            return false;
        }

        const scene = director.getScene?.();
        if (!scene) {
            return false;
        }

        // Check if gizmo camera already exists
        if (this._gizmoCameraNode) {
            this.syncAllCameras();
            return true;
        }

        try {
            // Create gizmo camera node
            const NodeClass = cc.Node as { new(name: string): unknown };
            this._gizmoCameraNode = new NodeClass('__GizmoCamera__');

            const cameraNode = this._gizmoCameraNode as {
                layer?: number;
                setPosition?: (x: number, y: number, z: number) => void;
                addComponent?: (type: string) => unknown;
            };

            // Set layer
            cameraNode.layer = Layers.DEFAULT;

            // Add to scene
            const sceneNode = scene as { addChild?: (child: unknown) => void };
            sceneNode.addChild?.(this._gizmoCameraNode);

            // Add Camera component
            this._gizmoCamera = cameraNode.addComponent?.('cc.Camera');

            if (!this._gizmoCamera) {
                console.error('[CameraService] Failed to add Camera component');
                this.destroyGizmoCamera();
                return false;
            }

            // Configure gizmo camera
            const camera = this._gizmoCamera as {
                projection?: number;
                orthoHeight?: number;
                near?: number;
                far?: number;
                clearFlags?: number;
                clearColor?: unknown;
                visibility?: number;
                priority?: number;
            };

            // Orthographic projection
            camera.projection = 1;
            camera.orthoHeight = this._viewportHeight / 2;
            camera.near = 0.1;
            camera.far = 2000;

            // DEPTH_ONLY - don't clear color buffer, overlay on user camera
            camera.clearFlags = ClearFlags.DEPTH_ONLY;

            // Only see GIZMO layer
            camera.visibility = Layers.GIZMO;

            // High priority - render after all user cameras
            camera.priority = 1000;

            // Set initial position
            cameraNode.setPosition?.(0, 0, 1000);

            // Sync with current state
            this.syncAllCameras();

            return true;
        } catch (error) {
            console.error('[CameraService] Failed to create gizmo camera:', error);
            this.destroyGizmoCamera();
            return false;
        }
    }

    /**
     * @zh 销毁 Gizmo 相机
     * @en Destroy Gizmo camera
     */
    destroyGizmoCamera(): void {
        if (this._gizmoCameraNode) {
            const node = this._gizmoCameraNode as { destroy?: () => void };
            node.destroy?.();
            this._gizmoCameraNode = null;
            this._gizmoCamera = null;
        }
    }



    screenToWorld(screenX: number, screenY: number, viewportWidth: number, viewportHeight: number): Vec2 {
        const worldX = (screenX - viewportWidth / 2) / this._state.zoom - this._state.x;
        const worldY = -(screenY - viewportHeight / 2) / this._state.zoom - this._state.y;
        return { x: worldX, y: worldY };
    }

    worldToScreen(worldX: number, worldY: number, viewportWidth: number, viewportHeight: number): Vec2 {
        const screenX = viewportWidth / 2 + (worldX + this._state.x) * this._state.zoom;
        const screenY = viewportHeight / 2 - (worldY + this._state.y) * this._state.zoom;
        return { x: screenX, y: screenY };
    }



    setViewportSize(width: number, height: number): void {
        this._viewportWidth = width;
        this._viewportHeight = height;
        this.syncAllCameras();
    }

    getViewportSize(): { width: number; height: number } {
        return {
            width: this._viewportWidth,
            height: this._viewportHeight,
        };
    }

    getVisibleWorldBounds(viewportWidth: number, viewportHeight: number): Rect {
        const topLeft = this.screenToWorld(0, 0, viewportWidth, viewportHeight);
        const bottomRight = this.screenToWorld(viewportWidth, viewportHeight, viewportWidth, viewportHeight);

        return {
            x: topLeft.x,
            y: bottomRight.y,
            width: bottomRight.x - topLeft.x,
            height: topLeft.y - bottomRight.y,
        };
    }



    onCameraChanged(callback: () => void): Unsubscribe {
        this._changeCallbacks.push(callback);
        return () => {
            const index = this._changeCallbacks.indexOf(callback);
            if (index >= 0) {
                this._changeCallbacks.splice(index, 1);
            }
        };
    }

    private notifyChange(): void {
        for (const callback of this._changeCallbacks) {
            callback();
        }
    }



    /**
     * @zh 同步所有相机（用户相机 + Gizmo 相机）
     * @en Sync all cameras (user cameras + Gizmo camera)
     */
    private syncAllCameras(): void {
        // Sync user cameras in scene
        this.syncUserCameras();

        // Sync gizmo camera
        this.syncGizmoCamera();
    }

    /**
     * @zh 同步用户场景中的相机
     * @en Sync user cameras in scene
     *
     * 控制用户相机的位置和缩放来实现编辑器视口控制。
     * Controls user camera position and zoom for editor viewport control.
     */
    private syncUserCameras(): void {
        const adapter = getEngineAdapter();
        const director = adapter.director;
        if (!director) return;

        const scene = director.getScene?.();
        if (!scene) return;

        const cameraX = -this._state.x;
        const cameraY = -this._state.y;

        const findAndSyncCameras = (nodes: unknown[]): void => {
            for (const node of nodes) {
                const n = node as {
                    name?: string;
                    getComponent?: (type: string) => unknown;
                    children?: unknown[];
                    position?: { x: number; y: number; z: number };
                    setPosition?: (x: number, y: number, z: number) => void;
                };

                // Skip editor nodes
                if (n.name?.startsWith('__')) continue;

                if (n.getComponent) {
                    const camera = n.getComponent('cc.Camera') || n.getComponent('Camera');
                    if (camera) {
                        const cam = camera as { orthoHeight?: number };
                        const cameraZ = n.position?.z ?? 1000;

                        // Update position
                        if (n.setPosition) {
                            n.setPosition(cameraX, cameraY, cameraZ);
                        } else if (n.position) {
                            n.position.x = cameraX;
                            n.position.y = cameraY;
                        }

                        // Update ortho height for zoom
                        if (typeof cam.orthoHeight === 'number') {
                            const baseHeight = this._viewportHeight / 2;
                            cam.orthoHeight = baseHeight / this._state.zoom;
                        }
                    }
                }

                if (n.children && n.children.length > 0) {
                    findAndSyncCameras(n.children);
                }
            }
        };

        const sceneTyped = scene as { children?: unknown[] };
        if (sceneTyped.children) {
            findAndSyncCameras(sceneTyped.children);
        }
    }

    /**
     * @zh 同步 Gizmo 相机
     * @en Sync Gizmo camera
     */
    private syncGizmoCamera(): void {
        if (!this._gizmoCameraNode || !this._gizmoCamera) return;

        const node = this._gizmoCameraNode as {
            position?: { x: number; y: number; z: number };
            setPosition?: (x: number, y: number, z: number) => void;
        };

        const camera = this._gizmoCamera as {
            orthoHeight?: number;
        };

        // Update position (same as user cameras)
        const cameraX = -this._state.x;
        const cameraY = -this._state.y;
        const cameraZ = node.position?.z ?? 1000;

        if (node.setPosition) {
            node.setPosition(cameraX, cameraY, cameraZ);
        } else if (node.position) {
            node.position.x = cameraX;
            node.position.y = cameraY;
        }

        // Update ortho height for zoom
        if (typeof camera.orthoHeight === 'number') {
            const baseHeight = this._viewportHeight / 2;
            camera.orthoHeight = baseHeight / this._state.zoom;
        }
    }
}



let instance: CameraServiceImpl | null = null;

export function getCameraService(): ICameraService {
    if (!instance) {
        instance = new CameraServiceImpl();
    }
    return instance;
}

export function resetCameraService(): void {
    if (instance) {
        instance.destroyGizmoCamera();
    }
    instance = null;
}

// Export layer constants for GizmoRenderService
export { Layers };
