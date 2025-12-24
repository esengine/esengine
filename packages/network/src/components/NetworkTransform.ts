import { Component, ECSComponent, Serialize, Serializable, Property } from '@esengine/ecs-framework';

/**
 * 网络变换组件
 * Network transform component
 *
 * 同步实体的位置和旋转。支持插值平滑。
 * Syncs entity position and rotation with interpolation smoothing.
 */
@ECSComponent('NetworkTransform', { requires: ['NetworkIdentity'] })
@Serializable({ version: 1, typeId: 'NetworkTransform' })
export class NetworkTransform extends Component {
    /**
     * 目标位置 X
     * Target position X
     */
    public targetX: number = 0;

    /**
     * 目标位置 Y
     * Target position Y
     */
    public targetY: number = 0;

    /**
     * 目标旋转
     * Target rotation
     */
    public targetRotation: number = 0;

    /**
     * 当前位置 X
     * Current position X
     */
    public currentX: number = 0;

    /**
     * 当前位置 Y
     * Current position Y
     */
    public currentY: number = 0;

    /**
     * 当前旋转
     * Current rotation
     */
    public currentRotation: number = 0;

    /**
     * 插值速度
     * Interpolation speed
     */
    @Serialize()
    @Property({ type: 'number', label: 'Lerp Speed', min: 0.1, max: 50 })
    public lerpSpeed: number = 10;

    /**
     * 是否启用插值
     * Enable interpolation
     */
    @Serialize()
    @Property({ type: 'boolean', label: 'Interpolate' })
    public bInterpolate: boolean = true;

    /**
     * 同步间隔 (ms)
     * Sync interval in milliseconds
     */
    @Serialize()
    @Property({ type: 'number', label: 'Sync Interval', min: 16 })
    public syncInterval: number = 50;

    /**
     * 上次同步时间
     * Last sync time
     */
    public lastSyncTime: number = 0;

    /**
     * 设置目标位置
     * Set target position
     */
    public setTarget(x: number, y: number, rotation?: number): void {
        this.targetX = x;
        this.targetY = y;
        if (rotation !== undefined) {
            this.targetRotation = rotation;
        }
    }

    /**
     * 立即跳转到目标位置
     * Snap to target position immediately
     */
    public snap(): void {
        this.currentX = this.targetX;
        this.currentY = this.targetY;
        this.currentRotation = this.targetRotation;
    }
}
