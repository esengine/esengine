/**
 * @zh RPC 客户端模块
 * @en RPC Client Module
 */

import type {
    ProtocolDef,
    ApiNames,
    MsgNames,
    ApiInput,
    ApiOutput,
    MsgData,
    Packet,
    ConnectionStatus,
} from '../types'
import { RpcError, ErrorCode } from '../types'
import { json } from '../codec/json'
import type { Codec } from '../codec/types'

// ============================================================================
// Re-exports | 类型重导出
// ============================================================================

export type {
    ProtocolDef,
    ApiNames,
    MsgNames,
    ApiInput,
    ApiOutput,
    MsgData,
    ConnectionStatus,
    Codec,
}
export { RpcError, ErrorCode }

// ============================================================================
// Types | 类型定义
// ============================================================================

/**
 * @zh WebSocket 适配器接口
 * @en WebSocket adapter interface
 *
 * @zh 用于适配不同平台的 WebSocket 实现（浏览器、微信小游戏等）
 * @en Used to adapt different platform WebSocket implementations (browser, WeChat Mini Games, etc.)
 */
export interface WebSocketAdapter {
    readonly readyState: number
    send(data: string | ArrayBuffer): void
    close(code?: number, reason?: string): void
    onopen: ((ev: Event) => void) | null
    onclose: ((ev: { code: number; reason: string }) => void) | null
    onerror: ((ev: Event) => void) | null
    onmessage: ((ev: { data: string | ArrayBuffer }) => void) | null
}

/**
 * @zh WebSocket 工厂函数类型
 * @en WebSocket factory function type
 */
export type WebSocketFactory = (url: string) => WebSocketAdapter

/**
 * @zh 客户端配置
 * @en Client options
 */
export interface RpcClientOptions {
    /**
     * @zh 编解码器
     * @en Codec
     * @defaultValue json()
     */
    codec?: Codec

    /**
     * @zh API 调用超时（毫秒）
     * @en API call timeout in milliseconds
     * @defaultValue 30000
     */
    timeout?: number

    /**
     * @zh 自动重连
     * @en Auto reconnect
     * @defaultValue true
     */
    autoReconnect?: boolean

    /**
     * @zh 重连间隔（毫秒）
     * @en Reconnect interval in milliseconds
     * @defaultValue 3000
     */
    reconnectInterval?: number

    /**
     * @zh WebSocket 工厂函数
     * @en WebSocket factory function
     *
     * @zh 用于自定义 WebSocket 实现，如微信小游戏
     * @en Used for custom WebSocket implementation, e.g., WeChat Mini Games
     */
    webSocketFactory?: WebSocketFactory

    /**
     * @zh 连接成功回调
     * @en Connection established callback
     */
    onConnect?: () => void

    /**
     * @zh 连接断开回调
     * @en Connection closed callback
     */
    onDisconnect?: (reason?: string) => void

    /**
     * @zh 错误回调
     * @en Error callback
     */
    onError?: (error: Error) => void
}

/** @deprecated Use RpcClientOptions instead */
export type ConnectOptions = RpcClientOptions

// ============================================================================
// Constants | 常量
// ============================================================================

const PacketType = {
    ApiRequest: 0,
    ApiResponse: 1,
    ApiError: 2,
    Message: 3,
    Heartbeat: 9,
} as const

const defaultWebSocketFactory: WebSocketFactory = (url) =>
    new WebSocket(url) as unknown as WebSocketAdapter

// ============================================================================
// RpcClient Class | RPC 客户端类
// ============================================================================

interface PendingCall {
    resolve: (value: unknown) => void
    reject: (error: Error) => void
    timer: ReturnType<typeof setTimeout>
}

/**
 * @zh RPC 客户端
 * @en RPC Client
 *
 * @example
 * ```typescript
 * const client = new RpcClient(protocol, 'ws://localhost:3000')
 * await client.connect()
 *
 * const result = await client.call('join', { name: 'Alice' })
 *
 * client.on('chat', (msg) => console.log(msg.text))
 * ```
 */
