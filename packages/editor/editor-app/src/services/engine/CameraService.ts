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
 * @zh ccesengine 层级常量（必须与引擎定义一致）
 * @en ccesengine layer constants (must match engine definitions)
 *
 * 参考 ccesengine 的 layerList 定义:
 * - GIZMOS: 1 << 21
 * - EDITOR: 1 << 22
 * - UI_2D: 1 << 25
 * - DEFAULT: 1 << 30
 */
const Layers = {
    DEFAULT: 1 << 30,
    UI_2D: 1 << 25,
    GIZMO: 1 << 21, // 必须使用 ccesengine 的 GIZMOS 层
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

/**
 * @zh CCObjectFlags 常量（用于隐藏编辑器节点）
 * @en CCObjectFlags constants (for hiding editor nodes)
 */
const CCObjectFlags = {
    DontSave: 1 << 4,
    HideInHierarchy: 1 << 10,
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
    getGizmoCameraRenderCamera(): unknown | null;
    getGizmoGeometryRenderer(): unknown | null;

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

    // Background camera node (clears screen with editor background color)
    private _backgroundCameraNode: unknown = null;
    private _backgroundCamera: unknown = null;

    // Gizmo camera node and component (only for rendering gizmos)
    private _gizmoCameraNode: unknown = null;
    private _gizmoCamera: unknown = null;
    private _gizmoGeometryRenderer: unknown = null;



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

        // Check if gizmo camera already exists and is still valid
        if (this._gizmoCameraNode) {
            const node = this._gizmoCameraNode as { isValid?: boolean };
            if (node.isValid === false) {
                // Node was destroyed (scene change), clean up references
                this._gizmoCameraNode = null;
                this._gizmoCamera = null;
                this._backgroundCameraNode = null;
                this._backgroundCamera = null;
                this._gizmoGeometryRenderer = null;
            } else {
                this.syncAllCameras();
                return true;
            }
        }

        // Get or create a scene
        let scene = director.getScene?.();
        if (!scene) {
            // Create an empty scene if none exists
            const SceneClass = cc.Scene as { new(name?: string): unknown } | undefined;
            if (SceneClass) {
                scene = new SceneClass('__GizmoScene__') as typeof scene;
                if (scene) {
                    director.runSceneImmediate?.(scene);
                    console.log('[CameraService] Created empty scene for gizmo rendering');
                }
            } else {
                console.warn('[CameraService] Cannot create scene - Scene class not available');
                return false;
            }
        }

        try {
            const NodeClass = cc.Node as { new(name: string): unknown };
            const sceneNode = scene as { addChild?: (child: unknown) => void };

            // === Create background camera (clears screen with editor background) ===
            this._backgroundCameraNode = new NodeClass('__BackgroundCamera__');
            const bgCameraNode = this._backgroundCameraNode as {
                layer?: number;
                hideFlags?: number;
                _objFlags?: number;
                setPosition?: (x: number, y: number, z: number) => void;
                addComponent?: (type: string) => unknown;
            };
            bgCameraNode.layer = Layers.DEFAULT;
            // Hide from hierarchy and don't save
            if (typeof bgCameraNode.hideFlags === 'number') {
                bgCameraNode.hideFlags |= CCObjectFlags.DontSave | CCObjectFlags.HideInHierarchy;
            } else if (typeof bgCameraNode._objFlags === 'number') {
                bgCameraNode._objFlags |= CCObjectFlags.DontSave | CCObjectFlags.HideInHierarchy;
            }
            sceneNode.addChild?.(this._backgroundCameraNode);

            this._backgroundCamera = bgCameraNode.addComponent?.('cc.Camera');
            if (this._backgroundCamera) {
                const bgCamera = this._backgroundCamera as {
                    projection?: number;
                    orthoHeight?: number;
                    near?: number;
                    far?: number;
                    clearFlags?: number;
                    clearColor?: { set?: (r: number, g: number, b: number, a: number) => void };
                    visibility?: number;
                    priority?: number;
                    rect?: { set?: (x: number, y: number, w: number, h: number) => void; x?: number; y?: number; width?: number; height?: number };
                };
                bgCamera.projection = 1;
                bgCamera.orthoHeight = this._viewportHeight / 2;
                bgCamera.near = 0.1;
                bgCamera.far = 2000;
                bgCamera.clearFlags = ClearFlags.SOLID_COLOR;
                if (bgCamera.clearColor?.set) {
                    bgCamera.clearColor.set(30 / 255, 30 / 255, 30 / 255, 1); // #1e1e1e
                }
                bgCamera.visibility = 0; // See nothing - just clears the screen
                bgCamera.priority = -2000; // Render FIRST (lowest priority)

                // Set viewport rect to full screen (normalized 0-1)
                if (bgCamera.rect?.set) {
                    bgCamera.rect.set(0, 0, 1, 1);
                } else if (bgCamera.rect) {
                    bgCamera.rect.x = 0;
                    bgCamera.rect.y = 0;
                    bgCamera.rect.width = 1;
                    bgCamera.rect.height = 1;
                }

                bgCameraNode.setPosition?.(0, 0, 1000);
            }

            // === Create gizmo camera (renders gizmos on top) ===
            this._gizmoCameraNode = new NodeClass('__GizmoCamera__');
            const cameraNode = this._gizmoCameraNode as {
                layer?: number;
                hideFlags?: number;
                _objFlags?: number;
                setPosition?: (x: number, y: number, z: number) => void;
                addComponent?: (type: string) => unknown;
            };
            cameraNode.layer = Layers.DEFAULT;
            // Hide from hierarchy and don't save
            if (typeof cameraNode.hideFlags === 'number') {
                cameraNode.hideFlags |= CCObjectFlags.DontSave | CCObjectFlags.HideInHierarchy;
            } else if (typeof cameraNode._objFlags === 'number') {
                cameraNode._objFlags |= CCObjectFlags.DontSave | CCObjectFlags.HideInHierarchy;
            }
            sceneNode.addChild?.(this._gizmoCameraNode);

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
                clearColor?: { set?: (r: number, g: number, b: number, a: number) => void };
                visibility?: number;
                priority?: number;
                rect?: { set?: (x: number, y: number, w: number, h: number) => void; x?: number; y?: number; width?: number; height?: number };
            };

            // Orthographic projection
            camera.projection = 1;
            camera.orthoHeight = this._viewportHeight / 2;
            camera.near = 0.1;
            camera.far = 2000;

            // Use DEPTH_ONLY to overlay on top of scene rendering
            // The scene camera clears and renders first, then gizmo camera overlays
            camera.clearFlags = ClearFlags.DEPTH_ONLY;

            // Only see GIZMO layer
            camera.visibility = Layers.GIZMO;

            // Highest priority - render LAST to overlay on everything including UI
            // UI Canvas in OVERLAY mode uses priority = 1 << 30, so we use higher
            camera.priority = (1 << 30) + 10000;

            // Set viewport rect to full screen (normalized 0-1)
            if (camera.rect?.set) {
                camera.rect.set(0, 0, 1, 1);
            } else if (camera.rect) {
                camera.rect.x = 0;
                camera.rect.y = 0;
                camera.rect.width = 1;
                camera.rect.height = 1;
            }

            // Set initial position
            cameraNode.setPosition?.(0, 0, 1000);

            // Initialize GeometryRenderer for gizmo drawing
            await this.initGizmoGeometryRenderer();

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
        // Destroy geometry renderer
        if (this._gizmoGeometryRenderer) {
            const gr = this._gizmoGeometryRenderer as { destroy?: () => void };
            gr.destroy?.();
            this._gizmoGeometryRenderer = null;
        }

        // Destroy gizmo camera
        if (this._gizmoCameraNode) {
            const node = this._gizmoCameraNode as { destroy?: () => void };
            node.destroy?.();
            this._gizmoCameraNode = null;
            this._gizmoCamera = null;
        }

        // Destroy background camera
        if (this._backgroundCameraNode) {
            const node = this._backgroundCameraNode as { destroy?: () => void };
            node.destroy?.();
            this._backgroundCameraNode = null;
            this._backgroundCamera = null;
        }
    }

    /**
     * @zh 获取 Gizmo 相机的内部渲染相机
     * @en Get the internal render camera of the Gizmo camera
     *
     * 用于 GizmoRenderService 获取 geometryRenderer。
     * Used by GizmoRenderService to get geometryRenderer.
     */
    getGizmoCameraRenderCamera(): unknown | null {
        if (!this._gizmoCamera) return null;
        const cameraComp = this._gizmoCamera as { camera?: unknown };
        return cameraComp.camera ?? null;
    }

    /**
     * @zh 获取 Gizmo GeometryRenderer
     * @en Get Gizmo GeometryRenderer
     */
    getGizmoGeometryRenderer(): unknown | null {
        return this._gizmoGeometryRenderer;
    }

    /**
     * @zh 初始化 Gizmo GeometryRenderer
     * @en Initialize Gizmo GeometryRenderer
     *
     * 使用相机组件自带的 initGeometryRenderer() 方法，
     * 这样可以确保 PipelineSceneData 中的材质和着色器正确初始化。
     *
     * Uses the camera component's built-in initGeometryRenderer() method,
     * which ensures PipelineSceneData materials and shaders are properly initialized.
     */
    private async initGizmoGeometryRenderer(): Promise<void> {
        // Wait for the render camera to be available
        await this.waitForRenderCamera();

        // Get the camera component and call its initGeometryRenderer method
        const cameraComp = this._gizmoCamera as {
            camera?: {
                initGeometryRenderer?: () => void;
                geometryRenderer?: unknown;
            };
        } | null;

        if (cameraComp?.camera?.initGeometryRenderer) {
            // Use the camera's built-in method to properly initialize GeometryRenderer
            // This ensures the geometry-renderer effect and materials are loaded
            cameraComp.camera.initGeometryRenderer();
            this._gizmoGeometryRenderer = cameraComp.camera.geometryRenderer ?? null;

            if (this._gizmoGeometryRenderer) {
                console.log('[CameraService] GeometryRenderer initialized via camera.initGeometryRenderer()');
            } else {
                console.warn('[CameraService] GeometryRenderer not available after initGeometryRenderer()');
            }
        } else {
            console.warn('[CameraService] camera.initGeometryRenderer not available');
        }
    }

    /**
     * @zh 等待渲染相机可用
     * @en Wait for render camera to be available
     */
    private waitForRenderCamera(): Promise<void> {
        return new Promise((resolve) => {
            const maxAttempts = 30;
            let attempts = 0;

            const check = () => {
                const renderCamera = this.getGizmoCameraRenderCamera();
                if (renderCamera || attempts >= maxAttempts) {
                    resolve();
                    return;
                }
                attempts++;
                requestAnimationFrame(check);
            };

            check();
        });
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
     * @zh 同步 Gizmo 相机和 Background 相机
     * @en Sync Gizmo camera and Background camera
     */
    private syncGizmoCamera(): void {
        const cameraX = -this._state.x;
        const cameraY = -this._state.y;

        // Calculate orthoHeight: viewport height / 2 / zoom
        // This gives us the vertical half-extent of the visible world in world units
        const orthoHeight = this._viewportHeight / 2 / this._state.zoom;

        // Sync background camera
        if (this._backgroundCameraNode && this._backgroundCamera) {
            const bgNode = this._backgroundCameraNode as {
                position?: { x: number; y: number; z: number };
                setPosition?: (x: number, y: number, z: number) => void;
            };
            const bgCamera = this._backgroundCamera as { orthoHeight?: number };

            const bgZ = bgNode.position?.z ?? 1000;
            if (bgNode.setPosition) {
                bgNode.setPosition(cameraX, cameraY, bgZ);
            }
            if (typeof bgCamera.orthoHeight === 'number') {
                bgCamera.orthoHeight = orthoHeight;
            }
        }

        // Sync gizmo camera
        if (this._gizmoCameraNode && this._gizmoCamera) {
            const node = this._gizmoCameraNode as {
                position?: { x: number; y: number; z: number };
                setPosition?: (x: number, y: number, z: number) => void;
            };
            const camera = this._gizmoCamera as { orthoHeight?: number };

            const cameraZ = node.position?.z ?? 1000;
            if (node.setPosition) {
                node.setPosition(cameraX, cameraY, cameraZ);
            } else if (node.position) {
                node.position.x = cameraX;
                node.position.y = cameraY;
            }
            if (typeof camera.orthoHeight === 'number') {
                camera.orthoHeight = orthoHeight;
            }
        }
    }

    /**
     * @zh 查找用户场景中主相机的原始 orthoHeight
     * @en Find the original orthoHeight of the main camera in user scene
     *
     * 这个值反映了 Canvas 适配后相机的实际可见范围。
     * This value reflects the camera's actual visible range after Canvas adaptation.
     */
    private findMainCameraOrthoHeight(): number | null {
        const adapter = getEngineAdapter();
        const director = adapter.director;
        if (!director) return null;

        const scene = director.getScene?.();
        if (!scene) return null;

        // Find the first non-editor camera in the scene
        const findCamera = (nodes: unknown[]): number | null => {
            for (const node of nodes) {
                const n = node as {
                    name?: string;
                    getComponent?: (type: string) => unknown;
                    children?: unknown[];
                };

                // Skip editor nodes
                if (n.name?.startsWith('__')) continue;

                if (n.getComponent) {
                    const camera = n.getComponent('cc.Camera') || n.getComponent('Camera');
                    if (camera) {
                        const cam = camera as { orthoHeight?: number; projection?: number };
                        // Only consider orthographic cameras (projection === 1)
                        if (cam.projection === 1 && typeof cam.orthoHeight === 'number') {
                            return cam.orthoHeight;
                        }
                    }
                }

                if (n.children && n.children.length > 0) {
                    const found = findCamera(n.children);
                    if (found !== null) return found;
                }
            }
            return null;
        };

        const sceneTyped = scene as { children?: unknown[] };
        if (sceneTyped.children) {
            return findCamera(sceneTyped.children);
        }

        return null;
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
