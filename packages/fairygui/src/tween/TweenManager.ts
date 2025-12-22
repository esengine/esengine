import { GTweener } from './GTweener';
import { Timer } from '../core/Timer';

/**
 * TweenManager
 *
 * Manages all active tweens and updates them.
 *
 * 管理所有活动的补间并更新它们
 */
export class TweenManager {
    private static _activeTweens: GTweener[] = [];
    private static _tweenPool: GTweener[] = [];
    private static _totalActiveTweens: number = 0;
    private static _lastTime: number = 0;
    private static _inited: boolean = false;

    /**
     * Create a new tween
     * 创建新补间
     */
    public static createTween(): GTweener {
        if (!TweenManager._inited) {
            TweenManager.init();
        }

        let tweener: GTweener;
        if (TweenManager._tweenPool.length > 0) {
            tweener = TweenManager._tweenPool.pop()!;
        } else {
            tweener = new GTweener();
        }

        tweener._init();
        TweenManager._activeTweens[TweenManager._totalActiveTweens++] = tweener;

        return tweener;
    }

    /**
     * Check if target is being tweened
     * 检查目标是否正在被补间
     */
    public static isTweening(target: any, propType?: any): boolean {
        if (!target) return false;

        for (let i = 0; i < TweenManager._totalActiveTweens; i++) {
            const tweener = TweenManager._activeTweens[i];
            if (tweener && tweener._target === target && !tweener._killed) {
                if (!propType || tweener._propType === propType) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Kill all tweens on target
     * 终止目标上的所有补间
     */
    public static killTweens(target: any, complete?: boolean, propType?: any): boolean {
        if (!target) return false;

        let result = false;
        for (let i = 0; i < TweenManager._totalActiveTweens; i++) {
            const tweener = TweenManager._activeTweens[i];
            if (tweener && tweener._target === target && !tweener._killed) {
                if (!propType || tweener._propType === propType) {
                    tweener.kill(complete);
                    result = true;
                }
            }
        }
        return result;
    }

    /**
     * Get tween for target
     * 获取目标的补间
     */
    public static getTween(target: any, propType?: any): GTweener | null {
        if (!target) return null;

        for (let i = 0; i < TweenManager._totalActiveTweens; i++) {
            const tweener = TweenManager._activeTweens[i];
            if (tweener && tweener._target === target && !tweener._killed) {
                if (!propType || tweener._propType === propType) {
                    return tweener;
                }
            }
        }
        return null;
    }

    private static init(): void {
        TweenManager._inited = true;
        TweenManager._lastTime = Timer.time;
        Timer.add(TweenManager.update, TweenManager);
    }

    private static update(): void {
        const currentTime = Timer.time;
        let dt = currentTime - TweenManager._lastTime;
        TweenManager._lastTime = currentTime;

        if (dt > 100) {
            dt = 100;
        }

        // Convert to seconds
        dt /= 1000;

        let freePosStart = -1;
        for (let i = 0; i < TweenManager._totalActiveTweens; i++) {
            const tweener = TweenManager._activeTweens[i];
            if (!tweener) {
                if (freePosStart === -1) {
                    freePosStart = i;
                }
            } else if (tweener._killed) {
                tweener._reset();
                TweenManager._tweenPool.push(tweener);
                TweenManager._activeTweens[i] = null as any;

                if (freePosStart === -1) {
                    freePosStart = i;
                }
            } else {
                if (!tweener._paused) {
                    tweener._update(dt);
                }

                if (freePosStart !== -1) {
                    TweenManager._activeTweens[freePosStart] = tweener;
                    TweenManager._activeTweens[i] = null as any;
                    freePosStart++;
                }
            }
        }

        if (freePosStart !== -1) {
            TweenManager._totalActiveTweens = freePosStart;
        }
    }
}