export class RpcClient<P extends ProtocolDef> {
    private readonly _url: string
    private readonly _codec: Codec
    private readonly _timeout: number
    private readonly _reconnectInterval: number
    private readonly _wsFactory: WebSocketFactory
    private readonly _options: RpcClientOptions

    private _ws: WebSocketAdapter | null = null
    private _status: ConnectionStatus = 'closed'
    private _callIdCounter = 0
    private _shouldReconnect: boolean
    private _reconnectTimer: ReturnType<typeof setTimeout> | null = null

    private readonly _pendingCalls = new Map<number, PendingCall>()
    private readonly _msgHandlers = new Map<string, Set<(data: unknown) => void>>()

    constructor(
        _protocol: P,
        url: string,
        options: RpcClientOptions = {}
    ) {
        this._url = url
        this._options = options
        this._codec = options.codec ?? json()
        this._timeout = options.timeout ?? 30000
        this._shouldReconnect = options.autoReconnect ?? true
        this._reconnectInterval = options.reconnectInterval ?? 3000
        this._wsFactory = options.webSocketFactory ?? defaultWebSocketFactory
    }

    /**
     * @zh 连接状态
     * @en Connection status
     */
    get status(): ConnectionStatus {
        return this._status
    }

    /**
     * @zh 是否已连接
     * @en Whether connected
     */
    get isConnected(): boolean {
        return this._status === 'open'
    }

    /**
     * @zh 连接到服务器
     * @en Connect to server
     */
    connect(): Promise<this> {
        return new Promise((resolve, reject) => {
            if (this._status === 'open' || this._status === 'connecting') {
                resolve(this)
                return
            }

            this._status = 'connecting'
            this._ws = this._wsFactory(this._url)

            this._ws.onopen = () => {
                this._status = 'open'
                this._options.onConnect?.()
                resolve(this)
            }

            this._ws.onclose = (e) => {
                this._status = 'closed'
                this._rejectAllPending()
                this._options.onDisconnect?.(e.reason)
                this._scheduleReconnect()
            }

            this._ws.onerror = () => {
                const err = new Error('WebSocket error')
                this._options.onError?.(err)
                if (this._status === 'connecting') {
                    reject(err)
                }
            }

            this._ws.onmessage = (e) => {
                this._handleMessage(e.data as string | ArrayBuffer)
            }
        })
    }

    /**
     * @zh 断开连接
     * @en Disconnect
     */
    disconnect(): void {
        this._shouldReconnect = false
        this._clearReconnectTimer()
        if (this._ws) {
            this._status = 'closing'
            this._ws.close()
            this._ws = null
        }
    }

    /**
     * @zh 调用 API
     * @en Call API
     */
    call<K extends ApiNames<P>>(
        name: K,
        input: ApiInput<P['api'][K]>
    ): Promise<ApiOutput<P['api'][K]>> {
        return new Promise((resolve, reject) => {
            if (this._status !== 'open') {
                reject(new RpcError(ErrorCode.CONNECTION_CLOSED, 'Not connected'))
                return
            }

            const id = ++this._callIdCounter
            const timer = setTimeout(() => {
                this._pendingCalls.delete(id)
                reject(new RpcError(ErrorCode.TIMEOUT, 'Request timeout'))
            }, this._timeout)

            this._pendingCalls.set(id, {
                resolve: resolve as (v: unknown) => void,
                reject,
                timer,
            })

            const packet: Packet = [PacketType.ApiRequest, id, name as string, input]
            this._ws!.send(this._codec.encode(packet) as string | ArrayBuffer)
        })
    }

    /**
     * @zh 发送消息
     * @en Send message
     */
    send<K extends MsgNames<P>>(name: K, data: MsgData<P['msg'][K]>): void {
        if (this._status !== 'open') return
        const packet: Packet = [PacketType.Message, name as string, data]
        this._ws!.send(this._codec.encode(packet) as string | ArrayBuffer)
    }

