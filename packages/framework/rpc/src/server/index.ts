/**
 * @zh RPC 服务端模块
 * @en RPC Server Module
 */

import { WebSocketServer, WebSocket } from 'ws'
import type { Server as HttpServer } from 'node:http'
import type {
    ProtocolDef,
    ApiNames,
    MsgNames,
    ApiInput,
    ApiOutput,
    MsgData,
    Packet,
    PacketType,
    Connection,
} from '../types'
import { RpcError, ErrorCode } from '../types'
import { json } from '../codec/json'
import type { Codec } from '../codec/types'
import { ServerConnection } from './connection'

// ============ Types ============

/**
 * @zh API 处理函数
 * @en API handler function
 */
type ApiHandler<TInput, TOutput, TConnData> = (
    input: TInput,
    conn: Connection<TConnData>
) => TOutput | Promise<TOutput>

/**
 * @zh 消息处理函数
 * @en Message handler function
 */
type MsgHandler<TData, TConnData> = (
    data: TData,
    conn: Connection<TConnData>
) => void | Promise<void>

/**
 * @zh API 处理器映射
 * @en API handlers map
 */
type ApiHandlers<P extends ProtocolDef, TConnData> = {
    [K in ApiNames<P>]: ApiHandler<
        ApiInput<P['api'][K]>,
        ApiOutput<P['api'][K]>,
        TConnData
    >
}

/**
 * @zh 消息处理器映射
 * @en Message handlers map
 */
type MsgHandlers<P extends ProtocolDef, TConnData> = {
    [K in MsgNames<P>]?: MsgHandler<MsgData<P['msg'][K]>, TConnData>
}

/**
 * @zh 服务器配置
 * @en Server options
 */
export interface ServeOptions<P extends ProtocolDef, TConnData = unknown> {
    /**
     * @zh 监听端口（与 server 二选一）
     * @en Listen port (mutually exclusive with server)
     */
    port?: number

    /**
     * @zh 已有的 HTTP 服务器（与 port 二选一）
     * @en Existing HTTP server (mutually exclusive with port)
     *
     * @zh 使用此选项可以在同一端口同时支持 HTTP 和 WebSocket
     * @en Use this option to support both HTTP and WebSocket on the same port
     */
    server?: HttpServer

    /**
     * @zh API 处理器
     * @en API handlers
     */
    api: ApiHandlers<P, TConnData>

    /**
     * @zh 消息处理器
     * @en Message handlers
     */
    msg?: MsgHandlers<P, TConnData>

    /**
     * @zh 编解码器
     * @en Codec
     * @defaultValue json()
     */
    codec?: Codec

    /**
     * @zh 连接初始数据工厂
     * @en Connection initial data factory
     */
    createConnData?: () => TConnData

    /**
     * @zh 连接建立回调
     * @en Connection established callback
     */
    onConnect?: (conn: Connection<TConnData>) => void | Promise<void>

    /**
     * @zh 连接断开回调
     * @en Connection closed callback
     */
    onDisconnect?: (conn: Connection<TConnData>, reason?: string) => void | Promise<void>

    /**
     * @zh 错误回调
     * @en Error callback
     */
    onError?: (error: Error, conn?: Connection<TConnData>) => void

    /**
     * @zh 服务器启动回调
     * @en Server started callback
     */
    onStart?: (port: number) => void
}

/**
 * @zh RPC 服务器实例
 * @en RPC Server instance
 */
export interface RpcServer<P extends ProtocolDef, TConnData = unknown> {
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
     * @zh 获取所有连接
     * @en Get all connections
     */
    readonly connections: ReadonlyArray<Connection<TConnData>>

    /**
     * @zh 向单个连接发送消息
     * @en Send message to a single connection
     */
    send<K extends MsgNames<P>>(
        conn: Connection<TConnData>,
        name: K,
        data: MsgData<P['msg'][K]>
    ): void

    /**
     * @zh 广播消息给所有连接
     * @en Broadcast message to all connections
     */
    broadcast<K extends MsgNames<P>>(
        name: K,
        data: MsgData<P['msg'][K]>,
        options?: { exclude?: Connection<TConnData> | Connection<TConnData>[] }
    ): void
}

// ============ Implementation ============

const PT = {
    ApiRequest: 0,
    ApiResponse: 1,
    ApiError: 2,
    Message: 3,
    Heartbeat: 9,
} as const

/**
 * @zh 创建 RPC 服务器
 * @en Create RPC server
 *
 * @example
 * ```typescript
 * const server = serve(protocol, {
 *     port: 3000,
 *     api: {
 *         join: async (input, conn) => {
 *             return { id: conn.id }
 *         },
 *     },
 * })
 * await server.start()
 * ```
 */
