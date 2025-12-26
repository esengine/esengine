/**
 * @zh 变换插值器
 * @en Transform Interpolator
 *
 * @zh 用于网络变换状态的插值
 * @en Interpolates network transform states
 */

import type { ITransformState, ITransformStateWithVelocity } from './IStateSnapshot';
import type { IInterpolator, IExtrapolator } from './IInterpolator';
import { lerp, lerpAngle } from './IInterpolator';

// =============================================================================
// 变换插值器 | Transform Interpolator
// =============================================================================

/**
 * @zh 变换状态插值器
 * @en Transform state interpolator
 */
export class TransformInterpolator implements IInterpolator<ITransformState>, IExtrapolator<ITransformStateWithVelocity> {
    /**
     * @zh 在两个变换状态之间插值
     * @en Interpolate between two transform states
     */
    interpolate(from: ITransformState, to: ITransformState, t: number): ITransformState {
        return {
            x: lerp(from.x, to.x, t),
            y: lerp(from.y, to.y, t),
            rotation: lerpAngle(from.rotation, to.rotation, t)
        };
    }

    /**
     * @zh 基于速度外推变换状态
     * @en Extrapolate transform state based on velocity
     */
    extrapolate(state: ITransformStateWithVelocity, deltaTime: number): ITransformStateWithVelocity {
        return {
            x: state.x + state.velocityX * deltaTime,
            y: state.y + state.velocityY * deltaTime,
            rotation: state.rotation + state.angularVelocity * deltaTime,
            velocityX: state.velocityX,
            velocityY: state.velocityY,
            angularVelocity: state.angularVelocity
        };
    }
}

// =============================================================================
// 赫尔米特插值器 | Hermite Interpolator
// =============================================================================

/**
 * @zh 赫尔米特变换插值器（更平滑的曲线）
 * @en Hermite transform interpolator (smoother curves)
 */
export class HermiteTransformInterpolator implements IInterpolator<ITransformStateWithVelocity> {
    /**
     * @zh 使用赫尔米特插值
     * @en Use Hermite interpolation
     */
    interpolate(
        from: ITransformStateWithVelocity,
        to: ITransformStateWithVelocity,
        t: number
    ): ITransformStateWithVelocity {
        const t2 = t * t;
        const t3 = t2 * t;

        // Hermite basis functions
        const h00 = 2 * t3 - 3 * t2 + 1;
        const h10 = t3 - 2 * t2 + t;
        const h01 = -2 * t3 + 3 * t2;
        const h11 = t3 - t2;

        // Estimate time interval (assume 100ms between snapshots)
        const dt = 0.1;

        const x = h00 * from.x + h10 * from.velocityX * dt + h01 * to.x + h11 * to.velocityX * dt;
        const y = h00 * from.y + h10 * from.velocityY * dt + h01 * to.y + h11 * to.velocityY * dt;

        // Derive velocity from position derivatives
        const dh00 = 6 * t2 - 6 * t;
        const dh10 = 3 * t2 - 4 * t + 1;
        const dh01 = -6 * t2 + 6 * t;
        const dh11 = 3 * t2 - 2 * t;

        const velocityX = (dh00 * from.x + dh10 * from.velocityX * dt + dh01 * to.x + dh11 * to.velocityX * dt) / dt;
        const velocityY = (dh00 * from.y + dh10 * from.velocityY * dt + dh01 * to.y + dh11 * to.velocityY * dt) / dt;

        return {
            x,
            y,
            rotation: lerpAngle(from.rotation, to.rotation, t),
            velocityX,
            velocityY,
            angularVelocity: lerp(from.angularVelocity, to.angularVelocity, t)
        };
    }
}

// =============================================================================
// 工厂函数 | Factory Functions
// =============================================================================

/**
 * @zh 创建变换插值器
 * @en Create transform interpolator
 */
export function createTransformInterpolator(): TransformInterpolator {
    return new TransformInterpolator();
}

/**
 * @zh 创建赫尔米特变换插值器
 * @en Create Hermite transform interpolator
 */
export function createHermiteTransformInterpolator(): HermiteTransformInterpolator {
    return new HermiteTransformInterpolator();
}
