/**
 * @zh Gizmo 渲染服务 - 在 ccesengine 内绘制编辑器 Gizmo
 * @en Gizmo Render Service - Draw editor gizmos inside ccesengine
 *
 * 使用 ccesengine 的 Graphics 组件绘制，确保与场景渲染使用相同的坐标系统。
 * Uses ccesengine's Graphics component for drawing, ensuring same coordinate system as scene rendering.
 */

import type { Unsubscribe } from './types';
import { getEngineAdapter } from './EngineAdapter';
import { getCameraService, Layers } from './CameraService';
import { getSelectionService } from './SelectionService';
import { getTransformService } from './TransformService';

export type TransformTool = 'select' | 'move' | 'rotate' | 'scale';

interface GizmoConfig {
    showGrid: boolean;
    activeTool: TransformTool;
    gridSize: number;
    gridColor: string;
    axisXColor: string;
    axisYColor: string;
    selectionColor: string;
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
    private _gizmoNode: unknown = null;
    private _gridGraphics: unknown = null;
    private _gizmoGraphics: unknown = null;
    private _config: GizmoConfig = {
        showGrid: true,
        activeTool: 'select',
        gridSize: 50,
        gridColor: 'rgba(255, 255, 255, 0.1)',
        axisXColor: '#ff4444',
        axisYColor: '#44ff44',
        selectionColor: '#4a9eff',
    };

    private _cameraUnsubscribe: Unsubscribe | null = null;
    private _selectionUnsubscribe: Unsubscribe | null = null;
    private _updateInterval: number | null = null;

    // Gizmo constants
    private readonly GIZMO_AXIS_LENGTH = 80;
    private readonly GIZMO_ARROW_SIZE = 12;
    private readonly GIZMO_ROTATE_RADIUS = 60;
    private readonly GIZMO_HANDLE_SIZE = 10;

    get isInitialized(): boolean {
        return this._isInitialized;
    }

    async initialize(): Promise<boolean> {
        if (this._isInitialized) return true;

        const adapter = getEngineAdapter();
        const director = adapter.director;
        if (!director) {
            return false;
        }

        const scene = director.getScene?.();
        if (!scene) {
            return false;
        }

        try {
            await this.createGizmoNodes(scene);
            this._isInitialized = true;

            // Subscribe to camera changes
            const cameraService = getCameraService();
            this._cameraUnsubscribe = cameraService.onCameraChanged(() => {
                this.update();
            });

            // Subscribe to selection changes
            const selectionService = getSelectionService();
            this._selectionUnsubscribe = selectionService.onSelectionChanged(() => {
                this.update();
            });

            // Set up periodic update for smooth gizmo rendering
            this._updateInterval = window.setInterval(() => {
                this.update();
            }, 1000 / 30) as unknown as number; // 30 FPS

            return true;
        } catch (error) {
            console.error('[GizmoRenderService] Failed to initialize:', error);
            return false;
        }
    }

    dispose(): void {
        if (this._updateInterval !== null) {
            window.clearInterval(this._updateInterval);
            this._updateInterval = null;
        }

        if (this._cameraUnsubscribe) {
            this._cameraUnsubscribe();
            this._cameraUnsubscribe = null;
        }

        if (this._selectionUnsubscribe) {
            this._selectionUnsubscribe();
            this._selectionUnsubscribe = null;
        }

        if (this._gizmoNode) {
            const node = this._gizmoNode as { destroy?: () => void };
            node.destroy?.();
            this._gizmoNode = null;
        }

        this._gridGraphics = null;
        this._gizmoGraphics = null;
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
        if (!this._isInitialized) return;

        this.drawGrid();
        this.drawGizmo();
    }

