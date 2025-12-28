/**
 * @zh 网络服务模块
 * @en Network Service Module
 */

import {
    RpcClient,
    type ProtocolDef,
    type ApiNames,
    type MsgNames,
    type ApiInput,
    type ApiOutput,
    type MsgData,
    type RpcClientOptions,
} from '@esengine/rpc/client'
import { gameProtocol, type GameProtocol, type PlayerInput } from '../protocol'

// ============================================================================
// Types | 类型定义
// ============================================================================

/**
 * @zh 连接状态
 * @en Connection state
 */
export const enum NetworkState {
    Disconnected = 0,
    Connecting = 1,
    Connected = 2,
}

/**
 * @zh 网络服务配置
 * @en Network service options
 */
export interface NetworkServiceOptions extends RpcClientOptions {
    /**
     * @zh 服务器地址
     * @en Server URL
     */
    url: string
}

// ============================================================================
// RpcService - Base Class | RPC 服务基类
// ============================================================================

/**
 * @zh RPC 服务基类
 * @en RPC Service base class
 *
 * @zh 纯粹的 RPC 客户端封装，不包含任何游戏特定逻辑
 * @en Pure RPC client wrapper without any game-specific logic
 *
 * @typeParam P - @zh 协议定义类型 @en Protocol definition type
 */
export class RpcService<P extends ProtocolDef> {
    protected _client: RpcClient<P> | null = null
    protected _state: NetworkState = NetworkState.Disconnected

    constructor(protected readonly _protocol: P) {}

    /**
     * @zh 获取连接状态
     * @en Get connection state
     */
    get state(): NetworkState {
        return this._state
    }

    /**
     * @zh 是否已连接
     * @en Whether connected
     */
    get isConnected(): boolean {
        return this._state === NetworkState.Connected
    }

    /**
     * @zh 获取底层 RPC 客户端
     * @en Get underlying RPC client
     */
    get client(): RpcClient<P> | null {
        return this._client
    }

    /**
     * @zh 连接到服务器
     * @en Connect to server
     */
    async connect(options: NetworkServiceOptions): Promise<void> {
        if (this._state !== NetworkState.Disconnected) {
            throw new Error('Already connected or connecting')
        }

        this._state = NetworkState.Connecting

        try {
            this._client = new RpcClient(this._protocol, options.url, {
                ...options,
                onConnect: () => {
                    this._state = NetworkState.Connected
                    options.onConnect?.()
                },
                onDisconnect: (reason) => {
                    this._state = NetworkState.Disconnected
                    options.onDisconnect?.(reason)
                },
                onError: options.onError,
            })
            await this._client.connect()
            this._state = NetworkState.Connected
        } catch (err) {
            this._state = NetworkState.Disconnected
            this._client = null
            throw err
        }
    }

    /**
     * @zh 断开连接
     * @en Disconnect
     */
    disconnect(): void {
        this._client?.disconnect()
        this._client = null
        this._state = NetworkState.Disconnected
    }

    /**
     * @zh 调用 API
     * @en Call API
     */
    call<K extends ApiNames<P>>(
        name: K,
        input: ApiInput<P['api'][K]>
    ): Promise<ApiOutput<P['api'][K]>> {
        if (!this._client) {
            return Promise.reject(new Error('Not connected'))
        }
        return this._client.call(name, input)
    }

    /**
     * @zh 发送消息
     * @en Send message
     */
    send<K extends MsgNames<P>>(name: K, data: MsgData<P['msg'][K]>): void {
        this._client?.send(name, data)
    }

    /**
     * @zh 监听消息
     * @en Listen to message
     */
    on<K extends MsgNames<P>>(
        name: K,
        handler: (data: MsgData<P['msg'][K]>) => void
    ): this {
        this._client?.on(name, handler)
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
        this._client?.off(name, handler)
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
        this._client?.once(name, handler)
        return this
    }
}

// ============================================================================
// GameNetworkService - Game-specific Class | 游戏网络服务
// ============================================================================

/**
 * @zh 游戏网络服务
 * @en Game network service
 *
 * @zh 基于默认游戏协议的网络服务，提供游戏特定的便捷方法
 * @en Network service based on default game protocol with game-specific convenience methods
 *
 * @example
 * ```typescript
 * const network = new GameNetworkService()
 * await network.connect({ url: 'ws://localhost:3000' })
 *
 * // 游戏特定的便捷方法
 * network.sendInput({ frame: 1, moveDir: { x: 1, y: 0 } })
 *
 * network.onSync((data) => {
 *     for (const entity of data.entities) {
 *         // 更新实体状态
 *     }
 * })
 * ```
 */
export class GameNetworkService extends RpcService<GameProtocol> {
    constructor() {
        super(gameProtocol)
    }

    /**
     * @zh 发送玩家输入
     * @en Send player input
     */
    sendInput(input: PlayerInput): void {
        this.send('input', input)
    }

    /**
     * @zh 监听状态同步
     * @en Listen to state sync
     */
    onSync(handler: (data: MsgData<GameProtocol['msg']['sync']>) => void): this {
        return this.on('sync', handler)
    }

    /**
     * @zh 监听实体生成
     * @en Listen to entity spawn
     */
    onSpawn(handler: (data: MsgData<GameProtocol['msg']['spawn']>) => void): this {
        return this.on('spawn', handler)
    }

    /**
     * @zh 监听实体销毁
     * @en Listen to entity despawn
     */
    onDespawn(handler: (data: MsgData<GameProtocol['msg']['despawn']>) => void): this {
        return this.on('despawn', handler)
    }
}

// ============================================================================
// Exports & Factories | 导出与工厂函数
// ============================================================================

/**
 * @zh 网络服务（GameNetworkService 的别名）
 * @en Network service (alias for GameNetworkService)
 */
export { GameNetworkService as NetworkService }

/**
 * @zh 创建网络服务
 * @en Create network service
 */
export function createNetworkService(): GameNetworkService
export function createNetworkService<P extends ProtocolDef>(protocol: P): RpcService<P>
export function createNetworkService<P extends ProtocolDef>(protocol?: P): RpcService<P> | GameNetworkService {
    if (protocol) {
        return new RpcService(protocol)
    }
    return new GameNetworkService()
}
