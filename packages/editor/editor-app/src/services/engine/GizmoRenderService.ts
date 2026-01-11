/**
 * @zh Gizmo 渲染服务 - 使用 GeometryRenderer 绘制编辑器 Gizmo
 * @en Gizmo Render Service - Draw editor gizmos using GeometryRenderer
 *
 * 使用 ccesengine 内置的 GeometryRenderer 进行高效的几何绘制。
 * 支持 2D 和 3D 场景，无需 Canvas/RenderRoot2D 依赖。
 *
 * Uses ccesengine's built-in GeometryRenderer for efficient geometry drawing.
 * Supports both 2D and 3D scenes without Canvas/RenderRoot2D dependencies.
 */

import { getEngineAdapter } from './EngineAdapter';
import { getCameraService } from './CameraService';
import { getSelectionService } from './SelectionService';
import { getTransformService } from './TransformService';
import { GIZMO_SIZE, GIZMO_COLORS, DEFAULT_OBJECT } from './GizmoConstants';

/**
 * @zh DirectorEvent 常量（与渲染循环同步）
 * @en DirectorEvent constants (sync with render loop)
 */
const DirectorEvent = {
    BEFORE_DRAW: 'director_before_draw',
};

export type TransformTool = 'select' | 'move' | 'rotate' | 'scale';

interface GizmoConfig {
    showGrid: boolean;
    activeTool: TransformTool;
    gridSize: number;
}

/**
 * @zh Vec3 类型接口
 * @en Vec3 type interface
 */
interface Vec3Like {
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): Vec3Like;
}

/**
 * @zh Color 类型接口
 * @en Color type interface
 */
interface ColorLike {
    r: number;
    g: number;
    b: number;
    a: number;
    set(r: number, g: number, b: number, a?: number): ColorLike;
}

/**
 * @zh GeometryRenderer 接口
 * @en GeometryRenderer interface
 */
interface IGeometryRenderer {
    activate(device: unknown, info?: { maxLines?: number; maxDashedLines?: number; maxTriangles?: number }): void;
    destroy(): void;
    update(): void;
    reset(): void;
    empty(): boolean;

    addLine(v0: Vec3Like, v1: Vec3Like, color: ColorLike, depthTest?: boolean): void;
    addDashedLine(v0: Vec3Like, v1: Vec3Like, color: ColorLike, depthTest?: boolean): void;
    addTriangle(v0: Vec3Like, v1: Vec3Like, v2: Vec3Like, color: ColorLike, wireframe?: boolean, depthTest?: boolean, unlit?: boolean): void;
    addQuad(v0: Vec3Like, v1: Vec3Like, v2: Vec3Like, v3: Vec3Like, color: ColorLike, wireframe?: boolean, depthTest?: boolean, unlit?: boolean): void;
    addCircle(center: Vec3Like, radius: number, color: ColorLike, segments?: number, depthTest?: boolean, useTransform?: boolean, transform?: unknown): void;
    addArc(center: Vec3Like, radius: number, color: ColorLike, startAngle: number, endAngle: number, segments?: number, depthTest?: boolean, useTransform?: boolean, transform?: unknown): void;
    addDisc(center: Vec3Like, radius: number, color: ColorLike, segments?: number, wireframe?: boolean, depthTest?: boolean, unlit?: boolean, useTransform?: boolean, transform?: unknown): void;
    addCross(position: Vec3Like, size: number, color: ColorLike, depthTest?: boolean): void;
    addPolygon(center: Vec3Like, radius: number, color: ColorLike, segments?: number, wireframe?: boolean, depthTest?: boolean, unlit?: boolean, useTransform?: boolean, transform?: unknown): void;
}

export interface IGizmoRenderService {
    initialize(): Promise<boolean>;
    dispose(): void;

    setShowGrid(show: boolean): void;
    setActiveTool(tool: TransformTool): void;

    update(): void;

    readonly isInitialized: boolean;
}


class GizmoRenderServiceImpl implements IGizmoRenderService {
    private _isInitialized = false;
    private _geometryRenderer: IGeometryRenderer | null = null;
    private _config: GizmoConfig = {
        showGrid: true,
        activeTool: 'select',
        gridSize: 50,
    };

