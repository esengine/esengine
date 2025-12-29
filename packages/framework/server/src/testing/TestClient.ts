/**
 * @zh 测试客户端
 * @en Test client for server testing
 */

import WebSocket from 'ws'
import { json } from '@esengine/rpc/codec'
import type { Codec } from '@esengine/rpc/codec'

// ============================================================================
// Types | 类型定义
// ============================================================================

/**
 * @zh 测试客户端配置
 * @en Test client options
 */
export interface TestClientOptions {
    /**
     * @zh 编解码器
     * @en Codec
     * @defaultValue json()
     */
    codec?: Codec

    /**
     * @zh API 调用超时（毫秒）
     * @en API call timeout in milliseconds
     * @defaultValue 5000
     */
    timeout?: number

    /**
     * @zh 连接超时（毫秒）
     * @en Connection timeout in milliseconds
     * @defaultValue 5000
     */
    connectTimeout?: number
}

/**
 * @zh 房间加入结果
 * @en Room join result
 */
export interface JoinRoomResult {
    roomId: string
    playerId: string
}

/**
 * @zh 收到的消息记录
 * @en Received message record
 */
export interface ReceivedMessage {
    type: string
    data: unknown
    timestamp: number
}

// ============================================================================
// Constants | 常量
// ============================================================================

const PacketType = {
    ApiRequest: 0,
    ApiResponse: 1,
    ApiError: 2,
    Message: 3,
} as const

// ============================================================================
// TestClient Class | 测试客户端类
// ============================================================================

interface PendingCall {
    resolve: (value: unknown) => void
    reject: (error: Error) => void
    timer: ReturnType<typeof setTimeout>
}

/**
 * @zh 测试客户端
 * @en Test client for server integration testing
 *
 * @zh 专为测试设计的客户端，提供便捷的断言方法和消息记录功能
 * @en Client designed for testing, with convenient assertion methods and message recording
 *
 * @example
 * ```typescript
 * const client = new TestClient(3000)
 * await client.connect()
 *
 * // 加入房间
 * const { roomId } = await client.joinRoom('game')
 *
 * // 发送消息
 * client.sendToRoom('Move', { x: 10, y: 20 })
 *
 * // 等待收到特定消息
 * const msg = await client.waitForMessage('PlayerMoved')
 *
 * // 断言收到消息
 * expect(client.hasReceivedMessage('PlayerMoved')).toBe(true)
 *
 * await client.disconnect()
 * ```
 */
export class TestClient {
    private readonly _port: number
    private readonly _codec: Codec
    private readonly _timeout: number
    private readonly _connectTimeout: number

    private _ws: WebSocket | null = null
    private _callIdCounter = 0
    private _connected = false
    private _currentRoomId: string | null = null
    private _currentPlayerId: string | null = null

    private readonly _pendingCalls = new Map<number, PendingCall>()
    private readonly _msgHandlers = new Map<string, Set<(data: unknown) => void>>()
    private readonly _receivedMessages: ReceivedMessage[] = []

    constructor(port: number, options: TestClientOptions = {}) {
        this._port = port
        this._codec = options.codec ?? json()
        this._timeout = options.timeout ?? 5000
        this._connectTimeout = options.connectTimeout ?? 5000
    }

    // ========================================================================
    // Properties | 属性
    // ========================================================================

    /**
     * @zh 是否已连接
     * @en Whether connected
     */
    get isConnected(): boolean {
        return this._connected
    }

    /**
     * @zh 当前房间 ID
     * @en Current room ID
     */
    get roomId(): string | null {
        return this._currentRoomId
    }

    /**
     * @zh 当前玩家 ID
     * @en Current player ID
     */
    get playerId(): string | null {
        return this._currentPlayerId
    }

    /**
     * @zh 收到的所有消息
     * @en All received messages
     */
    get receivedMessages(): ReadonlyArray<ReceivedMessage> {
        return this._receivedMessages
    }

    // ========================================================================
    // Connection | 连接管理
    // ========================================================================

