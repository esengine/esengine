/**
 * @zh Viewport RPC 协议定义
 * @en Viewport RPC protocol definitions
 *
 * @zh 基于 JSON-RPC 2.0 的类型安全通信协议，用于编辑器与 Viewport 之间的通信。
 * @en Type-safe communication protocol based on JSON-RPC 2.0 for editor-viewport communication.
 */

// ============================================================================
// JSON-RPC 2.0 Base Types
// ============================================================================

/**
 * @zh JSON-RPC 请求
 * @en JSON-RPC request
 */
export interface RpcRequest {
    jsonrpc: '2.0';
    method: string;
    params?: unknown;
    id: number;
}

/**
 * @zh JSON-RPC 响应
 * @en JSON-RPC response
 */
export interface RpcResponse {
    jsonrpc: '2.0';
    result?: unknown;
    error?: RpcError;
    id: number;
}

/**
 * @zh JSON-RPC 通知（无需响应）
 * @en JSON-RPC notification (no response needed)
 */
export interface RpcNotification {
    jsonrpc: '2.0';
    method: string;
    params?: unknown;
}

/**
 * @zh JSON-RPC 错误
 * @en JSON-RPC error
 */
export interface RpcError {
    code: number;
    message: string;
    data?: unknown;
}

// ============================================================================
// Shared Types
// ============================================================================

/**
 * @zh 视图模式
 * @en View mode
 */
export type ViewMode = '2d' | '3d';

/**
 * @zh 播放状态
 * @en Play state
 */
export type PlayState = 'playing' | 'paused' | 'stopped';

/**
 * @zh 日志级别
 * @en Log level
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * @zh 3D 向量
 * @en 3D vector
 */
export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

/**
 * @zh 节点信息
 * @en Node info
 */
export interface NodeInfo {
    uuid: string;
    name: string;
    position: Vec3;
    children?: NodeInfo[];
}

// ============================================================================
// Method Parameters (Editor -> Viewport)
// ============================================================================

/**
 * @zh 方法参数类型
 * @en Method parameter types
 */
export namespace MethodParams {
    export interface SetViewMode {
        mode: ViewMode;
    }

    export interface Resize {
        width: number;
        height: number;
    }

    export interface SetCamera {
        position: Vec3;
        target: Vec3;
        fov?: number;
    }

    export interface CreateNode {
        name: string;
        parentUuid?: string;
        position?: Vec3;
    }

    export interface SelectNode {
        uuid: string | null;
    }

    export interface SetEditMode {
        editMode: boolean;
    }
}

// ============================================================================
// Method Results
// ============================================================================

/**
 * @zh 方法返回类型
 * @en Method result types
 */
export namespace MethodResults {
    export interface CreateNode {
        uuid: string;
    }

    export interface GetSceneInfo {
        sceneName: string;
        nodes: NodeInfo[];
    }

    export interface GetState {
        isPlaying: boolean;
        isPaused: boolean;
        isEditMode: boolean;
        viewMode: ViewMode;
    }
}

// ============================================================================
// Event Parameters (Viewport -> Editor)
// ============================================================================

/**
 * @zh 事件参数类型
 * @en Event parameter types
 */
export namespace EventParams {
    export interface Ready {
        version: string;
    }

    export interface Error {
        message: string;
        stack?: string;
    }

    export interface Log {
        level: LogLevel;
        message: string;
    }

    export interface ViewModeChanged {
        mode: ViewMode;
    }

    export interface PlayStateChanged {
        state: PlayState;
    }

    export interface NodeSelected {
        uuid: string | null;
    }

    export interface SceneChanged {
        sceneName: string;
    }
}

// ============================================================================
// Constants
// ============================================================================

/**
 * @zh 方法名称常量
 * @en Method name constants
 */
export const Methods = {
    SET_VIEW_MODE: 'viewport.setViewMode',
    RESIZE: 'viewport.resize',
    SET_CAMERA: 'viewport.setCamera',
    PLAY: 'viewport.play',
    PAUSE: 'viewport.pause',
    STOP: 'viewport.stop',
    SET_EDIT_MODE: 'viewport.setEditMode',
    GET_STATE: 'viewport.getState',
    GET_SCENE_INFO: 'viewport.getSceneInfo',
    CREATE_NODE: 'viewport.createNode',
    SELECT_NODE: 'viewport.selectNode',
    RESET_CAMERA: 'viewport.resetCamera',
    FOCUS_SELECTED: 'viewport.focusSelected',
} as const;

/**
 * @zh 事件名称常量
 * @en Event name constants
 */
export const Events = {
    READY: 'viewport.ready',
    ERROR: 'viewport.error',
    LOG: 'viewport.log',
    VIEW_MODE_CHANGED: 'viewport.viewModeChanged',
    PLAY_STATE_CHANGED: 'viewport.playStateChanged',
    NODE_SELECTED: 'viewport.nodeSelected',
    SCENE_CHANGED: 'viewport.sceneChanged',
} as const;

/**
 * @zh JSON-RPC 错误码
 * @en JSON-RPC error codes
 */
export const ErrorCodes = {
    /** @zh 解析错误 @en Parse error */
    PARSE_ERROR: -32700,
    /** @zh 无效请求 @en Invalid request */
    INVALID_REQUEST: -32600,
    /** @zh 方法不存在 @en Method not found */
    METHOD_NOT_FOUND: -32601,
    /** @zh 无效参数 @en Invalid params */
    INVALID_PARAMS: -32602,
    /** @zh 内部错误 @en Internal error */
    INTERNAL_ERROR: -32603,
    /** @zh 服务器错误 @en Server error */
    SERVER_ERROR: -32000,
} as const;
