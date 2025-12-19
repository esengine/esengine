/**
 * UI Render Collector - Shared service for collecting UI render primitives
 * UI 渲染收集器 - 用于收集 UI 渲染原语的共享服务
 *
 * This collector is used by all UI render systems to submit render data.
 * 此收集器被所有 UI 渲染系统用于提交渲染数据。
 *
 * Render mode is controlled by EngineRenderSystem.previewMode:
 * - Editor mode (previewMode=false): UI renders in world space with sprites
 * - Preview mode (previewMode=true): UI renders as screen overlay
 *
 * 渲染模式由 EngineRenderSystem.previewMode 控制：
 * - 编辑器模式 (previewMode=false): UI 与精灵一起在世界空间渲染
 * - 预览模式 (previewMode=true): UI 作为屏幕叠加层渲染
 */

import { isValidGUID } from '@esengine/asset-system';
import { sortingLayerManager, SortingLayers } from '@esengine/engine-core';
import { getDynamicAtlasManager } from '../../atlas/DynamicAtlasManager';
import { getDynamicAtlasService, getTexturePathByGuid } from '../../atlas/DynamicAtlasService';

/**
 * Material property override for UI rendering.
 * UI 渲染的材质属性覆盖。
 */
export interface UIMaterialPropertyOverride {
    /** Uniform type. | Uniform 类型。 */
    type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'color' | 'int';
    /** Uniform value. | Uniform 值。 */
    value: number | number[];
}

/**
 * Material overrides map for UI.
 * UI 的材质覆盖映射。
 */
export type UIMaterialOverrides = Record<string, UIMaterialPropertyOverride>;

/**
 * 合批打断原因
 * Batch break reason
 *
 * 注意：orderInLayer 不会打断合批，它只决定渲染顺序
 * Note: orderInLayer doesn't break batching, it only determines render order
 */
export type BatchBreakReason =
    | 'first'           // 第一个批次 | First batch
    | 'sortingLayer'    // 排序层不同 | Different sorting layer
    | 'texture'         // 纹理不同 | Different texture
    | 'material'        // 材质不同 | Different material
    | 'clipRect';       // 裁剪区域不同 | Different clip rect

/**
 * 合批调试信息
 * Batch debug info
 */
export interface BatchDebugInfo {
    /** 批次索引 | Batch index */
    batchIndex: number;
    /** 打断原因 | Break reason */
    reason: BatchBreakReason;
    /** 详细信息 | Detail message */
    detail: string;
    /** 批次内原语数量 | Primitive count in batch */
    primitiveCount: number;
    /** 排序层 | Sorting layer */
    sortingLayer: string;
    /** 层内顺序 | Order in layer */
    orderInLayer: number;
    /** 纹理标识 | Texture key */
    textureKey: string;
    /** 材质 ID | Material ID */
    materialId: number;
    /** 批次包含的实体 ID 列表（去重）| Entity IDs in this batch (deduplicated) */
    entityIds: number[];
    /** 第一个实体 ID（打断合批的元素）| First entity ID (the batch breaker) */
    firstEntityId?: number;
}

/**
 * A single render primitive (rectangle with optional texture)
 * 单个渲染原语（可选带纹理的矩形）
 *
 * Coordinate system (same as Sprite rendering):
 * - x, y: Anchor/origin position of the rectangle
 * - width, height: Pixel dimensions
 * - pivotX, pivotY: Where the anchor point is on the rectangle (0-1)
 *   - (0, 0) = x,y is top-left corner
 *   - (0.5, 0.5) = x,y is center
 *   - (1, 1) = x,y is bottom-right corner
 *
 * For UI elements (UITransform), x,y is always top-left corner,
 * so pivotX=0, pivotY=0 should be used.
 *
 * 坐标系统（与 Sprite 渲染相同）：
 * - x, y: 矩形的锚点/原点位置
 * - width, height: 像素尺寸
 * - pivotX, pivotY: 锚点在矩形上的位置（0-1）
 *   - (0, 0) = x,y 是左上角
 *   - (0.5, 0.5) = x,y 是中心
 *   - (1, 1) = x,y 是右下角
 *
 * 对于 UI 元素（UITransform），x,y 始终是左上角，
 * 因此应使用 pivotX=0, pivotY=0。
 */