    private _boundUpdate: (() => void) | null = null;

    // Cached Vec3 and Color objects for performance
    private _v0: Vec3Like | null = null;
    private _v1: Vec3Like | null = null;
    private _v2: Vec3Like | null = null;
    private _v3: Vec3Like | null = null;
    private _center: Vec3Like | null = null;
    private _color: ColorLike | null = null;


    get isInitialized(): boolean {
        return this._isInitialized;
    }

    async initialize(): Promise<boolean> {
        const adapter = getEngineAdapter();
        const cc = adapter.getCC();

        if (!cc) {
            console.warn('[GizmoRenderService] CC not available');
            return false;
        }

        // Get the gizmo camera service
        const cameraService = getCameraService();

        // Ensure gizmo camera exists (this also initializes GeometryRenderer)
        // This will also detect and recreate cameras if they were destroyed
        const gizmoCameraCreated = await cameraService.createGizmoCamera();
        if (!gizmoCameraCreated) {
            console.warn('[GizmoRenderService] Gizmo camera not created yet');
            return false;
        }

        // Get the geometry renderer from camera service
        const newRenderer = cameraService.getGizmoGeometryRenderer() as IGeometryRenderer | null;

        if (!newRenderer) {
            console.warn('[GizmoRenderService] GeometryRenderer not available');
            return false;
        }

        // Check if this is a reinitialization (scene change)
        if (this._geometryRenderer !== newRenderer) {
            this._geometryRenderer = newRenderer;
        }

        // Already initialized with valid renderer
        if (this._isInitialized) {
            return true;
        }

        try {
            // Create cached objects first
            this.createCachedObjects(cc);

            this._isInitialized = true;

            // Note: We don't subscribe to camera/selection changes here
            // All updates happen via BEFORE_DRAW event for perfect synchronization

            // Subscribe to director's BEFORE_DRAW event for synchronized updates
            // This ensures geometry is ready exactly when rendering happens
            const adapter = getEngineAdapter();
            const director = adapter.director;
            if (director?.on) {
                this._boundUpdate = this.update.bind(this);
                director.on(DirectorEvent.BEFORE_DRAW, this._boundUpdate);
            }

            // Initial draw
            this.update();

            console.log('[GizmoRenderService] Initialized with BEFORE_DRAW sync');
            return true;
        } catch (error) {
            console.error('[GizmoRenderService] Failed to initialize:', error);
            return false;
        }
    }

    private createCachedObjects(cc: unknown): void {
        const Vec3Class = (cc as { Vec3?: new () => Vec3Like }).Vec3;
        const ColorClass = (cc as { Color?: new () => ColorLike }).Color;

        if (Vec3Class) {
            this._v0 = new Vec3Class();
            this._v1 = new Vec3Class();
            this._v2 = new Vec3Class();
            this._v3 = new Vec3Class();
            this._center = new Vec3Class();
        }

        if (ColorClass) {
            this._color = new ColorClass();
        }
    }

    dispose(): void {
        // Unsubscribe from director event
        if (this._boundUpdate) {
            const adapter = getEngineAdapter();
            const director = adapter.director;
            if (director?.off) {
                director.off(DirectorEvent.BEFORE_DRAW, this._boundUpdate);
            }
            this._boundUpdate = null;
        }

        // Note: We don't destroy the geometry renderer because it's owned by the camera
        // The camera will clean up its own geometry renderer when destroyed
        this._geometryRenderer = null;

        this._v0 = null;
        this._v1 = null;
        this._v2 = null;
        this._v3 = null;
        this._center = null;
        this._color = null;

        this._isInitialized = false;
    }

    setShowGrid(show: boolean): void {
        this._config.showGrid = show;
        this.update();
    }

    setActiveTool(tool: TransformTool): void {
        this._config.activeTool = tool;
        this.update();
    }

