import { ECSSystem, Entity, EntitySystem, HierarchyComponent, Matcher } from '@esengine/ecs-framework';
import { SortingLayers } from '@esengine/engine-core';
import { UICanvasComponent } from '../components/UICanvasComponent';
import { UIAlignItems, UIJustifyContent, UILayoutComponent, UILayoutType } from '../components/UILayoutComponent';
import { UITransformComponent } from '../components/UITransformComponent';
import { getUIRenderCollector } from './render/UIRenderCollector';

/** 度转弧度常量 | Degrees to radians constant */
const DEG_TO_RAD = Math.PI / 180;
/** 弧度转度常量 | Radians to degrees constant */
const RAD_TO_DEG = 180 / Math.PI;

/**
 * 2D 变换矩阵类型
 * 2D transformation matrix type
 */
interface Matrix2D {
    a: number;   // scaleX * cos(rotation)
    b: number;   // scaleX * sin(rotation)
    c: number;   // scaleY * -sin(rotation)
    d: number;   // scaleY * cos(rotation)
    tx: number;  // translateX
    ty: number;  // translateY
}

/**
 * Canvas 上下文（用于传播设置给子元素）
 * Canvas context (for propagating settings to children)
 */
interface CanvasContext {
    /** Canvas 实体 ID | Canvas entity ID */
    entityId: number | null;
    /** 排序层 | Sorting layer */
    sortingLayer: string;
    /** 基础层内顺序 | Base order in layer */
    baseSortOrder: number;
    /** 像素完美 | Pixel perfect */
    pixelPerfect: boolean;
}

/**
 * UI 布局系统
 * UI Layout System - Computes layout for UI elements
 *
 * 计算 UI 元素的世界坐标和尺寸
 * Computes world coordinates and sizes for UI elements
 *
 * 使用矩阵乘法计算世界变换：worldMatrix = parentMatrix * localMatrix
 * Uses matrix multiplication for world transforms: worldMatrix = parentMatrix * localMatrix
 *
 * 注意：canvasWidth/canvasHeight 是 UI 设计的参考尺寸，不是实际渲染视口大小
 * Note: canvasWidth/canvasHeight is the UI design reference size, not the actual render viewport size
 */
@ECSSystem('UILayout', { updateOrder: 50, runInEditMode: true })
export class UILayoutSystem extends EntitySystem {
    /**
     * UI 画布宽度（设计尺寸）
     * UI Canvas width (design size)
     */
    public canvasWidth: number = 1920;

    /**
     * UI 画布高度（设计尺寸）
     * UI Canvas height (design size)
     */
    public canvasHeight: number = 1080;

    /**
     * 当前帧的实体映射（用于快速查找）
     * Entity map for current frame (for fast lookup)
     */
    private currentFrameEntityMap: Map<number, Entity> = new Map();

    constructor() {
        super(Matcher.empty().all(UITransformComponent));
    }

    /**
     * 帧开始时调用
     * Called at the start of each frame
     *
     * 清除 UI 渲染收集器，为本帧的渲染数据做准备
     * Clear the UI render collector to prepare for this frame's render data
     */
    protected override onBegin(): void {
        const collector = getUIRenderCollector();
        collector.clear();
    }

    /**
     * 设置 UI 画布尺寸（设计尺寸）
     * Set UI canvas size (design size)
     *
     * 这是 UI 布局计算的参考尺寸，通常是固定的设计分辨率（如 1920x1080）
     * This is the reference size for UI layout calculation, usually a fixed design resolution (e.g., 1920x1080)
     */
    public setCanvasSize(width: number, height: number): void {
        this.canvasWidth = width;
        this.canvasHeight = height;

        // 标记所有元素需要重新布局
        for (const entity of this.entities) {
            const transform = entity.getComponent(UITransformComponent);
            if (transform) {
                transform.layoutDirty = true;
            }
        }
    }

    /**
     * 获取 UI 画布尺寸
     * Get UI canvas size
     */
    public getCanvasSize(): { width: number; height: number } {
        return { width: this.canvasWidth, height: this.canvasHeight };
    }

