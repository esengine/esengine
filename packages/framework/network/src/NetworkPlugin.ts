/**
 * @zh 网络插件
 * @en Network Plugin
 *
 * @zh 提供基于 @esengine/rpc 的网络同步功能，支持客户端预测和断线重连
 * @en Provides @esengine/rpc based network synchronization with client prediction and reconnection
 */

import { type IPlugin, Core, type ServiceContainer, type Scene } from '@esengine/ecs-framework'
import {
    GameNetworkService,
    type NetworkServiceOptions,
    NetworkState,
} from './services/NetworkService'
import { NetworkSyncSystem, type NetworkSyncConfig } from './systems/NetworkSyncSystem'
import { NetworkSpawnSystem, type PrefabFactory } from './systems/NetworkSpawnSystem'
import { NetworkInputSystem, type NetworkInputConfig } from './systems/NetworkInputSystem'
import {
    NetworkPredictionSystem,
    type NetworkPredictionConfig,
} from './systems/NetworkPredictionSystem'
import {
    NetworkAOISystem,
    type NetworkAOIConfig,
} from './systems/NetworkAOISystem'
import type { FullStateData, SyncData } from './protocol'

// =============================================================================
// Types | 类型定义
// =============================================================================

/**
 * @zh 网络插件配置
 * @en Network plugin configuration
 */
export interface NetworkPluginConfig {
    /**
     * @zh 是否启用客户端预测
     * @en Whether to enable client prediction
     */
    enablePrediction: boolean

    /**
     * @zh 是否启用自动重连
     * @en Whether to enable auto reconnection
     */
    enableAutoReconnect: boolean

    /**
     * @zh 重连最大尝试次数
     * @en Maximum reconnection attempts
     */
    maxReconnectAttempts: number

    /**
     * @zh 重连间隔（毫秒）
     * @en Reconnection interval in milliseconds
     */
    reconnectInterval: number

    /**
     * @zh 同步系统配置
     * @en Sync system configuration
     */
    syncConfig?: Partial<NetworkSyncConfig>

    /**
     * @zh 输入系统配置
     * @en Input system configuration
     */
    inputConfig?: Partial<NetworkInputConfig>

    /**
     * @zh 预测系统配置
     * @en Prediction system configuration
     */
    predictionConfig?: Partial<NetworkPredictionConfig>

    /**
     * @zh 是否启用 AOI 兴趣管理
     * @en Whether to enable AOI interest management
     */
    enableAOI: boolean

    /**
     * @zh AOI 系统配置
     * @en AOI system configuration
     */
    aoiConfig?: Partial<NetworkAOIConfig>
}

const DEFAULT_CONFIG: NetworkPluginConfig = {
    enablePrediction: true,
    enableAutoReconnect: true,
    maxReconnectAttempts: 5,
    reconnectInterval: 2000,
    enableAOI: false,
}

/**
 * @zh 连接选项
 * @en Connection options
 */
export interface ConnectOptions extends NetworkServiceOptions {
    playerName: string
    roomId?: string
}

/**
 * @zh 重连状态
 * @en Reconnection state
 */
interface ReconnectState {
    token: string
    playerId: number
    roomId: string
    attempts: number
    isReconnecting: boolean
}

// =============================================================================
// NetworkPlugin | 网络插件
// =============================================================================

/**
 * @zh 网络插件
 * @en Network plugin
 *
 * @zh 提供基于 @esengine/rpc 的网络同步功能
 * @en Provides @esengine/rpc based network synchronization
 *
 * @example
 * ```typescript
 * import { Core } from '@esengine/ecs-framework'
 * import { NetworkPlugin } from '@esengine/network'
 *
 * const networkPlugin = new NetworkPlugin({
 *     enablePrediction: true,
 *     enableAutoReconnect: true
 * })
 * await Core.installPlugin(networkPlugin)
 *
 * // 连接到服务器
 * await networkPlugin.connect({ url: 'ws://localhost:3000', playerName: 'Player1' })
 *
 * // 注册预制体
 * networkPlugin.registerPrefab('player', (scene, spawn) => {
 *     const entity = scene.createEntity('Player')
 *     return entity
 * })
 * ```
 */