    private async createGizmoNodes(scene: unknown): Promise<void> {
        const adapter = getEngineAdapter();
        const cc = adapter.getCC();
        if (!cc) throw new Error('CC not available');

        const NodeClass = cc.Node as { new (name: string): unknown };
        if (!NodeClass) throw new Error('cc.Node not available');

        const sceneNode = scene as { addChild?: (child: unknown) => void };


        // Create main gizmo container node
        this._gizmoNode = new NodeClass('__EditorGizmo__');
        const gizmoNode = this._gizmoNode as {
            layer?: number;
            setSiblingIndex?: (index: number) => void;
            addComponent?: (type: string) => unknown;
            addChild?: (child: unknown) => void;
        };

        // Use GIZMO layer so only the gizmo camera can see it
        gizmoNode.layer = Layers.GIZMO;

        // Add to scene
        sceneNode.addChild?.(this._gizmoNode);

        // Move to end of sibling list to render last
        gizmoNode.setSiblingIndex?.(999999);

        // Create grid node with Graphics
        const gridNode = new NodeClass('__Grid__');
        const gridNodeTyped = gridNode as {
            layer?: number;
            addComponent?: (type: string) => unknown;
        };
        gridNodeTyped.layer = Layers.GIZMO;
        this._gridGraphics = gridNodeTyped.addComponent?.('cc.Graphics');
        gizmoNode.addChild?.(gridNode);

        // Create gizmo node with Graphics
        const gizmoGraphicsNode = new NodeClass('__GizmoGraphics__');
        const gizmoGraphicsNodeTyped = gizmoGraphicsNode as {
            layer?: number;
            addComponent?: (type: string) => unknown;
        };
        gizmoGraphicsNodeTyped.layer = Layers.GIZMO;
        this._gizmoGraphics = gizmoGraphicsNodeTyped.addComponent?.('cc.Graphics');
        gizmoNode.addChild?.(gizmoGraphicsNode);

        // Configure graphics
        this.configureGraphics(this._gridGraphics);
        this.configureGraphics(this._gizmoGraphics);
    }

    private configureGraphics(graphics: unknown): void {
        if (!graphics) return;

        const g = graphics as {
            lineWidth?: number;
            strokeColor?: unknown;
            fillColor?: unknown;
        };

        g.lineWidth = 1;
    }

    /**
     * @zh 创建颜色对象
     * @en Create color object
     */
    private createColor(r: number, g: number, b: number, a = 255): unknown {
        const adapter = getEngineAdapter();
        const cc = adapter.getCC();

        if (cc?.Color) {
            try {
                const Color = cc.Color as { new (r?: number, g?: number, b?: number, a?: number): unknown };
                const color = new Color(r, g, b, a);
                if (color) return color;
            } catch {
                // Fall through to next approach
            }
        }

        if (cc?.color) {
            try {
                const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                const color = cc.color(hex);
                if (color) {
                    (color as { a?: number }).a = a;
                    return color;
                }
            } catch {
                // Fall through to fallback
            }
        }

        // Last fallback: return a plain object with color properties
        // This prevents null reference errors when Graphics.stroke tries to copy the color
        return { r, g, b, a };
    }

    private drawGrid(): void {
        const graphics = this._gridGraphics as {
            clear?: () => void;
            strokeColor?: unknown;
            lineWidth?: number;
            moveTo?: (x: number, y: number) => void;
            lineTo?: (x: number, y: number) => void;
            stroke?: () => void;
            circle?: (x: number, y: number, radius: number) => void;
            fill?: () => void;
            fillColor?: unknown;
        };

        if (!graphics || !graphics.clear) return;

        graphics.clear();

        if (!this._config.showGrid) return;

        const cameraService = getCameraService();
        const camera = cameraService.state;
        const viewport = cameraService.getViewportSize();

        const gridSize = this._config.gridSize;
        const halfWidth = viewport.width / 2 / camera.zoom;
        const halfHeight = viewport.height / 2 / camera.zoom;

        // Calculate visible grid range in world coordinates
        const cameraX = -camera.x;
        const cameraY = -camera.y;

        const left = cameraX - halfWidth - gridSize;
        const right = cameraX + halfWidth + gridSize;
        const bottom = cameraY - halfHeight - gridSize;
        const top = cameraY + halfHeight + gridSize;

        // Snap to grid
        const startX = Math.floor(left / gridSize) * gridSize;
        const startY = Math.floor(bottom / gridSize) * gridSize;

        // Draw minor grid lines
        graphics.strokeColor = this.createColor(51, 51, 51); // #333333
        graphics.lineWidth = 1;

        // Vertical lines
        for (let x = startX; x <= right; x += gridSize) {
            graphics.moveTo?.(x, bottom);
            graphics.lineTo?.(x, top);
        }
        // Horizontal lines
        for (let y = startY; y <= top; y += gridSize) {
            graphics.moveTo?.(left, y);
            graphics.lineTo?.(right, y);
        }
        graphics.stroke?.();

        // Draw origin axes
        // X axis (red)
        graphics.strokeColor = this.createColor(255, 68, 68); // #ff4444
        graphics.lineWidth = 2;
        graphics.moveTo?.(left, 0);
        graphics.lineTo?.(right, 0);
        graphics.stroke?.();

        // Y axis (green)
        graphics.strokeColor = this.createColor(68, 255, 68); // #44ff44
        graphics.moveTo?.(0, bottom);
        graphics.lineTo?.(0, top);
        graphics.stroke?.();

        // Origin marker
        graphics.fillColor = this.createColor(74, 158, 255); // #4a9eff
        graphics.circle?.(0, 0, 5 / camera.zoom);
        graphics.fill?.();
    }

