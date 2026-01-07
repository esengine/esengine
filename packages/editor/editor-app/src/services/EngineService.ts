/**
 * Engine Service - Abstraction layer for game engine integration
 * 引擎服务 - 游戏引擎集成的抽象层
 *
 * This service provides an abstraction layer that can be implemented by different engines.
 * Currently supports a placeholder renderer, but designed for ccesengine integration.
 */

export type TransformTool = 'select' | 'move' | 'rotate' | 'scale';
export type GizmoHandle = 'none' | 'x' | 'y' | 'xy' | 'rotate' | 'scale-x' | 'scale-y' | 'scale-xy';

export interface EngineConfig {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    backgroundColor?: string;
    showGrid?: boolean;
}

export interface SceneObject {
    id: number;
    name: string;
    type: 'box' | 'circle' | 'sprite';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    color: string;
    selected?: boolean;
}

export interface EngineState {
    isInitialized: boolean;
    isRunning: boolean;
    isPaused: boolean;
    frameCount: number;
    fps: number;
}

export interface IEngineService {
    init(config: EngineConfig): Promise<void>;
    destroy(): void;
    start(): void;
    pause(): void;
    resume(): void;
    stop(): void;
    resize(width: number, height: number): void;
    getState(): EngineState;
    render(): void;

    // Scene object management
    addObject(object: SceneObject): void;
    removeObject(id: number): void;
    updateObject(id: number, updates: Partial<SceneObject>): void;
    selectObject(id: number | null): void;
    getObjects(): SceneObject[];
    getSelectedObjectId(): number | null;

    // Hit testing
    hitTest(screenX: number, screenY: number): SceneObject | null;
    screenToWorld(screenX: number, screenY: number): { x: number; y: number };
    worldToScreen(worldX: number, worldY: number): { x: number; y: number };

    // Gizmo
    setActiveTool(tool: TransformTool): void;
    hitTestGizmo(screenX: number, screenY: number): GizmoHandle;
}

/**
 * Placeholder Engine Service
 * A simple 2D canvas-based renderer for development and testing
 */
export class PlaceholderEngineService implements IEngineService {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private config: EngineConfig | null = null;
    private animationFrameId: number | null = null;
    private lastFrameTime: number = 0;
    private frameCount: number = 0;
    private fps: number = 0;
    private fpsUpdateTime: number = 0;
    private fpsFrameCount: number = 0;
    private objects: SceneObject[] = [];
    private selectedObjectId: number | null = null;
    private activeTool: TransformTool = 'select';

    // Gizmo constants
    private readonly GIZMO_AXIS_LENGTH = 80;
    private readonly GIZMO_ARROW_SIZE = 12;
    private readonly GIZMO_HANDLE_SIZE = 10;
    private readonly GIZMO_ROTATE_RADIUS = 60;

    private state: EngineState = {
        isInitialized: false,
        isRunning: false,
        isPaused: false,
        frameCount: 0,
        fps: 0,
    };

    async init(config: EngineConfig): Promise<void> {
        this.canvas = config.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.config = config;

        this.canvas.width = config.width;
        this.canvas.height = config.height;

        this.state.isInitialized = true;
        this.render();
    }

    destroy(): void {
        this.stop();
        this.canvas = null;
        this.ctx = null;
        this.config = null;
        this.state.isInitialized = false;
    }

    start(): void {
        if (!this.state.isInitialized || this.state.isRunning) return;

        this.state.isRunning = true;
        this.state.isPaused = false;
        this.lastFrameTime = performance.now();
        this.fpsUpdateTime = this.lastFrameTime;
        this.fpsFrameCount = 0;
        this.gameLoop();
    }

    pause(): void {
        this.state.isPaused = true;
    }

    resume(): void {
        if (!this.state.isRunning) return;
        this.state.isPaused = false;
        this.lastFrameTime = performance.now();
    }

    stop(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.state.isRunning = false;
        this.state.isPaused = false;
        this.frameCount = 0;
        this.state.frameCount = 0;
        this.render();
    }

    resize(width: number, height: number): void {
        if (!this.canvas || !this.config) return;

        this.config.width = width;
        this.config.height = height;
        this.canvas.width = width;
        this.canvas.height = height;

        if (!this.state.isRunning) {
            this.render();
        }
    }

    getState(): EngineState {
        return { ...this.state };
    }

    // Scene object management
    addObject(object: SceneObject): void {
        this.objects.push(object);
        if (!this.state.isRunning) {
            this.render();
        }
    }

