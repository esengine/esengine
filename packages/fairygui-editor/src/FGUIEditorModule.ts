/**
 * FGUIEditorModule
 *
 * Editor module for FairyGUI integration.
 * Registers components, inspectors, and entity templates.
 *
 * FairyGUI 编辑器模块，注册组件、检视器和实体模板
 */

import type { ServiceContainer, Entity } from '@esengine/ecs-framework';
import { Core } from '@esengine/ecs-framework';
import type { IEditorModuleLoader, EntityCreationTemplate } from '@esengine/editor-core';
import {
    EntityStoreService,
    MessageHub,
    EditorComponentRegistry,
    ComponentInspectorRegistry,
    GizmoRegistry,
    GizmoColors,
    VirtualNodeRegistry
} from '@esengine/editor-core';
import type { IGizmoRenderData, IRectGizmoData, GizmoColor, IVirtualNode } from '@esengine/editor-core';
import { TransformComponent } from '@esengine/engine-core';
import {
    FGUIComponent,
    GComponent,
    GObject,
    Stage,
    GGraph,
    GImage,
    GTextField,
    GLoader,
    GButton,
    GList,
    GProgressBar,
    GSlider
} from '@esengine/fairygui';
import { fguiComponentInspector } from './inspectors';

/**
 * Gizmo colors for FGUI nodes
 * FGUI 节点的 Gizmo 颜色
 */
const FGUIGizmoColors = {
    /** Root component bounds | 根组件边界 */
    root: { r: 0.2, g: 0.6, b: 1.0, a: 0.8 } as GizmoColor,
    /** Child element bounds (selected virtual node) | 子元素边界（选中的虚拟节点） */
    childSelected: { r: 1.0, g: 0.8, b: 0.2, a: 0.8 } as GizmoColor,
    /** Child element bounds (unselected) | 子元素边界（未选中） */
    childUnselected: { r: 1.0, g: 0.8, b: 0.2, a: 0.15 } as GizmoColor
};

/**
 * Collect gizmo data from FGUI node tree
 * 从 FGUI 节点树收集 Gizmo 数据
 *
 * Uses the same coordinate conversion as FGUIRenderDataProvider:
 * - FGUI: top-left origin, Y-down
 * - Engine: center origin, Y-up
 * - Conversion: engineX = fguiX - halfWidth, engineY = halfHeight - fguiY
 *
 * 使用与 FGUIRenderDataProvider 相同的坐标转换：
 * - FGUI：左上角为原点，Y 向下
 * - 引擎：中心为原点，Y 向上
 * - 转换公式：engineX = fguiX - halfWidth, engineY = halfHeight - fguiY
 *
 * @param obj The GObject to collect from | 要收集的 GObject
 * @param halfWidth Half of Stage.designWidth | Stage.designWidth 的一半
 * @param halfHeight Half of Stage.designHeight | Stage.designHeight 的一半
 * @param gizmos Array to add gizmos to | 添加 gizmos 的数组
 * @param entityId The entity ID for virtual node selection check | 用于检查虚拟节点选中的实体 ID
 * @param selectedVirtualNodeId Currently selected virtual node ID | 当前选中的虚拟节点 ID
 * @param parentPath Path prefix for virtual node ID generation | 虚拟节点 ID 生成的路径前缀
 */
