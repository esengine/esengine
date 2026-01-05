/**
 * @zh 定点数变换插值器
 * @en Fixed-point Transform Interpolator
 *
 * @zh 用于帧同步确定性计算的插值器
 * @en Interpolator for deterministic lockstep calculations
 */

import { Fixed32, FixedVector2, FixedMath } from '@esengine/ecs-framework-math';
import {
    FixedTransformState,
    FixedTransformStateWithVelocity,
    type IFixedTransformStateRaw,
    type IFixedTransformStateWithVelocityRaw
} from './FixedTransformState';

// =============================================================================
// 插值器接口 | Interpolator Interface
// =============================================================================

/**
 * @zh 定点数插值器接口
 * @en Fixed-point interpolator interface
 */
export interface IFixedInterpolator<T> {
    /**
     * @zh 在两个状态之间插值
     * @en Interpolate between two states
     * @param from - @zh 起始状态 @en Start state
     * @param to - @zh 结束状态 @en End state
     * @param t - @zh 插值因子 (0-1) @en Interpolation factor (0-1)
     */
    interpolate(from: T, to: T, t: Fixed32): T;
}

/**
 * @zh 定点数外推器接口
 * @en Fixed-point extrapolator interface
 */
export interface IFixedExtrapolator<T> {
    /**
     * @zh 基于速度外推状态
     * @en Extrapolate state based on velocity
     * @param state - @zh 当前状态 @en Current state
     * @param deltaTime - @zh 时间增量 @en Time delta
     */
    extrapolate(state: T, deltaTime: Fixed32): T;
}

// =============================================================================
// 定点数变换插值器 | Fixed Transform Interpolator
// =============================================================================

/**
 * @zh 定点数变换状态插值器
 * @en Fixed-point transform state interpolator
 */
export class FixedTransformInterpolator
    implements IFixedInterpolator<FixedTransformState>, IFixedExtrapolator<FixedTransformStateWithVelocity> {

    /**
     * @zh 在两个变换状态之间插值
     * @en Interpolate between two transform states
     */
    interpolate(from: FixedTransformState, to: FixedTransformState, t: Fixed32): FixedTransformState {
        return new FixedTransformState(
            from.position.lerp(to.position, t),
            FixedMath.lerpAngle(from.rotation, to.rotation, t)
        );
    }

    /**
     * @zh 基于速度外推变换状态
     * @en Extrapolate transform state based on velocity
     */
    extrapolate(
        state: FixedTransformStateWithVelocity,
        deltaTime: Fixed32
    ): FixedTransformStateWithVelocity {
        return new FixedTransformStateWithVelocity(
            state.position.add(state.velocity.mul(deltaTime)),
            state.rotation.add(state.angularVelocity.mul(deltaTime)),
            state.velocity,
            state.angularVelocity
        );
    }

    /**
     * @zh 使用原始值进行插值
     * @en Interpolate using raw values
     */
    interpolateRaw(
        from: IFixedTransformStateRaw,
        to: IFixedTransformStateRaw,
        t: number
    ): IFixedTransformStateRaw {
        const fromState = FixedTransformState.fromRaw(from);
        const toState = FixedTransformState.fromRaw(to);
        const tFixed = Fixed32.from(t);
        return this.interpolate(fromState, toState, tFixed).toRaw();
    }

    /**
     * @zh 使用原始值进行外推
     * @en Extrapolate using raw values
     */
    extrapolateRaw(
        state: IFixedTransformStateWithVelocityRaw,
        deltaTimeMs: number
    ): IFixedTransformStateWithVelocityRaw {
        const fixedState = FixedTransformStateWithVelocity.fromRaw(state);
        const deltaTime = Fixed32.from(deltaTimeMs / 1000); // ms to seconds
        return this.extrapolate(fixedState, deltaTime).toRaw();
    }
}

// =============================================================================
// 赫尔米特插值器 | Hermite Interpolator
// =============================================================================