export interface UIRenderPrimitive {
    /** X position (anchor point) | X 坐标（锚点位置） */
    x: number;
    /** Y position (anchor point) | Y 坐标（锚点位置） */
    y: number;
    /** Width in pixels | 宽度（像素） */
    width: number;
    /** Height in pixels | 高度（像素） */
    height: number;
    /** Rotation in radians | 旋转角度（弧度） */
    rotation: number;
    /** Pivot/Origin X (0-1, 0=left, 0.5=center, 1=right) | 锚点 X (0-1, 0=左, 0.5=中心, 1=右) */
    pivotX: number;
    /** Pivot/Origin Y (0-1, 0=bottom, 0.5=center, 1=top) in Y-up system | 锚点 Y (0-1, 0=下, 0.5=中心, 1=上) Y轴向上坐标系 */
    pivotY: number;
    /** Packed color (0xAABBGGRR) | 打包颜色 */
    color: number;
    /** 排序层 | Sorting layer */
    sortingLayer: string;
    /** 层内排序顺序 | Order within layer */
    orderInLayer: number;
    /**
     * 添加顺序索引，用于稳定排序
     * Addition order index for stable sorting
     *
     * 当 sortKey 相同时，后添加的原语渲染在先添加的之上。
     * 这确保了系统执行顺序（如 UIButtonRenderSystem → UITextRenderSystem）
     * 自然决定渲染顺序，而不需要硬编码偏移量。
     *
     * When sortKey is equal, later-added primitives render on top of earlier ones.
     * This ensures system execution order (e.g., UIButtonRenderSystem → UITextRenderSystem)
     * naturally determines render order without hardcoded offsets.
     */
    addIndex: number;
    /** Optional texture ID | 可选纹理 ID */
    textureId?: number;
    /** Optional texture GUID | 可选纹理 GUID */
    textureGuid?: string;
    /** Optional texture URL/path (for dynamic atlas) | 可选纹理 URL/路径（用于动态图集） */
    texturePath?: string;
    /** UV coordinates [u0, v0, u1, v1] | UV 坐标 */
    uv?: [number, number, number, number];
    /** Material ID (0 = default). | 材质 ID (0 = 默认)。 */
    materialId?: number;
    /** Material property overrides. | 材质属性覆盖。 */
    materialOverrides?: UIMaterialOverrides;
    /** Source entity ID (for debugging). | 来源实体 ID（用于调试）。 */
    entityId?: number;
    /**
     * Clip rectangle for scissor test (screen coordinates).
     * Content outside this rect will be clipped.
     * 裁剪矩形用于 scissor test（屏幕坐标）。
     * 此矩形外的内容将被裁剪。
     */
    clipRect?: { x: number; y: number; width: number; height: number };
}

/**
 * Provider render data format (compatible with EngineRenderSystem)
 * 提供者渲染数据格式（兼容 EngineRenderSystem）
 */
export interface ProviderRenderData {
    transforms: Float32Array;
    textureIds: Uint32Array;
    uvs: Float32Array;
    colors: Uint32Array;
    tileCount: number;
    /** 排序层 | Sorting layer */
    sortingLayer: string;
    /** 层内排序顺序 | Order within layer */
    orderInLayer: number;
    /** 纹理 GUID（如果 textureId 为 0 则使用）| Texture GUID (used if textureId is 0) */
    textureGuid?: string;
    /** Material IDs for each primitive. | 每个原语的材质 ID。 */
    materialIds?: Uint32Array;
    /** Material overrides (per-group). | 材质覆盖（按组）。 */
    materialOverrides?: UIMaterialOverrides;
    /**
     * Clip rectangle for scissor test (screen coordinates).
     * All primitives in this batch will be clipped to this rect.
     * 裁剪矩形用于 scissor test（屏幕坐标）。
     * 此批次中的所有原语将被裁剪到此矩形。
     */
    clipRect?: { x: number; y: number; width: number; height: number };
}

/**
 * UI Render Collector
 * UI 渲染收集器
 *
 * Collects render primitives from all UI render systems and converts them
 * to the format expected by EngineRenderSystem.
 * 从所有 UI 渲染系统收集渲染原语，并转换为 EngineRenderSystem 期望的格式。
 */
export class UIRenderCollector {
    /** Collected primitives | 收集的原语 */
    private primitives: UIRenderPrimitive[] = [];

    private cache: ProviderRenderData[] | null = null;

    /** 合批调试信息缓存 | Batch debug info cache */
    private batchDebugCache: BatchDebugInfo[] | null = null;

    /**
     * 原语添加计数器，用于稳定排序
     * Primitive addition counter for stable sorting
     */
    private addIndexCounter: number = 0;

    /**
     * Clear all collected primitives (call at start of frame)
     * 清除所有收集的原语（在帧开始时调用）
     */
    clear(): void {
        this.primitives.length = 0;
        this.cache = null;
        this.batchDebugCache = null;
        this.addIndexCounter = 0;
    }