    update(): void {
        if (!this._isInitialized || !this._geometryRenderer) {
            return;
        }

        // Check if geometry renderer is still valid (might be destroyed on scene change)
        try {
            // Reset geometry buffers
            this._geometryRenderer.reset();
        } catch {
            // Geometry renderer became invalid, need to reinitialize
            this._geometryRenderer = null;
            this.initialize();
            return;
        }

        // Force update gizmo camera's internal state before drawing
        // This ensures the frustum culling uses the latest orthoHeight
        this.updateGizmoCameraState();

        // Draw grid
        this.drawGrid();

        // Draw gizmo for selected object
        this.drawGizmo();

        // Upload vertex data to GPU
        this._geometryRenderer.update();
    }

    /**
     * @zh 强制更新 Gizmo 相机的内部状态
     * @en Force update gizmo camera's internal state
     *
     * 确保相机的投影矩阵和视锥在绘制前更新，避免裁剪问题。
     * Ensures camera's projection matrix and frustum are updated before drawing.
     */
    private updateGizmoCameraState(): void {
        const cameraService = getCameraService();
        const renderCamera = cameraService.getGizmoCameraRenderCamera();

        if (renderCamera) {
            const cam = renderCamera as {
                update?: (forceUpdate?: boolean) => void;
                updateExposure?: () => void;
            };
            // Force update the internal render camera state with forceUpdate=true
            // This ensures projection matrix and frustum are recalculated
            cam.update?.(true);
        }
    }

    /**
     * @zh 设置颜色
     * @en Set color
     */
    private setColor(colorDef: { r: number; g: number; b: number; a: number }): ColorLike {
        if (this._color) {
            this._color.set(colorDef.r, colorDef.g, colorDef.b, colorDef.a);
            return this._color;
        }
        return colorDef as ColorLike;
    }

    /**
     * @zh 绘制多层级自适应网格（类似虚幻引擎）
     * @en Draw multi-level adaptive grid (like Unreal Engine)
     *
     * 网格会根据缩放级别自动调整：
     * - 缩小时显示更大的网格间距
     * - 放大时显示更细的网格
     * - 多层级网格叠加显示，粗网格颜色更亮
     */
    private drawGrid(): void {
        if (!this._config.showGrid || !this._geometryRenderer) return;
        if (!this._v0 || !this._v1) return;

        const cameraService = getCameraService();
        const camera = cameraService.state;
        const viewport = cameraService.getViewportSize();

        // Calculate visible bounds based on viewport size and zoom
        // Always use calculated values to ensure consistency with camera sync
        // orthoHeight = viewportHeight / 2 / zoom (same formula as CameraService.syncGizmoCamera)
        const halfHeight = viewport.height / 2 / camera.zoom;
        const halfWidth = viewport.width / 2 / camera.zoom;

        const cameraX = -camera.x;
        const cameraY = -camera.y;

        // Add safety margin to ensure lines at edges are visible
        // GPU clipping can be slightly different from our calculation
        const margin = Math.max(halfWidth, halfHeight) * 0.15;
        const left = cameraX - halfWidth - margin;
        const right = cameraX + halfWidth + margin;
        const bottom = cameraY - halfHeight - margin;
        const top = cameraY + halfHeight + margin;

        // Multi-level grid sizes (each level is 10x the previous)
        // Extended to support high zoom levels (zoom > 1)
        const GRID_SIZE_LEVELS = [0.1, 1, 10, 100, 1000, 10000] as const;

        // Calculate which grid levels to show based on zoom
        // We want roughly 10-50 lines visible at any zoom level
        const viewSize = Math.max(halfWidth, halfHeight) * 2;
        const targetLineCount = 20;
        const idealGridSize = viewSize / targetLineCount;

        // Find the best base grid size (the largest size that gives reasonable line count)
        let primaryGridSize: number = GRID_SIZE_LEVELS[0];
        for (const size of GRID_SIZE_LEVELS) {
            if (size <= idealGridSize * 2) {
                primaryGridSize = size;
            }
        }

        // Build grid levels to draw
        const gridLevels: Array<{ size: number; alpha: number }> = [];

        // Add finer grid if zoomed in enough (1/10 of primary)
        const finerSize = primaryGridSize / 10;
        if (finerSize >= 0.01 && viewSize < primaryGridSize * 30) {
            gridLevels.push({ size: finerSize, alpha: 60 });
        }

        // Primary grid
        gridLevels.push({ size: primaryGridSize, alpha: 150 });

        // Major grid (10x primary, brighter)
        const majorSize = primaryGridSize * 10;
        if (majorSize <= 10000) {
            gridLevels.push({ size: majorSize, alpha: 220 });
        }

        // Draw each grid level
        for (const level of gridLevels) {
            const gridSize = level.size;
            const alpha = level.alpha;

            // Limit line count to prevent performance issues
            const lineCountX = Math.ceil((right - left) / gridSize) + 2;
            const lineCountY = Math.ceil((top - bottom) / gridSize) + 2;

            if (lineCountX > 200 || lineCountY > 200) continue; // Skip if too many lines

            const startX = Math.floor(left / gridSize) * gridSize;
            const startY = Math.floor(bottom / gridSize) * gridSize;

            // Grid color with dynamic alpha
            const gridColor = this.setColor({ r: 80, g: 80, b: 80, a: alpha });

            // Draw vertical lines
            for (let x = startX; x <= right + gridSize; x += gridSize) {
                // Skip axis lines (drawn separately)
                if (Math.abs(x) < 0.001) continue;
                this._v0.set(x, bottom, 0);
                this._v1.set(x, top, 0);
                this._geometryRenderer.addLine(this._v0, this._v1, gridColor, false);
            }

            // Draw horizontal lines
            for (let y = startY; y <= top + gridSize; y += gridSize) {
                // Skip axis lines (drawn separately)
                if (Math.abs(y) < 0.001) continue;
                this._v0.set(left, y, 0);
                this._v1.set(right, y, 0);
                this._geometryRenderer.addLine(this._v0, this._v1, gridColor, false);
            }
        }

        // Draw X axis (red) - always on top
        const xAxisColor = this.setColor(GIZMO_COLORS.AXIS_X);
        this._v0.set(left, 0, 0);
        this._v1.set(right, 0, 0);
        this._geometryRenderer.addLine(this._v0, this._v1, xAxisColor, false);

        // Draw Y axis (green) - always on top
        const yAxisColor = this.setColor(GIZMO_COLORS.AXIS_Y);
        this._v0.set(0, bottom, 0);
        this._v1.set(0, top, 0);
        this._geometryRenderer.addLine(this._v0, this._v1, yAxisColor, false);
    }

