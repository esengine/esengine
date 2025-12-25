/**
 * @zh 插值器接口
 * @en Interpolator Interface
 *
 * @zh 提供状态插值的抽象
 * @en Provides abstraction for state interpolation
 */

// =============================================================================
// 插值器接口 | Interpolator Interface
// =============================================================================

/**
 * @zh 插值器接口
 * @en Interpolator interface
 */
export interface IInterpolator<T> {
    /**
     * @zh 在两个状态之间插值
     * @en Interpolate between two states
     *
     * @param from - @zh 起始状态 @en Start state
     * @param to - @zh 目标状态 @en Target state
     * @param t - @zh 插值因子 (0-1) @en Interpolation factor (0-1)
     * @returns @zh 插值后的状态 @en Interpolated state
     */
    interpolate(from: T, to: T, t: number): T;
}

/**
 * @zh 外推器接口
 * @en Extrapolator interface
 */
export interface IExtrapolator<T> {
    /**
     * @zh 基于当前状态外推
     * @en Extrapolate based on current state
     *
     * @param state - @zh 当前状态 @en Current state
     * @param deltaTime - @zh 外推时间（秒）@en Extrapolation time in seconds
     * @returns @zh 外推后的状态 @en Extrapolated state
     */
    extrapolate(state: T, deltaTime: number): T;
}

// =============================================================================
// 内置插值器 | Built-in Interpolators
// =============================================================================

/**
 * @zh 线性插值函数
 * @en Linear interpolation function
 */
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/**
 * @zh 角度插值函数（处理环绕）
 * @en Angle interpolation function (handles wrap-around)
 */
export function lerpAngle(a: number, b: number, t: number): number {
    let diff = b - a;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return a + diff * t;
}

/**
 * @zh 平滑阻尼插值
 * @en Smooth damp interpolation
 *
 * @param current - @zh 当前值 @en Current value
 * @param target - @zh 目标值 @en Target value
 * @param velocity - @zh 当前速度（将被修改）@en Current velocity (will be modified)
 * @param smoothTime - @zh 平滑时间 @en Smooth time
 * @param deltaTime - @zh 帧时间 @en Delta time
 * @param maxSpeed - @zh 最大速度 @en Maximum speed
 * @returns @zh [新值, 新速度] @en [new value, new velocity]
 */
export function smoothDamp(
    current: number,
    target: number,
    velocity: number,
    smoothTime: number,
    deltaTime: number,
    maxSpeed: number = Infinity
): [number, number] {
    smoothTime = Math.max(0.0001, smoothTime);
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

    let change = current - target;
    const maxChange = maxSpeed * smoothTime;
    change = Math.max(-maxChange, Math.min(maxChange, change));

    const temp = (velocity + omega * change) * deltaTime;
    let newVelocity = (velocity - omega * temp) * exp;
    let newValue = target + (change + temp) * exp;

    // Prevent overshoot
    if ((target - current > 0) === (newValue > target)) {
        newValue = target;
        newVelocity = (newValue - target) / deltaTime;
    }

    return [newValue, newVelocity];
}
