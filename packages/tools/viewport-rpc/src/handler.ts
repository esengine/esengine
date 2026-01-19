/**
 * @zh Viewport RPC 处理器
 * @en Viewport RPC handler
 *
 * @zh 在 Viewport 端处理来自编辑器的 RPC 请求，并发送事件通知。
 * @en Handles RPC requests from editor on viewport side and sends event notifications.
 */

import type {
    RpcRequest,
    RpcResponse,
    RpcNotification,
    RpcError,
    LogLevel,
    ViewMode,
    PlayState,
} from './protocol';
import { Events, ErrorCodes } from './protocol';

// ============================================================================
// Types
// ============================================================================

/**
 * @zh 方法处理器函数类型
 * @en Method handler function type
 */
export type MethodHandler<P = unknown, R = unknown> = (params: P) => Promise<R> | R;

/**
 * @zh 处理器配置
 * @en Handler configuration
 */
export interface HandlerConfig {
    /**
     * @zh 发送消息的回调函数
     * @en Callback function to send messages
     */
    send: (message: string) => void;
}

// ============================================================================
// ViewportRpcHandler Class
// ============================================================================

/**
 * @zh Viewport RPC 处理器
 * @en Viewport RPC handler
 *
 * @example
 * ```typescript
 * const rpc = new ViewportRpcHandler({
 *     send: (msg) => window.ipc.postMessage(msg)
 * });
 *
 * rpc.registerMethod('viewport.play', () => {
 *     game.play();
 * });
 *
 * // Handle incoming message
 * window.handleRpcMessage = (data) => rpc.handleMessage(data);
 * ```
 */
export class ViewportRpcHandler {
    private handlers: Map<string, MethodHandler> = new Map();
    private send: (message: string) => void;

    constructor(config: HandlerConfig) {
        this.send = config.send;
    }

    // ========================================================================
    // Method Registration
    // ========================================================================

    /**
     * @zh 注册方法处理器
     * @en Register a method handler
     *
     * @param name - @zh 方法名称 @en Method name
     * @param handler - @zh 处理函数 @en Handler function
     */
    registerMethod<P, R>(name: string, handler: MethodHandler<P, R>): void {
        this.handlers.set(name, handler as MethodHandler);
    }

    /**
     * @zh 批量注册方法处理器
     * @en Register multiple method handlers
     *
     * @param methods - @zh 方法映射对象 @en Methods map object
     */
    registerMethods(methods: Record<string, MethodHandler>): void {
        for (const [name, handler] of Object.entries(methods)) {
            this.handlers.set(name, handler);
        }
    }

    // ========================================================================
    // Message Handling
    // ========================================================================

    /**
     * @zh 处理收到的 RPC 消息
     * @en Handle received RPC message
     *
     * @param data - @zh JSON 字符串消息 @en JSON string message
     */
    async handleMessage(data: string): Promise<void> {
        let parsed: unknown;

        try {
            parsed = JSON.parse(data);
        } catch {
            console.error('[ViewportRpc] Parse error:', data);
            return;
        }

        if (this.isRequest(parsed)) {
            await this.handleRequest(parsed);
        }
    }

    // ========================================================================
    // Notification Sending
    // ========================================================================

    /**
     * @zh 发送通知到编辑器
     * @en Send notification to editor
     *
     * @param method - @zh 通知方法名 @en Notification method name
     * @param params - @zh 通知参数 @en Notification parameters
     */
    notify(method: string, params?: unknown): void {
        const notification: RpcNotification = {
            jsonrpc: '2.0',
            method,
            params,
        };
        this.send(JSON.stringify(notification));
    }

    // ========================================================================
    // Event Emitters (便捷方法)
    // ========================================================================

    /**
     * @zh 通知编辑器 Viewport 已就绪
     * @en Notify editor that viewport is ready
     */
    emitReady(version: string): void {
        this.notify(Events.READY, { version });
    }

    /**
     * @zh 通知编辑器发生错误
     * @en Notify editor of an error
     */
    emitError(message: string, stack?: string): void {
        this.notify(Events.ERROR, { message, stack });
    }

    /**
     * @zh 发送日志到编辑器
     * @en Send log to editor
     */
    emitLog(level: LogLevel, message: string): void {
        this.notify(Events.LOG, { level, message });
    }

    /**
     * @zh 通知视图模式变化
     * @en Notify view mode change
     */
    emitViewModeChanged(mode: ViewMode): void {
        this.notify(Events.VIEW_MODE_CHANGED, { mode });
    }

    /**
     * @zh 通知播放状态变化
     * @en Notify play state change
     */
    emitPlayStateChanged(state: PlayState): void {
        this.notify(Events.PLAY_STATE_CHANGED, { state });
    }

    /**
     * @zh 通知节点选择变化
     * @en Notify node selection change
     */
    emitNodeSelected(uuid: string | null): void {
        this.notify(Events.NODE_SELECTED, { uuid });
    }

    /**
     * @zh 通知场景变化
     * @en Notify scene change
     */
    emitSceneChanged(sceneName: string): void {
        this.notify(Events.SCENE_CHANGED, { sceneName });
    }

    // ========================================================================
    // Private Methods
    // ========================================================================

    private isRequest(obj: unknown): obj is RpcRequest {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            'jsonrpc' in obj &&
            'method' in obj &&
            'id' in obj
        );
    }

    private async handleRequest(request: RpcRequest): Promise<void> {
        const handler = this.handlers.get(request.method);

        if (!handler) {
            this.sendResponse(request.id, undefined, {
                code: ErrorCodes.METHOD_NOT_FOUND,
                message: `Method not found: ${request.method}`,
            });
            return;
        }

        try {
            const result = await handler(request.params);
            this.sendResponse(request.id, result);
        } catch (e) {
            this.sendResponse(request.id, undefined, {
                code: ErrorCodes.INTERNAL_ERROR,
                message: e instanceof Error ? e.message : String(e),
            });
        }
    }

    private sendResponse(id: number, result?: unknown, error?: RpcError): void {
        const response: RpcResponse = {
            jsonrpc: '2.0',
            id,
        };

        if (error) {
            response.error = error;
        } else {
            response.result = result ?? null;
        }

        this.send(JSON.stringify(response));
    }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * @zh 创建 Viewport RPC 处理器
 * @en Create viewport RPC handler
 *
 * @param config - @zh 处理器配置 @en Handler configuration
 * @returns @zh RPC 处理器实例 @en RPC handler instance
 */
export function createViewportRpc(config: HandlerConfig): ViewportRpcHandler {
    return new ViewportRpcHandler(config);
}