export class NetworkPlugin implements IPlugin {
    public readonly name = '@esengine/network'
    public readonly version = '2.1.0'

    private readonly _config: NetworkPluginConfig
    private _networkService!: GameNetworkService
    private _syncSystem!: NetworkSyncSystem
    private _spawnSystem!: NetworkSpawnSystem
    private _inputSystem!: NetworkInputSystem
    private _predictionSystem: NetworkPredictionSystem | null = null
    private _aoiSystem: NetworkAOISystem | null = null

    private _localPlayerId: number = 0
    private _reconnectState: ReconnectState | null = null
    private _reconnectTimer: ReturnType<typeof setTimeout> | null = null
    private _lastConnectOptions: ConnectOptions | null = null

    constructor(config?: Partial<NetworkPluginConfig>) {
        this._config = { ...DEFAULT_CONFIG, ...config }
    }

    // =========================================================================
    // Getters | 属性访问器
    // =========================================================================

    /**
     * @zh 网络服务
     * @en Network service
     */
    get networkService(): GameNetworkService {
        return this._networkService
    }

    /**
     * @zh 同步系统
     * @en Sync system
     */
    get syncSystem(): NetworkSyncSystem {
        return this._syncSystem
    }

    /**
     * @zh 生成系统
     * @en Spawn system
     */
    get spawnSystem(): NetworkSpawnSystem {
        return this._spawnSystem
    }

    /**
     * @zh 输入系统
     * @en Input system
     */
    get inputSystem(): NetworkInputSystem {
        return this._inputSystem
    }

    /**
     * @zh 预测系统
     * @en Prediction system
     */
    get predictionSystem(): NetworkPredictionSystem | null {
        return this._predictionSystem
    }

    /**
     * @zh AOI 系统
     * @en AOI system
     */
    get aoiSystem(): NetworkAOISystem | null {
        return this._aoiSystem
    }

    /**
     * @zh 本地玩家 ID
     * @en Local player ID
     */
    get localPlayerId(): number {
        return this._localPlayerId
    }

    /**
     * @zh 是否已连接
     * @en Is connected
     */
    get isConnected(): boolean {
        return this._networkService?.isConnected ?? false
    }

    /**
     * @zh 是否正在重连
     * @en Is reconnecting
     */
    get isReconnecting(): boolean {
        return this._reconnectState?.isReconnecting ?? false
    }

    /**
     * @zh 是否启用预测
     * @en Is prediction enabled
     */
    get isPredictionEnabled(): boolean {
        return this._config.enablePrediction && this._predictionSystem !== null
    }

    /**
     * @zh 是否启用 AOI
     * @en Is AOI enabled
     */
    get isAOIEnabled(): boolean {
        return this._config.enableAOI && this._aoiSystem !== null
    }

    // =========================================================================
    // Plugin Lifecycle | 插件生命周期
    // =========================================================================

    /**
     * @zh 安装插件
     * @en Install plugin
     */
    install(_core: Core, _services: ServiceContainer): void {
        this._networkService = new GameNetworkService()

        const scene = Core.scene
        if (scene) {
            this._setupSystems(scene as Scene)
        }
    }

    /**
     * @zh 卸载插件
     * @en Uninstall plugin
     */
    uninstall(): void {
        this._clearReconnectTimer()
        this._networkService?.disconnect()
    }

    private _setupSystems(scene: Scene): void {
        // Create systems
        this._syncSystem = new NetworkSyncSystem(this._config.syncConfig)
        this._spawnSystem = new NetworkSpawnSystem(this._syncSystem)
        this._inputSystem = new NetworkInputSystem(this._networkService, this._config.inputConfig)

        // Create prediction system if enabled
        if (this._config.enablePrediction) {
            this._predictionSystem = new NetworkPredictionSystem(this._config.predictionConfig)
            this._inputSystem.setPredictionSystem(this._predictionSystem)
            scene.addSystem(this._predictionSystem)
        }

        // Create AOI system if enabled
        if (this._config.enableAOI) {
            this._aoiSystem = new NetworkAOISystem(this._config.aoiConfig)
            scene.addSystem(this._aoiSystem)
        }

        scene.addSystem(this._syncSystem)
        scene.addSystem(this._spawnSystem)
        scene.addSystem(this._inputSystem)

        this._setupMessageHandlers()
    }