    /**
     * Add a rectangle primitive
     * 添加矩形原语
     */
    addRect(
        x: number,
        y: number,
        width: number,
        height: number,
        color: number,
        alpha: number,
        sortingLayer: string,
        orderInLayer: number,
        options?: {
            rotation?: number;
            pivotX?: number;
            pivotY?: number;
            textureId?: number;
            textureGuid?: string;
            /** 纹理路径（用于动态图集加载）| Texture path (for dynamic atlas loading) */
            texturePath?: string;
            uv?: [number, number, number, number];
            materialId?: number;
            materialOverrides?: UIMaterialOverrides;
            /** 来源实体 ID（用于调试）| Source entity ID (for debugging) */
            entityId?: number;
            /** 裁剪矩形（屏幕坐标）| Clip rectangle (screen coordinates) */
            clipRect?: { x: number; y: number; width: number; height: number };
        }
    ): void {
        // Pack color with alpha: 0xAABBGGRR
        const r = (color >> 16) & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = color & 0xFF;
        const a = Math.round(alpha * 255);
        const packedColor = ((a & 0xFF) << 24) | ((b & 0xFF) << 16) | ((g & 0xFF) << 8) | (r & 0xFF);

        const primitive: UIRenderPrimitive = {
            x,
            y,
            width,
            height,
            rotation: options?.rotation ?? 0,
            pivotX: options?.pivotX ?? 0,
            pivotY: options?.pivotY ?? 0,
            color: packedColor,
            sortingLayer,
            orderInLayer,
            addIndex: this.addIndexCounter++,
            textureId: options?.textureId,
            textureGuid: options?.textureGuid,
            texturePath: options?.texturePath,
            uv: options?.uv,
            materialId: options?.materialId,
            materialOverrides: options?.materialOverrides,
            entityId: options?.entityId,
            clipRect: options?.clipRect
        };

        this.primitives.push(primitive);

        // 如果有 GUID，请求加载到动态图集
        // If GUID provided, request loading to dynamic atlas
        if (options?.textureGuid) {
            // 优先使用提供的路径，否则从映射中查找
            // Prefer provided path, otherwise lookup from mapping
            const texturePath = options.texturePath ?? getTexturePathByGuid(options.textureGuid);
            if (texturePath) {
                requestTextureForAtlas(options.textureGuid, texturePath);
            }
            // 不再输出警告 - 路径可能稍后注册
            // No warning - path may be registered later
        }
        this.cache = null;
        this.batchDebugCache = null;
    }

    /**
     * Add a primitive with pre-calculated world transform
     * 添加带预计算世界变换的原语
     */
    addPrimitive(primitive: UIRenderPrimitive): void {
        // 分配添加索引用于稳定排序
        // Assign add index for stable sorting
        primitive.addIndex = this.addIndexCounter++;
        this.primitives.push(primitive);
        this.cache = null;
        this.batchDebugCache = null;
    }

