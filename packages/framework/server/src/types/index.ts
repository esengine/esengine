/**
 * @zh ESEngine Server 类型定义
 * @en ESEngine Server type definitions
 */

import type { Connection, ProtocolDef } from '@esengine/rpc'
import type { HttpRoutes, CorsOptions, HttpRequest, HttpResponse } from '../http/types.js'

// ============================================================================
// Server Config
// ============================================================================

/**
 * @zh 服务器配置
 * @en Server configuration
 */
export interface ServerConfig {
    /**
     * @zh 监听端口
     * @en Listen port
     * @default 3000
     */
    port?: number

    /**
     * @zh API 目录路径
     * @en API directory path
     * @default 'src/api'
     */
    apiDir?: string

    /**
     * @zh 消息处理器目录路径
     * @en Message handlers directory path
     * @default 'src/msg'
     */
    msgDir?: string

    /**
     * @zh HTTP 路由目录路径
     * @en HTTP routes directory path
     * @default 'src/http'
     *
     * @zh 文件命名规则：
     * - `login.ts` → POST /api/login
     * - `users/[id].ts` → /api/users/:id
     * - `health.ts` (method: 'GET') → GET /api/health
     * @en File naming convention:
     * - `login.ts` → POST /api/login
     * - `users/[id].ts` → /api/users/:id
     * - `health.ts` (method: 'GET') → GET /api/health
     */
    httpDir?: string

    /**
     * @zh HTTP 路由前缀
     * @en HTTP routes prefix
     * @default '/api'
     */
    httpPrefix?: string

    /**
     * @zh 游戏 Tick 速率 (每秒)
     * @en Game tick rate (per second)
     * @default 20
     */
    tickRate?: number

    /**
     * @zh HTTP 路由配置（内联定义，与 httpDir 文件路由合并）
     * @en HTTP routes configuration (inline definition, merged with httpDir file routes)
     */
    http?: HttpRoutes

    /**
     * @zh CORS 配置
     * @en CORS configuration
     * @default true
     */
    cors?: CorsOptions | boolean

    /**
     * @zh 服务器启动回调
     * @en Server start callback
     */
    onStart?: (port: number) => void

    /**
     * @zh 连接建立回调
     * @en Connection established callback
     */
    onConnect?: (conn: ServerConnection) => void | Promise<void>

    /**
     * @zh 连接断开回调
     * @en Connection closed callback
     */
    onDisconnect?: (conn: ServerConnection) => void | Promise<void>
}

// ============================================================================
// Connection
// ============================================================================

/**
 * @zh 服务器连接（扩展 RPC Connection）
 * @en Server connection (extends RPC Connection)
 */
export interface ServerConnection<TData = Record<string, unknown>> extends Connection<TData> {
    /**
     * @zh 连接唯一标识（继承自 Connection）
     * @en Connection unique identifier (inherited from Connection)
     */
    readonly id: string

    /**
     * @zh 用户自定义数据
     * @en User-defined data
     */
    data: TData
}

// ============================================================================
// API Definition
// ============================================================================

/**
 * @zh API 处理器上下文
 * @en API handler context
 */
export interface ApiContext<TData = Record<string, unknown>> {
    /**
     * @zh 当前连接
     * @en Current connection
     */
    conn: ServerConnection<TData>

    /**
     * @zh 服务器实例
     * @en Server instance
     */
    server: GameServer
}

/**
 * @zh API 定义选项
 * @en API definition options
 */
export interface ApiDefinition<TReq = unknown, TRes = unknown, TData = Record<string, unknown>> {
    /**
     * @zh API 处理函数
     * @en API handler function
     */
    handler: (req: TReq, ctx: ApiContext<TData>) => TRes | Promise<TRes>

    /**
     * @zh 请求验证函数（可选）
     * @en Request validation function (optional)
     */
    validate?: (req: unknown) => req is TReq
}

// ============================================================================
// Message Definition
// ============================================================================

/**
 * @zh 消息处理器上下文
 * @en Message handler context
 */
export interface MsgContext<TData = Record<string, unknown>> {
    /**
     * @zh 当前连接
     * @en Current connection
     */
    conn: ServerConnection<TData>

    /**
     * @zh 服务器实例
     * @en Server instance
     */
    server: GameServer
}

/**
 * @zh 消息定义选项
 * @en Message definition options
 */
export interface MsgDefinition<TMsg = unknown, TData = Record<string, unknown>> {
    /**
     * @zh 消息处理函数
     * @en Message handler function
     */
    handler: (msg: TMsg, ctx: MsgContext<TData>) => void | Promise<void>
}

// ============================================================================
// Game Server Interface
// ============================================================================

/**
 * @zh 游戏服务器接口
 * @en Game server interface
 */
export interface GameServer {
    /**
     * @zh 启动服务器
     * @en Start server
     */
    start(): Promise<void>

    /**
     * @zh 停止服务器
     * @en Stop server
     */
    stop(): Promise<void>

    /**
     * @zh 广播消息
     * @en Broadcast message
     */
    broadcast<T>(name: string, data: T): void

    /**
     * @zh 发送消息给指定连接
     * @en Send message to specific connection
     */
    send<T>(conn: ServerConnection, name: string, data: T): void

    /**
     * @zh 获取所有连接
     * @en Get all connections
     */
    readonly connections: ReadonlyArray<ServerConnection>

    /**
     * @zh 当前 Tick
     * @en Current tick
     */
    readonly tick: number

    /**
     * @zh 注册房间类型
     * @en Define room type
     */
    define(name: string, roomClass: new () => unknown): void
}

// ============================================================================
// Loaded Handler Types
// ============================================================================

/**
 * @zh 已加载的 API 处理器
 * @en Loaded API handler
 */
export interface LoadedApiHandler {
    name: string
    path: string
    definition: ApiDefinition<any, any, any>
}

/**
 * @zh 已加载的消息处理器
 * @en Loaded message handler
 */
export interface LoadedMsgHandler {
    name: string
    path: string
    definition: MsgDefinition<any, any>
}

// ============================================================================
// HTTP Definition
// ============================================================================

/**
 * @zh HTTP 请求方法
 * @en HTTP request method
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/**
 * @zh HTTP 定义选项
 * @en HTTP definition options
 *
 * @example
 * ```typescript
 * // src/http/login.ts
 * import { defineHttp } from '@esengine/server'
 *
 * export default defineHttp({
 *     method: 'POST',
 *     handler: async (req, res) => {
 *         const { username, password } = req.body
 *         // ... authentication logic
 *         res.json({ token: '...', userId: '...' })
 *     }
 * })
 * ```
 */
export interface HttpDefinition<TBody = unknown> {
    /**
     * @zh 请求方法
     * @en Request method
     * @default 'POST'
     */
    method?: HttpMethod

    /**
     * @zh 处理函数
     * @en Handler function
     */
    handler: (
        req: HttpRequest & { body: TBody },
        res: HttpResponse
    ) => void | Promise<void>
}

/**
 * @zh 已加载的 HTTP 处理器
 * @en Loaded HTTP handler
 */
export interface LoadedHttpHandler {
    /**
     * @zh 路由路径（如 /api/login）
     * @en Route path (e.g., /api/login)
     */
    route: string

    /**
     * @zh 请求方法
     * @en Request method
     */
    method: HttpMethod

    /**
     * @zh 源文件路径
     * @en Source file path
     */
    path: string

    /**
     * @zh 处理器定义
     * @en Handler definition
     */
    definition: HttpDefinition<any>
}