    private _setupMessageHandlers(): void {
        this._networkService
            .onSync((data: SyncData) => {
                // Use new sync handler with timestamps
                this._syncSystem.handleSyncData(data)

                // Reconcile prediction if enabled
                if (this._predictionSystem) {
                    this._predictionSystem.reconcileWithServer(data)
                }
            })
            .onSpawn((data) => {
                this._spawnSystem.handleSpawn(data)
            })
            .onDespawn((data) => {
                this._spawnSystem.handleDespawn(data)
            })

        // Handle full state for reconnection
        this._networkService.on('fullState', (data: FullStateData) => {
            this._handleFullState(data)
        })
    }

    // =========================================================================
    // Connection | 连接管理
    // =========================================================================

    /**
     * @zh 连接到服务器
     * @en Connect to server
     */
    public async connect(options: ConnectOptions): Promise<boolean> {
        this._lastConnectOptions = options

        try {
            // Setup disconnect handler for auto-reconnect
            const originalOnDisconnect = options.onDisconnect
            options.onDisconnect = (reason) => {
                originalOnDisconnect?.(reason)
                this._handleDisconnect(reason)
            }

            await this._networkService.connect(options)

            const result = await this._networkService.call('join', {
                playerName: options.playerName,
                roomId: options.roomId,
            })

            this._localPlayerId = result.playerId
            this._spawnSystem.setLocalPlayerId(this._localPlayerId)

            // Setup prediction for local player
            if (this._predictionSystem) {
                // Will be set when local player entity is spawned
            }

            // Save reconnect state
            if (this._config.enableAutoReconnect) {
                this._reconnectState = {
                    token: this._generateReconnectToken(),
                    playerId: result.playerId,
                    roomId: result.roomId,
                    attempts: 0,
                    isReconnecting: false,
                }
            }

            return true
        } catch (err) {
            console.error('[NetworkPlugin] Connection failed:', err)
            return false
        }
    }

    /**
     * @zh 断开连接
     * @en Disconnect
     */
    public async disconnect(): Promise<void> {
        this._clearReconnectTimer()
        this._reconnectState = null

        try {
            await this._networkService.call('leave', undefined)
        } catch {
            // ignore
        }
        this._networkService.disconnect()
        this._cleanup()
    }

    private _handleDisconnect(reason?: string): void {
        console.log('[NetworkPlugin] Disconnected:', reason)

        if (this._config.enableAutoReconnect && this._reconnectState && !this._reconnectState.isReconnecting) {
            this._attemptReconnect()
        }
    }

    private _attemptReconnect(): void {
        if (!this._reconnectState || !this._lastConnectOptions) return

        if (this._reconnectState.attempts >= this._config.maxReconnectAttempts) {
            console.error('[NetworkPlugin] Max reconnection attempts reached')
            this._reconnectState = null
            return
        }

        this._reconnectState.isReconnecting = true
        this._reconnectState.attempts++

        console.log(`[NetworkPlugin] Attempting reconnection (${this._reconnectState.attempts}/${this._config.maxReconnectAttempts})`)

        this._reconnectTimer = setTimeout(async () => {
            try {
                await this._networkService.connect(this._lastConnectOptions!)

                const result = await this._networkService.call('reconnect', {
                    playerId: this._reconnectState!.playerId,
                    roomId: this._reconnectState!.roomId,
                    token: this._reconnectState!.token,
                })

                if (result.success) {
                    console.log('[NetworkPlugin] Reconnection successful')
                    this._reconnectState!.isReconnecting = false
                    this._reconnectState!.attempts = 0

                    // Restore state
                    if (result.state) {
                        this._handleFullState(result.state)
                    }
                } else {
                    console.error('[NetworkPlugin] Reconnection rejected:', result.error)
                    this._attemptReconnect()
                }
            } catch (err) {
                console.error('[NetworkPlugin] Reconnection failed:', err)
                if (this._reconnectState) {
                    this._reconnectState.isReconnecting = false
                }
                this._attemptReconnect()
            }
        }, this._config.reconnectInterval)
    }