    protected process(entities: readonly Entity[]): void {
        // 构建当前帧的实体映射（用于快速查找，解决第一帧 findEntityById 返回 null 的问题）
        // Build entity map for current frame (for fast lookup, fixes findEntityById returning null on first frame)
        this.currentFrameEntityMap.clear();
        for (const e of entities) {
            this.currentFrameEntityMap.set(e.id, e);
        }

        // 首先处理根元素（没有父元素的）
        // 修复：如果父实体在当前处理的实体集合中，则不是根实体
        // 这解决了第一帧时 findEntityById 可能返回 null 的问题
        // Fix: If parent entity is in current entity set, this is not a root
        // This fixes the issue where findEntityById may return null on first frame
        const rootEntities = entities.filter(e => {
            const hierarchy = e.getComponent(HierarchyComponent);
            if (!hierarchy || hierarchy.parentId === null) {
                return true;
            }
            // 如果父实体在我们的实体集合中，这不是根实体（父实体会递归处理它）
            // If parent is in our entity set, this is NOT a root (parent will recursively process this child)
            if (this.currentFrameEntityMap.has(hierarchy.parentId)) {
                return false;
            }
            // 如果父实体不在我们的集合中，检查它是否存在于场景中
            // If parent is not in our set, check if it exists in scene
            const parent = this.scene?.findEntityById(hierarchy.parentId);
            return !parent || !parent.hasComponent(UITransformComponent);
        });

        // 画布中心为原点，Y 轴向上为正
        // Canvas center is origin, Y axis points up
        // 左上角是 (-width/2, +height/2)，右下角是 (+width/2, -height/2)
        // Top-left is (-width/2, +height/2), bottom-right is (+width/2, -height/2)
        const parentX = -this.canvasWidth / 2;
        const parentY = this.canvasHeight / 2;  // Y 轴向上，所以顶部是正值

        // 根元素使用单位矩阵作为父矩阵
        const identityMatrix: Matrix2D = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

        // 默认 Canvas 上下文
        // Default Canvas context
        const defaultCanvasContext: CanvasContext = {
            entityId: null,
            sortingLayer: SortingLayers.UI,
            baseSortOrder: 0,
            pixelPerfect: false
        };

        for (const entity of rootEntities) {
            this.layoutEntity(entity, parentX, parentY, this.canvasWidth, this.canvasHeight, 1, identityMatrix, true, 0, defaultCanvasContext);
        }
    }