function collectFGUIGizmos(
    obj: GObject,
    halfWidth: number,
    halfHeight: number,
    gizmos: IGizmoRenderData[],
    entityId: number,
    selectedVirtualNodeId: string | null,
    parentPath: string
): void {
    // Skip invisible objects
    if (!obj.visible) return;

    // Generate virtual node ID (same logic as collectFGUIVirtualNodes)
    const nodePath = parentPath ? `${parentPath}/${obj.name || obj.id}` : (obj.name || obj.id);

    // Use localToGlobal to get the global position in FGUI coordinate system
    // This handles all parent transforms correctly
    // 使用 localToGlobal 获取 FGUI 坐标系中的全局位置
    // 这正确处理了所有父级变换
    const globalPos = obj.localToGlobal(0, 0);
    const fguiX = globalPos.x;
    const fguiY = globalPos.y;

    // Convert from FGUI coordinates to engine coordinates
    // Same formula as FGUIRenderDataProvider
    // 从 FGUI 坐标转换为引擎坐标，与 FGUIRenderDataProvider 使用相同公式
    // Engine position is the top-left corner converted to engine coords
    const engineX = fguiX - halfWidth;
    const engineY = halfHeight - fguiY;

    // For gizmo rect, we need the center position
    // Engine Y increases upward, so center is at (engineX + width/2, engineY - height/2)
    // 对于 gizmo 矩形，我们需要中心位置
    // 引擎 Y 向上递增，所以中心在 (engineX + width/2, engineY - height/2)
    const centerX = engineX + obj.width / 2;
    const centerY = engineY - obj.height / 2;

    // Determine color based on selection state
    // 根据选中状态确定颜色
    const isSelected = nodePath === selectedVirtualNodeId;
    const color = isSelected ? FGUIGizmoColors.childSelected : FGUIGizmoColors.childUnselected;

    // Add rect gizmo for this object
    const rectGizmo: IRectGizmoData = {
        type: 'rect',
        x: centerX,
        y: centerY,
        width: obj.width,
        height: obj.height,
        rotation: 0,
        originX: 0.5,
        originY: 0.5,
        color,
        showHandles: isSelected,
        virtualNodeId: nodePath
    };
    gizmos.push(rectGizmo);

    // If this is a container, recurse into children
    if (obj instanceof GComponent) {
        for (let i = 0; i < obj.numChildren; i++) {
            const child = obj.getChildAt(i);
            collectFGUIGizmos(child, halfWidth, halfHeight, gizmos, entityId, selectedVirtualNodeId, nodePath);
        }
    }
}

/**
 * Gizmo provider for FGUIComponent
 * FGUIComponent 的 Gizmo 提供者
 *
 * Generates rect gizmos for all visible FGUI nodes.
 * Uses the same coordinate conversion as FGUIRenderDataProvider.
 * 为所有可见的 FGUI 节点生成矩形 gizmos。
 * 使用与 FGUIRenderDataProvider 相同的坐标转换。
 */
function fguiGizmoProvider(
    component: FGUIComponent,
    entity: Entity,
    isSelected: boolean
): IGizmoRenderData[] {
    const gizmos: IGizmoRenderData[] = [];

    // Get the root GObject
    const root = component.root;
    if (!root) return gizmos;

    // Get Stage design size for coordinate conversion
    // Use the same values as FGUIRenderDataProvider
    // 获取 Stage 设计尺寸用于坐标转换，与 FGUIRenderDataProvider 使用相同的值
    const stage = Stage.inst;
    const halfWidth = stage.designWidth / 2;
    const halfHeight = stage.designHeight / 2;

    // Root gizmo - root is at (0, 0) in FGUI coords
    // In engine coords: center is at (-halfWidth + width/2, halfHeight - height/2)
    // 根 Gizmo - 根节点在 FGUI 坐标 (0, 0)
    // 在引擎坐标中：中心在 (-halfWidth + width/2, halfHeight - height/2)
    const rootCenterX = -halfWidth + root.width / 2;
    const rootCenterY = halfHeight - root.height / 2;

    const rootGizmo: IRectGizmoData = {
        type: 'rect',
        x: rootCenterX,
        y: rootCenterY,
        width: root.width,
        height: root.height,
        rotation: 0,
        originX: 0.5,
        originY: 0.5,
        color: isSelected ? FGUIGizmoColors.root : { ...FGUIGizmoColors.root, a: 0.4 },
        showHandles: isSelected
    };
    gizmos.push(rootGizmo);

    // Collect child gizmos only when selected (performance optimization)
    if (isSelected && component.component) {
        const comp = component.component;

        // Get currently selected virtual node for this entity
        // 获取此实体当前选中的虚拟节点
        const selectedInfo = VirtualNodeRegistry.getSelectedVirtualNode();
        const selectedVirtualNodeId = (selectedInfo && selectedInfo.entityId === entity.id)
            ? selectedInfo.virtualNodeId
            : null;

        // First add gizmo for the component itself
        // 首先为组件本身添加 gizmo
        collectFGUIGizmos(comp, halfWidth, halfHeight, gizmos, entity.id, selectedVirtualNodeId, '');
    }

    return gizmos;
}

/**
 * Get the type name of a GObject
 * 获取 GObject 的类型名称
 */
function getGObjectTypeName(obj: GObject): string {
    // Use constructor name as type
    const name = obj.constructor.name;
    // Remove 'G' prefix for cleaner display
    if (name.startsWith('G') && name.length > 1) {
        return name.slice(1);
    }
    return name;
}

