/**
 * @zh 选择服务 - 节点选择管理
 * @en Selection Service - Node selection management
 *
 * Layer 3: 依赖 EngineAdapter, SceneService, CameraService。
 * Layer 3: Depends on EngineAdapter, SceneService, CameraService.
 */

import type { ComponentInfo, ComponentPropertyInfo, SelectedNodeInfo, TransformInfo, Unsubscribe, Vec2 } from './types';
import { quaternionToEuler } from './types';
import { DEFAULT_OBJECT } from './GizmoConstants';
import type { CCESNode, CCESComponent } from './types/ccesengine';
import type { IEngineAdapter } from './EngineAdapter';
import type { ISceneService } from './SceneService';
import type { ICameraService } from './CameraService';
import { getEngineAdapter } from './EngineAdapter';
import { getSceneService } from './SceneService';
import { getCameraService } from './CameraService';



/**
 * @zh 选择服务接口
 * @en Selection service interface
 */
export interface ISelectionService {
    // Selection State
    readonly selectedNodeIds: string[];
    readonly primarySelectedId: string | null;

    // Selection Operations
    select(nodeId: string): void;
    addToSelection(nodeId: string): void;
    removeFromSelection(nodeId: string): void;
    toggleSelection(nodeId: string): void;
    selectAll(): void;
    clearSelection(): void;

    // Selection Info
    getSelectedNodes(): CCESNode[];
    getSelectedNodeInfo(): SelectedNodeInfo | null;
    getSelectedComponents(): ComponentInfo[];

    // Hit Testing
    hitTestNode(screenX: number, screenY: number, viewportWidth: number, viewportHeight: number): string | null;

    // Events
    onSelectionChanged(callback: (nodeIds: string[]) => void): Unsubscribe;
}



/**
 * @zh 选择服务实现
 * @en Selection service implementation
 */
class SelectionServiceImpl implements ISelectionService {
    private _adapter: IEngineAdapter;
    private _sceneService: ISceneService;
    private _cameraService: ICameraService;
    private _selectedIds: string[] = [];
    private _changeCallbacks: Array<(nodeIds: string[]) => void> = [];

    constructor() {
        this._adapter = getEngineAdapter();
        this._sceneService = getSceneService();
        this._cameraService = getCameraService();
    }



    get selectedNodeIds(): string[] {
        return [...this._selectedIds];
    }

    get primarySelectedId(): string | null {
        return this._selectedIds[0] ?? null;
    }



    select(nodeId: string): void {
        if (this._selectedIds.length === 1 && this._selectedIds[0] === nodeId) {
            return;
        }
        this._selectedIds = [nodeId];
        this.notifyChange();
    }

    addToSelection(nodeId: string): void {
        if (!this._selectedIds.includes(nodeId)) {
            this._selectedIds.push(nodeId);
            this.notifyChange();
        }
    }

    removeFromSelection(nodeId: string): void {
        const index = this._selectedIds.indexOf(nodeId);
        if (index >= 0) {
            this._selectedIds.splice(index, 1);
            this.notifyChange();
        }
    }

    toggleSelection(nodeId: string): void {
        if (this._selectedIds.includes(nodeId)) {
            this.removeFromSelection(nodeId);
        } else {
            this.addToSelection(nodeId);
        }
    }

    selectAll(): void {
        const tree = this._sceneService.getSceneTree();
        const allIds: string[] = [];

        const collectIds = (nodes: typeof tree) => {
            for (const node of nodes) {
                allIds.push(node.id);
                collectIds(node.children);
            }
        };

        collectIds(tree);
        this._selectedIds = allIds;
        this.notifyChange();
    }

    clearSelection(): void {
        if (this._selectedIds.length > 0) {
            this._selectedIds = [];
            this.notifyChange();
        }
    }



    getSelectedNodes(): CCESNode[] {
        return this._selectedIds
            .map(id => this._sceneService.findNodeById(id))
            .filter((node): node is CCESNode => node !== null);
    }

    getSelectedNodeInfo(): SelectedNodeInfo | null {
        const nodeId = this.primarySelectedId;
        if (!nodeId) return null;

        const node = this._sceneService.findNodeById(nodeId);
        if (!node) return null;

        return {
            id: node.uuid,
            name: node.name,
            active: node.active,
            transform: this.getNodeTransform(node),
            components: this.getNodeComponents(node),
        };
    }

