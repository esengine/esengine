/**
 * @zh 通用类型定义
 * @en Common type definitions
 */

// Math Types

/**
 * @zh 2D 向量
 * @en 2D vector
 */
export interface Vec2 {
    x: number;
    y: number;
}

/**
 * @zh 3D 向量
 * @en 3D vector
 */
export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

/**
 * @zh 四元数
 * @en Quaternion
 */
export interface Quat {
    x: number;
    y: number;
    z: number;
    w: number;
}

/**
 * @zh 矩形
 * @en Rectangle
 */
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Transform Types

/**
 * @zh 变换信息
 * @en Transform information
 */
export interface TransformInfo {
    position: Vec3;
    rotation: Quat;
    eulerAngles: Vec3;
    scale: Vec3;
}

// Scene Node Types

/**
 * @zh 场景节点信息
 * @en Scene node information
 */
export interface SceneNodeInfo {
    id: string;
    name: string;
    active: boolean;
    position?: Vec3;
    rotation?: Quat;
    scale?: Vec3;
    children: SceneNodeInfo[];
    components?: string[];
}

/**
 * @zh 组件信息
 * @en Component information
 */
export interface ComponentInfo {
    name: string;
    type: string;
    enabled: boolean;
    properties: ComponentPropertyInfo[];
}

/**
 * @zh 组件属性信息（支持 ccesengine 装饰器元数据）
 * @en Component property information (supports ccesengine decorator metadata)
 */
export interface ComponentPropertyInfo {
    /** @zh 属性名称 @en Property name */
    name: string;
    /** @zh 属性类型 @en Property type */
    type: PropertyType;
    /** @zh 属性值 @en Property value */
    value: unknown;
    /** @zh 是否可编辑 @en Whether editable */
    editable: boolean;

    /** @zh 自定义显示名称 (@displayName) @en Custom display name */
    displayName?: string;
    /** @zh 显示顺序 (@displayOrder) @en Display order */
    displayOrder?: number;
    /** @zh 工具提示 (@tooltip) @en Tooltip text */
    tooltip?: string;
    /** @zh 属性分组 (@group) @en Property group */
    group?: string | { id: string; name: string; displayOrder?: number };

    /** @zh 最小值 (@rangeMin, @range) @en Minimum value */
    min?: number;
    /** @zh 最大值 (@rangeMax, @range) @en Maximum value */
    max?: number;
    /** @zh 步进值 (@rangeStep, @range) @en Step value */
    step?: number;
    /** @zh 显示滑块 (@slide) @en Show slider */
    slide?: boolean;

    /** @zh 多行文本 (@multiline) @en Multiline text */
    multiline?: boolean;
    /** @zh 计量单位 (@unit) @en Unit label */
    unit?: string;
    /** @zh 弧度转角度 (@radian) @en Radian to degree */
    radian?: boolean;

    /** @zh 条件可见 (计算后的结果) @en Conditional visibility (computed result) */
    visible?: boolean;

    /** @zh 资源类型名称 (SpriteFrame, Texture2D 等) @en Asset type name */
    assetType?: string;
    /** @zh 允许的文件扩展名 @en Allowed file extensions */
    extensions?: string[];

    /** @zh 数组元素类型名称 @en Array element type name */
    arrayElementType?: string;
}

/**
 * @zh 属性类型
 * @en Property type
 */
export type PropertyType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'vector2'
    | 'vector3'
    | 'color'
    | 'asset'
    | 'node'      // Node/Entity 引用
    | 'component' // Component 引用
    | 'object'
    | 'array'
    | 'enum'
    | 'size'
    | 'rect';

// Editor Camera Types

/**
 * @zh 编辑器相机状态
 * @en Editor camera state
 */
export interface EditorCameraState {
    x: number;
    y: number;
    zoom: number;
}

// Selection Types

/**
 * @zh 选中节点信息
 * @en Selected node information
 */
export interface SelectedNodeInfo {
    id: string;
    name: string;
    active: boolean;
    transform: TransformInfo;
    components: ComponentInfo[];
}

// Result Types

/**
 * @zh 操作结果
 * @en Operation result
 */
export interface OperationResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * @zh 取消订阅函数
 * @en Unsubscribe function
 */
export type Unsubscribe = () => void;

// Utility Functions

/**
 * @zh 四元数转欧拉角（度）
 * @en Convert quaternion to euler angles (degrees)
 *
 * 使用标准的 XYZ 旋转顺序。对于 2D 场景，主要使用 Z 轴分量。
 * Uses standard XYZ rotation order. For 2D scenes, primarily uses Z component.
 *
 * @param q - 输入四元数 / Input quaternion
 * @returns 欧拉角（度）/ Euler angles (degrees)
 */
export function quaternionToEuler(q: Quat): Vec3 {
    const sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
    const cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
    const x = Math.atan2(sinr_cosp, cosr_cosp) * (180 / Math.PI);

    const sinp = 2 * (q.w * q.y - q.z * q.x);
    const y = Math.abs(sinp) >= 1
        ? Math.sign(sinp) * 90
        : Math.asin(sinp) * (180 / Math.PI);

    const siny_cosp = 2 * (q.w * q.z + q.x * q.y);
    const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
    const z = Math.atan2(siny_cosp, cosy_cosp) * (180 / Math.PI);

    return { x, y, z };
}