    /**
     * 递归布局实体及其子元素
     * Recursively layout entity and its children
     */
    private layoutEntity(
        entity: Entity,
        parentX: number,
        parentY: number,
        parentWidth: number,
        parentHeight: number,
        parentAlpha: number,
        parentMatrix: Matrix2D,
        parentVisible: boolean = true,
        depth: number = 0,
        canvasContext: CanvasContext
    ): void {
        const transform = entity.getComponent(UITransformComponent);
        if (!transform) return;

        // 检查此实体是否有 UICanvasComponent
        // Check if this entity has UICanvasComponent
        const canvas = entity.getComponent(UICanvasComponent);
        let currentCanvasContext = canvasContext;

        if (canvas) {
            // 此实体是一个 Canvas，创建新的 Canvas 上下文
            // This entity is a Canvas, create new Canvas context
            currentCanvasContext = {
                entityId: entity.id,
                sortingLayer: canvas.sortingLayerName,
                baseSortOrder: canvas.sortOrder,
                pixelPerfect: canvas.pixelPerfect
            };
            canvas.canvasId = entity.id;
            canvas.dirty = false;
        }

        // 应用 Canvas 设置到 transform
        // Apply Canvas settings to transform
        transform.canvasEntityId = currentCanvasContext.entityId;
        transform.worldSortingLayer = currentCanvasContext.sortingLayer;
        transform.pixelPerfect = currentCanvasContext.pixelPerfect;

        // 计算锚点位置
        // X 轴：向右为正，anchorMinX=0 是左边，anchorMinX=1 是右边
        // Y 轴：向上为正，anchorMinY=0 是底部，anchorMinY=1 是顶部
        // X axis: right is positive, anchorMinX=0 is left, anchorMinX=1 is right
        // Y axis: up is positive, anchorMinY=0 is bottom, anchorMinY=1 is top
        const anchorMinX = parentX + parentWidth * transform.anchorMinX;
        const anchorMaxX = parentX + parentWidth * transform.anchorMaxX;
        // parentY 是顶部，anchorMinY=0 对应底部，anchorMinY=1 对应顶部
        // parentY is top, anchorMinY=0 maps to bottom, anchorMinY=1 maps to top
        const anchorMinY = parentY - parentHeight * (1 - transform.anchorMinY);
        const anchorMaxY = parentY - parentHeight * (1 - transform.anchorMaxY);

        // 计算元素尺寸
        let width: number;
        let height: number;

        // 如果锚点 min 和 max 相同，使用固定尺寸
        // If anchor min and max are the same, use fixed size
        if (transform.anchorMinX === transform.anchorMaxX) {
            width = transform.width;
        } else {
            // 拉伸模式：尺寸 = 锚点区域 + sizeDelta（width 字段存储 sizeDelta）
            // Stretch mode: size = anchor area + sizeDelta (width field stores sizeDelta)
            const anchorWidth = anchorMaxX - anchorMinX;
            width = anchorWidth + transform.width;
        }

        if (transform.anchorMinY === transform.anchorMaxY) {
            height = transform.height;
        } else {
            // 拉伸模式：尺寸 = 锚点区域 + sizeDelta（height 字段存储 sizeDelta）
            // Stretch mode: size = anchor area + sizeDelta (height field stores sizeDelta)
            const anchorHeight = anchorMaxY - anchorMinY;
            height = anchorHeight + transform.height;
        }

        // 应用尺寸约束
        if (transform.minWidth > 0) width = Math.max(width, transform.minWidth);
        if (transform.maxWidth > 0) width = Math.min(width, transform.maxWidth);
        if (transform.minHeight > 0) height = Math.max(height, transform.minHeight);
        if (transform.maxHeight > 0) height = Math.min(height, transform.maxHeight);

        // 计算世界位置（左下角，与 Gizmo origin=(0,0) 对应）
        // Calculate world position (bottom-left corner, matching Gizmo origin=(0,0))
        let worldX: number;
        let worldY: number;

        if (transform.anchorMinX === transform.anchorMaxX) {
            // 固定锚点模式：anchor 位置 + position 偏移 - pivot 偏移
            // Fixed anchor mode: anchor position + offset - pivot offset
            worldX = anchorMinX + transform.x - width * transform.pivotX;
        } else {
            // 拉伸模式：anchoredPosition 是相对于锚点中心的偏移
            // Stretch mode: anchoredPosition is offset from anchor center
            // pivot 位置 = 锚点中心 + anchoredPosition
            // Pivot position = anchor center + anchoredPosition
            const anchorCenterX = (anchorMinX + anchorMaxX) / 2;
            worldX = anchorCenterX + transform.x - width * transform.pivotX;
        }

        if (transform.anchorMinY === transform.anchorMaxY) {
            // 固定锚点模式：pivotY=0 是底部，pivotY=1 是顶部
            // Fixed anchor mode: pivotY=0 is bottom, pivotY=1 is top
            const anchorPosY = anchorMinY + transform.y;
            worldY = anchorPosY - height * transform.pivotY;
        } else {
            // 拉伸模式：anchoredPosition 是相对于锚点中心的偏移
            // Stretch mode: anchoredPosition is offset from anchor center
            const anchorCenterY = (anchorMinY + anchorMaxY) / 2;
            worldY = anchorCenterY + transform.y - height * transform.pivotY;
        }

        // 更新布局计算的值
        transform.worldX = worldX;
        transform.worldY = worldY;
        transform.computedWidth = width;
        transform.computedHeight = height;
        transform.worldAlpha = parentAlpha * transform.alpha;

        // 计算世界可见性（父元素不可见则子元素也不可见）
        // Calculate world visibility (if parent is invisible, children are also invisible)
        transform.worldVisible = parentVisible && transform.visible;

        // 计算世界层内顺序（子元素总是渲染在父元素之上）
        // Calculate world order in layer (children always render on top of parents)
        // 公式：canvasBaseSortOrder + depth * 1000 + localOrderInLayer
        // Formula: canvasBaseSortOrder + depth * 1000 + localOrderInLayer
        transform.worldOrderInLayer = currentCanvasContext.baseSortOrder + depth * 1000 + transform.orderInLayer;

        // 标记布局已计算 | Mark layout as computed
        transform.layoutComputed = true;

        // 使用矩阵乘法计算世界变换
        this.updateWorldMatrix(transform, parentMatrix);

        transform.layoutDirty = false;

        // 处理子元素布局 | Process child element layout
        const children = this.getUIChildren(entity);
        if (children.length === 0) return;

        // 计算子元素的父容器边界
        // 子元素的 parentY 应该是当前元素的顶部 Y 坐标（worldY 是底部，顶部 = 底部 + 高度）
        const childParentY = worldY + height;

        // 检查是否有布局组件
        const layout = entity.getComponent(UILayoutComponent);
        if (layout && layout.type !== UILayoutType.None) {
            this.layoutChildren(layout, transform, children, depth + 1, currentCanvasContext);
        } else {
            // 无布局组件，直接递归处理子元素
            for (const child of children) {
                this.layoutEntity(
                    child,
                    worldX,
                    childParentY,
                    width,
                    height,
                    transform.worldAlpha,
                    transform.localToWorldMatrix,
                    transform.worldVisible,
                    depth + 1,
                    currentCanvasContext
                );
            }
        }
    }

