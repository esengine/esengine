import type { GObject } from '../core/GObject';
import type { Controller } from '../core/Controller';
import { EEaseType } from '../core/FieldTypes';

/**
 * GearBase
 *
 * Base class for all gear types.
 * Gears connect object properties to controller states.
 *
 * 所有齿轮类型的基类，齿轮将对象属性连接到控制器状态
 */
export abstract class GearBase {
    /** Owner object | 所有者对象 */
    public readonly owner: GObject;

    /** Controller | 控制器 */
    protected _controller: Controller | null = null;

    /** Tween config | 缓动配置 */
    public tweenConfig: GearTweenConfig | null = null;

    constructor(owner: GObject) {
        this.owner = owner;
    }

    /**
     * Get controller
     * 获取控制器
     */
    public get controller(): Controller | null {
        return this._controller;
    }

    /**
     * Set controller
     * 设置控制器
     */
    public set controller(value: Controller | null) {
        if (this._controller !== value) {
            this._controller = value;
            if (this._controller) {
                this.init();
            }
        }
    }

    /**
     * Check if connected to a controller
     * 检查是否连接到控制器
     */
    public get connected(): boolean {
        return this._controller !== null;
    }

    /**
     * Initialize gear
     * 初始化齿轮
     */
    protected abstract init(): void;

    /**
     * Apply gear values
     * 应用齿轮值
     */
    public abstract apply(): void;

    /**
     * Update current state
     * 更新当前状态
     */
    public abstract updateState(): void;

    /**
     * Dispose
     * 销毁
     */
    public dispose(): void {
        this._controller = null;
        this.tweenConfig = null;
    }
}

/**
 * Gear tween configuration
 * 齿轮缓动配置
 */
export class GearTweenConfig {
    /** Tween enabled | 是否启用缓动 */
    public tween: boolean = true;

    /** Ease type | 缓动类型 */
    public easeType: EEaseType = EEaseType.QuadOut;

    /** Duration in seconds | 持续时间（秒） */
    public duration: number = 0.3;

    /** Delay in seconds | 延迟时间（秒） */
    public delay: number = 0;
}
