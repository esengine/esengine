/**
 * @zh RPC 客户端 - Viewport 侧
 * @en RPC Client - Viewport side
 *
 * @zh 提供请求-响应模式的 IPC 通信
 * @en Provides request-response pattern IPC communication
 */

import type {
  RPCRequest,
  RPCResponse,
  RPCNotification,
  RPCMethods,
  RPCNotifications,
} from './types';

interface TauriIPC {
  postMessage: (message: string) => void;
}

interface EguiBridge {
  receive: (data: unknown) => void;
}

declare global {
  interface Window {
    ipc?: TauriIPC;
    __EGUI_BRIDGE__?: EguiBridge;
  }
}

type MethodHandler<M extends keyof RPCMethods> = (
  params: RPCMethods[M]['params']
) => RPCMethods[M]['result'] | Promise<RPCMethods[M]['result']>;

type NotificationHandler<N extends keyof RPCNotifications> = (
  params: RPCNotifications[N]
) => void;

/**
 * @zh RPC 客户端类
 * @en RPC Client class
 */
class RPCClient {
  private requestId = 0;
  private pendingRequests = new Map<number, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
  }>();

  private methodHandlers = new Map<string, MethodHandler<keyof RPCMethods>>();
  private notificationHandlers = new Map<string, Set<NotificationHandler<keyof RPCNotifications>>>();

  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  constructor() {
    this.setupMessageReceiver();
  }

  /**
   * @zh 设置消息接收器
   * @en Setup message receiver
   */
  private setupMessageReceiver(): void {
    // Setup __EGUI_BRIDGE__ for receiving messages from Rust
    window.__EGUI_BRIDGE__ = {
      receive: (data: unknown) => {
        try {
          this.handleMessage(data as RPCRequest | RPCResponse | RPCNotification);
        } catch (e) {
          console.error('[RPC] Failed to handle message:', e);
        }
      },
    };
  }

  /**
   * @zh 处理收到的消息
   * @en Handle received message
   */
  private handleMessage(data: RPCRequest | RPCResponse | RPCNotification): void {
    // Response to our request
    if ('id' in data && !('method' in data)) {
      this.handleResponse(data as RPCResponse);
      return;
    }

    // Request from egui
    if ('id' in data && 'method' in data) {
      this.handleRequest(data as RPCRequest);
      return;
    }

    // Notification from egui
    if ('method' in data && !('id' in data)) {
      this.handleNotification(data as RPCNotification);
    }
  }

  /**
   * @zh 处理响应
   * @en Handle response
   */
  private handleResponse(response: RPCResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) {
      console.warn('[RPC] Received response for unknown request:', response.id);
      return;
    }

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(response.id);

    if (response.error) {
      pending.reject(new Error(response.error.message));
    } else {
      pending.resolve(response.result);
    }
  }

  /**
   * @zh 处理请求
   * @en Handle request
   */
  private async handleRequest(request: RPCRequest): Promise<void> {
    const handler = this.methodHandlers.get(request.method);
    if (!handler) {
      this.sendResponse(request.id, undefined, {
        code: -32601,
        message: `Method not found: ${request.method}`,
      });
      return;
    }

    try {
      const result = await handler(request.params as RPCMethods[keyof RPCMethods]['params']);
      this.sendResponse(request.id, result);
    } catch (e) {
      this.sendResponse(request.id, undefined, {
        code: -32000,
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  /**
   * @zh 处理通知
   * @en Handle notification
   */
  private handleNotification(notification: RPCNotification): void {
    const handlers = this.notificationHandlers.get(notification.method);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(notification.params as RPCNotifications[keyof RPCNotifications]);
        } catch (e) {
          console.error(`[RPC] Notification handler error for ${notification.method}:`, e);
        }
      }
    }
  }

  /**
   * @zh 发送原始消息
   * @en Send raw message
   */
  private send(data: RPCRequest | RPCResponse | RPCNotification): void {
    if (window.ipc?.postMessage) {
      window.ipc.postMessage(JSON.stringify(data));
    }
  }

  /**
   * @zh 发送响应
   * @en Send response
   */
  private sendResponse(id: number, result?: unknown, error?: { code: number; message: string }): void {
    const response: RPCResponse = { id };
    if (error) {
      response.error = error;
    } else {
      response.result = result;
    }
    this.send(response);
  }

  /**
   * @zh 调用远程方法
   * @en Call remote method
   */
  call<M extends keyof RPCMethods>(
    method: M,
    params?: RPCMethods[M]['params']
  ): Promise<RPCMethods[M]['result']> {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${method}`));
      }, this.REQUEST_TIMEOUT);

      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout,
      });

      const request: RPCRequest = { id, method, params };
      this.send(request);
    });
  }

  /**
   * @zh 发送通知（无需响应）
   * @en Send notification (no response needed)
   */
  notify<N extends keyof RPCNotifications>(
    method: N,
    params?: RPCNotifications[N]
  ): void {
    const notification: RPCNotification = { method, params };
    this.send(notification);
  }

  /**
   * @zh 注册方法处理器
   * @en Register method handler
   */
  registerMethod<M extends keyof RPCMethods>(
    method: M,
    handler: MethodHandler<M>
  ): void {
    this.methodHandlers.set(method, handler as unknown as MethodHandler<keyof RPCMethods>);
  }

  /**
   * @zh 监听通知
   * @en Listen to notification
   */
  onNotification<N extends keyof RPCNotifications>(
    method: N,
    handler: NotificationHandler<N>
  ): () => void {
    if (!this.notificationHandlers.has(method)) {
      this.notificationHandlers.set(method, new Set());
    }
    this.notificationHandlers.get(method)!.add(handler as NotificationHandler<keyof RPCNotifications>);

    return () => {
      this.notificationHandlers.get(method)?.delete(handler as NotificationHandler<keyof RPCNotifications>);
    };
  }
}

export const rpc = new RPCClient();

// Re-export types
export type { RPCMethods, RPCNotifications } from './types';