    private drawGizmo(): void {
        const graphics = this._gizmoGraphics as {
            clear?: () => void;
            strokeColor?: unknown;
            fillColor?: unknown;
            lineWidth?: number;
            moveTo?: (x: number, y: number) => void;
            lineTo?: (x: number, y: number) => void;
            stroke?: () => void;
            circle?: (x: number, y: number, radius: number) => void;
            rect?: (x: number, y: number, width: number, height: number) => void;
            fill?: () => void;
            close?: () => void;
        };

        if (!graphics || !graphics.clear) return;

        const adapter = getEngineAdapter();
        const cc = adapter.getCC();
        if (!cc) return;

        graphics.clear();

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
        this.drawSelectionOutline(graphics, worldX, worldY, transform.scale.x, transform.scale.y, scale);

        // Draw tool-specific gizmo
        switch (this._config.activeTool) {
            case 'move':
                this.drawMoveGizmo(graphics, worldX, worldY, scale);
                break;
            case 'rotate':
                this.drawRotateGizmo(graphics, worldX, worldY, scale);
                break;
            case 'scale':
                this.drawScaleGizmo(graphics, worldX, worldY, transform.scale.x, transform.scale.y, scale);
                break;
        }
    }

    private drawSelectionOutline(
        graphics: unknown,
        x: number,
        y: number,
        scaleX: number,
        scaleY: number,
        gizmoScale: number
    ): void {
        const g = graphics as {
            strokeColor?: unknown;
            lineWidth?: number;
            rect?: (x: number, y: number, width: number, height: number) => void;
            stroke?: () => void;
            fillColor?: unknown;
            fill?: () => void;
        };

        // Assume 100 unit base size
        const halfW = 50 * scaleX + 4 * gizmoScale;
        const halfH = 50 * scaleY + 4 * gizmoScale;

        g.strokeColor = this.createColor(74, 158, 255); // #4a9eff
        g.lineWidth = 2 * gizmoScale;
        g.rect?.(x - halfW, y - halfH, halfW * 2, halfH * 2);
        g.stroke?.();

        // Corner handles
        const handleSize = 6 * gizmoScale;
        g.fillColor = this.createColor(74, 158, 255); // #4a9eff
        const corners = [
            [x - halfW, y - halfH],
            [x + halfW, y - halfH],
            [x - halfW, y + halfH],
            [x + halfW, y + halfH],
        ];
        for (const corner of corners) {
            const cx = corner[0]!;
            const cy = corner[1]!;
            g.rect?.(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
            g.fill?.();
        }
    }

    private drawMoveGizmo(
        graphics: unknown,
        x: number,
        y: number,
        scale: number
    ): void {
        const g = graphics as {
            strokeColor?: unknown;
            fillColor?: unknown;
            lineWidth?: number;
            moveTo?: (x: number, y: number) => void;
            lineTo?: (x: number, y: number) => void;
            stroke?: () => void;
            rect?: (x: number, y: number, width: number, height: number) => void;
            fill?: () => void;
            close?: () => void;
        };

        const axisLength = this.GIZMO_AXIS_LENGTH * scale;
        const arrowSize = this.GIZMO_ARROW_SIZE * scale;

        // X axis (red)
        g.strokeColor = this.createColor(255, 68, 68); // #ff4444
        g.fillColor = this.createColor(255, 68, 68);
        g.lineWidth = 3 * scale;
        g.moveTo?.(x, y);
        g.lineTo?.(x + axisLength, y);
        g.stroke?.();

        // X arrow
        g.moveTo?.(x + axisLength + arrowSize, y);
        g.lineTo?.(x + axisLength - 4 * scale, y + 6 * scale);
        g.lineTo?.(x + axisLength - 4 * scale, y - 6 * scale);
        g.close?.();
        g.fill?.();

        // Y axis (green)
        g.strokeColor = this.createColor(68, 255, 68); // #44ff44
        g.fillColor = this.createColor(68, 255, 68);
        g.moveTo?.(x, y);
        g.lineTo?.(x, y + axisLength);
        g.stroke?.();

        // Y arrow
        g.moveTo?.(x, y + axisLength + arrowSize);
        g.lineTo?.(x - 6 * scale, y + axisLength - 4 * scale);
        g.lineTo?.(x + 6 * scale, y + axisLength - 4 * scale);
        g.close?.();
        g.fill?.();

        // Center XY handle (yellow)
        g.fillColor = this.createColor(255, 255, 68); // #ffff44
        g.strokeColor = this.createColor(204, 204, 0); // #cccc00
        g.lineWidth = 2 * scale;
        const handleSize = 16 * scale;
        g.rect?.(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
        g.fill?.();
        g.stroke?.();
    }

    private drawRotateGizmo(
        graphics: unknown,
        x: number,
        y: number,
        scale: number
    ): void {
        const g = graphics as {
            strokeColor?: unknown;
            fillColor?: unknown;
            lineWidth?: number;
            circle?: (x: number, y: number, radius: number) => void;
            stroke?: () => void;
            fill?: () => void;
            moveTo?: (x: number, y: number) => void;
            lineTo?: (x: number, y: number) => void;
        };

        const radius = this.GIZMO_ROTATE_RADIUS * scale;

        // Rotation circle
        g.strokeColor = this.createColor(74, 158, 255); // #4a9eff
        g.lineWidth = 3 * scale;
        g.circle?.(x, y, radius);
        g.stroke?.();

        // Handle at 0 degrees
        g.fillColor = this.createColor(74, 158, 255); // #4a9eff
        g.circle?.(x + radius, y, 8 * scale);
        g.fill?.();

        // Angle indicators
        g.strokeColor = this.createColor(74, 158, 255, 77); // rgba(74, 158, 255, 0.3)
        g.lineWidth = 1 * scale;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            g.moveTo?.(x, y);
            g.lineTo?.(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
        }
        g.stroke?.();

        // Center dot
        g.fillColor = this.createColor(74, 158, 255); // #4a9eff
        g.circle?.(x, y, 5 * scale);
        g.fill?.();
    }

    private drawScaleGizmo(
        graphics: unknown,
        x: number,
        y: number,
        scaleX: number,
        scaleY: number,
        gizmoScale: number
    ): void {
        const g = graphics as {
            strokeColor?: unknown;
            fillColor?: unknown;
            lineWidth?: number;
            rect?: (x: number, y: number, width: number, height: number) => void;
            stroke?: () => void;
            fill?: () => void;
            circle?: (x: number, y: number, radius: number) => void;
        };

        const halfW = 50 * scaleX;
        const halfH = 50 * scaleY;
        const handleSize = this.GIZMO_HANDLE_SIZE * gizmoScale;

        // Bounding box
        g.strokeColor = this.createColor(255, 170, 0); // #ffaa00
        g.lineWidth = 2 * gizmoScale;
        g.rect?.(x - halfW, y - halfH, halfW * 2, halfH * 2);
        g.stroke?.();

        // Corner handles (yellow)
        g.fillColor = this.createColor(255, 170, 0); // #ffaa00
        const corners = [
            [x - halfW, y - halfH],
            [x + halfW, y - halfH],
            [x - halfW, y + halfH],
            [x + halfW, y + halfH],
        ];
        for (const corner of corners) {
            const cx = corner[0]!;
            const cy = corner[1]!;
            g.rect?.(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
            g.fill?.();
        }

        // X handles (red)
        g.fillColor = this.createColor(255, 68, 68); // #ff4444
        g.rect?.(x - halfW - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
        g.fill?.();
        g.rect?.(x + halfW - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
        g.fill?.();

        // Y handles (green)
        g.fillColor = this.createColor(68, 255, 68); // #44ff44
        g.rect?.(x - handleSize / 2, y - halfH - handleSize / 2, handleSize, handleSize);
        g.fill?.();
        g.rect?.(x - handleSize / 2, y + halfH - handleSize / 2, handleSize, handleSize);
        g.fill?.();

        // Center
        g.fillColor = this.createColor(255, 170, 0); // #ffaa00
        g.circle?.(x, y, 6 * gizmoScale);
        g.fill?.();
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
