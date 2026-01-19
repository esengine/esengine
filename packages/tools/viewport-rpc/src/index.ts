/**
 * @zh Viewport RPC 模块
 * @en Viewport RPC module
 *
 * @zh 提供编辑器与 Viewport 之间的类型安全 RPC 通信。
 * @en Provides type-safe RPC communication between editor and viewport.
 *
 * @packageDocumentation
 */

// Protocol types and constants
export {
    // JSON-RPC types
    type RpcRequest,
    type RpcResponse,
    type RpcNotification,
    type RpcError,
    // Shared types
    type ViewMode,
    type PlayState,
    type LogLevel,
    type Vec3,
    type NodeInfo,
    // Parameter types
    type MethodParams,
    type MethodResults,
    type EventParams,
    // Constants
    Methods,
    Events,
    ErrorCodes,
} from './protocol';

// Handler
export {
    ViewportRpcHandler,
    createViewportRpc,
    type MethodHandler,
    type HandlerConfig,
} from './handler';
