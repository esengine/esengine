/**
 * 点击特效系统 - 处理点击输入并生成粒子效果
 * Click FX System - Handles click input and spawns particle effects
 *
 * 监听用户点击/触摸事件，在点击位置创建粒子效果实体。
 * Listens for user click/touch events and creates particle effect entities at click position.
 */

import { EntitySystem, Matcher, Entity, ECSSystem, PluginServiceRegistry, createServiceToken } from '@esengine/ecs-framework';
import { Input, MouseButton, TransformComponent, SortingLayers } from '@esengine/engine-core';
import { ClickFxComponent, ClickFxTriggerMode } from '../ClickFxComponent';
import { ParticleSystemComponent, RenderSpace } from '../ParticleSystemComponent';

import { CoordinateServiceToken, type ICoordinateService } from '@esengine/ecs-engine-bindgen';

// ============================================================================
// 本地服务令牌定义 | Local Service Token Definitions
// ============================================================================

/**
 * EngineRenderSystem 接口（最小定义，用于获取 UI Canvas 尺寸）
 * EngineRenderSystem interface (minimal definition for getting UI canvas size)
 */
interface IEngineRenderSystem {
    getUICanvasSize(): { width: number; height: number };
}

// RenderSystem 令牌（与 ecs-engine-bindgen 中的一致）
// RenderSystem token (consistent with ecs-engine-bindgen)
const RenderSystemToken = createServiceToken<IEngineRenderSystem>('renderSystem');

/**
 * 点击特效系统
 * Click FX System
 *
 * @example
 * ```typescript
 * // 在场景中添加系统
 * scene.addSystem(new ClickFxSystem());
 *
 * // 创建带有 ClickFxComponent 的实体
 * const clickFxEntity = scene.createEntity('ClickFx');
 * const clickFx = clickFxEntity.addComponent(new ClickFxComponent());
 * clickFx.particleAssets = ['particle-guid-1', 'particle-guid-2'];
 * ```
 */
@ECSSystem('ClickFx', { updateOrder: 100 })
export class ClickFxSystem extends EntitySystem {
    private _coordinateService: ICoordinateService | null = null;
    private _renderSystem: IEngineRenderSystem | null = null;
    private _entitiesToDestroy: Entity[] = [];
    private _canvas: HTMLCanvasElement | null = null;

    constructor() {
        super(Matcher.empty().all(ClickFxComponent));
    }

    /**
     * 设置服务注册表（用于获取 CoordinateService 和 RenderSystem）
     * Set service registry (for getting CoordinateService and RenderSystem)
     */
    setServiceRegistry(services: PluginServiceRegistry): void {
        this._coordinateService = services.get(CoordinateServiceToken) ?? null;
        this._renderSystem = services.get(RenderSystemToken) ?? null;
    }

    /**
     * 设置坐标服务（直接注入）
     * Set coordinate service (direct injection)
     */
    setCoordinateService(coordinateService: ICoordinateService): void {
        this._coordinateService = coordinateService;
    }

    /**
     * 设置 RenderSystem（直接注入）
     * Set RenderSystem (direct injection)
     */
    setRenderSystem(renderSystem: IEngineRenderSystem): void {
        this._renderSystem = renderSystem;
    }

    /**
     * 设置 Canvas 元素（用于计算相对坐标）
     * Set canvas element (for calculating relative coordinates)
     */
    setCanvas(canvas: HTMLCanvasElement): void {
        this._canvas = canvas;
    }

    /**
     * 检查是否应该处理
     * Check if should process
     *
     * 只在运行时模式（非编辑器模式）下处理点击事件
     * Only process click events in runtime mode (not editor mode)
     */
    protected override onCheckProcessing(): boolean {
        // 编辑器模式下不处理（预览时也不处理，只有 Play 模式才处理）
        // Don't process in editor mode (including preview, only in Play mode)
        if (this.scene?.isEditorMode) {
            return false;
        }
        return super.onCheckProcessing();
    }

