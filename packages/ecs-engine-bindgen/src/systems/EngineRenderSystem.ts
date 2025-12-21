/**
 * Engine render system for ECS.
 * 用于ECS的引擎渲染系统。
 */

import { CameraComponent } from '@esengine/camera';
import { Component, ComponentType, Core, ECSSystem, Entity, EntitySystem, Matcher } from '@esengine/ecs-framework';
import { Color } from '@esengine/ecs-framework-math';
import { TransformComponent, sortingLayerManager } from '@esengine/engine-core';
import { getMaterialManager } from '@esengine/material-system';
import { SpriteComponent } from '@esengine/sprite';
import type { EngineBridge } from '../core/EngineBridge';
import { RenderBatcher } from '../core/RenderBatcher';
import type { ITransformComponent } from '../core/SpriteRenderHelper';
import type { SpriteRenderData, MaterialOverrides } from '../types';

/**
 * Render data from a provider
 * 提供者的渲染数据
 */
export interface ProviderRenderData {
    transforms: Float32Array;
    textureIds: Uint32Array;
    uvs: Float32Array;
    colors: Uint32Array;
    tileCount: number;
    /**
     * 排序层名称
     * Sorting layer name
     *
     * 决定渲染的大类顺序。默认为 'Default'。
     * Determines the major render order category. Defaults to 'Default'.
     */
    sortingLayer: string;
    /**
     * 层内排序顺序
     * Order within the sorting layer
     */
    orderInLayer: number;
    /** 纹理 GUID（如果 textureId 为 0 则使用）| Texture GUID (used if textureId is 0) */
    textureGuid?: string;
    /**
     * 是否在屏幕空间渲染
     * Whether to render in screen space
     *
     * 覆盖 sortingLayer 的 bScreenSpace 设置，用于粒子等需要动态指定渲染空间的场景。
     * Overrides sortingLayer's bScreenSpace setting, for particles that need dynamic render space.
     */
    bScreenSpace?: boolean;
    /** Material IDs for each primitive. | 每个原语的材质 ID。 */
    materialIds?: Uint32Array;
    /** Material overrides (per-group). | 材质覆盖（按组）。 */
    materialOverrides?: MaterialOverrides;
    /**
     * Clip rectangle for scissor test (screen coordinates).
     * All primitives in this batch will be clipped to this rect.
     * 裁剪矩形用于 scissor test（屏幕坐标）。
     * 此批次中的所有原语将被裁剪到此矩形。
     */
    clipRect?: { x: number; y: number; width: number; height: number };
}

/**
 * Interface for additional render data providers (e.g., tilemap)
 * 额外渲染数据提供者接口（如瓦片地图）
 */
export interface IRenderDataProvider {
    getRenderData(): readonly ProviderRenderData[];
}

/**
 * Mesh render data for arbitrary 2D geometry
 * 任意 2D 几何体的网格渲染数据
 */
export interface MeshRenderData {
    /** Vertex positions [x, y, ...] | 顶点位置 */
    positions: Float32Array;
    /** Texture coordinates [u, v, ...] | 纹理坐标 */
    uvs: Float32Array;
    /** Vertex colors (packed RGBA) | 顶点颜色 */
    colors: Uint32Array;
    /** Triangle indices | 三角形索引 */
    indices: Uint16Array;
    /** Texture ID (0 = white pixel) | 纹理 ID */
    textureId: number;
}

/**
 * Interface for UI render data providers
 * UI 渲染数据提供者接口
 *
 * All UI is rendered in Screen Space with independent orthographic projection.
 * 所有 UI 都在屏幕空间渲染，使用独立的正交投影。
 */
export interface IUIRenderDataProvider extends IRenderDataProvider {
    /** Get UI render data | 获取 UI 渲染数据 */
    getRenderData(): readonly ProviderRenderData[];
    /** Get mesh render data for complex shapes | 获取复杂形状的网格渲染数据 */
    getMeshRenderData?(): readonly MeshRenderData[];
    /** @deprecated Use getRenderData() instead */
    getScreenSpaceRenderData?(): readonly ProviderRenderData[];
    /** @deprecated World space UI is no longer supported */
    getWorldSpaceRenderData?(): readonly ProviderRenderData[];
}

/**
 * Internal gizmo color interface (duck-typed, compatible with editor-core GizmoColor)
 * 内部 gizmo 颜色接口（鸭子类型，与 editor-core GizmoColor 兼容）
 * @internal
 */
interface GizmoColorInternal {
    r: number;
    g: number;
    b: number;
    a: number;
}

/**
 * Internal gizmo render data type (duck-typed, compatible with editor-core types)
 * 内部 gizmo 渲染数据类型（鸭子类型，与 editor-core 类型兼容）
 * @internal
 */
interface GizmoRenderDataInternal {
    type: 'rect' | 'circle' | 'line' | 'grid' | 'capsule';
    color: GizmoColorInternal;
    // Rect specific
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    rotation?: number;
    originX?: number;
    originY?: number;
    showHandles?: boolean;
    // Circle specific
    radius?: number;
    // Line specific
    points?: Array<{ x: number; y: number }>;
    closed?: boolean;
    // Grid specific
    cols?: number;
    rows?: number;
    // Capsule specific
    halfHeight?: number;
}

/**
 * Function type for getting gizmo data from a component.
 * Used to inject GizmoRegistry functionality from editor layer.
 * 从组件获取 gizmo 数据的函数类型。
 * 用于从编辑器层注入 GizmoRegistry 功能。
 */
export type GizmoDataProviderFn = (
    component: Component,
    entity: Entity,
    isSelected: boolean
) => GizmoRenderDataInternal[];

/**
 * Function type for checking if a component has gizmo provider.
 * 检查组件是否有 gizmo 提供者的函数类型。
 */
export type HasGizmoProviderFn = (component: Component) => boolean;