    /**
     * @zh 绘制 Gizmo
     * @en Draw Gizmo
     */
    private drawGizmo(): void {
        if (!this._geometryRenderer) return;

        const selectionService = getSelectionService();
        const selectedId = selectionService.primarySelectedId;

        if (!selectedId) return;

        const transformService = getTransformService();
        const transform = transformService.getTransform(selectedId);

        if (!transform) return;

        const cameraService = getCameraService();
        const camera = cameraService.state;

        // Calculate gizmo size in world coordinates (constant screen size)
        const scale = 1 / camera.zoom;

        const worldX = transform.position.x;
        const worldY = transform.position.y;

        // Draw selection outline
        this.drawSelectionOutline(worldX, worldY, transform.scale.x, transform.scale.y, scale);

        // Draw tool-specific gizmo
        switch (this._config.activeTool) {
            case 'move':
                this.drawMoveGizmo(worldX, worldY, scale);
                break;
            case 'rotate':
                this.drawRotateGizmo(worldX, worldY, scale);
                break;
            case 'scale':
                this.drawScaleGizmo(worldX, worldY, transform.scale.x, transform.scale.y, scale);
                break;
        }
    }

    /**
     * @zh 绘制选择轮廓
     * @en Draw selection outline
     */
    private drawSelectionOutline(
        x: number,
        y: number,
        scaleX: number,
        scaleY: number,
        gizmoScale: number
    ): void {
        if (!this._geometryRenderer || !this._v0 || !this._v1 || !this._v2 || !this._v3) return;

        const halfW = DEFAULT_OBJECT.HALF_SIZE * scaleX + DEFAULT_OBJECT.SELECTION_PADDING * gizmoScale;
        const halfH = DEFAULT_OBJECT.HALF_SIZE * scaleY + DEFAULT_OBJECT.SELECTION_PADDING * gizmoScale;

        const selectionColor = this.setColor(GIZMO_COLORS.SELECTION);

        // Draw bounding box (4 lines)
        this._v0.set(x - halfW, y - halfH, 0);
        this._v1.set(x + halfW, y - halfH, 0);
        this._v2.set(x + halfW, y + halfH, 0);
        this._v3.set(x - halfW, y + halfH, 0);

        this._geometryRenderer.addLine(this._v0, this._v1, selectionColor, false);
        this._geometryRenderer.addLine(this._v1, this._v2, selectionColor, false);
        this._geometryRenderer.addLine(this._v2, this._v3, selectionColor, false);
        this._geometryRenderer.addLine(this._v3, this._v0, selectionColor, false);

        // Draw corner handles as small quads
        const handleSize = GIZMO_SIZE.CORNER_HANDLE_SIZE * gizmoScale;
        const corners = [
            { x: x - halfW, y: y - halfH },
            { x: x + halfW, y: y - halfH },
            { x: x - halfW, y: y + halfH },
            { x: x + halfW, y: y + halfH },
        ];

        for (const corner of corners) {
            this.drawFilledRect(corner.x, corner.y, handleSize, selectionColor);
        }
    }