    protected override process(entities: readonly Entity[]): void {
        // 处理延迟销毁 | Process delayed destruction
        if (this._entitiesToDestroy.length > 0 && this.scene) {
            this.scene.destroyEntities(this._entitiesToDestroy);
            this._entitiesToDestroy = [];
        }

        for (const entity of entities) {
            const clickFx = entity.getComponent(ClickFxComponent);
            if (!clickFx || !clickFx.fxEnabled) continue;

            // 清理过期的特效 | Clean up expired effects
            this._cleanupExpiredEffects(clickFx);

            // 检查触发条件 | Check trigger conditions
            const triggered = this._checkTrigger(clickFx);
            if (!triggered) continue;

            // 检查是否可以添加新特效 | Check if can add new effect
            if (!clickFx.canAddEffect()) continue;

            // 获取点击/触摸位置 | Get click/touch position
            const screenPos = this._getInputPosition(clickFx);
            if (!screenPos) continue;

            // 转换为 canvas 相对坐标 | Convert to canvas-relative coordinates
            const canvasPos = this._windowToCanvas(screenPos.x, screenPos.y);

            // 应用偏移 | Apply offset
            canvasPos.x += clickFx.positionOffset.x;
            canvasPos.y += clickFx.positionOffset.y;

            // 创建粒子效果（使用屏幕空间坐标）
            // Create particle effect (using screen space coordinates)
            this._spawnEffect(clickFx, canvasPos.x, canvasPos.y);
        }
    }

    /**
     * 窗口坐标转 canvas 相对坐标
     * Window to canvas-relative coordinate conversion
     *
     * 将窗口坐标转换为 UI Canvas 的像素坐标。
     * Converts window coordinates to UI canvas pixel coordinates.
     */
    private _windowToCanvas(windowX: number, windowY: number): { x: number; y: number } {
        // 获取 UI Canvas 尺寸 | Get UI canvas size
        const canvasSize = this._renderSystem?.getUICanvasSize();
        const uiCanvasWidth = canvasSize?.width ?? 1920;
        const uiCanvasHeight = canvasSize?.height ?? 1080;

        let canvasX = windowX;
        let canvasY = windowY;

        if (this._canvas) {
            const rect = this._canvas.getBoundingClientRect();
            // 计算 CSS 坐标 | Calculate CSS coordinates
            canvasX = windowX - rect.left;
            canvasY = windowY - rect.top;

            // 将 CSS 坐标映射到 UI Canvas 坐标
            // Map CSS coordinates to UI canvas coordinates
            // UI Canvas 保持宽高比，可能会有 letterbox/pillarbox
            // UI Canvas maintains aspect ratio, may have letterbox/pillarbox
            const cssWidth = rect.width;
            const cssHeight = rect.height;

            // 计算 UI Canvas 在 CSS 坐标中的实际显示区域
            // Calculate actual display area of UI Canvas in CSS coordinates
            const uiAspect = uiCanvasWidth / uiCanvasHeight;
            const cssAspect = cssWidth / cssHeight;

            let displayWidth: number;
            let displayHeight: number;
            let offsetX = 0;
            let offsetY = 0;

            if (cssAspect > uiAspect) {
                // CSS 更宽，pillarbox（左右黑边）
                // CSS is wider, pillarbox (black bars on sides)
                displayHeight = cssHeight;
                displayWidth = cssHeight * uiAspect;
                offsetX = (cssWidth - displayWidth) / 2;
            } else {
                // CSS 更高，letterbox（上下黑边）
                // CSS is taller, letterbox (black bars on top/bottom)
                displayWidth = cssWidth;
                displayHeight = cssWidth / uiAspect;
                offsetY = (cssHeight - displayHeight) / 2;
            }

            // 转换为 UI Canvas 坐标
            // Convert to UI canvas coordinates
            canvasX = ((canvasX - offsetX) / displayWidth) * uiCanvasWidth;
            canvasY = ((canvasY - offsetY) / displayHeight) * uiCanvasHeight;
        }

        return { x: canvasX, y: canvasY };
    }