    removeObject(id: number): void {
        this.objects = this.objects.filter(obj => obj.id !== id);
        if (this.selectedObjectId === id) {
            this.selectedObjectId = null;
        }
        if (!this.state.isRunning) {
            this.render();
        }
    }

    updateObject(id: number, updates: Partial<SceneObject>): void {
        const obj = this.objects.find(o => o.id === id);
        if (obj) {
            Object.assign(obj, updates);
            if (!this.state.isRunning) {
                this.render();
            }
        }
    }

    selectObject(id: number | null): void {
        // Clear previous selection
        this.objects.forEach(obj => obj.selected = false);

        this.selectedObjectId = id;
        if (id !== null) {
            const obj = this.objects.find(o => o.id === id);
            if (obj) {
                obj.selected = true;
            }
        }
        if (!this.state.isRunning) {
            this.render();
        }
    }

    getObjects(): SceneObject[] {
        return [...this.objects];
    }

    getSelectedObjectId(): number | null {
        return this.selectedObjectId;
    }

    /**
     * @zh 命中测试 - 检测屏幕坐标点击的对象
     * @en Hit test - detect object at screen coordinates
     */
    hitTest(screenX: number, screenY: number): SceneObject | null {
        if (!this.config) return null;

        const world = this.screenToWorld(screenX, screenY);

        // Iterate in reverse order (top objects first)
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const obj = this.objects[i];
            if (obj && this.isPointInObject(world.x, world.y, obj)) {
                return obj;
            }
        }
        return null;
    }

    /**
     * @zh 检测点是否在对象内
     * @en Check if point is inside object
     */
    private isPointInObject(worldX: number, worldY: number, obj: SceneObject): boolean {
        // Transform point to object's local space
        const dx = worldX - obj.x;
        const dy = worldY - obj.y;

        // Apply inverse rotation
        const angle = -obj.rotation * Math.PI / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        const halfW = obj.width / 2;
        const halfH = obj.height / 2;

        if (obj.type === 'circle') {
            const radius = Math.min(halfW, halfH);
            return (localX * localX + localY * localY) <= radius * radius;
        }

        // Box and sprite use AABB in local space
        return localX >= -halfW && localX <= halfW &&
               localY >= -halfH && localY <= halfH;
    }

    /**
     * @zh 屏幕坐标转世界坐标
     * @en Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
        if (!this.config) return { x: 0, y: 0 };

        const centerX = this.config.width / 2;
        const centerY = this.config.height / 2;

        return {
            x: screenX - centerX,
            y: centerY - screenY  // Y is inverted
        };
    }

    /**
     * @zh 世界坐标转屏幕坐标
     * @en Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
        if (!this.config) return { x: 0, y: 0 };

        const centerX = this.config.width / 2;
        const centerY = this.config.height / 2;

        return {
            x: centerX + worldX,
            y: centerY - worldY  // Y is inverted
        };
    }

    /**
     * @zh 设置当前激活的变换工具
     * @en Set the active transform tool
     */
    setActiveTool(tool: TransformTool): void {
        this.activeTool = tool;
        if (!this.state.isRunning) {
            this.render();
        }
    }

    /**
     * @zh Gizmo 命中测试
     * @en Gizmo hit testing
     */
    hitTestGizmo(screenX: number, screenY: number): GizmoHandle {
        if (this.selectedObjectId === null || !this.config) return 'none';

        const selectedObj = this.objects.find(o => o.id === this.selectedObjectId);
        if (!selectedObj) return 'none';

        const objScreen = this.worldToScreen(selectedObj.x, selectedObj.y);
        const dx = screenX - objScreen.x;
        const dy = screenY - objScreen.y;

        if (this.activeTool === 'move') {
            // Check XY handle (center square)
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
                return 'xy';
            }
            // Check X axis
            if (dx > 0 && dx < this.GIZMO_AXIS_LENGTH + this.GIZMO_ARROW_SIZE && Math.abs(dy) < 10) {
                return 'x';
            }
            // Check Y axis (screen Y is inverted)
            if (dy < 0 && dy > -(this.GIZMO_AXIS_LENGTH + this.GIZMO_ARROW_SIZE) && Math.abs(dx) < 10) {
                return 'y';
            }
        } else if (this.activeTool === 'rotate') {
            // Check rotate circle
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (Math.abs(dist - this.GIZMO_ROTATE_RADIUS) < 8) {
                return 'rotate';
            }
        } else if (this.activeTool === 'scale') {
            const halfW = selectedObj.width / 2;
            const halfH = selectedObj.height / 2;
            const handleSize = this.GIZMO_HANDLE_SIZE;

            // Check corner handles (scale XY)
            const corners = [
                { x: halfW, y: -halfH },   // top-right
                { x: -halfW, y: -halfH },  // top-left
                { x: -halfW, y: halfH },   // bottom-left
                { x: halfW, y: halfH }     // bottom-right
            ];
            for (const corner of corners) {
                if (Math.abs(dx - corner.x) < handleSize && Math.abs(dy - corner.y) < handleSize) {
                    return 'scale-xy';
                }
            }
            // Check X scale handles
            if (Math.abs(dx - halfW) < handleSize && Math.abs(dy) < handleSize) return 'scale-x';
            if (Math.abs(dx + halfW) < handleSize && Math.abs(dy) < handleSize) return 'scale-x';
            // Check Y scale handles
            if (Math.abs(dy + halfH) < handleSize && Math.abs(dx) < handleSize) return 'scale-y';
            if (Math.abs(dy - halfH) < handleSize && Math.abs(dx) < handleSize) return 'scale-y';
        }

        return 'none';
    }

    private gameLoop = (): void => {
        if (!this.state.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;

        // Update FPS counter
        this.fpsFrameCount++;
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = this.fpsFrameCount;
            this.state.fps = this.fps;
            this.fpsFrameCount = 0;
            this.fpsUpdateTime = currentTime;
        }

        if (!this.state.isPaused) {
            this.frameCount++;
            this.state.frameCount = this.frameCount;
            this.update(deltaTime);
        }

        this.render();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    };

    private update(deltaTime: number): void {
        // Placeholder update logic - can be extended for game objects
    }

    render(): void {
        if (!this.ctx || !this.config) return;

        const { width, height, backgroundColor = '#1a1a1a', showGrid = true } = this.config;

        // Clear canvas
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, width, height);

        // Draw grid if enabled
        if (showGrid) {
            this.drawGrid(width, height);
        }

        // Draw scene objects
        this.drawObjects(width, height);

        // Draw origin marker
        this.drawOriginMarker(width, height);

        // Draw gizmo for selected object
        if (this.selectedObjectId !== null && this.activeTool !== 'select') {
            this.drawGizmo();
        }

        // Draw running indicator if game is running
        if (this.state.isRunning && !this.state.isPaused) {
            this.drawRunningIndicator(width, height);
        }
    }

    /**
     * @zh 绘制变换 Gizmo
     * @en Draw transform gizmo
     */
    private drawGizmo(): void {
        if (!this.ctx) return;

        const selectedObj = this.objects.find(o => o.id === this.selectedObjectId);
        if (!selectedObj) return;

        const screen = this.worldToScreen(selectedObj.x, selectedObj.y);

        this.ctx.save();
        this.ctx.translate(screen.x, screen.y);

        switch (this.activeTool) {
            case 'move':
                this.drawMoveGizmo();
                break;
            case 'rotate':
                this.drawRotateGizmo();
                break;
            case 'scale':
                this.drawScaleGizmo(selectedObj);
                break;
        }

        this.ctx.restore();
    }

    /**
     * @zh 绘制移动 Gizmo
     * @en Draw move gizmo with X/Y axis arrows
     */
    private drawMoveGizmo(): void {
        if (!this.ctx) return;

        const axisLength = this.GIZMO_AXIS_LENGTH;
        const arrowSize = this.GIZMO_ARROW_SIZE;

        // X axis (red) - pointing right
        this.ctx.strokeStyle = '#ff4444';
        this.ctx.fillStyle = '#ff4444';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(axisLength, 0);
        this.ctx.stroke();

        // X arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(axisLength + arrowSize, 0);
        this.ctx.lineTo(axisLength - 4, -6);
        this.ctx.lineTo(axisLength - 4, 6);
        this.ctx.closePath();
        this.ctx.fill();

        // X label
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.fillText('X', axisLength + arrowSize + 4, 4);

        // Y axis (green) - pointing up (negative screen Y)
        this.ctx.strokeStyle = '#44ff44';
        this.ctx.fillStyle = '#44ff44';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -axisLength);
        this.ctx.stroke();

        // Y arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(0, -(axisLength + arrowSize));
        this.ctx.lineTo(-6, -(axisLength - 4));
        this.ctx.lineTo(6, -(axisLength - 4));
        this.ctx.closePath();
        this.ctx.fill();

        // Y label
        this.ctx.fillText('Y', 4, -(axisLength + arrowSize + 4));

        // Center XY handle (yellow square)
        this.ctx.fillStyle = '#ffff44';
        this.ctx.strokeStyle = '#cccc00';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(-8, -8, 16, 16);
        this.ctx.strokeRect(-8, -8, 16, 16);
    }

    /**
     * @zh 绘制旋转 Gizmo
     * @en Draw rotate gizmo with rotation circle
     */
    private drawRotateGizmo(): void {
        if (!this.ctx) return;

        const radius = this.GIZMO_ROTATE_RADIUS;

        // Draw rotation circle
        this.ctx.strokeStyle = '#4a9eff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Draw rotation handle at 0 degrees (right side)
        this.ctx.fillStyle = '#4a9eff';
        this.ctx.beginPath();
        this.ctx.arc(radius, 0, 8, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw angle indicator lines
        this.ctx.strokeStyle = 'rgba(74, 158, 255, 0.3)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            this.ctx.stroke();
        }

        // Center dot
        this.ctx.fillStyle = '#4a9eff';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * @zh 绘制缩放 Gizmo
     * @en Draw scale gizmo with scale handles
     */
    private drawScaleGizmo(obj: SceneObject): void {
        if (!this.ctx) return;

        const halfW = obj.width / 2;
        const halfH = obj.height / 2;
        const handleSize = this.GIZMO_HANDLE_SIZE;

        // Draw bounding box
        this.ctx.strokeStyle = '#ffaa00';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 3]);
        this.ctx.strokeRect(-halfW, -halfH, obj.width, obj.height);
        this.ctx.setLineDash([]);

        // Corner handles (scale XY) - yellow
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.fillRect(-halfW - handleSize / 2, -halfH - handleSize / 2, handleSize, handleSize);
        this.ctx.fillRect(halfW - handleSize / 2, -halfH - handleSize / 2, handleSize, handleSize);
        this.ctx.fillRect(-halfW - handleSize / 2, halfH - handleSize / 2, handleSize, handleSize);
        this.ctx.fillRect(halfW - handleSize / 2, halfH - handleSize / 2, handleSize, handleSize);

        // Edge handles
        // X handles (left/right) - red
        this.ctx.fillStyle = '#ff4444';
        this.ctx.fillRect(-halfW - handleSize / 2, -handleSize / 2, handleSize, handleSize);
        this.ctx.fillRect(halfW - handleSize / 2, -handleSize / 2, handleSize, handleSize);

        // Y handles (top/bottom) - green
        this.ctx.fillStyle = '#44ff44';
        this.ctx.fillRect(-handleSize / 2, -halfH - handleSize / 2, handleSize, handleSize);
        this.ctx.fillRect(-handleSize / 2, halfH - handleSize / 2, handleSize, handleSize);

        // Center handle
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
        this.ctx.fill();
    }

    private drawObjects(width: number, height: number): void {
        if (!this.ctx) return;

        const centerX = width / 2;
        const centerY = height / 2;

        for (const obj of this.objects) {
            this.ctx.save();

            // Transform to world coordinates (centered)
            const screenX = centerX + obj.x;
            const screenY = centerY - obj.y; // Y is inverted for screen coordinates

            this.ctx.translate(screenX, screenY);
            this.ctx.rotate(-obj.rotation * Math.PI / 180);

            // Draw the object
            switch (obj.type) {
                case 'box':
                    this.drawBox(obj);
                    break;
                case 'circle':
                    this.drawCircle(obj);
                    break;
                case 'sprite':
                    this.drawSprite(obj);
                    break;
            }

            // Draw selection outline
            if (obj.selected) {
                this.drawSelectionOutline(obj);
            }

            this.ctx.restore();
        }
    }

    private drawBox(obj: SceneObject): void {
        if (!this.ctx) return;

        const halfW = obj.width / 2;
        const halfH = obj.height / 2;

        this.ctx.fillStyle = obj.color;
        this.ctx.fillRect(-halfW, -halfH, obj.width, obj.height);

        // Draw border
        this.ctx.strokeStyle = this.adjustBrightness(obj.color, -30);
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-halfW, -halfH, obj.width, obj.height);
    }

    private drawCircle(obj: SceneObject): void {
        if (!this.ctx) return;

        const radius = Math.min(obj.width, obj.height) / 2;

        this.ctx.fillStyle = obj.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw border
        this.ctx.strokeStyle = this.adjustBrightness(obj.color, -30);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    private drawSprite(obj: SceneObject): void {
        if (!this.ctx) return;

        const halfW = obj.width / 2;
        const halfH = obj.height / 2;

        // Draw sprite placeholder (checkerboard pattern)
        const checkSize = 10;
        for (let y = -halfH; y < halfH; y += checkSize) {
            for (let x = -halfW; x < halfW; x += checkSize) {
                const isWhite = ((Math.floor((x + halfW) / checkSize) + Math.floor((y + halfH) / checkSize)) % 2 === 0);
                this.ctx.fillStyle = isWhite ? '#555' : '#333';
                this.ctx.fillRect(x, y, checkSize, checkSize);
            }
        }

        // Draw border
        this.ctx.strokeStyle = obj.color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-halfW, -halfH, obj.width, obj.height);

        // Draw sprite icon
        this.ctx.fillStyle = obj.color;
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Sprite', 0, 0);
    }

    private drawSelectionOutline(obj: SceneObject): void {
        if (!this.ctx) return;

        const halfW = obj.width / 2 + 4;
        const halfH = obj.height / 2 + 4;

        // Draw selection box
        this.ctx.strokeStyle = '#4a9eff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 3]);
        this.ctx.strokeRect(-halfW, -halfH, halfW * 2, halfH * 2);
        this.ctx.setLineDash([]);

        // Draw corner handles
        const handleSize = 6;
        this.ctx.fillStyle = '#4a9eff';

        // Draw corner handles
        this.ctx.fillRect(-halfW - handleSize / 2, -halfH - handleSize / 2, handleSize, handleSize);
        this.ctx.fillRect(halfW - handleSize / 2, -halfH - handleSize / 2, handleSize, handleSize);
        this.ctx.fillRect(-halfW - handleSize / 2, halfH - handleSize / 2, handleSize, handleSize);
        this.ctx.fillRect(halfW - handleSize / 2, halfH - handleSize / 2, handleSize, handleSize);
    }

    private adjustBrightness(color: string, amount: number): string {
        // Simple brightness adjustment for hex colors
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    private drawGrid(width: number, height: number): void {
        if (!this.ctx) return;

        const gridSize = 50;
        this.ctx.strokeStyle = '#2a2a2a';
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }

        // Center lines (thicker)
        this.ctx.strokeStyle = '#3a3a3a';
        this.ctx.lineWidth = 2;

        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);

        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 0);
        this.ctx.lineTo(centerX, height);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(0, centerY);
        this.ctx.lineTo(width, centerY);
        this.ctx.stroke();
    }

    private drawOriginMarker(width: number, height: number): void {
        if (!this.ctx) return;

        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);

        // Draw origin circle
        this.ctx.fillStyle = '#4a9eff';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw coordinate axes
        const axisLength = 40;

        // X axis (red)
        this.ctx.strokeStyle = '#ff4444';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX + axisLength, centerY);
        this.ctx.stroke();

        // Y axis (green) - pointing up
        this.ctx.strokeStyle = '#44ff44';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX, centerY - axisLength);
        this.ctx.stroke();
    }

    private drawRunningIndicator(width: number, height: number): void {
        if (!this.ctx) return;

        // Draw FPS counter
        this.ctx.fillStyle = '#4a9eff';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
        this.ctx.fillText(`Frame: ${this.frameCount}`, 10, 36);

        // Draw animated circle to show game is running
        const time = performance.now() / 1000;
        const pulseSize = 8 + Math.sin(time * 4) * 3;

        this.ctx.fillStyle = '#44ff44';
        this.ctx.beginPath();
        this.ctx.arc(width - 20, 20, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

// Singleton instance
let engineService: IEngineService | null = null;

export function getEngineService(): IEngineService {
    if (!engineService) {
        engineService = new PlaceholderEngineService();
    }
    return engineService;
}

export function setEngineService(service: IEngineService): void {
    if (engineService) {
        engineService.destroy();
    }
    engineService = service;
}

/**
 * Future ccesengine integration example:
 *
 * import { game, Game, director } from 'ccesengine';
 *
 * export class CCESEngineService implements IEngineService {
 *     async init(config: EngineConfig): Promise<void> {
 *         // Set the canvas for ccesengine
 *         await game.init({
 *             overrideSettings: {
 *                 rendering: {
 *                     renderMode: 2, // WebGL
 *                 }
 *             }
 *         });
 *         game.canvas = config.canvas;
 *         game.run();
 *     }
 *
 *     // ... implement other methods
 * }
 */