    /**
     * @zh 绘制移动 Gizmo
     * @en Draw move gizmo
     */
    private drawMoveGizmo(x: number, y: number, scale: number): void {
        if (!this._geometryRenderer || !this._v0 || !this._v1 || !this._v2 || !this._center) return;

        const axisLength = GIZMO_SIZE.AXIS_LENGTH * scale;
        const arrowSize = GIZMO_SIZE.ARROW_SIZE * scale;

        // X axis (red)
        const xColor = this.setColor(GIZMO_COLORS.AXIS_X);
        this._v0.set(x, y, 0);
        this._v1.set(x + axisLength, y, 0);
        this._geometryRenderer.addLine(this._v0, this._v1, xColor, false);

        // X arrow (triangle)
        this._v0.set(x + axisLength + arrowSize, y, 0);
        this._v1.set(x + axisLength - 4 * scale, y + 6 * scale, 0);
        this._v2.set(x + axisLength - 4 * scale, y - 6 * scale, 0);
        this._geometryRenderer.addTriangle(this._v0, this._v1, this._v2, xColor, false, false, true);

        // Y axis (green)
        const yColor = this.setColor(GIZMO_COLORS.AXIS_Y);
        this._v0.set(x, y, 0);
        this._v1.set(x, y + axisLength, 0);
        this._geometryRenderer.addLine(this._v0, this._v1, yColor, false);

        // Y arrow (triangle)
        this._v0.set(x, y + axisLength + arrowSize, 0);
        this._v1.set(x - 6 * scale, y + axisLength - 4 * scale, 0);
        this._v2.set(x + 6 * scale, y + axisLength - 4 * scale, 0);
        this._geometryRenderer.addTriangle(this._v0, this._v1, this._v2, yColor, false, false, true);

        // Center XY handle (yellow square)
        const centerColor = this.setColor(GIZMO_COLORS.MOVE_CENTER);
        const handleSize = GIZMO_SIZE.CENTER_HANDLE_SIZE * scale;
        this.drawFilledRect(x, y, handleSize, centerColor);
    }

    /**
     * @zh 绘制旋转 Gizmo
     * @en Draw rotate gizmo
     */
    private drawRotateGizmo(x: number, y: number, scale: number): void {
        if (!this._geometryRenderer || !this._center || !this._v0 || !this._v1) return;

        const radius = GIZMO_SIZE.ROTATE_RADIUS * scale;
        const rotateColor = this.setColor(GIZMO_COLORS.ROTATE);

        // Rotation circle
        this._center.set(x, y, 0);
        this._geometryRenderer.addCircle(this._center, radius, rotateColor, 64, false);

        // Handle at 0 degrees
        const handlePos = { x: x + radius, y: y };
        this._center.set(handlePos.x, handlePos.y, 0);
        this._geometryRenderer.addDisc(this._center, 8 * scale, rotateColor, 16, false, false, true);

        // Angle indicators (8 lines from center)
        const indicatorColor = this.setColor({ r: 74, g: 158, b: 255, a: 77 }); // 30% alpha
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            this._v0.set(x, y, 0);
            this._v1.set(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, 0);
            this._geometryRenderer.addLine(this._v0, this._v1, indicatorColor, false);
        }