    /**
     * 检查触发条件
     * Check trigger conditions
     */
    private _checkTrigger(clickFx: ClickFxComponent): boolean {
        const mode = clickFx.triggerMode;

        // 首先检查鼠标是否在 Canvas 内
        // First check if mouse is within canvas bounds
        if (!this._isMouseInCanvas()) {
            return false;
        }

        switch (mode) {
            case ClickFxTriggerMode.LeftClick:
                return Input.isMouseButtonJustPressed(MouseButton.Left);

            case ClickFxTriggerMode.RightClick:
                return Input.isMouseButtonJustPressed(MouseButton.Right);

            case ClickFxTriggerMode.AnyClick:
                return Input.isMouseButtonJustPressed(MouseButton.Left) ||
                       Input.isMouseButtonJustPressed(MouseButton.Middle) ||
                       Input.isMouseButtonJustPressed(MouseButton.Right);

            case ClickFxTriggerMode.Touch:
                return this._checkTouchStart();

            case ClickFxTriggerMode.All:
                return Input.isMouseButtonJustPressed(MouseButton.Left) ||
                       Input.isMouseButtonJustPressed(MouseButton.Middle) ||
                       Input.isMouseButtonJustPressed(MouseButton.Right) ||
                       this._checkTouchStart();

            default:
                return false;
        }
    }

    /**
     * 检查鼠标是否在 Canvas 内
     * Check if mouse is within canvas bounds
     */
    private _isMouseInCanvas(): boolean {
        if (!this._canvas) {
            return true; // 没有 canvas 引用时，默认允许（兼容旧行为）
        }

        const rect = this._canvas.getBoundingClientRect();
        const mouseX = Input.mousePosition.x;
        const mouseY = Input.mousePosition.y;

        // 检查鼠标是否在 canvas 边界内
        // Check if mouse is within canvas bounds
        return mouseX >= rect.left &&
               mouseX <= rect.right &&
               mouseY >= rect.top &&
               mouseY <= rect.bottom;
    }