    /**
     * @zh 监听消息
     * @en Listen to message
     */
    on<K extends MsgNames<P>>(
        name: K,
        handler: (data: MsgData<P['msg'][K]>) => void
    ): this {
        const key = name as string
        let handlers = this._msgHandlers.get(key)
        if (!handlers) {
            handlers = new Set()
            this._msgHandlers.set(key, handlers)
        }
        handlers.add(handler as (data: unknown) => void)
        return this
    }

    /**
     * @zh 取消监听消息
     * @en Remove message listener
     */
    off<K extends MsgNames<P>>(
        name: K,
        handler?: (data: MsgData<P['msg'][K]>) => void
    ): this {
        const key = name as string
        if (handler) {
            this._msgHandlers.get(key)?.delete(handler as (data: unknown) => void)
        } else {
            this._msgHandlers.delete(key)
        }
        return this
    }

    /**
     * @zh 监听消息（只触发一次）
     * @en Listen to message (once)
     */
    once<K extends MsgNames<P>>(
        name: K,
        handler: (data: MsgData<P['msg'][K]>) => void
    ): this {
        const wrapper = (data: MsgData<P['msg'][K]>) => {
            this.off(name, wrapper)
            handler(data)
        }
        return this.on(name, wrapper)
    }

    // ========================================================================
    // Private Methods | 私有方法
    // ========================================================================

    private _handleMessage(raw: string | ArrayBuffer): void {
        try {
            const data = typeof raw === 'string' ? raw : new Uint8Array(raw)
            const packet = this._codec.decode(data)
            const type = packet[0]

            switch (type) {
                case PacketType.ApiResponse:
                    this._handleApiResponse(packet as [number, number, unknown])
                    break
                case PacketType.ApiError:
                    this._handleApiError(packet as [number, number, string, string])
                    break
                case PacketType.Message:
                    this._handleMsg(packet as [number, string, unknown])
                    break
            }
        } catch (err) {
            this._options.onError?.(err as Error)
        }
    }

    private _handleApiResponse([, id, result]: [number, number, unknown]): void {
        const pending = this._pendingCalls.get(id)
        if (pending) {
            clearTimeout(pending.timer)
            this._pendingCalls.delete(id)
            pending.resolve(result)
        }
    }

    private _handleApiError([, id, code, message]: [number, number, string, string]): void {
        const pending = this._pendingCalls.get(id)
        if (pending) {
            clearTimeout(pending.timer)
            this._pendingCalls.delete(id)
            pending.reject(new RpcError(code, message))
        }
    }

    private _handleMsg([, path, data]: [number, string, unknown]): void {
        const handlers = this._msgHandlers.get(path)
        if (handlers) {
            for (const handler of handlers) {
                try {
                    handler(data)
                } catch (err) {
                    this._options.onError?.(err as Error)
                }
            }
        }
    }

    private _rejectAllPending(): void {
        for (const [, pending] of this._pendingCalls) {
            clearTimeout(pending.timer)
            pending.reject(new RpcError(ErrorCode.CONNECTION_CLOSED, 'Connection closed'))
        }
        this._pendingCalls.clear()
    }

    private _scheduleReconnect(): void {
        if (this._shouldReconnect && !this._reconnectTimer) {
            this._reconnectTimer = setTimeout(() => {
                this._reconnectTimer = null
                this.connect().catch(() => {})
            }, this._reconnectInterval)
        }
    }

    private _clearReconnectTimer(): void {
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer)
            this._reconnectTimer = null
        }
    }
}

// ============================================================================
// Factory Function | 工厂函数
// ============================================================================

/**
 * @zh 连接到 RPC 服务器（便捷函数）
 * @en Connect to RPC server (convenience function)
 *
 * @example
 * ```typescript
 * const client = await connect(protocol, 'ws://localhost:3000')
 * const result = await client.call('join', { name: 'Alice' })
 * ```
 */
export function connect<P extends ProtocolDef>(
    protocol: P,
    url: string,
    options: RpcClientOptions = {}
): Promise<RpcClient<P>> {
    return new RpcClient(protocol, url, options).connect()
}