export function serve<P extends ProtocolDef, TConnData = unknown>(
    _protocol: P,
    options: ServeOptions<P, TConnData>
): RpcServer<P, TConnData> {
    const codec = options.codec ?? json()
    const connections: ServerConnection<TConnData>[] = []
    let wss: WebSocketServer | null = null
    let connIdCounter = 0

    const getClientIp = (ws: WebSocket, req: any): string => {
        return req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
            || req?.socket?.remoteAddress
            || 'unknown'
    }

    const handleMessage = async (
        conn: ServerConnection<TConnData>,
        data: string | Buffer
    ): Promise<void> => {
        try {
            const packet = codec.decode(
                typeof data === 'string' ? data : new Uint8Array(data)
            )

            const type = packet[0]

            if (type === PT.ApiRequest) {
                const [, id, path, input] = packet as [number, number, string, unknown]
                await handleApiRequest(conn, id, path, input)
            } else if (type === PT.Message) {
                const [, path, msgData] = packet as [number, string, unknown]
                await handleMsg(conn, path, msgData)
            } else if (type === PT.Heartbeat) {
                conn.send(codec.encode([PT.Heartbeat]))
            }
        } catch (err) {
            options.onError?.(err as Error, conn)
        }
    }

    const handleApiRequest = async (
        conn: ServerConnection<TConnData>,
        id: number,
        path: string,
        input: unknown
    ): Promise<void> => {
        const handler = (options.api as any)[path]

        if (!handler) {
            const errPacket: Packet = [PT.ApiError, id, ErrorCode.NOT_FOUND, `API not found: ${path}`]
            conn.send(codec.encode(errPacket))
            return
        }

        try {
            const result = await handler(input, conn)
            const resPacket: Packet = [PT.ApiResponse, id, result]
            conn.send(codec.encode(resPacket))
        } catch (err) {
            if (err instanceof RpcError) {
                const errPacket: Packet = [PT.ApiError, id, err.code, err.message]
                conn.send(codec.encode(errPacket))
            } else {
                const errPacket: Packet = [PT.ApiError, id, ErrorCode.INTERNAL_ERROR, 'Internal server error']
                conn.send(codec.encode(errPacket))
                options.onError?.(err as Error, conn)
            }
        }
    }

    const handleMsg = async (
        conn: ServerConnection<TConnData>,
        path: string,
        data: unknown
    ): Promise<void> => {
        const handler = options.msg?.[path as MsgNames<P>]
        if (handler) {
            await (handler as any)(data, conn)
        }
    }

    const server: RpcServer<P, TConnData> = {
        get connections() {
            return connections as ReadonlyArray<Connection<TConnData>>
        },

        async start() {
            return new Promise((resolve) => {
                // 根据配置创建 WebSocketServer
                if (options.server) {
                    // 附加到已有的 HTTP 服务器
                    wss = new WebSocketServer({ server: options.server })
                } else if (options.port) {
                    // 独立创建
                    wss = new WebSocketServer({ port: options.port })
                } else {
                    throw new Error('Either port or server must be provided')
                }

                wss.on('connection', async (ws, req) => {
                    const id = String(++connIdCounter)
                    const ip = getClientIp(ws, req)
                    const initialData = options.createConnData?.() ?? ({} as TConnData)

                    const conn = new ServerConnection<TConnData>({
                        id,
                        ip,
                        socket: ws,
                        initialData,
                        onClose: () => {
                            const idx = connections.indexOf(conn)
                            if (idx !== -1) connections.splice(idx, 1)
                        },
                    })

                    connections.push(conn)

                    ws.on('message', (data) => {
                        handleMessage(conn, data as string | Buffer)
                    })

                    ws.on('close', async (code, reason) => {
                        conn._markClosed()
                        const idx = connections.indexOf(conn)
                        if (idx !== -1) connections.splice(idx, 1)
                        await options.onDisconnect?.(conn, reason?.toString())
                    })

                    ws.on('error', (err) => {
                        options.onError?.(err, conn)
                    })

                    await options.onConnect?.(conn)
                })

                // 如果使用已有的 HTTP 服务器，WebSocketServer 不会触发 listening 事件
                if (options.server) {
                    options.onStart?.(0) // 端口由 HTTP 服务器管理
                    resolve()
                } else {
                    wss.on('listening', () => {
                        options.onStart?.(options.port!)
                        resolve()
                    })
                }
            })
        },

        async stop() {
            return new Promise((resolve, reject) => {
                if (!wss) {
                    resolve()
                    return
                }

                for (const conn of connections) {
                    conn.close('Server shutting down')
                }

                wss.close((err) => {
                    if (err) reject(err)
                    else resolve()
                })
            })
        },

        send(conn, name, data) {
            const packet: Packet = [PT.Message, name as string, data]
            ;(conn as ServerConnection<TConnData>).send(codec.encode(packet))
        },

        broadcast(name, data, opts) {
            const packet: Packet = [PT.Message, name as string, data]
            const encoded = codec.encode(packet)

            const excludeSet = new Set(
                Array.isArray(opts?.exclude)
                    ? opts.exclude
                    : opts?.exclude
                        ? [opts.exclude]
                        : []
            )

            for (const conn of connections) {
                if (!excludeSet.has(conn)) {
                    conn.send(encoded)
                }
            }
        },
    }

    return server
}