    /**
     * 根据布局组件布局子元素
     * Layout children according to layout component
     */
    private layoutChildren(
        layout: UILayoutComponent,
        parentTransform: UITransformComponent,
        children: Entity[],
        depth: number,
        canvasContext: CanvasContext
    ): void {
        // 父元素的世界坐标在此调用前应已计算，使用 ?? 回退以防万一
        // Parent's world coords should be computed before this call, use ?? fallback just in case
        const parentWorldX = parentTransform.worldX ?? parentTransform.x;
        const parentWorldY = parentTransform.worldY ?? parentTransform.y;
        const parentWidth = parentTransform.computedWidth ?? parentTransform.width;
        const parentHeight = parentTransform.computedHeight ?? parentTransform.height;

        const contentStartX = parentWorldX + layout.paddingLeft;
        // Y-up 系统：worldY 是底部，顶部 = worldY + height
        // contentStartY 是内容区域的顶部 Y（从顶部减去 paddingTop）
        const parentTopY = parentWorldY + parentHeight;
        const contentStartY = parentTopY - layout.paddingTop;
        const contentWidth = parentWidth - layout.getHorizontalPadding();
        const contentHeight = parentHeight - layout.getVerticalPadding();

        switch (layout.type) {
            case UILayoutType.Horizontal:
                this.layoutHorizontal(layout, parentTransform, children, contentStartX, contentStartY, contentWidth, contentHeight, depth, canvasContext);
                break;
            case UILayoutType.Vertical:
                this.layoutVertical(layout, parentTransform, children, contentStartX, contentStartY, contentWidth, contentHeight, depth, canvasContext);
                break;
            case UILayoutType.Grid:
                this.layoutGrid(layout, parentTransform, children, contentStartX, contentStartY, contentWidth, contentHeight, depth, canvasContext);
                break;
            default:
                for (const child of children) {
                    this.layoutEntity(
                        child,
                        parentWorldX,
                        parentTopY,
                        parentWidth,
                        parentHeight,
                        parentTransform.worldAlpha,
                        parentTransform.localToWorldMatrix,
                        parentTransform.worldVisible,
                        depth,
                        canvasContext
                    );
                }
        }
    }