        // Center dot
        this._center.set(x, y, 0);
        this._geometryRenderer.addDisc(this._center, 5 * scale, rotateColor, 16, false, false, true);
    }

    /**
     * @zh 绘制缩放 Gizmo
     * @en Draw scale gizmo
     */
    private drawScaleGizmo(
        x: number,
        y: number,
        scaleX: number,
        scaleY: number,
        gizmoScale: number
    ): void {
        if (!this._geometryRenderer || !this._v0 || !this._v1 || !this._v2 || !this._v3 || !this._center) return;

        const halfW = DEFAULT_OBJECT.HALF_SIZE * scaleX;
        const halfH = DEFAULT_OBJECT.HALF_SIZE * scaleY;
        const handleSize = GIZMO_SIZE.HANDLE_SIZE * gizmoScale;

        const scaleColor = this.setColor(GIZMO_COLORS.SCALE);

        // Bounding box (4 lines)
        this._v0.set(x - halfW, y - halfH, 0);
        this._v1.set(x + halfW, y - halfH, 0);
        this._v2.set(x + halfW, y + halfH, 0);
        this._v3.set(x - halfW, y + halfH, 0);

        this._geometryRenderer.addLine(this._v0, this._v1, scaleColor, false);
        this._geometryRenderer.addLine(this._v1, this._v2, scaleColor, false);
        this._geometryRenderer.addLine(this._v2, this._v3, scaleColor, false);
        this._geometryRenderer.addLine(this._v3, this._v0, scaleColor, false);

        // Corner handles (orange)
        const corners = [
            { x: x - halfW, y: y - halfH },
            { x: x + halfW, y: y - halfH },
            { x: x - halfW, y: y + halfH },
            { x: x + halfW, y: y + halfH },
        ];
        for (const corner of corners) {
            this.drawFilledRect(corner.x, corner.y, handleSize, scaleColor);
        }

        // X handles (red) - left and right edges
        const xColor = this.setColor(GIZMO_COLORS.AXIS_X);
        this.drawFilledRect(x - halfW, y, handleSize, xColor);
        this.drawFilledRect(x + halfW, y, handleSize, xColor);

        // Y handles (green) - top and bottom edges
        const yColor = this.setColor(GIZMO_COLORS.AXIS_Y);
        this.drawFilledRect(x, y - halfH, handleSize, yColor);
        this.drawFilledRect(x, y + halfH, handleSize, yColor);

        // Center dot
        this._center.set(x, y, 0);
        this._geometryRenderer.addDisc(this._center, 6 * gizmoScale, scaleColor, 16, false, false, true);
    }

    /**
     * @zh 绘制填充矩形（作为两个三角形）
     * @en Draw filled rectangle (as two triangles)
     */
    private drawFilledRect(cx: number, cy: number, size: number, color: ColorLike): void {
        if (!this._geometryRenderer || !this._v0 || !this._v1 || !this._v2 || !this._v3) return;

        const halfSize = size / 2;

        // Define quad vertices
        this._v0.set(cx - halfSize, cy - halfSize, 0);
        this._v1.set(cx + halfSize, cy - halfSize, 0);
        this._v2.set(cx + halfSize, cy + halfSize, 0);
        this._v3.set(cx - halfSize, cy + halfSize, 0);

        // Draw as quad (two triangles internally)
        this._geometryRenderer.addQuad(this._v0, this._v1, this._v2, this._v3, color, false, false, true);
    }

    /**
     * @zh 获取 GeometryRenderer（供渲染管线调用）
     * @en Get GeometryRenderer (for render pipeline)
     */
    getRenderer(): IGeometryRenderer | null {
        return this._geometryRenderer;
    }
}

let instance: GizmoRenderServiceImpl | null = null;

export function getGizmoRenderService(): IGizmoRenderService {
    if (!instance) {
        instance = new GizmoRenderServiceImpl();
    }
    return instance;
}

export function resetGizmoRenderService(): void {
    if (instance) {
        instance.dispose();
    }
    instance = null;
}
