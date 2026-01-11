/**
 * @zh Gizmo 常量定义
 * @en Gizmo constants definition
 *
 * 集中定义 Gizmo 相关的所有常量，供 GizmoRenderService 和 GizmoOverlay 共享。
 * Centralized definition of all Gizmo-related constants, shared by GizmoRenderService and GizmoOverlay.
 */

/**
 * @zh Gizmo 尺寸配置（屏幕像素）
 * @en Gizmo size configuration (screen pixels)
 */
export const GIZMO_SIZE = {
    /** @zh 移动/缩放轴长度 @en Move/scale axis length */
    AXIS_LENGTH: 80,
    /** @zh 箭头大小 @en Arrow size */
    ARROW_SIZE: 12,
    /** @zh 旋转圆半径 @en Rotate circle radius */
    ROTATE_RADIUS: 60,
    /** @zh 手柄大小 @en Handle size */
    HANDLE_SIZE: 10,
    /** @zh 中心手柄大小 @en Center handle size */
    CENTER_HANDLE_SIZE: 16,
    /** @zh 角手柄大小 @en Corner handle size */
    CORNER_HANDLE_SIZE: 6,
} as const;

/**
 * @zh 命中测试容差（屏幕像素）
 * @en Hit test tolerance (screen pixels)
 */
export const GIZMO_HIT_TOLERANCE = {
    /** @zh 轴线容差 @en Axis tolerance */
    AXIS: 15,
    /** @zh 旋转圆容差 @en Rotate circle tolerance */
    ROTATE: 12,
    /** @zh 手柄额外容差 @en Handle extra tolerance */
    HANDLE: 5,
    /** @zh 中心区域大小 @en Center area size */
    CENTER: 20,
} as const;

/**
 * @zh 默认对象尺寸配置
 * @en Default object size configuration
 *
 * ccesengine 中默认精灵大小为 100x100，这里使用半尺寸 50 进行计算。
 * Default sprite size in ccesengine is 100x100, using half size 50 for calculations.
 */
export const DEFAULT_OBJECT = {
    /** @zh 基础半尺寸 @en Base half size */
    HALF_SIZE: 50,
    /** @zh 选择框额外边距系数 @en Selection outline extra padding factor */
    SELECTION_PADDING: 4,
} as const;

/**
 * @zh Gizmo 颜色定义（0-255 范围，与 ccesengine Color 兼容）
 * @en Gizmo color definitions (0-255 range, compatible with ccesengine Color)
 */
export const GIZMO_COLORS = {
    GRID: { r: 80, g: 80, b: 80, a: 255 },           // #505050 (lighter gray for visibility)
    AXIS_X: { r: 255, g: 68, b: 68, a: 255 },        // #ff4444 (red)
    AXIS_Y: { r: 68, g: 255, b: 68, a: 255 },        // #44ff44 (green)
    AXIS_Z: { r: 74, g: 158, b: 255, a: 255 },       // #4a9eff (blue)
    SELECTION: { r: 74, g: 158, b: 255, a: 255 },    // #4a9eff (blue)
    MOVE_CENTER: { r: 255, g: 255, b: 68, a: 255 },  // #ffff44 (yellow)
    SCALE: { r: 255, g: 170, b: 0, a: 255 },         // #ffaa00 (orange)
    ROTATE: { r: 74, g: 158, b: 255, a: 255 },       // #4a9eff (blue)
    ORIGIN: { r: 74, g: 158, b: 255, a: 255 },       // #4a9eff (blue)
} as const;

export type GizmoColor = typeof GIZMO_COLORS[keyof typeof GIZMO_COLORS];