/**
 * @zh 定点数赫尔米特变换插值器（更平滑的曲线）
 * @en Fixed-point Hermite transform interpolator (smoother curves)
 */
export class FixedHermiteTransformInterpolator
    implements IFixedInterpolator<FixedTransformStateWithVelocity> {

    /**
     * @zh 快照间隔时间（秒）
     * @en Snapshot interval in seconds
     */
    private readonly snapshotInterval: Fixed32;

    constructor(snapshotIntervalMs: number = 100) {
        this.snapshotInterval = Fixed32.from(snapshotIntervalMs / 1000);
    }

    /**
     * @zh 使用赫尔米特插值
     * @en Use Hermite interpolation
     */
    interpolate(
        from: FixedTransformStateWithVelocity,
        to: FixedTransformStateWithVelocity,
        t: Fixed32
    ): FixedTransformStateWithVelocity {
        const t2 = t.mul(t);
        const t3 = t2.mul(t);

        const two = Fixed32.from(2);
        const three = Fixed32.from(3);
        const six = Fixed32.from(6);
        const four = Fixed32.from(4);

        // Hermite basis functions
        // h00 = 2t³ - 3t² + 1
        const h00 = two.mul(t3).sub(three.mul(t2)).add(Fixed32.ONE);
        // h10 = t³ - 2t² + t
        const h10 = t3.sub(two.mul(t2)).add(t);
        // h01 = -2t³ + 3t²
        const h01 = two.neg().mul(t3).add(three.mul(t2));
        // h11 = t³ - t²
        const h11 = t3.sub(t2);

        const dt = this.snapshotInterval;

        // Position interpolation
        const x = h00.mul(from.position.x)
            .add(h10.mul(from.velocity.x).mul(dt))
            .add(h01.mul(to.position.x))
            .add(h11.mul(to.velocity.x).mul(dt));

        const y = h00.mul(from.position.y)
            .add(h10.mul(from.velocity.y).mul(dt))
            .add(h01.mul(to.position.y))
            .add(h11.mul(to.velocity.y).mul(dt));

        // Velocity derivatives
        // dh00 = 6t² - 6t
        const dh00 = six.mul(t2).sub(six.mul(t));
        // dh10 = 3t² - 4t + 1
        const dh10 = three.mul(t2).sub(four.mul(t)).add(Fixed32.ONE);
        // dh01 = -6t² + 6t
        const dh01 = six.neg().mul(t2).add(six.mul(t));
        // dh11 = 3t² - 2t
        const dh11 = three.mul(t2).sub(two.mul(t));

        const velocityX = dh00.mul(from.position.x)
            .add(dh10.mul(from.velocity.x).mul(dt))
            .add(dh01.mul(to.position.x))
            .add(dh11.mul(to.velocity.x).mul(dt))
            .div(dt);

        const velocityY = dh00.mul(from.position.y)
            .add(dh10.mul(from.velocity.y).mul(dt))
            .add(dh01.mul(to.position.y))
            .add(dh11.mul(to.velocity.y).mul(dt))
            .div(dt);

        return new FixedTransformStateWithVelocity(
            new FixedVector2(x, y),
            FixedMath.lerpAngle(from.rotation, to.rotation, t),
            new FixedVector2(velocityX, velocityY),
            Fixed32.lerp(from.angularVelocity, to.angularVelocity, t)
        );
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建定点数变换插值器
 * @en Create fixed-point transform interpolator
 */
export function createFixedTransformInterpolator(): FixedTransformInterpolator {
    return new FixedTransformInterpolator();
}

/**
 * @zh 创建定点数赫尔米特变换插值器
 * @en Create fixed-point Hermite transform interpolator
 */
export function createFixedHermiteTransformInterpolator(
    snapshotIntervalMs?: number
): FixedHermiteTransformInterpolator {
    return new FixedHermiteTransformInterpolator(snapshotIntervalMs);
}