/**
 * Function type for getting highlight color for gizmo.
 * Used to inject GizmoInteractionService functionality from editor layer.
 * 获取 gizmo 高亮颜色的函数类型。
 * 用于从编辑器层注入 GizmoInteractionService 功能。
 */
export type GizmoHighlightColorFn = (
    entityId: number,
    baseColor: GizmoColorInternal,
    isSelected: boolean
) => GizmoColorInternal;

/**
 * Function type for getting hovered entity ID.
 * 获取悬停实体 ID 的函数类型。
 */
export type GetHoveredEntityIdFn = () => number | null;

/**
 * Type for transform component constructor.
 * 变换组件构造函数类型。
 */
export type TransformComponentType = ComponentType & (new (...args: any[]) => Component & ITransformComponent);

/**
 * Asset path resolver function type.
 * 资产路径解析器函数类型。
 *
 * Resolves GUID or path to actual file path for loading.
 * 将 GUID 或路径解析为实际文件路径以进行加载。
 *
 * @param guidOrPath - Asset GUID or path | 资产 GUID 或路径
 * @returns Resolved file path, or original value if cannot resolve | 解析后的文件路径，或无法解析时返回原值
 */
export type AssetPathResolverFn = (guidOrPath: string) => string;

/**
 * Render item for sorting.
 * 用于排序的渲染项。
 * @internal
 */
interface RenderItem {
    sortKey: number;
    addIndex: number;
    /** Start index in batcher | 在批处理器中的起始索引 */
    startIndex: number;
    /** Number of sprites | 精灵数量 */
    count: number;
}

/**
 * ECS System for rendering sprites using the Rust engine.
 * 使用Rust引擎渲染精灵的ECS系统。
 *
 * @example
 * ```typescript
 * const bridge = new EngineBridge({ canvasId: 'canvas' });
 * await bridge.initialize();
 * const renderSystem = new EngineRenderSystem(bridge, Transform);
 * scene.addSystem(renderSystem);
 * ```
 */
@ECSSystem('EngineRender', { updateOrder: 1000 }) // Render system executes last | 渲染系统最后执行
export class EngineRenderSystem extends EntitySystem {
    private bridge: EngineBridge;
    private worldBatcher: RenderBatcher;
    private screenBatcher: RenderBatcher;
    private transformType: TransformComponentType;
    private showGizmos = true;
    private selectedEntityIds: Set<number> = new Set();
    private transformMode: 'select' | 'move' | 'rotate' | 'scale' = 'select';

    // Reusable map to avoid allocation per frame
    // 可重用的映射以避免每帧分配
    private entityRenderMap: Map<number, SpriteRenderData> = new Map();

    // ===== Pre-allocated arrays for render items =====
    // ===== 渲染项的预分配数组 =====
    private worldSpaceItems: RenderItem[] = [];
    private screenSpaceItems: RenderItem[] = [];
    private worldSpaceItemCount = 0;
    private screenSpaceItemCount = 0;

    // Frame counter for dirty tracking
    // 用于脏标记追踪的帧计数器
    private frameNumber = 0;

    // Additional render data providers (e.g., tilemap)
    // 额外的渲染数据提供者（如瓦片地图）
    private renderDataProviders: IRenderDataProvider[] = [];

    // Gizmo registry functions (injected from editor layer)
    // Gizmo 注册表函数（从编辑器层注入）
    private gizmoDataProvider: GizmoDataProviderFn | null = null;
    private hasGizmoProvider: HasGizmoProviderFn | null = null;

    // Gizmo interaction functions (injected from editor layer)
    // Gizmo 交互函数（从编辑器层注入）
    private gizmoHighlightColorFn: GizmoHighlightColorFn | null = null;
    private getHoveredEntityIdFn: GetHoveredEntityIdFn | null = null;

    // UI Canvas boundary settings
    // UI 画布边界设置
    private uiCanvasWidth: number = 0;
    private uiCanvasHeight: number = 0;
    private showUICanvasBoundary: boolean = true;

    // UI render data provider (supports screen space and world space)
    // UI 渲染数据提供者（支持屏幕空间和世界空间）
    private uiRenderDataProvider: IUIRenderDataProvider | null = null;

    // Asset path resolver (injected from editor layer for GUID resolution)
    // 资产路径解析器（从编辑器层注入，用于 GUID 解析）
    private assetPathResolver: AssetPathResolverFn | null = null;

    // Preview mode flag: when true, UI uses screen space overlay projection
    // when false (editor mode), UI renders in world space following editor camera
    // 预览模式标志：为 true 时，UI 使用屏幕空间叠加投影
    // 为 false（编辑器模式）时，UI 在世界空间渲染，跟随编辑器相机
    private previewMode: boolean = false;

    /**
     * Create a new engine render system.
     * 创建新的引擎渲染系统。
     *
     * @param bridge - Engine bridge instance | 引擎桥接实例
     * @param transformType - Transform component class (must implement ITransformComponent) | 变换组件类（必须实现ITransformComponent）
     */
    constructor(bridge: EngineBridge, transformType: TransformComponentType) {
        // Match entities with both Sprite and Transform components
        // 匹配同时具有Sprite和Transform组件的实体
        super(Matcher.empty().all(SpriteComponent, transformType));

        this.bridge = bridge;
        this.worldBatcher = new RenderBatcher();
        this.screenBatcher = new RenderBatcher();
        this.transformType = transformType;
    }

    /**
     * Called when system is initialized.
     * 系统初始化时调用。
     */
    public override initialize(): void {
        super.initialize();
        this.logger.info('EngineRenderSystem initialized | 引擎渲染系统初始化完成');
    }