    private _handleFullState(data: FullStateData): void {
        // Clear existing entities
        this._syncSystem.clearSnapshots()

        // Spawn all entities from full state
        for (const entityData of data.entities) {
            this._spawnSystem.handleSpawn(entityData)

            // Apply initial state if available
            if (entityData.state) {
                this._syncSystem.handleSyncData({
                    frame: data.frame,
                    timestamp: data.timestamp,
                    entities: [entityData.state],
                })
            }
        }
    }

    private _clearReconnectTimer(): void {
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer)
            this._reconnectTimer = null
        }
    }

    private _generateReconnectToken(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    }

    private _cleanup(): void {
        this._localPlayerId = 0
        this._syncSystem?.clearSnapshots()
        this._predictionSystem?.reset()
        this._inputSystem?.reset()
    }

    // =========================================================================
    // Game API | 游戏接口
    // =========================================================================

    /**
     * @zh 注册预制体工厂
     * @en Register prefab factory
     */
    public registerPrefab(prefabType: string, factory: PrefabFactory): void {
        this._spawnSystem?.registerPrefab(prefabType, factory)
    }

    /**
     * @zh 发送移动输入
     * @en Send move input
     */
    public sendMoveInput(x: number, y: number): void {
        this._inputSystem?.addMoveInput(x, y)
    }

    /**
     * @zh 发送动作输入
     * @en Send action input
     */
    public sendActionInput(action: string): void {
        this._inputSystem?.addActionInput(action)
    }

    /**
     * @zh 设置本地玩家网络 ID（用于预测）
     * @en Set local player network ID (for prediction)
     */
    public setLocalPlayerNetId(netId: number): void {
        if (this._predictionSystem) {
            this._predictionSystem.setLocalPlayerNetId(netId)
        }
    }

    /**
     * @zh 启用/禁用预测
     * @en Enable/disable prediction
     */
    public setPredictionEnabled(enabled: boolean): void {
        if (this._predictionSystem) {
            this._predictionSystem.enabled = enabled
        }
    }

    // =========================================================================
    // AOI API | AOI 接口
    // =========================================================================

    /**
     * @zh 添加 AOI 观察者（玩家）
     * @en Add AOI observer (player)
     */
    public addAOIObserver(netId: number, x: number, y: number, viewRange?: number): void {
        this._aoiSystem?.addObserver(netId, x, y, viewRange)
    }

    /**
     * @zh 移除 AOI 观察者
     * @en Remove AOI observer
     */
    public removeAOIObserver(netId: number): void {
        this._aoiSystem?.removeObserver(netId)
    }

    /**
     * @zh 更新 AOI 观察者位置
     * @en Update AOI observer position
     */
    public updateAOIObserverPosition(netId: number, x: number, y: number): void {
        this._aoiSystem?.updateObserverPosition(netId, x, y)
    }

    /**
     * @zh 获取观察者可见的实体
     * @en Get entities visible to observer
     */
    public getVisibleEntities(observerNetId: number): number[] {
        return this._aoiSystem?.getVisibleEntities(observerNetId) ?? []
    }

    /**
     * @zh 检查是否可见
     * @en Check if visible
     */
    public canSee(observerNetId: number, targetNetId: number): boolean {
        return this._aoiSystem?.canSee(observerNetId, targetNetId) ?? true
    }

    /**
     * @zh 启用/禁用 AOI
     * @en Enable/disable AOI
     */
    public setAOIEnabled(enabled: boolean): void {
        if (this._aoiSystem) {
            this._aoiSystem.enabled = enabled
        }
    }
}
