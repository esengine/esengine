/**
 * Timer callback info
 * 定时器回调信息
 */
interface TimerCallback {
    id: number;
    caller: any;
    callback: Function;
    interval: number;
    elapsed: number;
    repeat: boolean;
    removed: boolean;
}

/**
 * Call later callback info
 * 延迟调用回调信息
 */
interface CallLaterItem {
    caller: any;
    callback: Function;
}

/**
 * Timer
 *
 * Provides timing and scheduling functionality.
 *
 * 提供计时和调度功能
 */
export class Timer {
    private static _inst: Timer | null = null;

    /** Frame delta time in milliseconds | 帧间隔时间（毫秒） */
    public delta: number = 0;

    /** Current time in milliseconds | 当前时间（毫秒） */
    public currentTime: number = 0;

    /** Frame count | 帧数 */
    public frameCount: number = 0;

    private _callbacks: Map<number, TimerCallback> = new Map();
    private _callLaterList: CallLaterItem[] = [];
    private _callLaterPending: CallLaterItem[] = [];
    private _nextId: number = 1;
    private _updating: boolean = false;

    private constructor() {
        this.currentTime = performance.now();
    }

    /**
     * Get singleton instance
     * 获取单例实例
     */
    public static get inst(): Timer {
        if (!Timer._inst) {
            Timer._inst = new Timer();
        }
        return Timer._inst;
    }

    /**
     * Get current time (static shortcut)
     * 获取当前时间（静态快捷方式）
     */
    public static get time(): number {
        return Timer.inst.currentTime;
    }

    /**
     * Add a callback to be called each frame
     * 添加每帧调用的回调
     */
    public static add(callback: Function, caller: any): void {
        Timer.inst.frameLoop(1, caller, callback);
    }

    /**
     * Remove a callback
     * 移除回调
     */
    public static remove(callback: Function, caller: any): void {
        Timer.inst.clear(caller, callback);
    }

    /**
     * Update timer (called by ECS system each frame)
     * 更新定时器（每帧由 ECS 系统调用）
     *
     * @param deltaMs Delta time in milliseconds | 间隔时间（毫秒）
     */
    public update(deltaMs: number): void {
        this.delta = deltaMs;
        this.currentTime += deltaMs;
        this.frameCount++;

        this._updating = true;

        // Process timers
        for (const callback of this._callbacks.values()) {
            if (callback.removed) continue;

            callback.elapsed += deltaMs;
            if (callback.elapsed >= callback.interval) {
                callback.callback.call(callback.caller);
                if (callback.repeat) {
                    callback.elapsed = 0;
                } else {
                    callback.removed = true;
                }
            }
        }

        // Clean up removed callbacks
        for (const [id, callback] of this._callbacks) {
            if (callback.removed) {
                this._callbacks.delete(id);
            }
        }

        // Process callLater
        const pending = this._callLaterList;
        this._callLaterList = this._callLaterPending;
        this._callLaterPending = [];

        for (const item of pending) {
            item.callback.call(item.caller);
        }
        pending.length = 0;
        this._callLaterList = pending;

        this._updating = false;
    }

    /**
     * Execute callback after specified delay (one time)
     * 延迟执行回调（一次）
     *
     * @param delay Delay in milliseconds | 延迟时间（毫秒）
     * @param caller Callback context | 回调上下文
     * @param callback Callback function | 回调函数
     */
    public once(delay: number, caller: any, callback: Function): void {
        this.addCallback(delay, caller, callback, false);
    }

    /**
     * Execute callback repeatedly at interval
     * 按间隔重复执行回调
     *
     * @param interval Interval in milliseconds | 间隔时间（毫秒）
     * @param caller Callback context | 回调上下文
     * @param callback Callback function | 回调函数
     */
    public loop(interval: number, caller: any, callback: Function): void {
        this.addCallback(interval, caller, callback, true);
    }

    /**
     * Execute callback every frame
     * 每帧执行回调
     *
     * @param interval Frame interval (1 = every frame) | 帧间隔
     * @param caller Callback context | 回调上下文
     * @param callback Callback function | 回调函数
     */
    public frameLoop(interval: number, caller: any, callback: Function): void {
        this.loop(interval * 16.67, caller, callback);
    }

    /**
     * Execute callback at the end of current frame
     * 在当前帧结束时执行回调
     *
     * @param caller Callback context | 回调上下文
     * @param callback Callback function | 回调函数
     */
    public callLater(caller: any, callback: Function): void {
        const list = this._updating ? this._callLaterPending : this._callLaterList;

        const exists = list.some(
            (item) => item.caller === caller && item.callback === callback
        );

        if (!exists) {
            list.push({ caller, callback });
        }
    }

    /**
     * Clear a specific callback
     * 清除指定回调
     *
     * @param caller Callback context | 回调上下文
     * @param callback Callback function | 回调函数
     */
    public clear(caller: any, callback: Function): void {
        for (const cb of this._callbacks.values()) {
            if (cb.caller === caller && cb.callback === callback) {
                cb.removed = true;
            }
        }

        this._callLaterList = this._callLaterList.filter(
            (item) => !(item.caller === caller && item.callback === callback)
        );

        this._callLaterPending = this._callLaterPending.filter(
            (item) => !(item.caller === caller && item.callback === callback)
        );
    }

    /**
     * Clear all callbacks for a caller
     * 清除指定对象的所有回调
     *
     * @param caller Callback context | 回调上下文
     */
    public clearAll(caller: any): void {
        for (const cb of this._callbacks.values()) {
            if (cb.caller === caller) {
                cb.removed = true;
            }
        }

        this._callLaterList = this._callLaterList.filter(
            (item) => item.caller !== caller
        );

        this._callLaterPending = this._callLaterPending.filter(
            (item) => item.caller !== caller
        );
    }

    private addCallback(
        interval: number,
        caller: any,
        callback: Function,
        repeat: boolean
    ): void {
        this.clear(caller, callback);

        const id = this._nextId++;
        this._callbacks.set(id, {
            id,
            caller,
            callback,
            interval,
            elapsed: 0,
            repeat,
            removed: false
        });
    }

    /**
     * Dispose the timer
     * 销毁定时器
     */
    public dispose(): void {
        this._callbacks.clear();
        this._callLaterList.length = 0;
        this._callLaterPending.length = 0;
    }
}