/**
 * Graph type enum to string mapping
 * 图形类型枚举到字符串的映射
 */
const GraphTypeNames: Record<number, string> = {
    0: 'Empty',
    1: 'Rect',
    2: 'Ellipse',
    3: 'Polygon',
    4: 'RegularPolygon'
};

/**
 * Flip type enum to string mapping
 * 翻转类型枚举到字符串的映射
 */
const FlipTypeNames: Record<number, string> = {
    0: 'None',
    1: 'Horizontal',
    2: 'Vertical',
    3: 'Both'
};

/**
 * Fill method enum to string mapping
 * 填充方法枚举到字符串的映射
 */
const FillMethodNames: Record<number, string> = {
    0: 'None',
    1: 'Horizontal',
    2: 'Vertical',
    3: 'Radial90',
    4: 'Radial180',
    5: 'Radial360'
};

/**
 * Align type enum to string mapping
 * 对齐类型枚举到字符串的映射
 */
const AlignTypeNames: Record<number, string> = {
    0: 'Left',
    1: 'Center',
    2: 'Right'
};

/**
 * Vertical align type enum to string mapping
 * 垂直对齐类型枚举到字符串的映射
 */
const VertAlignTypeNames: Record<number, string> = {
    0: 'Top',
    1: 'Middle',
    2: 'Bottom'
};

/**
 * Loader fill type enum to string mapping
 * 加载器填充类型枚举到字符串的映射
 */
const LoaderFillTypeNames: Record<number, string> = {
    0: 'None',
    1: 'Scale',
    2: 'ScaleMatchHeight',
    3: 'ScaleMatchWidth',
    4: 'ScaleFree',
    5: 'ScaleNoBorder'
};

/**
 * Button mode enum to string mapping
 * 按钮模式枚举到字符串的映射
 */
const ButtonModeNames: Record<number, string> = {
    0: 'Common',
    1: 'Check',
    2: 'Radio'
};

/**
 * Auto size type enum to string mapping
 * 自动尺寸类型枚举到字符串的映射
 */
const AutoSizeTypeNames: Record<number, string> = {
    0: 'None',
    1: 'Both',
    2: 'Height',
    3: 'Shrink',
    4: 'Ellipsis'
};

/**
 * Extract type-specific properties from a GObject
 * 从 GObject 提取类型特定的属性
 */