    /**
     * 水平布局
     * Horizontal layout
     */
    private layoutHorizontal(
        layout: UILayoutComponent,
        parentTransform: UITransformComponent,
        children: Entity[],
        startX: number,
        startY: number,
        contentWidth: number,
        contentHeight: number,
        depth: number,
        canvasContext: CanvasContext
    ): void {
        // 计算总子元素宽度
        const childSizes = children.map(child => {
            const t = child.getComponent(UITransformComponent)!;
            return { entity: child, width: t.width, height: t.height };
        });

        const totalChildWidth = childSizes.reduce((sum, c) => sum + c.width, 0);
        const totalGap = layout.gap * (children.length - 1);
        const totalWidth = totalChildWidth + totalGap;

        // 计算起始位置（基于 justifyContent）
        let offsetX = startX;
        let gap = layout.gap;

        switch (layout.justifyContent) {
            case UIJustifyContent.Center:
                offsetX = startX + (contentWidth - totalWidth) / 2;
                break;
            case UIJustifyContent.End:
                offsetX = startX + contentWidth - totalWidth;
                break;
            case UIJustifyContent.SpaceBetween:
                if (children.length > 1) {
                    gap = (contentWidth - totalChildWidth) / (children.length - 1);
                }
                break;
            case UIJustifyContent.SpaceAround:
                if (children.length > 0) {
                    const space = (contentWidth - totalChildWidth) / children.length;
                    gap = space;
                    offsetX = startX + space / 2;
                }
                break;
            case UIJustifyContent.SpaceEvenly:
                if (children.length > 0) {
                    const space = (contentWidth - totalChildWidth) / (children.length + 1);
                    gap = space;
                    offsetX = startX + space;
                }
                break;
        }

        // 布局每个子元素
        // startY 是内容区域的顶部 Y（Y-up 系统）
        for (let i = 0; i < children.length; i++) {
            const child = children[i]!;
            const childTransform = child.getComponent(UITransformComponent)!;
            const size = childSizes[i]!;

            // 计算子元素顶部 Y 位置（基于 alignItems）
            // startY 是内容区域顶部，向下布局意味着 Y 值减小
            let childTopY = startY;  // 默认从顶部开始
            let childHeight = size.height;

            switch (layout.alignItems) {
                case UIAlignItems.Center:
                    // 在内容区域垂直居中：顶部 Y = startY - (contentHeight - childHeight) / 2
                    childTopY = startY - (contentHeight - childHeight) / 2;
                    break;
                case UIAlignItems.End:
                    // 对齐到底部：顶部 Y = startY - contentHeight + childHeight
                    childTopY = startY - contentHeight + childHeight;
                    break;
                case UIAlignItems.Stretch:
                    childHeight = contentHeight;
                    break;
                // UIAlignItems.Start: 默认从顶部开始，不需要修改
            }

            // 直接设置子元素的世界坐标（worldY 是底部 Y）
            childTransform.worldX = offsetX;
            childTransform.worldY = childTopY - childHeight;  // 底部 Y = 顶部 Y - 高度
            childTransform.computedWidth = size.width;
            childTransform.computedHeight = childHeight;
            childTransform.worldAlpha = parentTransform.worldAlpha * childTransform.alpha;
            // 传播世界可见性 | Propagate world visibility
            childTransform.worldVisible = parentTransform.worldVisible && childTransform.visible;
            // 计算世界层内顺序（包含 Canvas 基础排序）| Calculate world order in layer (with Canvas base sort)
            childTransform.worldOrderInLayer = canvasContext.baseSortOrder + depth * 1000 + childTransform.orderInLayer;
            // 传播 Canvas 设置 | Propagate Canvas settings
            childTransform.canvasEntityId = canvasContext.entityId;
            childTransform.worldSortingLayer = canvasContext.sortingLayer;
            childTransform.pixelPerfect = canvasContext.pixelPerfect;
            // 使用矩阵乘法计算世界旋转和缩放
            this.updateWorldMatrix(childTransform, parentTransform.localToWorldMatrix);
            childTransform.layoutComputed = true;
            childTransform.layoutDirty = false;

            // 递归处理子元素的子元素
            this.processChildrenRecursive(child, childTransform, depth, canvasContext);

            offsetX += size.width + gap;
        }
    }

