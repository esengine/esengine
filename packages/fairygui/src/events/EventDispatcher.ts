import type { FGUIEvents } from './Events';

/**
 * Event type key from FGUIEvents
 * FGUIEvents 事件类型键
 */
export type FGUIEventType = (typeof FGUIEvents)[keyof typeof FGUIEvents];

/**
 * Event data mapping - maps event types to their data types
 * 事件数据映射 - 将事件类型映射到其数据类型
 */
export interface IEventDataMap {
    [key: string]: unknown;
}

/**
 * Event listener callback with type safety
 * 类型安全的事件监听回调
 */
export type TypedEventListener<T = unknown> = (data: T) => void;

/**
 * Legacy event listener (for backwards compatibility)
 * 传统事件监听器（向后兼容）
 */
export type EventListener = (data?: unknown) => void;

/**
 * Event listener info
 * 事件监听信息
 */
interface ListenerInfo<T = unknown> {
    listener: TypedEventListener<T>;
    thisArg: unknown;
    once: boolean;
    priority: number;
}

/**
 * Event propagation control
 * 事件传播控制
 */
export interface IEventContext {
    /** Stop propagation | 停止传播 */
    stopped: boolean;
    /** Prevent default behavior | 阻止默认行为 */
    defaultPrevented: boolean;
    /** Event type | 事件类型 */
    type: string;
    /** Current target | 当前目标 */
    currentTarget: EventDispatcher | null;
    /** Original target | 原始目标 */
    target: EventDispatcher | null;
}

/**
 * Create event context
 * 创建事件上下文
 */
function createEventContext(type: string, target: EventDispatcher): IEventContext {
    return {
        stopped: false,
        defaultPrevented: false,
        type,
        currentTarget: target,
        target
    };
}

/**
 * EventDispatcher
 *
 * Modern event dispatching system with type safety and priority support.
 *
 * 现代化的事件分发系统，支持类型安全和优先级
 *
 * Features:
 * - Type-safe event listeners
 * - Priority-based listener ordering
 * - Event propagation control
 * - Capture phase support
 * - Memory-efficient listener management
 */
export class EventDispatcher {
    private _listeners: Map<string, ListenerInfo[]> = new Map();
    private _captureListeners: Map<string, ListenerInfo[]> = new Map();
    private _dispatching: Set<string> = new Set();
    private _pendingRemovals: Map<string, ListenerInfo[]> = new Map();

    /**
     * Register an event listener with optional priority
     * 注册事件监听器（支持优先级）
     *
     * @param type Event type | 事件类型
     * @param listener Callback function | 回调函数
     * @param thisArg Context for callback | 回调上下文
     * @param priority Higher priority listeners are called first (default: 0) | 优先级越高越先调用
     */
    public on<T = unknown>(
        type: string,
        listener: TypedEventListener<T>,
        thisArg?: unknown,
        priority: number = 0
    ): this {
        this.addListener(this._listeners, type, listener as TypedEventListener, thisArg, false, priority);
        return this;
    }

    /**
     * Register a one-time event listener
     * 注册一次性事件监听器
     */
    public once<T = unknown>(
        type: string,
        listener: TypedEventListener<T>,
        thisArg?: unknown,
        priority: number = 0
    ): this {
        this.addListener(this._listeners, type, listener as TypedEventListener, thisArg, true, priority);
        return this;
    }