    /**
     * Add a nine-patch (9-slice) primitive
     * 添加九宫格原语
     *
     * Nine-patch divides the texture into 9 regions:
     * - Corners: Keep original size
     * - Edges: Stretch in one direction
     * - Center: Stretches in both directions
     *
     * 九宫格将纹理分为 9 个区域：
     * - 角落：保持原始尺寸
     * - 边缘：单向拉伸
     * - 中心：双向拉伸
     *
     * @param x - Pivot X position (same as regular rect) | Pivot X 坐标（与普通矩形相同）
     * @param y - Pivot Y position (same as regular rect) | Pivot Y 坐标（与普通矩形相同）
     * @param width - Target width | 目标宽度
     * @param height - Target height | 目标高度
     * @param margins - Nine-patch margins [top, right, bottom, left] | 九宫格边距
     * @param textureWidth - Source texture width | 源纹理宽度
     * @param textureHeight - Source texture height | 源纹理高度
     * @param color - Tint color | 着色颜色
     * @param alpha - Alpha value | 透明度
     * @param sortingLayer - Sorting layer | 排序层
     * @param orderInLayer - Order in layer | 层内顺序
     * @param options - Additional options | 额外选项
     */
    addNinePatch(
        x: number,
        y: number,
        width: number,
        height: number,
        margins: [number, number, number, number],
        textureWidth: number,
        textureHeight: number,
        color: number,
        alpha: number,
        sortingLayer: string,
        orderInLayer: number,
        options?: {
            rotation?: number;
            /** Pivot X (0-1), default 0.5 | X 轴锚点 (0-1)，默认 0.5 */
            pivotX?: number;
            /** Pivot Y (0-1), default 0.5 | Y 轴锚点 (0-1)，默认 0.5 */
            pivotY?: number;
            textureId?: number;
            textureGuid?: string;
            /** 纹理路径（用于动态图集加载）| Texture path (for dynamic atlas loading) */
            texturePath?: string;
            materialId?: number;
            materialOverrides?: UIMaterialOverrides;
            /** 来源实体 ID（用于调试）| Source entity ID (for debugging) */
            entityId?: number;
        }
    ): void {
        let [marginTop, marginRight, marginBottom, marginLeft] = margins;
        const rotation = options?.rotation ?? 0;
        const pivotX = options?.pivotX ?? 0.5;
        const pivotY = options?.pivotY ?? 0.5;

        // Proportionally scale margins if target size is smaller than minimum
        // 如果目标尺寸小于最小值，按比例缩小边距
        const minWidth = marginLeft + marginRight;
        const minHeight = marginTop + marginBottom;

        if (width < minWidth && minWidth > 0) {
            const scale = width / minWidth;
            marginLeft *= scale;
            marginRight *= scale;
        }

        if (height < minHeight && minHeight > 0) {
            const scale = height / minHeight;
            marginTop *= scale;
            marginBottom *= scale;
        }

        const targetWidth = width;
        const targetHeight = height;

        // Calculate center dimensions
        // 计算中心区域尺寸
        const centerWidth = targetWidth - marginLeft - marginRight;
        const centerHeight = targetHeight - marginTop - marginBottom;

        // Source texture UV boundaries (normalized)
        // 源纹理 UV 边界（归一化）
        const uvLeft = marginLeft / textureWidth;
        const uvRight = (textureWidth - marginRight) / textureWidth;
        const uvTop = marginTop / textureHeight;
        const uvBottom = (textureHeight - marginBottom) / textureHeight;

        // Pre-calculate sin/cos for rotation
        // 预计算旋转的 sin/cos
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        // Calculate top-left corner position (unrotated) relative to pivot point
        // 计算相对于 pivot 点的左上角位置（未旋转）
        const topLeftOffsetX = -targetWidth * pivotX;
        const topLeftOffsetY = targetHeight * (1 - pivotY);

        // Common options for all patches (no rotation per-patch, we handle it via position)
        // 所有 patch 的公共选项（每个 patch 不单独旋转，我们通过位置处理）
        const baseOptions = {
            rotation: rotation,
            pivotX: 0.5,
            pivotY: 0.5,
            textureId: options?.textureId,
            textureGuid: options?.textureGuid,
            texturePath: options?.texturePath,
            materialId: options?.materialId,
            materialOverrides: options?.materialOverrides,
            entityId: options?.entityId
        };

        // Helper to rotate a point around the pivot
        // 辅助函数：围绕 pivot 旋转一个点
        const rotatePoint = (offsetX: number, offsetY: number): { x: number; y: number } => {
            // Offset is relative to pivot (x, y)
            // 偏移是相对于 pivot (x, y) 的
            const rotatedX = offsetX * cos - offsetY * sin;
            const rotatedY = offsetX * sin + offsetY * cos;
            return { x: x + rotatedX, y: y + rotatedY };
        };

        // Helper to add a patch with specific UVs
        // The patch position is specified by its top-left corner offset from the nine-patch's top-left
        // 辅助函数：添加具有特定 UV 的 patch
        // patch 位置由相对于九宫格左上角的偏移指定
        const addPatch = (
            // Local offset from top-left corner of nine-patch (unrotated)
            // 相对于九宫格左上角的本地偏移（未旋转）
            localX: number,
            localY: number,
            pw: number,
            ph: number,
            u0: number,
            v0: number,
            u1: number,
            v1: number
        ) => {
            if (pw <= 0 || ph <= 0) return;

            // Calculate the center of this patch (relative to pivot)
            // 计算此 patch 的中心（相对于 pivot）
            // localX, localY is top-left corner offset from nine-patch's top-left
            // Add topLeftOffset to get offset from pivot
            const offsetX = topLeftOffsetX + localX + pw / 2;
            const offsetY = topLeftOffsetY - localY - ph / 2;

            // Rotate around pivot point
            // 围绕 pivot 点旋转
            const rotated = rotatePoint(offsetX, offsetY);

            this.addRect(rotated.x, rotated.y, pw, ph, color, alpha, sortingLayer, orderInLayer, {
                ...baseOptions,
                uv: [u0, v0, u1, v1]
            });
        };

        // Add all 9 patches (localX, localY relative to top-left of nine-patch)
        // 添加所有 9 个 patch（localX, localY 相对于九宫格的左上角）

        // Top-left corner | 左上角
        addPatch(0, 0, marginLeft, marginTop, 0, 0, uvLeft, uvTop);

        // Top edge | 顶边
        addPatch(marginLeft, 0, centerWidth, marginTop, uvLeft, 0, uvRight, uvTop);

        // Top-right corner | 右上角
        addPatch(marginLeft + centerWidth, 0, marginRight, marginTop, uvRight, 0, 1, uvTop);

        // Left edge | 左边
        addPatch(0, marginTop, marginLeft, centerHeight, 0, uvTop, uvLeft, uvBottom);

        // Center | 中心
        addPatch(marginLeft, marginTop, centerWidth, centerHeight, uvLeft, uvTop, uvRight, uvBottom);

        // Right edge | 右边
        addPatch(marginLeft + centerWidth, marginTop, marginRight, centerHeight, uvRight, uvTop, 1, uvBottom);

        // Bottom-left corner | 左下角
        addPatch(0, marginTop + centerHeight, marginLeft, marginBottom, 0, uvBottom, uvLeft, 1);

        // Bottom edge | 底边
        addPatch(marginLeft, marginTop + centerHeight, centerWidth, marginBottom, uvLeft, uvBottom, uvRight, 1);

        // Bottom-right corner | 右下角
        addPatch(marginLeft + centerWidth, marginTop + centerHeight, marginRight, marginBottom, uvRight, uvBottom, 1, 1);
    }