    /**
     * Called before processing entities.
     * 处理实体之前调用。
     */
    protected override onBegin(): void {
        // Increment frame counter | 递增帧计数器
        this.frameNumber++;

        // Clear the batches | 清空批处理
        this.worldBatcher.clear();
        this.screenBatcher.clear();

        // Reset render item counts (reuse arrays) | 重置渲染项计数（复用数组）
        this.worldSpaceItemCount = 0;
        this.screenSpaceItemCount = 0;

        // Clear screen with dark background | 用深色背景清屏
        this.bridge.clear(0.1, 0.1, 0.12, 1);

        // Update input | 更新输入
        this.bridge.updateInput();
    }

    /**
     * Process all matched entities.
     * 处理所有匹配的实体。
     *
     * Rendering pipeline:
     * 渲染管线：
     *
     * 1. World Space Pass: Background → Default → Foreground → WorldOverlay
     *    世界空间阶段：背景 → 默认 → 前景 → 世界覆盖层
     *
     * 2. Screen Space Pass (Preview Mode Only): UI → ScreenOverlay → Modal
     *    屏幕空间阶段（仅预览模式）：UI → 屏幕覆盖层 → 模态层
     *
     * @param entities - Entities to process | 要处理的实体
     */
    protected override process(entities: readonly Entity[]): void {
        // Clear and reuse map for gizmo drawing
        // 清空并重用映射用于绘制 gizmo
        this.entityRenderMap.clear();

        this.collectEntitySprites(entities);
        this.collectProviderRenderData();
        this.collectUIRenderData();

        this.renderWorldSpace();
        if (this.previewMode && this.screenSpaceItemCount > 0) {
            this.renderScreenSpace();
        }
    }

    /** @internal */
    private addRenderItem(
        items: RenderItem[],
        itemCount: number,
        sortKey: number,
        addIndex: number,
        startIndex: number,
        count: number
    ): number {
        if (itemCount >= items.length) {
            items.push({ sortKey: 0, addIndex: 0, startIndex: 0, count: 0 });
        }
        const item = items[itemCount];
        item.sortKey = sortKey;
        item.addIndex = addIndex;
        item.startIndex = startIndex;
        item.count = count;
        return itemCount + 1;
    }

    /**
     * Collect sprites from matched entities.
     * 收集匹配实体的 sprites。
     */
    private collectEntitySprites(entities: readonly Entity[]): void {
        for (const entity of entities) {
            const sprite = entity.getComponent(SpriteComponent);
            const transform = entity.getComponent(this.transformType) as unknown as ITransformComponent | null;
            if (!sprite || !transform) continue;

            let u0 = sprite.uv[0], v0 = sprite.uv[1], u1 = sprite.uv[2], v1 = sprite.uv[3];
            if (sprite.flipX) { [u0, u1] = [u1, u0]; }
            if (sprite.flipY) { [v0, v1] = [v1, v0]; }

            const pos = transform.worldPosition ?? transform.position;
            const scl = transform.worldScale ?? transform.scale;
            const rot = transform.worldRotation
                ? transform.worldRotation.z
                : (typeof transform.rotation === 'number' ? transform.rotation : transform.rotation.z);

            const color = Color.packHexAlpha(sprite.color, sprite.alpha);

            let textureId = 0;
            const textureSource = sprite.getTextureSource();
            if (textureSource) {
                textureId = this.bridge.getOrLoadTextureByPath(this.resolveAssetPath(textureSource));
            }

            const materialGuidOrPath = sprite.materialGuid;
            const materialPath = materialGuidOrPath ? this.resolveAssetPath(materialGuidOrPath) : materialGuidOrPath;
            const materialId = materialPath ? getMaterialManager().getMaterialIdByPath(materialPath) : 0;

            // Determine if this sprite should render in screen space
            // 确定此精灵是否应在屏幕空间渲染
            const bScreenSpace = this.previewMode && sortingLayerManager.isScreenSpace(sprite.sortingLayer);
            const batcher = bScreenSpace ? this.screenBatcher : this.worldBatcher;

            const startIndex = batcher.count;
            const index = batcher.addSpriteSoA(
                pos.x, pos.y, rot,
                sprite.width * scl.x, sprite.height * scl.y,
                sprite.anchorX, sprite.anchorY,
                textureId, u0, v0, u1, v1, color, materialId
            );

            if (index >= 0 && sprite.hasOverrides()) {
                batcher.setMaterialOverrides(index, sprite.materialOverrides!);
            }

            const sortKey = sortingLayerManager.getSortKey(sprite.sortingLayer, sprite.orderInLayer);
            if (bScreenSpace) {
                this.screenSpaceItemCount = this.addRenderItem(
                    this.screenSpaceItems, this.screenSpaceItemCount,
                    sortKey, this.screenSpaceItemCount, startIndex, 1
                );
            } else {
                this.worldSpaceItemCount = this.addRenderItem(
                    this.worldSpaceItems, this.worldSpaceItemCount,
                    sortKey, this.worldSpaceItemCount, startIndex, 1
                );
            }
        }
    }

