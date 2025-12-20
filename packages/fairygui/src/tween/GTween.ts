import { GTweener } from './GTweener';
import { TweenManager } from './TweenManager';
import { TweenValue } from './TweenValue';

/**
 * GTween
 *
 * Main entry point for the tween system.
 * Provides static factory methods for creating tweens.
 *
 * 补间系统的主入口点
 * 提供创建补间的静态工厂方法
 *
 * @example
 * ```typescript
 * // Simple tween
 * GTween.to(0, 100, 0.5)
 *     .setTarget(sprite, 'x')
 *     .setEase(EEaseType.QuadOut);
 *
 * // Vector tween
 * GTween.to2(0, 0, 100, 200, 0.5)
 *     .setTarget(sprite)
 *     .onUpdate((tweener) => {
 *         sprite.x = tweener.value.x;
 *         sprite.y = tweener.value.y;
 *     });
 *
 * // Delayed call
 * GTween.delayedCall(1.0)
 *     .onComplete(() => console.log('Done!'));
 * ```
 */
export class GTween {
    /**
     * Catch all uncaught tween callback exceptions
     * 捕获所有未捕获的补间回调异常
     */
    public static catchCallbackExceptions: boolean = true;

    /**
     * Create a tween from start to end value
     * 创建从起始值到结束值的补间
     */
    public static to(start: number, end: number, duration: number): GTweener {
        return TweenManager.createTween()._to(start, end, duration);
    }

    /**
     * Create a 2D tween
     * 创建2D补间
     */
    public static to2(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        duration: number
    ): GTweener {
        return TweenManager.createTween()._to2(startX, startY, endX, endY, duration);
    }

    /**
     * Create a 3D tween
     * 创建3D补间
     */
    public static to3(
        startX: number,
        startY: number,
        startZ: number,
        endX: number,
        endY: number,
        endZ: number,
        duration: number
    ): GTweener {
        return TweenManager.createTween()._to3(startX, startY, startZ, endX, endY, endZ, duration);
    }

    /**
     * Create a 4D tween
     * 创建4D补间
     */
    public static to4(
        startX: number,
        startY: number,
        startZ: number,
        startW: number,
        endX: number,
        endY: number,
        endZ: number,
        endW: number,
        duration: number
    ): GTweener {
        return TweenManager.createTween()._to4(
            startX,
            startY,
            startZ,
            startW,
            endX,
            endY,
            endZ,
            endW,
            duration
        );
    }

    /**
     * Create a color tween
     * 创建颜色补间
     */
    public static toColor(start: number, end: number, duration: number): GTweener {
        return TweenManager.createTween()._toColor(start, end, duration);
    }

    /**
     * Create a delayed call
     * 创建延迟调用
     */
    public static delayedCall(delay: number): GTweener {
        return TweenManager.createTween().setDelay(delay);
    }

    /**
     * Create a shake tween
     * 创建震动补间
     */
    public static shake(
        startX: number,
        startY: number,
        amplitude: number,
        duration: number
    ): GTweener {
        return TweenManager.createTween()._shake(startX, startY, amplitude, duration);
    }

    /**
     * Check if target is being tweened
     * 检查目标是否正在被补间
     */
    public static isTweening(target: any, propType?: any): boolean {
        return TweenManager.isTweening(target, propType);
    }

    /**
     * Kill all tweens on target
     * 终止目标上的所有补间
     */
    public static kill(target: any, bComplete?: boolean, propType?: any): void {
        TweenManager.killTweens(target, bComplete, propType);
    }

    /**
     * Get tween for target
     * 获取目标的补间
     */
    public static getTween(target: any, propType?: any): GTweener | null {
        return TweenManager.getTween(target, propType);
    }
}