    getSelectedComponents(): ComponentInfo[] {
        const node = this._sceneService.findNodeById(this.primarySelectedId ?? '');
        if (!node) return [];
        return this.getNodeComponents(node);
    }



    /**
     * @zh 在屏幕坐标查找节点
     * @en Find node at screen coordinates
     */
    hitTestNode(screenX: number, screenY: number, viewportWidth: number, viewportHeight: number): string | null {
        const scene = this._sceneService.getScene();
        if (!scene) return null;

        const worldPos = this._cameraService.screenToWorld(screenX, screenY, viewportWidth, viewportHeight);

        return this.hitTestRecursive(scene.children, worldPos);
    }

    private hitTestRecursive(nodes: CCESNode[], worldPos: Vec2): string | null {
        // Iterate in reverse to check front nodes first
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            if (!node) continue;

            // Check children first
            const childHit = this.hitTestRecursive(node.children || [], worldPos);
            if (childHit) return childHit;

            // Check this node
            if (!node.active) continue;

            // Get node bounds (approximate with position and scale)
            const pos = node.position;
            const scale = node.scale;
            const halfWidth = DEFAULT_OBJECT.HALF_SIZE * Math.abs(scale.x);
            const halfHeight = DEFAULT_OBJECT.HALF_SIZE * Math.abs(scale.y);

            // Simple AABB test
            if (worldPos.x >= pos.x - halfWidth && worldPos.x <= pos.x + halfWidth &&
                worldPos.y >= pos.y - halfHeight && worldPos.y <= pos.y + halfHeight) {
                return node.uuid;
            }
        }