    /**
     * Collect render data from providers (tilemap, particle, etc.).
     * 收集渲染数据提供者的数据。
     */
    private collectProviderRenderData(): void {
        for (const provider of this.renderDataProviders) {
            for (const data of provider.getRenderData()) {
                const bScreenSpace = this.previewMode && (data.bScreenSpace ?? sortingLayerManager.isScreenSpace(data.sortingLayer));
                const batcher = bScreenSpace ? this.screenBatcher : this.worldBatcher;

                let textureId = data.textureIds[0] || 0;
                if (textureId === 0 && data.textureGuid) {
                    textureId = this.bridge.getOrLoadTextureByPath(this.resolveAssetPath(data.textureGuid));
                }

                const startIndex = batcher.count;
                const sortKey = sortingLayerManager.getSortKey(data.sortingLayer, data.orderInLayer);

                for (let i = 0; i < data.tileCount; i++) {
                    const tOffset = i * 7;
                    const uvOffset = i * 4;
                    batcher.addSpriteSoA(
                        data.transforms[tOffset], data.transforms[tOffset + 1], data.transforms[tOffset + 2],
                        data.transforms[tOffset + 3], data.transforms[tOffset + 4],
                        data.transforms[tOffset + 5], data.transforms[tOffset + 6],
                        textureId,
                        data.uvs[uvOffset], data.uvs[uvOffset + 1], data.uvs[uvOffset + 2], data.uvs[uvOffset + 3],
                        data.colors[i], data.materialIds?.[i] ?? 0
                    );
                }

                if (bScreenSpace) {
                    this.screenSpaceItemCount = this.addRenderItem(
                        this.screenSpaceItems, this.screenSpaceItemCount,
                        sortKey, this.screenSpaceItemCount, startIndex, data.tileCount
                    );
                } else {
                    this.worldSpaceItemCount = this.addRenderItem(
                        this.worldSpaceItems, this.worldSpaceItemCount,
                        sortKey, this.worldSpaceItemCount, startIndex, data.tileCount
                    );
                }
            }
        }
    }

    /**
     * Collect UI render data.
     * 收集 UI 渲染数据。
     */
    private collectUIRenderData(): void {
        if (!this.uiRenderDataProvider) return;

        const uiRenderData = this.uiRenderDataProvider.getRenderData();

        if ((globalThis as any).__UI_RENDER_DEBUG__) {
            console.log('[EngineRenderSystem] UI render batches:', uiRenderData.map((data, i) => ({
                index: i, orderInLayer: data.orderInLayer, sortingLayer: data.sortingLayer,
                tileCount: data.tileCount,
                sortKey: sortingLayerManager.getSortKey(data.sortingLayer, data.orderInLayer),
                textureIds: Array.from(data.textureIds).slice(0, 3), textureGuid: data.textureGuid
            })));
        }

        for (const data of uiRenderData) {
            if (data.tileCount === 0) continue;

            // UI goes to screen space in preview mode, world space in editor mode
            // UI 在预览模式下进入屏幕空间，在编辑器模式下进入世界空间
            const bScreenSpace = this.previewMode;
            const batcher = bScreenSpace ? this.screenBatcher : this.worldBatcher;

            let textureId = data.textureIds[0] || 0;
            if (textureId === 0 && data.textureGuid) {
                textureId = this.bridge.getOrLoadTextureByPath(this.resolveAssetPath(data.textureGuid));
            }

            const startIndex = batcher.count;
            const sortKey = sortingLayerManager.getSortKey(data.sortingLayer, data.orderInLayer);

            for (let i = 0; i < data.tileCount; i++) {
                const tOffset = i * 7;
                const uvOffset = i * 4;
                const index = batcher.addSpriteSoA(
                    data.transforms[tOffset], data.transforms[tOffset + 1], data.transforms[tOffset + 2],
                    data.transforms[tOffset + 3], data.transforms[tOffset + 4],
                    data.transforms[tOffset + 5], data.transforms[tOffset + 6],
                    textureId,
                    data.uvs[uvOffset], data.uvs[uvOffset + 1], data.uvs[uvOffset + 2], data.uvs[uvOffset + 3],
                    data.colors[i], data.materialIds?.[i] ?? 0
                );

                if (index >= 0) {
                    if (data.clipRect) batcher.setClipRect(index, data.clipRect);
                    if (data.materialOverrides) batcher.setMaterialOverrides(index, data.materialOverrides);
                }
            }

            if (bScreenSpace) {
                this.screenSpaceItemCount = this.addRenderItem(
                    this.screenSpaceItems, this.screenSpaceItemCount,
                    sortKey, this.screenSpaceItemCount, startIndex, data.tileCount
                );
            } else {
                this.worldSpaceItemCount = this.addRenderItem(
                    this.worldSpaceItems, this.worldSpaceItemCount,
                    sortKey, this.worldSpaceItemCount, startIndex, data.tileCount
                );
            }
        }

        // Collect mesh render data for complex shapes (ellipses, polygons, etc.)
        // 收集复杂形状（椭圆、多边形等）的网格渲染数据
        if (this.uiRenderDataProvider.getMeshRenderData) {
            const meshRenderData = this.uiRenderDataProvider.getMeshRenderData();
            if (meshRenderData.length > 0) {
                console.log(`[EngineRenderSystem] Submitting ${meshRenderData.length} mesh batches`);
            }
            for (const mesh of meshRenderData) {
                if (mesh.positions.length === 0) continue;

                console.log('[EngineRenderSystem] Mesh batch:', {
                    vertices: mesh.positions.length / 2,
                    indices: mesh.indices.length,
                    textureId: mesh.textureId
                });

                // Submit mesh data directly to the engine
                // 直接将网格数据提交到引擎
                this.bridge.submitMeshBatch(
                    mesh.positions,
                    mesh.uvs,
                    mesh.colors,
                    mesh.indices,
                    mesh.textureId
                );
            }
        }
    }

    /**
     * Render world space content.
     * 渲染世界空间内容。
     */
    private renderWorldSpace(): void {
        const items = this.worldSpaceItems;
        const count = this.worldSpaceItemCount;

        // Sort by sortKey, use addIndex for stable sorting
        if (count > 1) {
            for (let i = 0; i < count - 1; i++) {
                for (let j = i + 1; j < count; j++) {
                    const a = items[i], b = items[j];
                    const diff = a.sortKey - b.sortKey;
                    if (diff > 0 || (diff === 0 && a.addIndex > b.addIndex)) {
                        items[i] = b;
                        items[j] = a;
                    }
                }
            }
        }

        if (!this.worldBatcher.isEmpty) {
            const buffers = this.worldBatcher.getBuffers();
            this.bridge.submitSprites(
                buffers.transforms, buffers.textureIds, buffers.uvs,
                buffers.colors, buffers.materialIds, buffers.count
            );
        }

        if (this.showGizmos) {
            this.drawComponentGizmos();
            if (this.selectedEntityIds.size > 0) this.drawSelectedEntityGizmos();
            this.drawCameraFrustums();
            if (this.showUICanvasBoundary && this.uiCanvasWidth > 0 && this.uiCanvasHeight > 0) {
                this.drawUICanvasBoundary();
            }
        }

        this.bridge.render();
    }

