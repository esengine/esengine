/**
 * Engine Service - Abstraction layer for game engine integration
 * 引擎服务 - 游戏引擎集成的抽象层
 *
 * This service provides an abstraction layer that can be implemented by different engines.
 * Currently supports a placeholder renderer, but designed for ccesengine integration.
 */

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

        // Draw running indicator if game is running
        if (this.state.isRunning && !this.state.isPaused) {
            this.drawRunningIndicator(width, height);
        }
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