    /**
     * Get render data
     * 获取渲染数据
     */
    getRenderData(): readonly ProviderRenderData[] {
        if (this.cache) {
            return this.cache;
        }

        this.cache = this.buildRenderData(this.primitives);

        return this.cache;
    }

    /**
     * Build render data from primitives
     * 从原语构建渲染数据
     */
    private buildRenderData(primitives: UIRenderPrimitive[]): ProviderRenderData[] {
        if (primitives.length === 0) {
            this.batchDebugCache = [];
            return [];
        }

        // 创建副本进行排序，避免修改原数组
        // Create a copy for sorting to avoid modifying the original array
        const sortedPrimitives = [...primitives];

        // Sort by sortKey (layer order * 10000 + orderInLayer), then by addIndex for stability
        // 按 sortKey 排序（层顺序 * 10000 + 层内顺序），然后按 addIndex 保持稳定性
        // 当 sortKey 相同时，后添加的原语渲染在先添加的之上
        // When sortKey is equal, later-added primitives render on top of earlier ones
        sortedPrimitives.sort((a, b) => {
            const sortKeyA = sortingLayerManager.getSortKey(a.sortingLayer, a.orderInLayer);
            const sortKeyB = sortingLayerManager.getSortKey(b.sortingLayer, b.orderInLayer);
            if (sortKeyA !== sortKeyB) {
                return sortKeyA - sortKeyB;
            }
            // 稳定排序：addIndex 大的在后面（渲染在上层）
            // Stable sort: larger addIndex comes later (renders on top)
            return a.addIndex - b.addIndex;
        });

        // Group by texture + sortingLayer + material (primitives with same texture/layer/material can be batched)
        // 按纹理 + 排序层 + 材质分组（相同纹理/层/材质的原语可以批处理）
        const groups = new Map<string, UIRenderPrimitive[]>();
        const batchDebugInfos: BatchDebugInfo[] = [];
        // 每个批次的 entityId 集合 | Entity ID set per batch
        const batchEntityIds = new Map<string, Set<number>>();

        // Track previous primitive's properties to detect break reason
        // Batching condition: consecutive primitives with same sortingLayer + texture + material + clipRect can be batched
        // orderInLayer only determines render order, doesn't affect batching
        // 追踪上一个原语的属性以检测打断原因
        // 合批条件：连续的原语如果有相同的 sortingLayer + texture + material + clipRect 就可以合批
        // orderInLayer 只决定渲染顺序，不影响能否合批
        let prevSortingLayer: string | null = null;
        let prevTextureKey: string | null = null;
        let prevMaterialKey: number | null = null;
        let prevClipRectKey: string | null = null;
        let batchIndex = 0;
        let currentGroup: UIRenderPrimitive[] | null = null;
        let currentBatchKey: string | null = null;

        // Get dynamic atlas manager for batch key optimization
        // 获取动态图集管理器用于优化合批 key
        const atlasManager = getDynamicAtlasManager();

        for (const prim of sortedPrimitives) {
            // Check if texture is in dynamic atlas
            // 检查纹理是否在动态图集中
            let textureKey: string;
            const atlasEntry = prim.textureGuid && atlasManager
                ? atlasManager.getEntry(prim.textureGuid)
                : undefined;

            if (atlasEntry) {
                // Use atlas texture ID as key - all textures in same atlas can batch!
                // 使用图集纹理 ID 作为 key - 同一图集中的所有纹理可以合批！
                textureKey = `atlas:${atlasEntry.atlasId}`;
            } else {
                // Use original texture key
                // 使用原始纹理 key
                textureKey = prim.textureGuid ?? (prim.textureId?.toString() ?? 'solid');
            }

            const materialKey = prim.materialId ?? 0;
            // Generate clipRect key (null/undefined = no clipping)
            // 生成 clipRect key（null/undefined = 无裁剪）
            const clipRectKey = prim.clipRect
                ? `${prim.clipRect.x},${prim.clipRect.y},${prim.clipRect.width},${prim.clipRect.height}`
                : 'none';
            // Batch key must include orderInLayer and clipRect
            // 合批 key 必须包含 orderInLayer 和 clipRect
            const batchKey = `${prim.sortingLayer}:${prim.orderInLayer}:${textureKey}:${materialKey}:${clipRectKey}`;

            // 检查是否需要新批次：sortingLayer、orderInLayer、texture 或 material 变化
            // Check if new batch needed: sortingLayer, orderInLayer, texture or material changed
            const needNewBatch = currentBatchKey !== batchKey;

            if (needNewBatch) {
                // 新批次 - 记录打断原因 | New batch - record break reason
                let reason: BatchBreakReason = 'first';
                let detail = 'First batch';

                if (prevSortingLayer !== null) {
                    if (prim.sortingLayer !== prevSortingLayer) {
                        reason = 'sortingLayer';
                        detail = `Layer changed: ${prevSortingLayer} → ${prim.sortingLayer}`;
                    } else if (textureKey !== prevTextureKey) {
                        reason = 'texture';
                        detail = `Texture changed: ${prevTextureKey} → ${textureKey}`;
                    } else if (materialKey !== prevMaterialKey) {
                        reason = 'material';
                        detail = `Material changed: ${prevMaterialKey} → ${materialKey}`;
                    } else if (clipRectKey !== prevClipRectKey) {
                        reason = 'clipRect';
                        detail = `ClipRect changed: ${prevClipRectKey} → ${clipRectKey}`;
                    }
                }

                // 使用带索引的唯一 key 来存储每个批次（因为相同 batchKey 可能出现多次）
                // Use indexed unique key to store each batch (same batchKey may appear multiple times)
                const uniqueKey = `${batchIndex}:${batchKey}`;

                batchDebugInfos.push({
                    batchIndex,
                    reason,
                    detail,
                    primitiveCount: 0, // 稍后更新 | Update later
                    sortingLayer: prim.sortingLayer,
                    orderInLayer: prim.orderInLayer,
                    textureKey,
                    materialId: materialKey,
                    entityIds: [], // 稍后填充 | Fill later
                    firstEntityId: prim.entityId // 第一个实体 ID | First entity ID
                });

                batchIndex++;

                currentGroup = [];
                groups.set(uniqueKey, currentGroup);
                batchEntityIds.set(uniqueKey, new Set<number>());
                currentBatchKey = batchKey;
            }

            currentGroup!.push(prim);

            // 收集 entityId | Collect entityId
            if (prim.entityId !== undefined) {
                const uniqueKey = `${batchIndex - 1}:${currentBatchKey}`;
                batchEntityIds.get(uniqueKey)?.add(prim.entityId);
            }

            prevSortingLayer = prim.sortingLayer;
            prevTextureKey = textureKey;
            prevMaterialKey = materialKey;
            prevClipRectKey = clipRectKey;
        }

        // 更新每个批次的原语数量和 entityIds | Update primitive count and entityIds for each batch
        let debugIdx = 0;
        for (const [key, prims] of groups) {
            if (debugIdx < batchDebugInfos.length) {
                batchDebugInfos[debugIdx].primitiveCount = prims.length;
                const entityIdSet = batchEntityIds.get(key);
                if (entityIdSet) {
                    batchDebugInfos[debugIdx].entityIds = [...entityIdSet];
                }
                debugIdx++;
            }
        }

        this.batchDebugCache = batchDebugInfos;

        // Convert groups to ProviderRenderData with addIndex for stable sorting
        // 将分组转换为带 addIndex 的 ProviderRenderData 以实现稳定排序
        const result: Array<{ data: ProviderRenderData; addIndex: number }> = [];

        for (const [key, prims] of groups) {
            const count = prims.length;
            const transforms = new Float32Array(count * 7);
            const textureIds = new Uint32Array(count);
            const uvs = new Float32Array(count * 4);
            const colors = new Uint32Array(count);

            // Use the first primitive's sorting info (all in group have same layer/order/material)
            // 使用第一个原语的排序信息（组内所有原语层/顺序/材质相同）
            const firstPrim = prims[0];
            const hasMaterial = (firstPrim.materialId ?? 0) !== 0;
            let materialIds: Uint32Array | undefined;
            if (hasMaterial) {
                materialIds = new Uint32Array(count);
            }

            // Get dynamic atlas manager for UV remapping
            // 获取动态图集管理器用于 UV 重映射
            const atlasManager = getDynamicAtlasManager();

            for (let i = 0; i < count; i++) {
                const p = prims[i];
                const tOffset = i * 7;
                const uvOffset = i * 4;

                // Unified render transform format (same as SpriteRenderData):
                // [x, y, rotation, width(pixels), height(pixels), pivotX(0-1), pivotY(0-1)]
                // 统一渲染变换格式（与 SpriteRenderData 相同）
                transforms[tOffset] = p.x;
                transforms[tOffset + 1] = p.y;
                transforms[tOffset + 2] = p.rotation;
                transforms[tOffset + 3] = p.width;
                transforms[tOffset + 4] = p.height;
                transforms[tOffset + 5] = p.pivotX;
                transforms[tOffset + 6] = p.pivotY;

                // Check for dynamic atlas entry
                // 检查动态图集条目
                let atlasEntry = p.textureGuid && atlasManager
                    ? atlasManager.getEntry(p.textureGuid)
                    : undefined;

                if (atlasEntry) {
                    // Use atlas texture ID
                    // 使用图集纹理 ID
                    textureIds[i] = atlasEntry.atlasId;

                    // Remap UV to atlas space
                    // 将 UV 重映射到图集空间
                    const originalUV = p.uv ?? [0, 0, 1, 1];
                    const remappedUV = atlasManager!.remapUV(
                        atlasEntry,
                        originalUV[0],
                        originalUV[1],
                        originalUV[2],
                        originalUV[3]
                    );
                    uvs[uvOffset] = remappedUV[0];
                    uvs[uvOffset + 1] = remappedUV[1];
                    uvs[uvOffset + 2] = remappedUV[2];
                    uvs[uvOffset + 3] = remappedUV[3];
                } else {
                    // Use original texture ID and UV
                    // 使用原始纹理 ID 和 UV
                    textureIds[i] = p.textureId ?? 0;

                    // UV
                    if (p.uv) {
                        uvs[uvOffset] = p.uv[0];
                        uvs[uvOffset + 1] = p.uv[1];
                        uvs[uvOffset + 2] = p.uv[2];
                        uvs[uvOffset + 3] = p.uv[3];
                    } else {
                        uvs[uvOffset] = 0;
                        uvs[uvOffset + 1] = 0;
                        uvs[uvOffset + 2] = 1;
                        uvs[uvOffset + 3] = 1;
                    }
                }

                colors[i] = p.color;

                // Material ID
                if (materialIds) {
                    materialIds[i] = p.materialId ?? 0;
                }
            }

            const renderData: ProviderRenderData = {
                transforms,
                textureIds,
                uvs,
                colors,
                tileCount: count,
                sortingLayer: firstPrim.sortingLayer,
                orderInLayer: firstPrim.orderInLayer
            };

            // Add texture GUID if it's a valid GUID (UUID format)
            // 如果是有效的 GUID（UUID 格式），则添加纹理 GUID
            if (firstPrim.textureGuid && isValidGUID(firstPrim.textureGuid)) {
                renderData.textureGuid = firstPrim.textureGuid;
            }

            // Add material data if present
            // 如果存在材质数据，添加它
            if (materialIds) {
                renderData.materialIds = materialIds;
            }
            // Use the first primitive's material overrides (all in group share same material)
            // 使用第一个原语的材质覆盖（组内所有原语共享相同材质）
            if (firstPrim.materialOverrides && Object.keys(firstPrim.materialOverrides).length > 0) {
                renderData.materialOverrides = firstPrim.materialOverrides;
            }
            // Use the first primitive's clipRect (all in group share same clipRect)
            // 使用第一个原语的 clipRect（组内所有原语共享相同 clipRect）
            if (firstPrim.clipRect) {
                renderData.clipRect = firstPrim.clipRect;
            }

            result.push({ data: renderData, addIndex: firstPrim.addIndex });
        }

        // Sort result by sortKey, then by addIndex for stability
        // 按 sortKey 排序，然后按 addIndex 保持稳定性
        // 当 sortKey 相同时，后添加的 batch 渲染在先添加的之上
        // When sortKey is equal, later-added batches render on top of earlier ones
        result.sort((a, b) => {
            const sortKeyA = sortingLayerManager.getSortKey(a.data.sortingLayer, a.data.orderInLayer);
            const sortKeyB = sortingLayerManager.getSortKey(b.data.sortingLayer, b.data.orderInLayer);
            if (sortKeyA !== sortKeyB) {
                return sortKeyA - sortKeyB;
            }
            // 稳定排序：addIndex 大的在后面（渲染在上层）
            // Stable sort: larger addIndex comes later (renders on top)
            return a.addIndex - b.addIndex;
        });

        return result.map(r => r.data);
    }