function extractTypeSpecificData(obj: GObject): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    // GGraph specific properties
    if (obj instanceof GGraph) {
        data.graphType = GraphTypeNames[obj.type] || obj.type;
        // Use public getters where available, fall back to private fields
        data.lineColor = obj.lineColor;
        data.fillColor = obj.fillColor;
        // Access private fields via type assertion for properties without public getters
        const graph = obj as unknown as {
            _lineSize: number;
            _cornerRadius: number[] | null;
            _sides: number;
            _startAngle: number;
        };
        data.lineSize = graph._lineSize;
        if (graph._cornerRadius) {
            data.cornerRadius = graph._cornerRadius.join(', ');
        }
        if (obj.type === 4) { // RegularPolygon
            data.sides = graph._sides;
            data.startAngle = graph._startAngle;
        }
    }

    // GImage specific properties
    if (obj instanceof GImage) {
        data.color = obj.color;
        data.flip = FlipTypeNames[obj.flip] || obj.flip;
        data.fillMethod = FillMethodNames[obj.fillMethod] || obj.fillMethod;
        if (obj.fillMethod !== 0) {
            data.fillOrigin = obj.fillOrigin;
            data.fillClockwise = obj.fillClockwise;
            data.fillAmount = obj.fillAmount;
        }
    }

    // GTextField specific properties
    if (obj instanceof GTextField) {
        data.text = obj.text;
        data.font = obj.font;
        data.fontSize = obj.fontSize;
        data.color = obj.color;
        data.align = AlignTypeNames[obj.align] || obj.align;
        data.valign = VertAlignTypeNames[obj.valign] || obj.valign;
        data.leading = obj.leading;
        data.letterSpacing = obj.letterSpacing;
        data.bold = obj.bold;
        data.italic = obj.italic;
        data.underline = obj.underline;
        data.singleLine = obj.singleLine;
        data.autoSize = AutoSizeTypeNames[obj.autoSize] || obj.autoSize;
        if (obj.stroke > 0) {
            data.stroke = obj.stroke;
            data.strokeColor = obj.strokeColor;
        }
    }

    // GLoader specific properties
    if (obj instanceof GLoader) {
        data.url = obj.url;
        data.align = AlignTypeNames[obj.align] || obj.align;
        data.verticalAlign = VertAlignTypeNames[obj.verticalAlign] || obj.verticalAlign;
        data.fill = LoaderFillTypeNames[obj.fill] || obj.fill;
        data.shrinkOnly = obj.shrinkOnly;
        data.autoSize = obj.autoSize;
        data.color = obj.color;
        data.fillMethod = FillMethodNames[obj.fillMethod] || obj.fillMethod;
        if (obj.fillMethod !== 0) {
            data.fillOrigin = obj.fillOrigin;
            data.fillClockwise = obj.fillClockwise;
            data.fillAmount = obj.fillAmount;
        }
    }

    // GButton specific properties
    if (obj instanceof GButton) {
        data.title = obj.title;
        data.icon = obj.icon;
        data.mode = ButtonModeNames[obj.mode] || obj.mode;
        data.selected = obj.selected;
        data.titleColor = obj.titleColor;
        data.titleFontSize = obj.titleFontSize;
        if (obj.selectedTitle) {
            data.selectedTitle = obj.selectedTitle;
        }
        if (obj.selectedIcon) {
            data.selectedIcon = obj.selectedIcon;
        }
    }

    // GList specific properties
    if (obj instanceof GList) {
        data.defaultItem = obj.defaultItem;
        data.itemCount = obj.numItems;
        data.selectedIndex = obj.selectedIndex;
        data.scrollPane = obj.scrollPane ? 'Yes' : 'No';
    }

    // GProgressBar specific properties
    if (obj instanceof GProgressBar) {
        data.value = obj.value;
        data.max = obj.max;
    }

    // GSlider specific properties
    if (obj instanceof GSlider) {
        data.value = obj.value;
        data.max = obj.max;
    }

    // GComponent specific properties (for all components)
    if (obj instanceof GComponent) {
        data.numChildren = obj.numChildren;
        data.numControllers = obj.numControllers;
        // Access private _transitions array via type assertion for display
        const comp = obj as unknown as { _transitions: unknown[] };
        data.numTransitions = comp._transitions?.length || 0;
    }

    return data;
}

/**
 * Collect virtual nodes from FGUI node tree
 * 从 FGUI 节点树收集虚拟节点
 *
 * Uses localToGlobal to get correct global positions.
 * 使用 localToGlobal 获取正确的全局位置。
 */
function collectFGUIVirtualNodes(
    obj: GObject,
    halfWidth: number,
    halfHeight: number,
    parentPath: string
): IVirtualNode {
    // Use localToGlobal to get the global position in FGUI coordinate system
    // 使用 localToGlobal 获取 FGUI 坐标系中的全局位置
    const globalPos = obj.localToGlobal(0, 0);

    // Convert to engine coordinates for display
    // 转换为引擎坐标用于显示
    const engineX = globalPos.x - halfWidth;
    const engineY = halfHeight - globalPos.y;

    const nodePath = parentPath ? `${parentPath}/${obj.name || obj.id}` : (obj.name || obj.id);

    const children: IVirtualNode[] = [];

    // If this is a container, collect children
    if (obj instanceof GComponent) {
        for (let i = 0; i < obj.numChildren; i++) {
            const child = obj.getChildAt(i);
            children.push(collectFGUIVirtualNodes(child, halfWidth, halfHeight, nodePath));
        }
    }

    // Extract common properties
    const commonData: Record<string, unknown> = {
        className: obj.constructor.name,
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
        alpha: obj.alpha,
        visible: obj.visible,
        touchable: obj.touchable,
        rotation: obj.rotation,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY
    };

    // Extract type-specific properties
    const typeSpecificData = extractTypeSpecificData(obj);

    return {
        id: nodePath,
        name: obj.name || `[${getGObjectTypeName(obj)}]`,
        type: getGObjectTypeName(obj),
        children,
        visible: obj.visible,
        data: {
            ...commonData,
            ...typeSpecificData
        },
        x: engineX,
        y: engineY,
        width: obj.width,
        height: obj.height
    };
}

/**
 * Virtual node provider for FGUIComponent
 * FGUIComponent 的虚拟节点提供者
 *
 * Returns the internal FGUI node tree as virtual nodes.
 * 将内部 FGUI 节点树作为虚拟节点返回。
 */