    /**
     * @zh 连接到服务器
     * @en Connect to server
     */
    connect(): Promise<this> {
        return new Promise((resolve, reject) => {
            const url = `ws://localhost:${this._port}`
            this._ws = new WebSocket(url)

            const timeout = setTimeout(() => {
                this._ws?.close()
                reject(new Error(`Connection timeout after ${this._connectTimeout}ms`))
            }, this._connectTimeout)

            this._ws.on('open', () => {
                clearTimeout(timeout)
                this._connected = true
                resolve(this)
            })

            this._ws.on('close', () => {
                this._connected = false
                this._rejectAllPending('Connection closed')
            })

            this._ws.on('error', (err) => {
                clearTimeout(timeout)
                if (!this._connected) {
                    reject(err)
                }
            })

            this._ws.on('message', (data: Buffer) => {
                this._handleMessage(data)
            })
        })
    }

    /**
     * @zh 断开连接
     * @en Disconnect from server
     */
    async disconnect(): Promise<void> {
        return new Promise((resolve) => {
            if (!this._ws || this._ws.readyState === WebSocket.CLOSED) {
                resolve()
                return
            }

            this._ws.once('close', () => {
                this._connected = false
                this._ws = null
                resolve()
            })

            this._ws.close()
        })
    }

    // ========================================================================
    // Room Operations | 房间操作
    // ========================================================================

    /**
     * @zh 加入房间
     * @en Join a room
     */
    async joinRoom(roomType: string, options?: Record<string, unknown>): Promise<JoinRoomResult> {
        const result = await this.call<JoinRoomResult>('JoinRoom', { roomType, options })
        this._currentRoomId = result.roomId
        this._currentPlayerId = result.playerId
        return result
    }

    /**
     * @zh 通过 ID 加入房间
     * @en Join a room by ID
     */
    async joinRoomById(roomId: string): Promise<JoinRoomResult> {
        const result = await this.call<JoinRoomResult>('JoinRoom', { roomId })
        this._currentRoomId = result.roomId
        this._currentPlayerId = result.playerId
        return result
    }

    /**
     * @zh 离开房间
     * @en Leave room
     */
    async leaveRoom(): Promise<void> {
        await this.call('LeaveRoom', {})
        this._currentRoomId = null
        this._currentPlayerId = null
    }

    /**
     * @zh 发送消息到房间
     * @en Send message to room
     */
    sendToRoom(type: string, data: unknown): void {
        this.send('RoomMessage', { type, data })
    }

    // ========================================================================
    // API Calls | API 调用
    // ========================================================================

    /**
     * @zh 调用 API
     * @en Call API
     */
    call<T = unknown>(name: string, input: unknown): Promise<T> {
        return new Promise((resolve, reject) => {
            if (!this._connected || !this._ws) {
                reject(new Error('Not connected'))
                return
            }

            const id = ++this._callIdCounter
            const timer = setTimeout(() => {
                this._pendingCalls.delete(id)
                reject(new Error(`API call '${name}' timeout after ${this._timeout}ms`))
            }, this._timeout)

            this._pendingCalls.set(id, {
                resolve: resolve as (v: unknown) => void,
                reject,
                timer,
            })

            const packet = [PacketType.ApiRequest, id, name, input]
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this._ws.send(this._codec.encode(packet as any) as Buffer)
        })
    }

    /**
     * @zh 发送消息
     * @en Send message
     */
    send(name: string, data: unknown): void {
        if (!this._connected || !this._ws) return
        const packet = [PacketType.Message, name, data]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._ws.send(this._codec.encode(packet as any) as Buffer)
    }

    // ========================================================================
    // Message Handling | 消息处理
    // ========================================================================

    /**
     * @zh 监听消息
     * @en Listen for message
     */
    on(name: string, handler: (data: unknown) => void): this {
        let handlers = this._msgHandlers.get(name)
        if (!handlers) {
            handlers = new Set()
            this._msgHandlers.set(name, handlers)
        }
        handlers.add(handler)
        return this
    }

    /**
     * @zh 取消监听消息
     * @en Remove message listener
     */
    off(name: string, handler?: (data: unknown) => void): this {
        if (handler) {
            this._msgHandlers.get(name)?.delete(handler)
        } else {
            this._msgHandlers.delete(name)
        }
        return this
    }