    /**
     * 检查是否有新的触摸开始
     * Check if there's a new touch start
     */
    private _checkTouchStart(): boolean {
        for (const [id] of Input.touches) {
            if (Input.isTouchJustStarted(id)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 获取输入位置
     * Get input position
     */
    private _getInputPosition(clickFx: ClickFxComponent): { x: number; y: number } | null {
        const mode = clickFx.triggerMode;

        // 优先检查触摸 | Check touch first
        if (mode === ClickFxTriggerMode.Touch || mode === ClickFxTriggerMode.All) {
            for (const [id, touch] of Input.touches) {
                if (Input.isTouchJustStarted(id)) {
                    return { x: touch.x, y: touch.y };
                }
            }
        }

        // 检查鼠标 | Check mouse
        if (mode !== ClickFxTriggerMode.Touch) {
            return { x: Input.mousePosition.x, y: Input.mousePosition.y };
        }

        return null;
    }

    /**
     * 生成粒子效果
     * Spawn particle effect
     *
     * 点击特效使用屏幕空间渲染，坐标相对于 UI Canvas 中心。
     * Click effects use screen space rendering, coordinates relative to UI canvas center.
     */
    private _spawnEffect(clickFx: ClickFxComponent, screenX: number, screenY: number): void {
        const particleGuid = clickFx.getNextParticleAsset();
        if (!particleGuid) {
            console.warn('[ClickFxSystem] No particle assets configured');
            return;
        }

        if (!this.scene) {
            console.warn('[ClickFxSystem] No scene available');
            return;
        }

        // 获取 UI Canvas 尺寸 | Get UI canvas size
        const canvasSize = this._renderSystem?.getUICanvasSize();
        const canvasWidth = canvasSize?.width ?? 1920;
        const canvasHeight = canvasSize?.height ?? 1080;

        // 将屏幕坐标转换为屏幕空间坐标（相对于 UI Canvas 中心）
        // Convert screen coords to screen space coords (relative to UI canvas center)
        // 屏幕空间坐标系：中心为 (0, 0)，Y 轴向上
        // Screen space coordinate system: center at (0, 0), Y-axis up
        const screenSpaceX = screenX - canvasWidth / 2;
        const screenSpaceY = canvasHeight / 2 - screenY;  // Y 翻转

        // 创建特效实体 | Create effect entity
        const effectEntity = this.scene.createEntity(`ClickFx_${Date.now()}`);

        // 添加 Transform（使用屏幕空间坐标）| Add Transform (using screen space coords)
        const transform = effectEntity.addComponent(new TransformComponent(screenSpaceX, screenSpaceY));
        transform.setScale(clickFx.scale, clickFx.scale, 1);

        // 创建 ParticleSystemComponent 并预先设置 GUID（在添加到实体前）
        // Create ParticleSystemComponent and set GUID before adding to entity
        // 这样 ParticleUpdateSystem.onAdded 触发时已经有 GUID 了
        // So ParticleUpdateSystem.onAdded has the GUID when triggered
        const particleSystem = new ParticleSystemComponent();
        particleSystem.particleAssetGuid = particleGuid;
        particleSystem.autoPlay = true;
        // 使用 ScreenOverlay 层和屏幕空间渲染
        // Use ScreenOverlay layer and screen space rendering
        particleSystem.sortingLayer = SortingLayers.ScreenOverlay;
        particleSystem.orderInLayer = 0;
        particleSystem.renderSpace = RenderSpace.Screen;

        // 添加组件到实体（触发 ParticleUpdateSystem 的初始化和资产加载）
        // Add component to entity (triggers ParticleUpdateSystem initialization and asset loading)
        effectEntity.addComponent(particleSystem);

        // 记录活跃特效 | Record active effect
        clickFx.addActiveEffect(effectEntity.id);
    }

    /**
     * 清理过期的特效
     * Clean up expired effects
     */
    private _cleanupExpiredEffects(clickFx: ClickFxComponent): void {
        if (!this.scene) return;

        const now = Date.now();
        const lifetimeMs = clickFx.effectLifetime * 1000;
        const effectsToRemove: number[] = [];

        for (const effect of clickFx.getActiveEffects()) {
            const age = now - effect.startTime;

            if (age >= lifetimeMs) {
                // 标记为需要移除 | Mark for removal
                effectsToRemove.push(effect.entityId);

                // 查找并销毁实体 | Find and destroy entity
                const entity = this.scene.findEntityById(effect.entityId);
                if (entity) {
                    // 停止粒子系统 | Stop particle system
                    const particleSystem = entity.getComponent(ParticleSystemComponent);
                    if (particleSystem) {
                        particleSystem.stop(true);
                    }

                    // 添加到销毁队列 | Add to destroy queue
                    this._entitiesToDestroy.push(entity);
                }
            }
        }

        // 从记录中移除 | Remove from records
        for (const entityId of effectsToRemove) {
            clickFx.removeActiveEffect(entityId);
        }
    }

    protected override onDestroy(): void {
        // 清理所有特效 | Clean up all effects
        if (this.scene) {
            const entities = this.scene.entities.buffer;
            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                const clickFx = entity.getComponent(ClickFxComponent);
                if (clickFx) {
                    for (const effect of clickFx.getActiveEffects()) {
                        const effectEntity = this.scene.findEntityById(effect.entityId);
                        if (effectEntity) {
                            this._entitiesToDestroy.push(effectEntity);
                        }
                    }
                    clickFx.clearActiveEffects();
                }
            }

            // 立即销毁 | Destroy immediately
            if (this._entitiesToDestroy.length > 0) {
                this.scene.destroyEntities(this._entitiesToDestroy);
                this._entitiesToDestroy = [];
            }
        }
    }
}
