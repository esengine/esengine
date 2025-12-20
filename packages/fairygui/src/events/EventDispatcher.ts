/**
 * Event listener callback
 * 事件监听回调
 */
export type EventListener = (data?: any) => void;

/**
 * Event listener info
 * 事件监听信息
 */
interface ListenerInfo {
    listener: EventListener;
    thisArg: any;
    once: boolean;
}

/**
 * EventDispatcher
 *
 * Provides event dispatching functionality.
 *
 * 提供事件分发功能
 */
export class EventDispatcher {
    private _listeners: Map<string, ListenerInfo[]> = new Map();
    private _captureListeners: Map<string, ListenerInfo[]> = new Map();

    /**
     * Register an event listener
     * 注册事件监听器
     */
    public on(type: string, listener: EventListener, thisArg?: any): this {
        this.addListener(this._listeners, type, listener, thisArg, false);
        return this;
    }

    /**
     * Register a one-time event listener
     * 注册一次性事件监听器
     */
    public once(type: string, listener: EventListener, thisArg?: any): this {
        this.addListener(this._listeners, type, listener, thisArg, true);
        return this;
    }

    /**
     * Remove an event listener
     * 移除事件监听器
     */
    public off(type: string, listener: EventListener, thisArg?: any): this {
        this.removeListener(this._listeners, type, listener, thisArg);
        return this;
    }

    /**
     * Remove all listeners for a type, or all listeners
     * 移除指定类型的所有监听器，或移除所有监听器
     */
    public offAll(type?: string): this {
        if (type) {
            this._listeners.delete(type);
            this._captureListeners.delete(type);
        } else {
            this._listeners.clear();
            this._captureListeners.clear();
        }
        return this;
    }

    /**
     * Emit an event
     * 发送事件
     */
    public emit(type: string, data?: any): boolean {
        const listeners = this._listeners.get(type);
        if (!listeners || listeners.length === 0) {
            return false;
        }

        const toRemove: ListenerInfo[] = [];

        for (const info of listeners) {
            info.listener.call(info.thisArg, data);
            if (info.once) {
                toRemove.push(info);
            }
        }

        for (const info of toRemove) {
            this.removeListener(this._listeners, type, info.listener, info.thisArg);
        }

        return true;
    }

    /**
     * Check if there are any listeners for a type
     * 检查是否有指定类型的监听器
     */
    public hasListener(type: string): boolean {
        const listeners = this._listeners.get(type);
        return listeners !== undefined && listeners.length > 0;
    }

    /**
     * Register a capture phase listener
     * 注册捕获阶段监听器
     */
    public onCapture(type: string, listener: EventListener, thisArg?: any): this {
        this.addListener(this._captureListeners, type, listener, thisArg, false);
        return this;
    }

    /**
     * Remove a capture phase listener
     * 移除捕获阶段监听器
     */
    public offCapture(type: string, listener: EventListener, thisArg?: any): this {
        this.removeListener(this._captureListeners, type, listener, thisArg);
        return this;
    }

    /**
     * Dispose all listeners
     * 销毁所有监听器
     */
    public dispose(): void {
        this._listeners.clear();
        this._captureListeners.clear();
    }

    private addListener(
        map: Map<string, ListenerInfo[]>,
        type: string,
        listener: EventListener,
        thisArg: any,
        once: boolean
    ): void {
        let listeners = map.get(type);
        if (!listeners) {
            listeners = [];
            map.set(type, listeners);
        }

        const exists = listeners.some(
            (info) => info.listener === listener && info.thisArg === thisArg
        );

        if (!exists) {
            listeners.push({ listener, thisArg, once });
        }
    }

    private removeListener(
        map: Map<string, ListenerInfo[]>,
        type: string,
        listener: EventListener,
        thisArg: any
    ): void {
        const listeners = map.get(type);
        if (!listeners) return;

        const index = listeners.findIndex(
            (info) => info.listener === listener && info.thisArg === thisArg
        );

        if (index !== -1) {
            listeners.splice(index, 1);
            if (listeners.length === 0) {
                map.delete(type);
            }
        }
    }
}
