/**
 * UI Dirty Flags - Unified change tracking for UI components
 * UI 脏标记 - UI 组件的统一变更追踪
 *
 * This module provides a standardized way to track component changes
 * and optimize rendering by skipping unchanged elements.
 * 此模块提供标准化的组件变更追踪方式，通过跳过未变化的元素来优化渲染。
 */

/**
 * Dirty flag types for different aspects of UI components
 * UI 组件不同方面的脏标记类型
 *
 * Using bit flags allows combining multiple dirty states efficiently.
 * 使用位标志可以高效地组合多个脏状态。
 */
export const enum UIDirtyFlags {
    /** No changes | 无变化 */
    None = 0,

    /** Visual properties changed (color, alpha, texture) | 视觉属性变化 */
    Visual = 1 << 0,

    /** Layout properties changed (position, size, anchor) | 布局属性变化 */
    Layout = 1 << 1,

    /** Transform properties changed (rotation, scale) | 变换属性变化 */
    Transform = 1 << 2,

    /** Material properties changed | 材质属性变化 */
    Material = 1 << 3,

    /** Text content changed | 文本内容变化 */
    Text = 1 << 4,

    /** All flags | 所有标记 */
    All = Visual | Layout | Transform | Material | Text
}

/**
 * Dirty tracking mixin interface
 * 脏追踪混入接口
 *
 * Components implementing this interface can be checked for changes.
 * 实现此接口的组件可以被检查变化。
 */
export interface IDirtyTrackable {
    /** Current dirty flags | 当前脏标记 */
    _dirtyFlags: UIDirtyFlags;

    /**
     * Check if any dirty flags are set
     * 检查是否有任何脏标记
     */
    isDirty(): boolean;

    /**
     * Check if specific dirty flags are set
     * 检查是否设置了特定的脏标记
     */
    hasDirtyFlag(flags: UIDirtyFlags): boolean;

    /**
     * Set dirty flags
     * 设置脏标记
     */
    markDirty(flags: UIDirtyFlags): void;

    /**
     * Clear all dirty flags
     * 清除所有脏标记
     */
    clearDirtyFlags(): void;

    /**
     * Clear specific dirty flags
     * 清除特定的脏标记
     */
    clearDirtyFlag(flags: UIDirtyFlags): void;
}

/**
 * Create a property descriptor that marks the component as dirty on change
 * 创建在变化时标记组件为脏的属性描述符
 *
 * @param dirtyFlag - Which flag to set on change | 变化时设置哪个标记
 * @returns Property decorator | 属性装饰器
 *
 * @example
 * ```typescript
 * class MyComponent implements IDirtyTrackable {
 *     _dirtyFlags = UIDirtyFlags.None;
 *
 *     private _color = 0xFFFFFF;
 *
 *     @DirtyOnChange(UIDirtyFlags.Visual)
 *     get color() { return this._color; }
 *     set color(value: number) { this._color = value; }
 * }
 * ```
 */
export function DirtyOnChange(dirtyFlag: UIDirtyFlags): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        const privateKey = `_${String(propertyKey)}`;

        Object.defineProperty(target, propertyKey, {
            get(this: IDirtyTrackable & Record<string, unknown>) {
                return this[privateKey];
            },
            set(this: IDirtyTrackable & Record<string, unknown>, value: unknown) {
                if (this[privateKey] !== value) {
                    this[privateKey] = value;
                    this.markDirty(dirtyFlag);
                }
            },
            enumerable: true,
            configurable: true
        });
    };
}

/**
 * Helper class to implement dirty tracking
 * 实现脏追踪的辅助类
 *
 * @example
 * ```typescript
 * class MyComponent extends Component implements IDirtyTrackable {
 *     _dirtyFlags = UIDirtyFlags.None;
 *     isDirty = () => DirtyTracker.isDirty(this);
 *     hasDirtyFlag = (flags: UIDirtyFlags) => DirtyTracker.hasDirtyFlag(this, flags);
 *     markDirty = (flags: UIDirtyFlags) => DirtyTracker.markDirty(this, flags);
 *     clearDirtyFlags = () => DirtyTracker.clearDirtyFlags(this);
 *     clearDirtyFlag = (flags: UIDirtyFlags) => DirtyTracker.clearDirtyFlag(this, flags);
 * }
 * ```
 */
export const DirtyTracker = {
    isDirty(component: IDirtyTrackable): boolean {
        return component._dirtyFlags !== UIDirtyFlags.None;
    },

    hasDirtyFlag(component: IDirtyTrackable, flags: UIDirtyFlags): boolean {
        return (component._dirtyFlags & flags) !== 0;
    },

    markDirty(component: IDirtyTrackable, flags: UIDirtyFlags): void {
        component._dirtyFlags |= flags;
    },

    clearDirtyFlags(component: IDirtyTrackable): void {
        component._dirtyFlags = UIDirtyFlags.None;
    },

    clearDirtyFlag(component: IDirtyTrackable, flags: UIDirtyFlags): void {
        component._dirtyFlags &= ~flags;
    }
};

/**
 * Frame-level dirty tracking for global state
 * 帧级别的全局状态脏追踪
 *
 * Tracks whether any UI component changed this frame.
 * 追踪本帧是否有任何 UI 组件发生变化。
 */
let frameDirty = false;
let dirtyComponentCount = 0;

/**
 * Mark the frame as dirty (at least one component changed)
 * 标记帧为脏（至少有一个组件变化）
 */
export function markFrameDirty(): void {
    frameDirty = true;
    dirtyComponentCount++;
}

/**
 * Check if any UI component is dirty this frame
 * 检查本帧是否有任何 UI 组件为脏
 */
export function isFrameDirty(): boolean {
    return frameDirty;
}

/**
 * Get the number of dirty components this frame
 * 获取本帧脏组件的数量
 */
export function getDirtyComponentCount(): number {
    return dirtyComponentCount;
}

/**
 * Clear frame dirty state (call at frame end)
 * 清除帧脏状态（在帧结束时调用）
 */
export function clearFrameDirty(): void {
    frameDirty = false;
    dirtyComponentCount = 0;
}