    /**
     * @zh 等待收到指定消息
     * @en Wait for a specific message
     */
    waitForMessage<T = unknown>(type: string, timeout?: number): Promise<T> {
        return new Promise((resolve, reject) => {
            const timeoutMs = timeout ?? this._timeout

            const timer = setTimeout(() => {
                this.off(type, handler)
                reject(new Error(`Timeout waiting for message '${type}' after ${timeoutMs}ms`))
            }, timeoutMs)

            const handler = (data: unknown) => {
                clearTimeout(timer)
                this.off(type, handler)
                resolve(data as T)
            }

            this.on(type, handler)
        })
    }

    /**
     * @zh 等待收到指定房间消息
     * @en Wait for a specific room message
     */
    waitForRoomMessage<T = unknown>(type: string, timeout?: number): Promise<T> {
        return new Promise((resolve, reject) => {
            const timeoutMs = timeout ?? this._timeout

            const timer = setTimeout(() => {
                this.off('RoomMessage', handler)
                reject(new Error(`Timeout waiting for room message '${type}' after ${timeoutMs}ms`))
            }, timeoutMs)

            const handler = (data: unknown) => {
                const msg = data as { type: string; data: unknown }
                if (msg.type === type) {
                    clearTimeout(timer)
                    this.off('RoomMessage', handler)
                    resolve(msg.data as T)
                }
            }

            this.on('RoomMessage', handler)
        })
    }

    // ========================================================================
    // Assertions | 断言辅助
    // ========================================================================

    /**
     * @zh 是否收到过指定消息
     * @en Whether received a specific message
     */
    hasReceivedMessage(type: string): boolean {
        return this._receivedMessages.some((m) => m.type === type)
    }

    /**
     * @zh 获取指定类型的所有消息
     * @en Get all messages of a specific type
     */
    getMessagesOfType<T = unknown>(type: string): T[] {
        return this._receivedMessages
            .filter((m) => m.type === type)
            .map((m) => m.data as T)
    }

    /**
     * @zh 获取最后收到的指定类型消息
     * @en Get the last received message of a specific type
     */
    getLastMessage<T = unknown>(type: string): T | undefined {
        for (let i = this._receivedMessages.length - 1; i >= 0; i--) {
            if (this._receivedMessages[i].type === type) {
                return this._receivedMessages[i].data as T
            }
        }
        return undefined
    }

    /**
     * @zh 清空消息记录
     * @en Clear message records
     */
    clearMessages(): void {
        this._receivedMessages.length = 0
    }

    /**
     * @zh 获取收到的消息数量
     * @en Get received message count
     */
    getMessageCount(type?: string): number {
        if (type) {
            return this._receivedMessages.filter((m) => m.type === type).length
        }
        return this._receivedMessages.length
    }

    // ========================================================================
    // Private Methods | 私有方法
    // ========================================================================

    private _handleMessage(raw: Buffer): void {
        try {
            const packet = this._codec.decode(raw) as unknown[]
            const type = packet[0] as number

            switch (type) {
                case PacketType.ApiResponse:
                    this._handleApiResponse([packet[0], packet[1], packet[2]] as [number, number, unknown])
                    break
                case PacketType.ApiError:
                    this._handleApiError([packet[0], packet[1], packet[2], packet[3]] as [number, number, string, string])
                    break
                case PacketType.Message:
                    this._handleMsg([packet[0], packet[1], packet[2]] as [number, string, unknown])
                    break
            }
        } catch (err) {
            console.error('[TestClient] Failed to handle message:', err)
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
            pending.reject(new Error(`[${code}] ${message}`))
        }
    }

    private _handleMsg([, name, data]: [number, string, unknown]): void {
        // 记录消息
        this._receivedMessages.push({
            type: name,
            data,
            timestamp: Date.now(),
        })

        // 触发处理器
        const handlers = this._msgHandlers.get(name)
        if (handlers) {
            for (const handler of handlers) {
                try {
                    handler(data)
                } catch (err) {
                    console.error('[TestClient] Handler error:', err)
                }
            }
        }
    }

    private _rejectAllPending(reason: string): void {
        for (const [, pending] of this._pendingCalls) {
            clearTimeout(pending.timer)
            pending.reject(new Error(reason))
        }
        this._pendingCalls.clear()
    }
}