    /**
     * 垂直布局
     * Vertical layout
     * Y-up 系统：startY 是内容区域的顶部，子元素从上往下排列（Y 值递减）
     */
    private layoutVertical(
        layout: UILayoutComponent,
        parentTransform: UITransformComponent,
        children: Entity[],
        startX: number,
        startY: number,
        contentWidth: number,
        contentHeight: number,
        depth: number,
        canvasContext: CanvasContext
    ): void {
        // 计算总子元素高度
        const childSizes = children.map(child => {
            const t = child.getComponent(UITransformComponent)!;
            return { entity: child, width: t.width, height: t.height };
        });

        const totalChildHeight = childSizes.reduce((sum, c) => sum + c.height, 0);
        const totalGap = layout.gap * (children.length - 1);
        const totalHeight = totalChildHeight + totalGap;

        // 计算第一个子元素的顶部 Y（Y-up 系统，从顶部开始向下）
        // startY 是内容区域顶部
        let currentTopY = startY;  // 从顶部开始
        let gap = layout.gap;

        switch (layout.justifyContent) {
            case UIJustifyContent.Center:
                // 垂直居中：第一个元素的顶部 Y = startY - (contentHeight - totalHeight) / 2
                currentTopY = startY - (contentHeight - totalHeight) / 2;
                break;
            case UIJustifyContent.End:
                // 对齐到底部：第一个元素的顶部 Y = startY - contentHeight + totalHeight
                currentTopY = startY - contentHeight + totalHeight;
                break;
            case UIJustifyContent.SpaceBetween:
                if (children.length > 1) {
                    gap = (contentHeight - totalChildHeight) / (children.length - 1);
                }
                break;
            case UIJustifyContent.SpaceAround:
                if (children.length > 0) {
                    const space = (contentHeight - totalChildHeight) / children.length;
                    gap = space;
                    currentTopY = startY - space / 2;
                }
                break;
            case UIJustifyContent.SpaceEvenly:
                if (children.length > 0) {
                    const space = (contentHeight - totalChildHeight) / (children.length + 1);
                    gap = space;
                    currentTopY = startY - space;
                }
                break;
        }

        // 布局每个子元素（从上往下）
        for (let i = 0; i < children.length; i++) {
            const child = children[i]!;
            const childTransform = child.getComponent(UITransformComponent)!;
            const size = childSizes[i]!;

            // 计算 X 位置
            let childX = startX;
            let childWidth = size.width;

            switch (layout.alignItems) {
                case UIAlignItems.Center:
                    childX = startX + (contentWidth - childWidth) / 2;
                    break;
                case UIAlignItems.End:
                    childX = startX + contentWidth - childWidth;
                    break;
                case UIAlignItems.Stretch:
                    childWidth = contentWidth;
                    break;
            }

            // worldY 是底部 Y = 顶部 Y - 高度
            childTransform.worldX = childX;
            childTransform.worldY = currentTopY - size.height;
            childTransform.computedWidth = childWidth;
            childTransform.computedHeight = size.height;
            childTransform.worldAlpha = parentTransform.worldAlpha * childTransform.alpha;
            // 传播世界可见性 | Propagate world visibility
            childTransform.worldVisible = parentTransform.worldVisible && childTransform.visible;
            // 计算世界层内顺序（包含 Canvas 基础排序）| Calculate world order in layer (with Canvas base sort)
            childTransform.worldOrderInLayer = canvasContext.baseSortOrder + depth * 1000 + childTransform.orderInLayer;
            // 传播 Canvas 设置 | Propagate Canvas settings
            childTransform.canvasEntityId = canvasContext.entityId;
            childTransform.worldSortingLayer = canvasContext.sortingLayer;
            childTransform.pixelPerfect = canvasContext.pixelPerfect;
            // 使用矩阵乘法计算世界旋转和缩放
            this.updateWorldMatrix(childTransform, parentTransform.localToWorldMatrix);
            childTransform.layoutComputed = true;
            childTransform.layoutDirty = false;

            this.processChildrenRecursive(child, childTransform, depth, canvasContext);

            // 移动到下一个元素的顶部位置（向下 = Y 减小）
            currentTopY -= size.height + gap;
        }
    }