function fguiVirtualNodeProvider(
    component: FGUIComponent,
    _entity: Entity
): IVirtualNode[] {
    if (!component.isReady || !component.component) {
        return [];
    }

    // Get Stage design size for coordinate conversion
    // 获取 Stage 设计尺寸用于坐标转换
    const stage = Stage.inst;
    const halfWidth = stage.designWidth / 2;
    const halfHeight = stage.designHeight / 2;

    // Collect from the loaded component
    // 从加载的组件收集
    const rootNode = collectFGUIVirtualNodes(
        component.component,
        halfWidth,
        halfHeight,
        ''
    );

    // Return the children of the root (we don't want to duplicate the root)
    return rootNode.children.length > 0 ? rootNode.children : [rootNode];
}

/**
 * FGUIEditorModule
 *
 * Editor module that provides FairyGUI integration.
 *
 * 提供 FairyGUI 集成的编辑器模块
 */
export class FGUIEditorModule implements IEditorModuleLoader {
    /**
     * Install the module
     * 安装模块
     */
    async install(services: ServiceContainer): Promise<void> {
        // Register component
        const componentRegistry = services.resolve(EditorComponentRegistry);
        if (componentRegistry) {
            componentRegistry.register({
                name: 'FGUIComponent',
                type: FGUIComponent,
                category: 'components.category.ui',
                description: 'FairyGUI component for loading and displaying .fui packages',
                icon: 'Layout'
            });
        }

        // Register custom inspector
        const inspectorRegistry = services.resolve(ComponentInspectorRegistry);
        if (inspectorRegistry) {
            inspectorRegistry.register(fguiComponentInspector);
        }

        // Register gizmo provider for FGUIComponent
        // 为 FGUIComponent 注册 Gizmo 提供者
        GizmoRegistry.register(FGUIComponent, fguiGizmoProvider);

        // Register virtual node provider for FGUIComponent
        // 为 FGUIComponent 注册虚拟节点提供者
        VirtualNodeRegistry.register(FGUIComponent, fguiVirtualNodeProvider);
    }

    /**
     * Uninstall the module
     * 卸载模块
     */
    async uninstall(): Promise<void> {
        // Unregister gizmo provider
        GizmoRegistry.unregister(FGUIComponent);
        // Unregister virtual node provider
        VirtualNodeRegistry.unregister(FGUIComponent);
    }

    /**
     * Get entity creation templates
     * 获取实体创建模板
     */
    getEntityCreationTemplates(): EntityCreationTemplate[] {
        return [
            {
                id: 'create-fgui-root',
                label: 'FGUI Root',
                icon: 'Layout',
                category: 'ui',
                order: 300,
                create: (): number => this.createFGUIEntity('FGUI Root', { width: 1920, height: 1080 })
            },
            {
                id: 'create-fgui-view',
                label: 'FGUI View',
                icon: 'Image',
                category: 'ui',
                order: 301,
                create: (): number => this.createFGUIEntity('FGUI View')
            }
        ];
    }

    /**
     * Create FGUI entity with optional configuration
     * 创建 FGUI 实体，可选配置
     */
    private createFGUIEntity(baseName: string, config?: { width?: number; height?: number }): number {
        const scene = Core.scene;
        if (!scene) {
            throw new Error('Scene not available');
        }

        const entityStore = Core.services.resolve(EntityStoreService);
        const messageHub = Core.services.resolve(MessageHub);

        if (!entityStore || !messageHub) {
            throw new Error('EntityStoreService or MessageHub not available');
        }

        // Generate unique name
        const existingCount = entityStore.getAllEntities()
            .filter((e: Entity) => e.name.startsWith(baseName)).length;
        const entityName = existingCount > 0 ? `${baseName} ${existingCount + 1}` : baseName;

        // Create entity
        const entity = scene.createEntity(entityName);

        // Add transform component
        entity.addComponent(new TransformComponent());

        // Add FGUI component
        const fguiComponent = new FGUIComponent();
        if (config?.width) fguiComponent.width = config.width;
        if (config?.height) fguiComponent.height = config.height;
        entity.addComponent(fguiComponent);

        // Register and select entity
        entityStore.addEntity(entity);
        messageHub.publish('entity:added', { entity });
        messageHub.publish('scene:modified', {});
        entityStore.selectEntity(entity);

        return entity.id;
    }
}

/**
 * Default FGUI editor module instance
 * 默认 FGUI 编辑器模块实例
 */
export const fguiEditorModule = new FGUIEditorModule();