    /**
     * Get the total number of primitives collected
     * 获取收集的原语总数量
     */
    get count(): number {
        return this.primitives.length;
    }

    /**
     * Check if collector is empty
     * 检查收集器是否为空
     */
    get isEmpty(): boolean {
        return this.primitives.length === 0;
    }

    /**
     * 获取合批调试信息
     * Get batch debug info
     *
     * 注意：此方法只返回已构建的缓存，不会触发构建。
     * 这是为了避免在渲染过程中被 Frame Debugger 调用时提前构建缓存，
     * 导致后续添加的原语（如 Text）不被包含。
     *
     * Note: This method only returns the already-built cache, without triggering a build.
     * This prevents Frame Debugger from prematurely building the cache during rendering,
     * which would cause subsequently added primitives (like Text) to be excluded.
     */
    getBatchDebugInfo(): readonly BatchDebugInfo[] {
        // 不再触发构建，只返回已有缓存
        // No longer trigger build, only return existing cache
        return this.batchDebugCache ?? [];
    }
}

// Cache invalidation callbacks
// 缓存失效回调
type CacheInvalidationCallback = () => void;
const cacheInvalidationCallbacks: CacheInvalidationCallback[] = [];

// 使用 globalThis 确保跨模块单例
// Use globalThis to ensure cross-module singleton
const COLLECTOR_KEY = '__esengine_ui_render_collector__';