    /**
     * 网格布局
     * Grid layout
     * Y-up 系统：startY 是内容区域的顶部，网格从上往下、从左往右排列
     */
    private layoutGrid(
        layout: UILayoutComponent,
        parentTransform: UITransformComponent,
        children: Entity[],
        startX: number,
        startY: number,
        contentWidth: number,
        _contentHeight: number,
        depth: number,
        canvasContext: CanvasContext
    ): void {
        const columns = layout.columns;
        const gapX = layout.getHorizontalGap();
        const gapY = layout.getVerticalGap();

        // 计算单元格尺寸
        const cellWidth = layout.cellWidth > 0
            ? layout.cellWidth
            : (contentWidth - gapX * (columns - 1)) / columns;
        const cellHeight = layout.cellHeight > 0
            ? layout.cellHeight
            : cellWidth; // 默认正方形

        for (let i = 0; i < children.length; i++) {
            const child = children[i]!;
            const childTransform = child.getComponent(UITransformComponent)!;

            const col = i % columns;
            const row = Math.floor(i / columns);

            const x = startX + col * (cellWidth + gapX);
            // Y-up 系统：第一行在顶部，行号增加 Y 值减小
            // 单元格顶部 Y = startY - row * (cellHeight + gapY)
            // 单元格底部 Y = 顶部 Y - cellHeight
            const cellTopY = startY - row * (cellHeight + gapY);
            const y = cellTopY - cellHeight;  // worldY 是底部 Y

            childTransform.worldX = x;
            childTransform.worldY = y;
            childTransform.computedWidth = cellWidth;
            childTransform.computedHeight = cellHeight;
            childTransform.worldAlpha = parentTransform.worldAlpha * childTransform.alpha;
            // 传播世界可见性 | Propagate world visibility
            childTransform.worldVisible = parentTransform.worldVisible && childTransform.visible;
            // 计算世界层内顺序（包含 Canvas 基础排序）| Calculate world order in layer (with Canvas base sort)
            childTransform.worldOrderInLayer = canvasContext.baseSortOrder + depth * 1000 + childTransform.orderInLayer;
            // 传播 Canvas 设置 | Propagate Canvas settings
            childTransform.canvasEntityId = canvasContext.entityId;
            childTransform.worldSortingLayer = canvasContext.sortingLayer;
            childTransform.pixelPerfect = canvasContext.pixelPerfect;
            // 使用矩阵乘法计算世界旋转和缩放
            this.updateWorldMatrix(childTransform, parentTransform.localToWorldMatrix);
            childTransform.layoutComputed = true;
            childTransform.layoutDirty = false;

            this.processChildrenRecursive(child, childTransform, depth, canvasContext);
        }
    }

    /**
     * 获取具有 UITransformComponent 的子实体
     * Get child entities that have UITransformComponent
     *
     * 优先使用 HierarchyComponent，如果没有则返回空数组
     * 优先从当前帧实体映射查找，解决第一帧 findEntityById 返回 null 的问题
     */
    private getUIChildren(entity: Entity): Entity[] {
        const hierarchy = entity.getComponent(HierarchyComponent);

        // 如果没有 HierarchyComponent，返回空数组
        // UI 实体应该通过 UIBuilder 创建，会自动添加 HierarchyComponent
        if (!hierarchy) {
            return [];
        }

        if (hierarchy.childIds.length === 0) {
            return [];
        }

        const children: Entity[] = [];
        for (const childId of hierarchy.childIds) {
            // 优先从当前帧实体映射查找（解决第一帧问题）
            // Prefer looking up from current frame entity map (fixes first frame issue)
            let child = this.currentFrameEntityMap.get(childId);
            const fromMap = !!child;
            if (!child) {
                // 回退到场景查找
                // Fallback to scene lookup
                child = this.scene?.findEntityById(childId) ?? undefined;
            }
            if (child && child.hasComponent(UITransformComponent)) {
                children.push(child);
            }
        }
        return children;
    }

    /**
     * 递归处理子元素
     * Recursively process children
     */
    private processChildrenRecursive(entity: Entity, parentTransform: UITransformComponent, depth: number, canvasContext: CanvasContext): void {
        const children = this.getUIChildren(entity);
        if (children.length === 0) return;

        // 父元素的世界坐标在此调用前应已计算，使用 ?? 回退以防万一
        // Parent's world coords should be computed before this call, use ?? fallback just in case
        const parentWorldX = parentTransform.worldX ?? parentTransform.x;
        const parentWorldY = parentTransform.worldY ?? parentTransform.y;
        const parentWidth = parentTransform.computedWidth ?? parentTransform.width;
        const parentHeight = parentTransform.computedHeight ?? parentTransform.height;

        // 计算子元素的父容器顶部 Y（worldY 是底部，顶部 = 底部 + 高度）
        const parentTopY = parentWorldY + parentHeight;

        const layout = entity.getComponent(UILayoutComponent);
        if (layout && layout.type !== UILayoutType.None) {
            this.layoutChildren(layout, parentTransform, children, depth + 1, canvasContext);
        } else {
            for (const child of children) {
                this.layoutEntity(
                    child,
                    parentWorldX,
                    parentTopY,
                    parentWidth,
                    parentHeight,
                    parentTransform.worldAlpha,
                    parentTransform.localToWorldMatrix,
                    parentTransform.worldVisible,
                    depth + 1,
                    canvasContext
                );
            }
        }
    }

    // ===== 矩阵计算方法 Matrix calculation methods =====