    /**
     * Render screen space content (UI overlay).
     * 渲染屏幕空间内容（UI 叠加层）。
     */
    private renderScreenSpace(): void {
        const items = this.screenSpaceItems;
        const count = this.screenSpaceItemCount;

        if (count > 1) {
            for (let i = 0; i < count - 1; i++) {
                for (let j = i + 1; j < count; j++) {
                    const a = items[i], b = items[j];
                    const diff = a.sortKey - b.sortKey;
                    if (diff > 0 || (diff === 0 && a.addIndex > b.addIndex)) {
                        items[i] = b;
                        items[j] = a;
                    }
                }
            }
        }

        const canvasWidth = this.uiCanvasWidth > 0 ? this.uiCanvasWidth : 1920;
        const canvasHeight = this.uiCanvasHeight > 0 ? this.uiCanvasHeight : 1080;
        this.bridge.pushScreenSpaceMode(canvasWidth, canvasHeight);

        if (!this.screenBatcher.isEmpty) {
            const buffers = this.screenBatcher.getBuffers();
            this.bridge.submitSprites(
                buffers.transforms, buffers.textureIds, buffers.uvs,
                buffers.colors, buffers.materialIds, buffers.count
            );
            this.bridge.renderOverlay();
        }

        this.bridge.clearScissorRect();
        this.bridge.popScreenSpaceMode();
    }
    /**
     * Draw gizmos from components that have registered gizmo providers.
     * 绘制已注册 gizmo 提供者的组件的 gizmo。
     */
    private drawComponentGizmos(): void {
        const scene = Core.scene;
        if (!scene || !this.gizmoDataProvider || !this.hasGizmoProvider) return;

        // Get hovered entity ID for highlight
        // 获取悬停的实体 ID 用于高亮
        const hoveredEntityId = this.getHoveredEntityIdFn?.() ?? null;

        // Iterate all entities in the scene
        // 遍历场景中的所有实体
        for (const entity of scene.entities.buffer) {
            const isSelected = this.selectedEntityIds.has(entity.id);
            const isHovered = entity.id === hoveredEntityId;

            // Check each component for gizmo provider
            // 检查每个组件是否有 gizmo 提供者
            for (const component of entity.components) {
                if (this.hasGizmoProvider(component)) {
                    try {
                        const gizmoDataArray = this.gizmoDataProvider(component, entity, isSelected);
                        for (const gizmoData of gizmoDataArray) {
                            // Apply hover highlight color if applicable
                            // 如果适用，应用悬停高亮颜色
                            if (isHovered && this.gizmoHighlightColorFn) {
                                gizmoData.color = this.gizmoHighlightColorFn(
                                    entity.id,
                                    gizmoData.color,
                                    isSelected
                                );
                            }
                            this.renderGizmoData(gizmoData);
                        }
                    } catch (e) {
                        // Silently ignore errors from gizmo providers
                        // 静默忽略 gizmo 提供者的错误
                    }
                }
            }
        }
    }

    /**
     * Render a single gizmo data item.
     * 渲染单个 gizmo 数据项。
     */
    private renderGizmoData(data: GizmoRenderDataInternal): void {
        const { r, g, b, a } = data.color;

        switch (data.type) {
            case 'rect':
                if (data.x !== undefined && data.y !== undefined &&
                    data.width !== undefined && data.height !== undefined) {
                    this.bridge.addGizmoRect(
                        data.x,
                        data.y,
                        data.width,
                        data.height,
                        data.rotation ?? 0,
                        data.originX ?? 0.5,
                        data.originY ?? 0.5,
                        r, g, b, a,
                        data.showHandles ?? false
                    );
                }
                break;

            case 'grid':
                if (data.x !== undefined && data.y !== undefined &&
                    data.width !== undefined && data.height !== undefined &&
                    data.cols !== undefined && data.rows !== undefined) {
                    this.renderGridGizmo(data.x, data.y, data.width, data.height, data.cols, data.rows, r, g, b, a);
                }
                break;

            case 'line':
                if (data.points && data.points.length >= 2) {
                    const flatPoints: number[] = [];
                    for (const p of data.points) {
                        flatPoints.push(p.x, p.y);
                    }
                    this.bridge.addGizmoLine(flatPoints, r, g, b, a, data.closed ?? false);
                }
                break;

            case 'circle':
                if (data.x !== undefined && data.y !== undefined && data.radius !== undefined) {
                    this.bridge.addGizmoCircle(data.x, data.y, data.radius, r, g, b, a);
                }
                break;

            case 'capsule':
                if (data.x !== undefined && data.y !== undefined &&
                    data.radius !== undefined && data.halfHeight !== undefined) {
                    this.bridge.addGizmoCapsule(
                        data.x,
                        data.y,
                        data.radius,
                        data.halfHeight,
                        data.rotation ?? 0,
                        r, g, b, a
                    );
                }
                break;
        }
    }