    /**
     * Remove an event listener
     * 移除事件监听器
     */
    public off<T = unknown>(type: string, listener: TypedEventListener<T>, thisArg?: unknown): this {
        this.removeListener(this._listeners, type, listener as TypedEventListener, thisArg);
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
     * Emit an event with typed data
     * 发送带类型数据的事件
     *
     * @returns true if event was handled, false otherwise
     */
    public emit<T = unknown>(type: string, data?: T): boolean {
        const listeners = this._listeners.get(type);
        if (!listeners || listeners.length === 0) {
            return false;
        }

        this._dispatching.add(type);
        const toRemove: ListenerInfo[] = [];

        try {
            for (const info of listeners) {
                try {
                    info.listener.call(info.thisArg, data);
                } catch (error) {
                    console.error(`Error in event listener for "${type}":`, error);
                }

                if (info.once) {
                    toRemove.push(info);
                }
            }
        } finally {
            this._dispatching.delete(type);
        }

        // Remove one-time listeners
        for (const info of toRemove) {
            this.removeListener(this._listeners, type, info.listener, info.thisArg);
        }

        // Process pending removals
        const pending = this._pendingRemovals.get(type);
        if (pending) {
            for (const info of pending) {
                this.removeListener(this._listeners, type, info.listener, info.thisArg);
            }
            this._pendingRemovals.delete(type);
        }

        return true;
    }

    /**
     * Emit with event context for propagation control
     * 发送带事件上下文的事件（用于传播控制）
     */
    public emitWithContext<T = unknown>(type: string, data?: T): IEventContext {
        const context = createEventContext(type, this);
        const listeners = this._listeners.get(type);

        if (listeners && listeners.length > 0) {
            this._dispatching.add(type);
            const toRemove: ListenerInfo[] = [];

            try {
                for (const info of listeners) {
                    if (context.stopped) break;

                    try {
                        info.listener.call(info.thisArg, data);
                    } catch (error) {
                        console.error(`Error in event listener for "${type}":`, error);
                    }

                    if (info.once) {
                        toRemove.push(info);
                    }
                }
            } finally {
                this._dispatching.delete(type);
            }

            for (const info of toRemove) {
                this.removeListener(this._listeners, type, info.listener, info.thisArg);
            }
        }

        return context;
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
     * Get listener count for a type
     * 获取指定类型的监听器数量
     */
    public listenerCount(type: string): number {
        const listeners = this._listeners.get(type);
        return listeners?.length ?? 0;
    }

    /**
     * Register a capture phase listener
     * 注册捕获阶段监听器
     */
    public onCapture<T = unknown>(
        type: string,
        listener: TypedEventListener<T>,
        thisArg?: unknown,
        priority: number = 0
    ): this {
        this.addListener(this._captureListeners, type, listener as TypedEventListener, thisArg, false, priority);
        return this;
    }

    /**
     * Remove a capture phase listener
     * 移除捕获阶段监听器
     */
    public offCapture<T = unknown>(type: string, listener: TypedEventListener<T>, thisArg?: unknown): this {
        this.removeListener(this._captureListeners, type, listener as TypedEventListener, thisArg);
        return this;
    }

    /**
     * Dispose all listeners
     * 销毁所有监听器
     */
    public dispose(): void {
        this._listeners.clear();
        this._captureListeners.clear();
        this._dispatching.clear();
        this._pendingRemovals.clear();
    }

    private addListener(
        map: Map<string, ListenerInfo[]>,
        type: string,
        listener: TypedEventListener,
        thisArg: unknown,
        once: boolean,
        priority: number
    ): void {
        let listeners = map.get(type);
        if (!listeners) {
            listeners = [];
            map.set(type, listeners);
        }

        // Check for duplicate
        const exists = listeners.some((info) => info.listener === listener && info.thisArg === thisArg);
        if (exists) return;

        const info: ListenerInfo = { listener, thisArg, once, priority };

        // Insert by priority (higher priority first)
        let inserted = false;
        for (let i = 0; i < listeners.length; i++) {
            if (priority > listeners[i].priority) {
                listeners.splice(i, 0, info);
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            listeners.push(info);
        }
    }

    private removeListener(
        map: Map<string, ListenerInfo[]>,
        type: string,
        listener: TypedEventListener,
        thisArg: unknown
    ): void {
        const listeners = map.get(type);
        if (!listeners) return;

        // If dispatching, defer removal
        if (this._dispatching.has(type)) {
            let pending = this._pendingRemovals.get(type);
            if (!pending) {
                pending = [];
                this._pendingRemovals.set(type, pending);
            }
            pending.push({ listener, thisArg, once: false, priority: 0 });
            return;
        }

        const index = listeners.findIndex((info) => info.listener === listener && info.thisArg === thisArg);
        if (index !== -1) {
            listeners.splice(index, 1);
            if (listeners.length === 0) {
                map.delete(type);
            }
        }
    }
}