/**
 * Get the global UI render collector instance
 * 获取全局 UI 渲染收集器实例
 */
export function getUIRenderCollector(): UIRenderCollector {
    // 使用 globalThis 确保即使模块被重复打包也只有一个实例
    // Use globalThis to ensure single instance even if module is bundled multiple times
    if (!(globalThis as any)[COLLECTOR_KEY]) {
        (globalThis as any)[COLLECTOR_KEY] = new UIRenderCollector();
    }
    return (globalThis as any)[COLLECTOR_KEY];
}

/**
 * Reset the global collector (for testing or cleanup)
 * 重置全局收集器（用于测试或清理）
 */
export function resetUIRenderCollector(): void {
    (globalThis as any)[COLLECTOR_KEY] = null;
}

/**
 * Register a cache invalidation callback
 * 注册缓存失效回调
 *
 * UI render systems can register their cache clearing functions here.
 * When invalidateUIRenderCaches() is called, all registered callbacks will be invoked.
 *
 * UI 渲染系统可以在这里注册它们的缓存清除函数。
 * 当调用 invalidateUIRenderCaches() 时，所有注册的回调将被调用。
 */
export function registerCacheInvalidationCallback(callback: CacheInvalidationCallback): void {
    if (!cacheInvalidationCallbacks.includes(callback)) {
        cacheInvalidationCallbacks.push(callback);
    }
}