        return null;
    }



    onSelectionChanged(callback: (nodeIds: string[]) => void): Unsubscribe {
        this._changeCallbacks.push(callback);
        return () => {
            const index = this._changeCallbacks.indexOf(callback);
            if (index >= 0) this._changeCallbacks.splice(index, 1);
        };
    }



    private getNodeTransform(node: CCESNode): TransformInfo {
        const rotation = node.rotation;

        return {
            position: { ...node.position },
            rotation: { ...rotation },
            eulerAngles: quaternionToEuler(rotation),
            scale: { ...node.scale },
        };
    }

    private getNodeComponents(node: CCESNode): ComponentInfo[] {
        const components: ComponentInfo[] = [];

        // 首先添加 Node 自身的属性作为特殊组件
        const nodeProperties = this.extractNodeProperties(node);
        if (nodeProperties.length > 0) {
            components.push({
                name: 'Node',
                type: 'Node',
                enabled: true,
                properties: nodeProperties,
            });
        }

        // Use ccesengine's official API: node.components or node.getComponents()
        let nodeComponents: readonly CCESComponent[] = [];

        // Prefer the official components property
        if (node.components && node.components.length > 0) {
            nodeComponents = node.components;
        } else if (typeof node.getComponents === 'function') {
            // Fallback to getComponents() method
            nodeComponents = node.getComponents();
        } else if (node._components) {
            // Last resort: internal _components property
            nodeComponents = node._components;
        }

        for (const comp of nodeComponents) {
            if (!comp) continue;

            const compInfo: ComponentInfo = {
                name: comp.constructor?.name || 'Unknown',
                type: comp.constructor?.name || 'Unknown',
                enabled: comp.enabled ?? true,
                properties: this.extractComponentProperties(comp),
            };

            components.push(compInfo);
        }

        return components;
    }

    /**
     * @zh 提取 Node 自身的属性
     * @en Extract Node's own properties
     */
    private extractNodeProperties(node: CCESNode): ComponentPropertyInfo[] {
        const properties: ComponentPropertyInfo[] = [];
        const nodeObj = node as unknown as Record<string, unknown>;

        // Layer 属性
        if (nodeObj.layer !== undefined || nodeObj._layer !== undefined) {
            const layerValue = (nodeObj.layer ?? nodeObj._layer) as number;
            properties.push({
                name: 'layer',
                type: 'number',
                value: layerValue,
                editable: true,
            });
        }

        // Mobility 属性
        if (nodeObj.mobility !== undefined || nodeObj._mobility !== undefined) {
            const mobilityValue = (nodeObj.mobility ?? nodeObj._mobility) as number;
            properties.push({
                name: 'mobility',
                type: 'enum',
                value: {
                    value: mobilityValue,
                    name: mobilityValue === 0 ? 'Static' : mobilityValue === 1 ? 'Stationary' : 'Movable',
                    options: [
                        { name: 'Static', value: 0 },
                        { name: 'Stationary', value: 1 },
                        { name: 'Movable', value: 2 },
                    ],
                },
                editable: true,
            });
        }

        return properties;
    }

    /**
     * @zh 从 ccesengine 组件提取属性（使用 __props__ 和 __attrs__ 元数据）
     * @en Extract properties from ccesengine component (using __props__ and __attrs__ metadata)
     *
     * ccesengine 组件使用以下元数据：
     * - __props__: 属性名称列表（注意：getter/setter 属性只在 DEV 模式下才会被添加）
     * - __attrs__: 属性的详细元数据（类型、默认值、是否可见等）
     *   - 键格式: `${propName}$_$${attrName}`
     *   - hasGetter: 标记有 getter
     *   - hasSetter: 标记有 setter
     * - __values__: 可序列化的属性列表
     */
    private extractComponentProperties(comp: CCESComponent): ComponentPropertyInfo[] {
        const properties: ComponentPropertyInfo[] = [];
        const compObj = comp as unknown as Record<string, unknown>;
        const compCtor = comp.constructor as unknown as Record<string, unknown>;
        const compName = comp.constructor?.name || '';

        // 特殊处理 UITransform - 直接读取已知属性
        if (compName === 'UITransform') {
            return this.extractUITransformProperties(compObj);
        }

        // 从 __props__ 和 __attrs__ 获取属性列表
        const props = compCtor.__props__ as string[] | undefined;
        const attrs = compCtor.__attrs__ as Record<string, unknown> | undefined;

        // 收集所有属性名称（合并 __props__ 和从 __attrs__ 发现的 getter/setter 属性）
        const allPropNames = this.collectAllPropertyNames(props, attrs);

        if (allPropNames.size > 0) {
            // 使用 ccesengine 的属性元数据
            for (const propName of allPropNames) {
                // 跳过内部属性
                if (this.shouldSkipProperty(propName, attrs)) continue;

                // 获取属性元数据
                const propAttrs = this.getPropertyAttrs(attrs, propName);

                // 检查条件可见性（visible 可能是函数）
                const visibleAttr = propAttrs.visible;
                // 检查是否有明确的类型装饰器（@type()）
                // 如果有类型装饰器，即使 visible=false 也应该显示
                // 因为 ccesengine 对某些类型（如数组）会自动设置 visible=false
                const hasExplicitType = propAttrs.ctor !== undefined || propAttrs.type !== undefined;

                if (typeof visibleAttr === 'function') {
                    try {
                        const isVisible = visibleAttr.call(comp);
                        if (!isVisible) continue;
                    } catch {
                        // 如果可见性检查失败，默认显示
                    }
                } else if (visibleAttr === false && !hasExplicitType) {
                    // 只有当 visible 明确为 false 且没有类型装饰器时才跳过
                    // 有类型装饰器的属性应该显示，因为 visible=false 可能是副作用
                    continue;
                }

                // 获取属性值（优先使用 getter，回退到内部属性）
                const value = this.getPropertyValue(compObj, propName);
                // 注意：不再跳过 undefined，因为资源引用可能是 null/undefined

                const propInfo = this.createPropertyInfo(propName, value, propAttrs);
                if (propInfo) {
                    properties.push(propInfo);
                }
            }
        } else {
            // 回退：自动发现属性（用于没有元数据的组件）
            const discoveredProps = this.discoverComponentProperties(compObj);
            for (const [publicName, internalName] of discoveredProps) {
                const value = compObj[publicName] ?? compObj[internalName];
                if (value !== undefined) {
                    const propInfo = this.createPropertyInfo(publicName, value);
                    if (propInfo) {
                        properties.push(propInfo);
                    }
                }
            }
        }

        // 按 displayOrder 排序（未设置的默认为 0）
        properties.sort((a, b) => {
            const orderA = a.displayOrder ?? 0;
            const orderB = b.displayOrder ?? 0;
            return orderA - orderB;
        });

        return properties;
    }

    /**
     * @zh 收集所有属性名称（合并 __props__ 和从 __attrs__ 发现的属性）
     * @en Collect all property names (merge __props__ and properties discovered from __attrs__)
     *
     * ccesengine 的 getter/setter 属性在非 DEV 模式下可能不在 __props__ 中，
     * 但它们的元数据（如 hasGetter, hasSetter, type 等）仍在 __attrs__ 中。
     */
    private collectAllPropertyNames(
        props: string[] | undefined,
        attrs: Record<string, unknown> | undefined
    ): Set<string> {
        const propNames = new Set<string>();

        // 添加 __props__ 中的属性
        if (props) {
            for (const prop of props) {
                propNames.add(prop);
            }
        }

        // 从 __attrs__ 中发现额外的属性（通过各种属性标记）
        if (attrs) {
            const DELIMITER = '$_$';
            const discoveredProps = new Set<string>();

            // 识别属性的有效标记列表
            const validAttrMarkers = [
                'hasGetter', 'hasSetter', 'type', 'ctor', 'default',
                'displayName', 'displayOrder', 'tooltip', 'group',
                'serializable', 'editable', 'visible', 'readonly',
                'min', 'max', 'step', 'slide', 'range',
                'multiline', 'unit', 'radian',
            ];

            for (const key of Object.keys(attrs)) {
                const delimiterIndex = key.indexOf(DELIMITER);
                if (delimiterIndex > 0) {
                    const propName = key.substring(0, delimiterIndex);
                    const attrName = key.substring(delimiterIndex + DELIMITER.length);

                    // 检查是否是有效的属性标记
                    if (validAttrMarkers.includes(attrName)) {
                        discoveredProps.add(propName);
                    }
                }
            }

            // 添加发现的属性
            for (const prop of discoveredProps) {
                propNames.add(prop);
            }
        }

        return propNames;
    }

    /**
     * @zh 提取 UITransform 组件的属性
     * @en Extract UITransform component properties
     */
    private extractUITransformProperties(compObj: Record<string, unknown>): ComponentPropertyInfo[] {
        const properties: ComponentPropertyInfo[] = [];

        // contentSize (Size)
        const contentSize = compObj._contentSize || compObj.contentSize;
        if (contentSize && typeof contentSize === 'object') {
            const size = contentSize as { width: number; height: number };
            properties.push({
                name: 'contentSize',
                type: 'size',
                value: { width: size.width ?? 100, height: size.height ?? 100 },
                editable: true,
            });
        }

        // anchorPoint (Vec2)
        const anchorPoint = compObj._anchorPoint || compObj.anchorPoint;
        if (anchorPoint && typeof anchorPoint === 'object') {
            const anchor = anchorPoint as { x: number; y: number };
            properties.push({
                name: 'anchorPoint',
                type: 'vector2',
                value: { x: anchor.x ?? 0.5, y: anchor.y ?? 0.5 },
                editable: true,
            });
        }

        // priority (deprecated but may still exist)
        const priority = compObj._priority ?? compObj.priority;
        if (priority !== undefined && typeof priority === 'number') {
            properties.push({
                name: 'priority',
                type: 'number',
                value: priority,
                editable: true,
            });
        }

        return properties;
    }

    /**
     * @zh 判断是否应该跳过属性
     * @en Check if property should be skipped
     */
    private shouldSkipProperty(propName: string, attrs?: Record<string, unknown>): boolean {
        // 跳过双下划线开头的内部属性
        if (propName.startsWith('__')) {
            return true;
        }

        // 跳过单下划线开头的内部属性（这些通常有对应的公开 getter/setter）
        // 内部属性的 visible=false 是正确的，因为应该显示公开属性
        if (propName.startsWith('_')) {
            // 检查是否有对应的公开属性（通过 hasGetter/hasSetter）
            const publicName = propName.substring(1);
            const hasGetterKey = `${publicName}$_$hasGetter`;
            const hasSetterKey = `${publicName}$_$hasSetter`;

            if (attrs && (attrs[hasGetterKey] || attrs[hasSetterKey])) {
                // 有公开的 getter/setter，跳过内部属性
                return true;
            }
        }

        // 检查 editorOnly 属性
        if (attrs) {
            const editorOnlyKey = `${propName}$_$editorOnly`;
            if (attrs[editorOnlyKey] === true) {
                return true;
            }
        }

        return false;
    }

    /**
     * @zh 获取属性值
     * @en Get property value
     */
    private getPropertyValue(compObj: Record<string, unknown>, propName: string): unknown {
        // 优先使用公开属性（getter）
        if (propName in compObj) {
            return compObj[propName];
        }
        // 回退到内部属性
        const internalName = `_${propName}`;
        if (internalName in compObj) {
            return compObj[internalName];
        }
        return undefined;
    }

    /**
     * @zh 获取属性元数据
     * @en Get property attributes
     */
    private getPropertyAttrs(attrs: Record<string, unknown> | undefined, propName: string): Record<string, unknown> {
        if (!attrs) return {};

        const result: Record<string, unknown> = {};
        const prefix = `${propName}$_$`;

        for (const key in attrs) {
            if (key.startsWith(prefix)) {
                const attrName = key.substring(prefix.length);
                result[attrName] = attrs[key];
            }
        }

        return result;
    }

    /**
     * @zh 自动发现组件的可编辑属性（回退方案）
     * @en Auto-discover component's editable properties (fallback)
     */
    private discoverComponentProperties(compObj: Record<string, unknown>): Array<[string, string]> {
        const pairs: Array<[string, string]> = [];
        const skipKeys = new Set([
            'node', 'enabled', 'uuid', '_id', '__classname__', 'constructor',
            '_name', '__scriptAsset', '__prefab', '_objFlags', '__editorExtras__',
            'name', 'hideFlags', 'isValid', 'enabledInHierarchy',
        ]);

        for (const key of Object.keys(compObj)) {
            if (skipKeys.has(key)) continue;
            if (typeof compObj[key] === 'function') continue;

            // 处理内部属性（以 _ 开头）
            if (key.startsWith('_') && !key.startsWith('__')) {
                const publicName = key.substring(1);
                pairs.push([publicName, key]);
            }
        }

        return pairs;
    }

    /**
     * @zh 创建属性信息（使用 ccesengine 装饰器元数据）
     * @en Create property info (using ccesengine decorator metadata)
     *
     * 支持的 __attrs__ 键格式: `{propName}$_${attrName}`
     * - displayName: 自定义显示名称
     * - displayOrder: 显示顺序
     * - tooltip: 工具提示
     * - group: 属性分组
     * - min/max/step: 数值范围
     * - slide: 显示滑块
     * - multiline: 多行文本
     * - unit: 计量单位
     * - radian: 弧度转角度
     * - range: [min, max, step?] 数组
     * - enumList: 枚举选项列表
     * - type: 类型构造函数（用于识别资源引用类型）
     */
    private createPropertyInfo(
        name: string,
        value: unknown,
        attrs?: Record<string, unknown>
    ): ComponentPropertyInfo | null {
        const propName = name.startsWith('_') ? name.substring(1) : name;

        // 从 attrs 获取类型信息（用于资源引用等）
        // ccesengine 中类型信息可能在 attrs.type（字符串）或 attrs.ctor（构造函数）中
        const typeStr = attrs?.type as string | undefined;
        const typeCtor = attrs?.ctor as { name?: string } | undefined;
        const typeName = typeCtor?.name || (typeof typeStr === 'string' ? typeStr : '');

        // 判断是否是资源引用类型
        const assetTypes = ['SpriteFrame', 'Texture2D', 'AudioClip', 'Font', 'TTFFont', 'BitmapFont',
            'Material', 'Prefab', 'AnimationClip', 'SkeletonData', 'sp.SkeletonData',
            'SpriteAtlas', 'TiledMapAsset', 'JsonAsset', 'TextAsset', 'BufferAsset'];
        const isAssetType = assetTypes.includes(typeName);

        // 判断是否是节点引用类型
        const nodeTypes = ['Node', 'cc.Node'];
        const isNodeType = nodeTypes.includes(typeName);

        // 对于资源/节点引用类型，null 值也是有效的（表示未设置）
        if (value === null || value === undefined) {
            if (isAssetType) {
                return {
                    name: propName,
                    type: 'asset',
                    value: null,
                    editable: true,
                    assetType: typeName,
                    displayName: (attrs?.displayName as string) || undefined,
                    displayOrder: attrs?.displayOrder as number | undefined,
                    tooltip: (attrs?.tooltip as string) || undefined,
                    group: attrs?.group as string | { id: string; name: string; displayOrder?: number } | undefined,
                };
            }
            if (isNodeType) {
                return {
                    name: propName,
                    type: 'node',
                    value: null,
                    editable: true,
                    displayName: (attrs?.displayName as string) || undefined,
                    displayOrder: attrs?.displayOrder as number | undefined,
                    tooltip: (attrs?.tooltip as string) || undefined,
                    group: attrs?.group as string | { id: string; name: string; displayOrder?: number } | undefined,
                };
            }
            // 其他 null/undefined 值跳过
            return null;
        }

        let type: ComponentPropertyInfo['type'] = 'object';
        let editable = attrs?.readonly !== true;
        let processedValue: unknown = value;


        const displayName = (attrs?.displayName as string) || undefined;
        const displayOrder = attrs?.displayOrder as number | undefined;
        const tooltip = (attrs?.tooltip as string) || undefined;
        const group = attrs?.group as string | { id: string; name: string; displayOrder?: number } | undefined;
        const multiline = attrs?.multiline as boolean | undefined;
        const unit = (attrs?.unit as string) || undefined;
        const radian = attrs?.radian as boolean | undefined;
        const slide = attrs?.slide as boolean | undefined;

        // 处理范围约束（支持 range 数组和单独的 min/max/step）
        let min = attrs?.min as number | undefined;
        let max = attrs?.max as number | undefined;
        let step = attrs?.step as number | undefined;

        const range = attrs?.range as number[] | undefined;
        if (range && Array.isArray(range)) {
            if (range.length >= 2) {
                min = range[0];
                max = range[1];
            }
            if (range.length >= 3) {
                step = range[2];
            }
        }

        // 从元数据获取类型信息
        const enumList = attrs?.enumList as Array<{ name: string; value: number }> | undefined;

        // 如果有枚举列表，处理为枚举类型
        if (enumList && typeof value === 'number') {
            type = 'enum';
            const enumItem = enumList.find(e => e.value === value);
            processedValue = {
                value: value,
                name: enumItem?.name ?? String(value),
                options: enumList,
            };
            return {
                name: propName, type, value: processedValue, editable,
                displayName, displayOrder, tooltip, group,
            };
        }

        // 根据值类型推断
        if (typeof value === 'string') {
            type = 'string';
        } else if (typeof value === 'number') {
            type = 'number';
            // 弧度转角度
            if (radian) {
                processedValue = value * (180 / Math.PI);
            }
        } else if (typeof value === 'boolean') {
            type = 'boolean';
        } else if (value && typeof value === 'object') {
            const obj = value as Record<string, unknown>;

            // Color (r, g, b, a) - ccesengine Color 值是 0-255
            if ('r' in obj && 'g' in obj && 'b' in obj && typeof obj.r === 'number') {
                type = 'color';
                const r = Math.round(obj.r as number);
                const g = Math.round(obj.g as number);
                const b = Math.round(obj.b as number);
                const a = obj.a !== undefined ? Math.round(obj.a as number) : 255;
                processedValue = {
                    r, g, b, a,
                    hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
                };
            }
            // Size (width, height)
            else if ('width' in obj && 'height' in obj && !('x' in obj)) {
                type = 'size';
                processedValue = {
                    width: obj.width as number,
                    height: obj.height as number,
                };
            }
            // Rect (x, y, width, height)
            else if ('x' in obj && 'y' in obj && 'width' in obj && 'height' in obj) {
                type = 'rect';
                processedValue = {
                    x: obj.x as number,
                    y: obj.y as number,
                    width: obj.width as number,
                    height: obj.height as number,
                };
            }
            // Vec3 (x, y, z)
            else if ('x' in obj && 'y' in obj && 'z' in obj && !('w' in obj)) {
                type = 'vector3';
                processedValue = {
                    x: obj.x as number,
                    y: obj.y as number,
                    z: obj.z as number,
                };
            }
            // Vec2 (x, y)
            else if ('x' in obj && 'y' in obj && !('z' in obj)) {
                type = 'vector2';
                processedValue = {
                    x: obj.x as number,
                    y: obj.y as number,
                };
            }
            // Asset reference (SpriteFrame, Texture2D, Font, etc.)
            // 优先使用 attrs.type 识别，其次使用 uuid 属性检测
            else if (isAssetType || '_uuid' in obj || '__uuid__' in obj || (obj.constructor && (obj.constructor as { _uuid?: string })._uuid)) {
                type = 'asset';
                editable = true;
                const uuid = (obj._uuid || obj.__uuid__ || (obj.constructor as { _uuid?: string })._uuid) as string;
                const assetName = (obj as { name?: string }).name || '';
                processedValue = {
                    uuid: uuid || '',
                    name: assetName,
                    type: typeName || obj.constructor?.name || 'Asset',
                };
                // 返回时附加 assetType 用于过滤
                return {
                    name: propName,
                    type,
                    value: processedValue,
                    editable,
                    assetType: typeName || obj.constructor?.name,
                    displayName,
                    displayOrder,
                    tooltip,
                    group,
                };
            }
            // Node reference
            else if (isNodeType || (obj.constructor?.name === 'Node') || ('uuid' in obj && 'name' in obj && 'children' in obj)) {
                type = 'node';
                editable = true;
                const uuid = (obj.uuid || obj._uuid) as string;
                const nodeName = (obj as { name?: string }).name || '';
                processedValue = {
                    uuid: uuid || '',
                    name: nodeName,
                };
                return {
                    name: propName,
                    type,
                    value: processedValue,
                    editable,
                    displayName,
                    displayOrder,
                    tooltip,
                    group,
                };
            }
            // Array - 检查是否是特定类型的数组
            else if (Array.isArray(value)) {
                type = 'array';
                // 从 attrs.ctor 获取数组元素类型
                const elementType = typeCtor?.name || typeName;

                // 对于事件处理器数组，标记为可编辑
                if (elementType === 'ComponentEventHandler' || elementType === 'EventHandler') {
                    editable = true;
                    processedValue = {
                        items: value.map((item, index) => ({
                            index,
                            target: (item as { target?: { name?: string } })?.target?.name || '',
                            component: (item as { _componentName?: string })?._componentName || '',
                            handler: (item as { handler?: string })?.handler || '',
                            customEventData: (item as { customEventData?: string })?.customEventData || '',
                        })),
                        length: value.length,
                        elementType,
                    };
                } else {
                    editable = false;
                    processedValue = {
                        items: [],
                        length: value.length,
                        elementType: elementType || 'Unknown',
                    };
                }

                return {
                    name: propName,
                    type,
                    value: processedValue,
                    editable,
                    displayName,
                    displayOrder,
                    tooltip,
                    group,
                    arrayElementType: elementType || undefined,
                };
            }
        }

        return {
            name: propName,
            type,
            value: processedValue,
            editable,
            // 装饰器元数据
            displayName,
            displayOrder,
            tooltip,
            group,
            min,
            max,
            step,
            slide,
            multiline,
            unit,
            radian,
        };
    }

    private notifyChange(): void {
        const ids = [...this._selectedIds];
        for (const cb of this._changeCallbacks) {
            cb(ids);
        }
    }
}



let instance: SelectionServiceImpl | null = null;

/**
 * @zh 获取选择服务单例
 * @en Get selection service singleton
 */
export function getSelectionService(): ISelectionService {
    if (!instance) {
        instance = new SelectionServiceImpl();
    }
    return instance;
}

/**
 * @zh 重置选择服务（仅用于测试）
 * @en Reset selection service (for testing only)
 */
export function resetSelectionService(): void {
    instance = null;
}