    /**
     * Render a grid gizmo using line segments.
     * 使用线段渲染网格 gizmo。
     */
    private renderGridGizmo(
        x: number, y: number, width: number, height: number,
        cols: number, rows: number,
        r: number, g: number, b: number, a: number
    ): void {
        const cellWidth = width / cols;
        const cellHeight = height / rows;
        const lineThickness = 1;

        // Vertical lines | 垂直线
        for (let col = 0; col <= cols; col++) {
            const lineX = x + col * cellWidth;
            this.bridge.addGizmoRect(
                lineX, y + height / 2,
                lineThickness, height,
                0, 0.5, 0.5,
                r, g, b, a,
                false
            );
        }

        // Horizontal lines | 水平线
        for (let row = 0; row <= rows; row++) {
            const lineY = y + row * cellHeight;
            this.bridge.addGizmoRect(
                x + width / 2, lineY,
                width, lineThickness,
                0, 0.5, 0.5,
                r, g, b, a,
                false
            );
        }
    }

    /**
     * Render a line gizmo.
     * 渲染线条 gizmo。
     */
    private renderLineGizmo(
        points: Array<{ x: number; y: number }>,
        closed: boolean,
        r: number, g: number, b: number, a: number
    ): void {
        const lineThickness = 2;
        const count = closed ? points.length : points.length - 1;

        for (let i = 0; i < count; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            // Draw line segment as thin rect
            // 将线段绘制为细矩形
            this.bridge.addGizmoRect(
                (p1.x + p2.x) / 2,
                (p1.y + p2.y) / 2,
                length, lineThickness,
                angle, 0.5, 0.5,
                r, g, b, a,
                false
            );
        }
    }

