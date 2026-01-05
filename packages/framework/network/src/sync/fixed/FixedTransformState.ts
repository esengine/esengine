/**
 * @zh 定点数变换状态
 * @en Fixed-point Transform State
 *
 * @zh 用于帧同步确定性计算的变换状态
 * @en Transform state for deterministic lockstep calculations
 */

import { Fixed32, FixedVector2 } from '@esengine/ecs-framework-math';

// =============================================================================
// 定点数变换状态接口 | Fixed Transform State Interface
// =============================================================================

/**
 * @zh 定点数变换状态（原始值）
 * @en Fixed-point transform state (raw values)
 *
 * @zh 用于网络传输的原始整数格式，确保跨平台一致性
 * @en Raw integer format for network transmission, ensures cross-platform consistency
 */
export interface IFixedTransformStateRaw {
    /**
     * @zh X 坐标原始值
     * @en X coordinate raw value
     */
    x: number;

    /**
     * @zh Y 坐标原始值
     * @en Y coordinate raw value
     */
    y: number;

    /**
     * @zh 旋转角度原始值（弧度 * 65536）
     * @en Rotation raw value (radians * 65536)
     */
    rotation: number;
}

/**
 * @zh 带速度的定点数变换状态（原始值）
 * @en Fixed-point transform state with velocity (raw values)
 */
export interface IFixedTransformStateWithVelocityRaw extends IFixedTransformStateRaw {
    /**
     * @zh X 速度原始值
     * @en X velocity raw value
     */
    velocityX: number;

    /**
     * @zh Y 速度原始值
     * @en Y velocity raw value
     */
    velocityY: number;

    /**
     * @zh 角速度原始值
     * @en Angular velocity raw value
     */
    angularVelocity: number;
}

// =============================================================================
// 定点数变换状态类 | Fixed Transform State Class
// =============================================================================

/**
 * @zh 定点数变换状态
 * @en Fixed-point transform state
 */
export class FixedTransformState {
    readonly position: FixedVector2;
    readonly rotation: Fixed32;

    constructor(position: FixedVector2, rotation: Fixed32) {
        this.position = position;
        this.rotation = rotation;
    }

    /**
     * @zh 从原始值创建
     * @en Create from raw values
     */
    static fromRaw(raw: IFixedTransformStateRaw): FixedTransformState {
        return new FixedTransformState(
            FixedVector2.fromRaw(raw.x, raw.y),
            Fixed32.fromRaw(raw.rotation)
        );
    }

    /**
     * @zh 从浮点数创建
     * @en Create from floating-point numbers
     */
    static from(x: number, y: number, rotation: number): FixedTransformState {
        return new FixedTransformState(
            FixedVector2.from(x, y),
            Fixed32.from(rotation)
        );
    }

    /**
     * @zh 转换为原始值（用于网络传输）
     * @en Convert to raw values (for network transmission)
     */
    toRaw(): IFixedTransformStateRaw {
        return {
            x: this.position.x.toRaw(),
            y: this.position.y.toRaw(),
            rotation: this.rotation.toRaw()
        };
    }

    /**
     * @zh 转换为浮点数对象（用于渲染）
     * @en Convert to floating-point object (for rendering)
     */
    toFloat(): { x: number; y: number; rotation: number } {
        return {
            x: this.position.x.toNumber(),
            y: this.position.y.toNumber(),
            rotation: this.rotation.toNumber()
        };
    }

    /**
     * @zh 检查是否相等
     * @en Check equality
     */
    equals(other: FixedTransformState): boolean {
        return this.position.equals(other.position) && this.rotation.eq(other.rotation);
    }
}

/**
 * @zh 带速度的定点数变换状态
 * @en Fixed-point transform state with velocity
 */
export class FixedTransformStateWithVelocity {
    readonly position: FixedVector2;
    readonly rotation: Fixed32;
    readonly velocity: FixedVector2;
    readonly angularVelocity: Fixed32;

    constructor(
        position: FixedVector2,
        rotation: Fixed32,
        velocity: FixedVector2,
        angularVelocity: Fixed32
    ) {
        this.position = position;
        this.rotation = rotation;
        this.velocity = velocity;
        this.angularVelocity = angularVelocity;
    }

    /**
     * @zh 从原始值创建
     * @en Create from raw values
     */
    static fromRaw(raw: IFixedTransformStateWithVelocityRaw): FixedTransformStateWithVelocity {
        return new FixedTransformStateWithVelocity(
            FixedVector2.fromRaw(raw.x, raw.y),
            Fixed32.fromRaw(raw.rotation),
            FixedVector2.fromRaw(raw.velocityX, raw.velocityY),
            Fixed32.fromRaw(raw.angularVelocity)
        );
    }

    /**
     * @zh 从浮点数创建
     * @en Create from floating-point numbers
     */
    static from(
        x: number,
        y: number,
        rotation: number,
        velocityX: number,
        velocityY: number,
        angularVelocity: number
    ): FixedTransformStateWithVelocity {
        return new FixedTransformStateWithVelocity(
            FixedVector2.from(x, y),
            Fixed32.from(rotation),
            FixedVector2.from(velocityX, velocityY),
            Fixed32.from(angularVelocity)
        );
    }

    /**
     * @zh 转换为原始值
     * @en Convert to raw values
     */
    toRaw(): IFixedTransformStateWithVelocityRaw {
        return {
            x: this.position.x.toRaw(),
            y: this.position.y.toRaw(),
            rotation: this.rotation.toRaw(),
            velocityX: this.velocity.x.toRaw(),
            velocityY: this.velocity.y.toRaw(),
            angularVelocity: this.angularVelocity.toRaw()
        };
    }

    /**
     * @zh 转换为浮点数对象
     * @en Convert to floating-point object
     */
    toFloat(): {
        x: number;
        y: number;
        rotation: number;
        velocityX: number;
        velocityY: number;
        angularVelocity: number;
    } {
        return {
            x: this.position.x.toNumber(),
            y: this.position.y.toNumber(),
            rotation: this.rotation.toNumber(),
            velocityX: this.velocity.x.toNumber(),
            velocityY: this.velocity.y.toNumber(),
            angularVelocity: this.angularVelocity.toNumber()
        };
    }

    /**
     * @zh 检查是否相等
     * @en Check equality
     */
    equals(other: FixedTransformStateWithVelocity): boolean {
        return this.position.equals(other.position) &&
            this.rotation.eq(other.rotation) &&
            this.velocity.equals(other.velocity) &&
            this.angularVelocity.eq(other.angularVelocity);
    }
}

// =============================================================================
// 工具函数 | Utility Functions
// =============================================================================

/**
 * @zh 创建零状态
 * @en Create zero state
 */
export function createZeroFixedTransformState(): FixedTransformState {
    return new FixedTransformState(FixedVector2.ZERO, Fixed32.ZERO);
}

/**
 * @zh 创建带速度的零状态
 * @en Create zero state with velocity
 */
export function createZeroFixedTransformStateWithVelocity(): FixedTransformStateWithVelocity {
    return new FixedTransformStateWithVelocity(
        FixedVector2.ZERO,
        Fixed32.ZERO,
        FixedVector2.ZERO,
        Fixed32.ZERO
    );
}
