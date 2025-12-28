/**
 * @zh 网络插件
 * @en Network Plugin
 */

import { type IPlugin, Core, type ServiceContainer, type Scene } from '@esengine/ecs-framework'
import { GameNetworkService, type NetworkServiceOptions } from './services/NetworkService'
import { NetworkSyncSystem } from './systems/NetworkSyncSystem'
import { NetworkSpawnSystem, type PrefabFactory } from './systems/NetworkSpawnSystem'
import { NetworkInputSystem } from './systems/NetworkInputSystem'

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
 * const networkPlugin = new NetworkPlugin()
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
    public readonly version = '2.0.0'

    private _networkService!: GameNetworkService
    private _syncSystem!: NetworkSyncSystem
    private _spawnSystem!: NetworkSpawnSystem
    private _inputSystem!: NetworkInputSystem
    private _localPlayerId: number = 0

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
        this._networkService?.disconnect()
    }

    private _setupSystems(scene: Scene): void {
        this._syncSystem = new NetworkSyncSystem()
        this._spawnSystem = new NetworkSpawnSystem(this._syncSystem)
        this._inputSystem = new NetworkInputSystem(this._networkService)

        scene.addSystem(this._syncSystem)
        scene.addSystem(this._spawnSystem)
        scene.addSystem(this._inputSystem)

        this._setupMessageHandlers()
    }

    private _setupMessageHandlers(): void {
        this._networkService
            .onSync((data) => {
                this._syncSystem.handleSync({ entities: data.entities })
            })
            .onSpawn((data) => {
                this._spawnSystem.handleSpawn(data)
            })
            .onDespawn((data) => {
                this._spawnSystem.handleDespawn(data)
            })
    }

    /**
     * @zh 连接到服务器
     * @en Connect to server
     */
    public async connect(options: NetworkServiceOptions & { playerName: string; roomId?: string }): Promise<boolean> {
        try {
            await this._networkService.connect(options)

            const result = await this._networkService.call('join', {
                playerName: options.playerName,
                roomId: options.roomId,
            })

            this._localPlayerId = result.playerId
            this._spawnSystem.setLocalPlayerId(this._localPlayerId)

            return true
        } catch (err) {
            return false
        }
    }

    /**
     * @zh 断开连接
     * @en Disconnect
     */
    public async disconnect(): Promise<void> {
        try {
            await this._networkService.call('leave', undefined)
        } catch {
            // ignore
        }
        this._networkService.disconnect()
    }

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
}