    /**
     * Render a circle gizmo as polygon.
     * 将圆形 gizmo 渲染为多边形。
     */
    private renderCircleGizmo(
        x: number, y: number, radius: number,
        r: number, g: number, b: number, a: number
    ): void {
        const segments = 32;
        const points: Array<{ x: number; y: number }> = [];

        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius
            });
        }

        this.renderLineGizmo(points, true, r, g, b, a);
    }

    /**
     * Draw gizmos for selected entities with transform handles.
     * 为选中的实体绘制带有变换手柄的 gizmo。
     *
     * This method ensures that selected entities show transform handles
     * regardless of whether they have sprite data in entityRenderMap.
     * 此方法确保选中的实体显示变换手柄，无论它们是否在 entityRenderMap 中有精灵数据。
     */
    private drawSelectedEntityGizmos(): void {
        const scene = Core.scene;
        if (!scene) return;

        // Determine if we should show handles based on transform mode
        // 根据变换模式确定是否显示手柄
        const shouldShowHandles = this.transformMode !== 'select';

        for (const entityId of this.selectedEntityIds) {
            // Find the entity
            // 查找实体
            const entity = scene.entities.findEntityById(entityId);
            if (!entity) continue;

            // Get transform component
            // 获取变换组件
            const transform = entity.getComponent(TransformComponent);
            if (!transform) continue;

            // First check if we have sprite data from entityRenderMap
            // 首先检查是否有来自 entityRenderMap 的精灵数据
            const spriteData = this.entityRenderMap.get(entityId);
            if (spriteData) {
                // Use sprite data for selection gizmo
                // 使用精灵数据绘制选择 gizmo
                this.bridge.addGizmoRect(
                    spriteData.x,
                    spriteData.y,
                    spriteData.scaleX,
                    spriteData.scaleY,
                    spriteData.rotation,
                    spriteData.originX,
                    spriteData.originY,
                    0.0, 0.8, 1.0, 1.0,  // Selection color (cyan)
                    shouldShowHandles
                );
                continue;
            }

            // For entities without sprite data, try to get gizmo data from components via registry
            // 对于没有精灵数据的实体，尝试通过注册表从组件获取 gizmo 数据
            let foundGizmo = false;
            if (this.gizmoDataProvider && this.hasGizmoProvider) {
                for (const component of entity.components) {
                    if (this.hasGizmoProvider(component)) {
                        try {
                            const gizmoDataArray = this.gizmoDataProvider(component, entity, true);
                            // Use the first rect gizmo for selection handles
                            // 使用第一个矩形 gizmo 来绘制选择手柄
                            for (const gizmoData of gizmoDataArray) {
                                if (gizmoData.type === 'rect' &&
                                    gizmoData.x !== undefined && gizmoData.y !== undefined &&
                                    gizmoData.width !== undefined && gizmoData.height !== undefined) {

                                    // Draw selection gizmo with handles
                                    // 绘制带手柄的选择 gizmo
                                    this.bridge.addGizmoRect(
                                        gizmoData.x,
                                        gizmoData.y,
                                        gizmoData.width,
                                        gizmoData.height,
                                        gizmoData.rotation ?? 0,
                                        gizmoData.originX ?? 0.5,
                                        gizmoData.originY ?? 0.5,
                                        0.0, 0.8, 1.0, 1.0,  // Selection color (cyan)
                                        shouldShowHandles
                                    );
                                    foundGizmo = true;
                                    break;
                                }
                            }
                            if (foundGizmo) break;
                        } catch (e) {
                            // Silently ignore errors
                            // 静默忽略错误
                        }
                    }
                }
            }

            // If no gizmo provider found, draw a default gizmo at transform position
            // 如果没有找到 gizmo 提供者，在变换位置绘制默认 gizmo
            if (!foundGizmo) {
                const rotation = typeof transform.rotation === 'number'
                    ? transform.rotation
                    : transform.rotation.z;

                // Draw a small default gizmo at entity position
                // 在实体位置绘制一个小的默认 gizmo
                this.bridge.addGizmoRect(
                    transform.position.x,
                    transform.position.y,
                    32,  // Default size
                    32,
                    rotation,
                    0.5,
                    0.5,
                    0.0, 0.8, 1.0, 1.0,  // Selection color (cyan)
                    shouldShowHandles
                );
            }
        }
    }

    /**
     * Draw camera frustum gizmos for all cameras in scene.
     * 为场景中所有相机绘制视锥体 gizmo。
     */
    private drawCameraFrustums(): void {
        const scene = Core.scene;
        if (!scene) return;

        const cameraEntities = scene.entities.findEntitiesWithComponent(CameraComponent);

        for (const entity of cameraEntities) {
            const camera = entity.getComponent(CameraComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!camera || !transform) continue;

            // Calculate frustum size based on canvas size and orthographicSize
            // 根据 canvas 尺寸和 orthographicSize 计算视锥体大小
            // At runtime, zoom = 1 / orthographicSize
            // So visible area = canvas size * orthographicSize
            const canvas = document.getElementById('viewport-canvas') as HTMLCanvasElement;
            if (!canvas) continue;

            // The actual visible world units when running
            // 运行时实际可见的世界单位
            const zoom = camera.orthographicSize > 0 ? 1 / camera.orthographicSize : 1;
            const width = canvas.width / zoom;
            const height = canvas.height / zoom;

            // Handle rotation
            const rotation = typeof transform.rotation === 'number'
                ? transform.rotation
                : transform.rotation.z;

            // Draw frustum rectangle (white color for camera)
            // 绘制视锥体矩形（相机用白色）
            this.bridge.addGizmoRect(
                transform.position.x,
                transform.position.y,
                width,
                height,
                rotation,
                0.5,  // origin center
                0.5,
                1.0, 1.0, 1.0, 0.8,  // White color with some transparency
                false  // Don't show transform handles for camera frustum
            );
        }
    }

    /**
     * Draw UI canvas boundary.
     * 绘制 UI 画布边界。
     *
     * Shows the design resolution boundary of the UI canvas.
     * 显示 UI 画布的设计分辨率边界。
     */
    private drawUICanvasBoundary(): void {
        const w = this.uiCanvasWidth;
        const h = this.uiCanvasHeight;

        // Canvas is centered at (0, 0) in Y-up coordinate system
        // 画布以 (0, 0) 为中心，Y 轴向上坐标系
        // Bottom-left: (-w/2, -h/2), Top-right: (w/2, h/2)

        // Draw the boundary as a rectangle
        // 绘制边界矩形
        // Using origin (0, 0) means position is bottom-left corner
        // 使用 origin (0, 0) 表示位置是左下角
        this.bridge.addGizmoRect(
            -w / 2,     // x: left edge
            -h / 2,     // y: bottom edge (in Y-up system)
            w,          // width
            h,          // height
            0,          // rotation
            0,          // originX: left
            0,          // originY: bottom
            0.5, 0.8, 1.0, 0.6,  // Light blue color for UI canvas boundary
            false       // Don't show transform handles
        );

        // Draw corner markers for better visibility
        // 绘制角标记以提高可见性
        const markerSize = 20;
        const markerColor = { r: 0.5, g: 0.8, b: 1.0, a: 1.0 };

        // Top-left corner marker (L shape)
        const corners = [
            // Top-left
            { x: -w / 2, y: h / 2 - markerSize, ex: -w / 2, ey: h / 2 },
            { x: -w / 2, y: h / 2, ex: -w / 2 + markerSize, ey: h / 2 },
            // Top-right
            { x: w / 2 - markerSize, y: h / 2, ex: w / 2, ey: h / 2 },
            { x: w / 2, y: h / 2, ex: w / 2, ey: h / 2 - markerSize },
            // Bottom-right
            { x: w / 2, y: -h / 2 + markerSize, ex: w / 2, ey: -h / 2 },
            { x: w / 2, y: -h / 2, ex: w / 2 - markerSize, ey: -h / 2 },
            // Bottom-left
            { x: -w / 2 + markerSize, y: -h / 2, ex: -w / 2, ey: -h / 2 },
            { x: -w / 2, y: -h / 2, ex: -w / 2, ey: -h / 2 + markerSize },
        ];

        for (const line of corners) {
            const dx = line.ex - line.x;
            const dy = line.ey - line.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            this.bridge.addGizmoRect(
                (line.x + line.ex) / 2,
                (line.y + line.ey) / 2,
                length,
                2,  // Line thickness
                angle,
                0.5,
                0.5,
                markerColor.r, markerColor.g, markerColor.b, markerColor.a,
                false
            );
        }
    }

    /**
     * Set gizmo registry functions.
     * 设置 gizmo 注册表函数。
     *
     * This allows the editor layer to inject GizmoRegistry functionality
     * without creating a direct dependency from engine to editor.
     * 这允许编辑器层注入 GizmoRegistry 功能，
     * 而不会创建从引擎到编辑器的直接依赖。
     *
     * @param provider - Function to get gizmo data from a component
     * @param hasProvider - Function to check if a component has a gizmo provider
     */
    setGizmoRegistry(
        provider: GizmoDataProviderFn,
        hasProvider: HasGizmoProviderFn
    ): void {
        this.gizmoDataProvider = provider;
        this.hasGizmoProvider = hasProvider;
    }

    /**
     * Set gizmo interaction functions.
     * 设置 gizmo 交互函数。
     *
     * This allows the editor layer to inject GizmoInteractionService functionality
     * for hover highlighting and click selection.
     * 这允许编辑器层注入 GizmoInteractionService 功能，
     * 用于悬停高亮和点击选择。
     *
     * @param highlightColorFn - Function to get highlight color for gizmo
     * @param getHoveredEntityIdFn - Function to get currently hovered entity ID
     */
    setGizmoInteraction(
        highlightColorFn: GizmoHighlightColorFn,
        getHoveredEntityIdFn: GetHoveredEntityIdFn
    ): void {
        this.gizmoHighlightColorFn = highlightColorFn;
        this.getHoveredEntityIdFn = getHoveredEntityIdFn;
    }

    /**
     * Set gizmo visibility.
     * 设置Gizmo可见性。
     */
    setShowGizmos(show: boolean): void {
        this.showGizmos = show;
    }

    /**
     * Get gizmo visibility.
     * 获取Gizmo可见性。
     */
    getShowGizmos(): boolean {
        return this.showGizmos;
    }

    /**
     * Set UI canvas size for boundary display.
     * 设置 UI 画布尺寸以显示边界。
     *
     * @param width - Canvas width (design resolution) | 画布宽度（设计分辨率）
     * @param height - Canvas height (design resolution) | 画布高度（设计分辨率）
     */
    setUICanvasSize(width: number, height: number): void {
        this.uiCanvasWidth = width;
        this.uiCanvasHeight = height;
    }

    /**
     * Get UI canvas size.
     * 获取 UI 画布尺寸。
     */
    getUICanvasSize(): { width: number; height: number } {
        return { width: this.uiCanvasWidth, height: this.uiCanvasHeight };
    }

    /**
     * Set UI canvas boundary visibility.
     * 设置 UI 画布边界可见性。
     */
    setShowUICanvasBoundary(show: boolean): void {
        this.showUICanvasBoundary = show;
    }

    /**
     * Get UI canvas boundary visibility.
     * 获取 UI 画布边界可见性。
     */
    getShowUICanvasBoundary(): boolean {
        return this.showUICanvasBoundary;
    }

    /**
     * Set selected entity IDs.
     * 设置选中的实体ID。
     */
    setSelectedEntityIds(ids: number[]): void {
        this.selectedEntityIds = new Set(ids);
    }

    /**
     * Get selected entity IDs.
     * 获取选中的实体ID。
     */
    getSelectedEntityIds(): number[] {
        return Array.from(this.selectedEntityIds);
    }

    /**
     * Set transform tool mode.
     * 设置变换工具模式。
     */
    setTransformMode(mode: 'select' | 'move' | 'rotate' | 'scale'): void {
        this.transformMode = mode;

        // Convert string mode to u8 for Rust engine
        const modeMap: Record<string, number> = {
            'select': 0,
            'move': 1,
            'rotate': 2,
            'scale': 3
        };
        this.bridge.setTransformMode(modeMap[mode]);
    }

    /**
     * Get transform tool mode.
     * 获取变换工具模式。
     */
    getTransformMode(): 'select' | 'move' | 'rotate' | 'scale' {
        return this.transformMode;
    }

    /**
     * Register a render data provider.
     * 注册渲染数据提供者。
     */
    addRenderDataProvider(provider: IRenderDataProvider): void {
        if (!this.renderDataProviders.includes(provider)) {
            this.renderDataProviders.push(provider);
        }
    }

    /**
     * Remove a render data provider.
     * 移除渲染数据提供者。
     */
    removeRenderDataProvider(provider: IRenderDataProvider): void {
        const index = this.renderDataProviders.indexOf(provider);
        if (index >= 0) {
            this.renderDataProviders.splice(index, 1);
        }
    }

    /**
     * Set the UI render data provider.
     * 设置 UI 渲染数据提供者。
     *
     * The UI render data provider supports both screen space and world space UI.
     * UI 渲染数据提供者支持屏幕空间和世界空间 UI。
     *
     * @param provider - UI render data provider | UI 渲染数据提供者
     */
    setUIRenderDataProvider(provider: IUIRenderDataProvider | null): void {
        this.uiRenderDataProvider = provider;
    }

    /**
     * Get the UI render data provider.
     * 获取 UI 渲染数据提供者。
     */
    getUIRenderDataProvider(): IUIRenderDataProvider | null {
        return this.uiRenderDataProvider;
    }

    /**
     * Set preview mode.
     * 设置预览模式。
     *
     * In preview mode (true): UI uses screen space overlay projection, independent of world camera.
     * In editor mode (false): UI renders in world space, following the editor camera.
     *
     * 预览模式（true）：UI 使用屏幕空间叠加投影，独立于世界相机。
     * 编辑器模式（false）：UI 在世界空间渲染，跟随编辑器相机。
     *
     * @param mode - True for preview mode, false for editor mode
     */
    setPreviewMode(mode: boolean): void {
        this.previewMode = mode;
    }

    /**
     * Get preview mode.
     * 获取预览模式。
     */
    isPreviewMode(): boolean {
        return this.previewMode;
    }

    /**
     * Get the number of sprites rendered.
     * 获取渲染的精灵数量。
     */
    get spriteCount(): number {
        return this.worldBatcher.count + this.screenBatcher.count;
    }

    /**
     * Get engine statistics.
     * 获取引擎统计信息。
     */
    getStats() {
        return this.bridge.getStats();
    }

    /**
     * Load a texture.
     * 加载纹理。
     */
    loadTexture(id: number, url: string): void {
        this.bridge.loadTexture(id, url);
    }

    /**
     * Set asset path resolver.
     * 设置资产路径解析器。
     *
     * The resolver function is used to convert asset GUIDs to file paths.
     * This allows the editor to inject AssetRegistryService functionality
     * without creating a direct dependency.
     * 解析器函数用于将资产 GUID 转换为文件路径。
     * 这允许编辑器注入 AssetRegistryService 功能而不创建直接依赖。
     *
     * @param resolver - Function to resolve GUID/path to actual path | 将 GUID/路径解析为实际路径的函数
     */
    setAssetPathResolver(resolver: AssetPathResolverFn | null): void {
        this.assetPathResolver = resolver;
    }

    /**
     * Get asset path resolver.
     * 获取资产路径解析器。
     */
    getAssetPathResolver(): AssetPathResolverFn | null {
        return this.assetPathResolver;
    }

    /**
     * Resolve asset GUID or path to actual file path.
     * 将资产 GUID 或路径解析为实际文件路径。
     *
     * @param guidOrPath - Asset GUID or path | 资产 GUID 或路径
     * @returns Resolved path or original value | 解析后的路径或原值
     */
    private resolveAssetPath(guidOrPath: string): string {
        return this.assetPathResolver
            ? this.assetPathResolver(guidOrPath)
            : guidOrPath;
    }
}