/**
 * Unregister a cache invalidation callback
 * 取消注册缓存失效回调
 */
export function unregisterCacheInvalidationCallback(callback: CacheInvalidationCallback): void {
    const index = cacheInvalidationCallbacks.indexOf(callback);
    if (index >= 0) {
        cacheInvalidationCallbacks.splice(index, 1);
    }
}

/**
 * Invalidate all UI render caches
 * 使所有 UI 渲染缓存失效
 *
 * Call this when the scene is restored or when caches need to be cleared.
 * 在场景恢复或需要清除缓存时调用此函数。
 */
export function invalidateUIRenderCaches(): void {
    for (const callback of cacheInvalidationCallbacks) {
        try {
            callback();
        } catch (e) {
            console.error('Error invalidating UI render cache:', e);
        }
    }
}

// 已请求加载的纹理集合（避免重复请求）
// Set of requested textures (avoid duplicate requests)
const requestedTextures = new Set<string>();

// 日志节流相关 | Log throttling related
// 已警告过的纹理 GUID（避免重复警告）
// Warned texture GUIDs (avoid duplicate warnings)
const warnedTextureGuids = new Set<string>();
let atlasServiceWarningShown = false;

/**
 * Request a texture to be loaded into the dynamic atlas
 * 请求将纹理加载到动态图集
 *
 * This function is called automatically when primitives with textureGuid and texturePath are added.
 * The texture will be loaded asynchronously and added to the atlas for future batching.
 * 当添加带有 textureGuid 和 texturePath 的原语时会自动调用此函数。
 * 纹理将被异步加载并添加到图集以供将来合批使用。
 *
 * @param textureGuid - Texture GUID | 纹理 GUID
 * @param texturePath - Texture URL/path | 纹理 URL/路径
 */
export function requestTextureForAtlas(textureGuid: string, texturePath: string): void {
    // 检查是否已请求或已在图集中
    // Check if already requested or in atlas
    if (requestedTextures.has(textureGuid)) {
        return;
    }

    const atlasManager = getDynamicAtlasManager();
    if (atlasManager?.hasTexture(textureGuid)) {
        requestedTextures.add(textureGuid); // Mark as known
        return;
    }

    const atlasService = getDynamicAtlasService();
    if (!atlasService) {
        // 只警告一次 | Warn only once
        if (!atlasServiceWarningShown) {
            console.warn('[UIRenderCollector] Atlas service not initialized');
            atlasServiceWarningShown = true;
        }
        return; // Service not initialized
    }

    // Mark as requested to avoid duplicate loads
    // 标记为已请求以避免重复加载
    requestedTextures.add(textureGuid);

    // Load async - don't await, let it complete in background
    // 异步加载 - 不等待，让它在后台完成
    atlasService.addTextureFromUrl(textureGuid, texturePath).catch((_err) => {
        // Remove from requested set so it can be retried
        // 从请求集合中移除以便可以重试
        requestedTextures.delete(textureGuid);
    });
}

/**
 * Clear the texture request cache
 * 清除纹理请求缓存
 *
 * Call this when switching scenes or when textures need to be reloaded.
 * 在切换场景或需要重新加载纹理时调用此函数。
 */
export function clearTextureRequestCache(): void {
    requestedTextures.clear();
    warnedTextureGuids.clear();
    atlasServiceWarningShown = false;
}