    /**
     * 计算本地变换矩阵
     * Calculate local transformation matrix
     *
     * @param pivotX - 轴心点 X (0-1)
     * @param pivotY - 轴心点 Y (0-1)
     * @param width - 元素宽度
     * @param height - 元素高度
     * @param rotation - 旋转角度（弧度）
     * @param scaleX - X 缩放
     * @param scaleY - Y 缩放
     * @param x - 元素世界 X 位置
     * @param y - 元素世界 Y 位置
     */
    private calculateLocalMatrix(
        pivotX: number,
        pivotY: number,
        width: number,
        height: number,
        rotation: number,
        scaleX: number,
        scaleY: number,
        x: number,
        y: number
    ): Matrix2D {
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        // 轴心点相对于元素左下角的偏移
        const px = width * pivotX;
        const py = height * pivotY;

        // 构建变换矩阵: Translate(-pivot) -> Scale -> Rotate -> Translate(position + pivot)
        // 最终矩阵将轴心点作为旋转/缩放中心
        // 顺时针旋转矩阵 | Clockwise rotation matrix
        return {
            a: scaleX * cos,
            b: -scaleX * sin,
            c: scaleY * sin,
            d: scaleY * cos,
            tx: x + px - (scaleX * cos * px + scaleY * sin * py),
            ty: y + py - (-scaleX * sin * px + scaleY * cos * py)
        };
    }

    /**
     * 矩阵乘法: result = a * b
     * Matrix multiplication: result = a * b
     */
    private multiplyMatrices(a: Matrix2D, b: Matrix2D): Matrix2D {
        return {
            a: a.a * b.a + a.c * b.b,
            b: a.b * b.a + a.d * b.b,
            c: a.a * b.c + a.c * b.d,
            d: a.b * b.c + a.d * b.d,
            tx: a.a * b.tx + a.c * b.ty + a.tx,
            ty: a.b * b.tx + a.d * b.ty + a.ty
        };
    }

    /**
     * 从世界矩阵分解出旋转和缩放
     * Decompose rotation and scale from world matrix
     */
    private decomposeMatrix(m: Matrix2D): { rotation: number; scaleX: number; scaleY: number } {
        // 计算缩放
        const scaleX = Math.sqrt(m.a * m.a + m.b * m.b);
        const scaleY = Math.sqrt(m.c * m.c + m.d * m.d);

        // 检测负缩放（通过行列式符号）
        const det = m.a * m.d - m.b * m.c;
        const sign = det < 0 ? -1 : 1;

        // 计算旋转（从归一化的矩阵）
        let rotation = 0;
        if (scaleX > 1e-10) {
            rotation = Math.atan2(m.b / scaleX, m.a / scaleX);
        }

        return {
            rotation,
            scaleX,
            scaleY: scaleY * sign
        };
    }

    /**
     * 更新元素的世界变换矩阵
     * Update element's world transformation matrix
     */
    private updateWorldMatrix(transform: UITransformComponent, parentMatrix: Matrix2D | null): void {
        // 此方法在布局计算后调用，worldX/worldY/computedWidth/Height 应已计算
        // This method is called after layout calculation, worldX/Y/computed values should be ready
        const worldX = transform.worldX ?? transform.x;
        const worldY = transform.worldY ?? transform.y;
        const width = transform.computedWidth ?? transform.width;
        const height = transform.computedHeight ?? transform.height;

        // 计算本地矩阵（度转弧度）
        const localMatrix = this.calculateLocalMatrix(
            transform.pivotX,
            transform.pivotY,
            width,
            height,
            transform.rotation * DEG_TO_RAD,
            transform.scaleX,
            transform.scaleY,
            worldX,
            worldY
        );

        // 计算世界矩阵
        if (parentMatrix) {
            transform.localToWorldMatrix = this.multiplyMatrices(parentMatrix, localMatrix);
        } else {
            transform.localToWorldMatrix = localMatrix;
        }

        // 从世界矩阵分解出世界旋转和缩放（弧度转度）
        const decomposed = this.decomposeMatrix(transform.localToWorldMatrix);
        transform.worldRotation = decomposed.rotation * RAD_TO_DEG;
        transform.worldScaleX = decomposed.scaleX;
        transform.worldScaleY = decomposed.scaleY;
    }
}
