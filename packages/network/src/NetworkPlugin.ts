import { type IPlugin, Core, type ServiceContainer, type Scene } from '@esengine/ecs-framework';
import { NetworkService } from './services/NetworkService';
import { NetworkSyncSystem } from './systems/NetworkSyncSystem';
import { NetworkSpawnSystem, type PrefabFactory } from './systems/NetworkSpawnSystem';
import { NetworkInputSystem } from './systems/NetworkInputSystem';

/**
 * 网络插件
 * Network plugin
 *
 * 提供基于 TSRPC 的网络同步功能。
 * Provides TSRPC-based network synchronization.
 *
 * @example
 * ```typescript
 * import { Core } from '@esengine/ecs-framework';
 * import { NetworkPlugin } from '@esengine/network';
 *
 * const networkPlugin = new NetworkPlugin();
 * await Core.installPlugin(networkPlugin);
 *
 * // 连接到服务器 | Connect to server
 * await networkPlugin.connect('ws://localhost:3000', 'Player1');
 *
 * // 注册预制体 | Register prefab
 * networkPlugin.registerPrefab('player', (scene, spawn) => {
 *     const entity = scene.createEntity('Player');
 *     return entity;
 * });
 * ```
 */
export class NetworkPlugin implements IPlugin {
    public readonly name = '@esengine/network';
    public readonly version = '1.0.0';

    private _networkService!: NetworkService;
    private _syncSystem!: NetworkSyncSystem;
    private _spawnSystem!: NetworkSpawnSystem;
    private _inputSystem!: NetworkInputSystem;

    /**
     * 网络服务
     * Network service
     */
    get networkService(): NetworkService {
        return this._networkService;
    }

    /**
     * 同步系统
     * Sync system
     */
    get syncSystem(): NetworkSyncSystem {
        return this._syncSystem;
    }

    /**
     * 生成系统
     * Spawn system
     */
    get spawnSystem(): NetworkSpawnSystem {
        return this._spawnSystem;
    }

    /**
     * 输入系统
     * Input system
     */
    get inputSystem(): NetworkInputSystem {
        return this._inputSystem;
    }

    /**
     * 是否已连接
     * Is connected
     */
    get isConnected(): boolean {
        return this._networkService?.isConnected ?? false;
    }

    /**
     * 安装插件
     * Install plugin
     */
    install(_core: Core, _services: ServiceContainer): void {
        this._networkService = new NetworkService();

        // 当场景加载时添加系统
        // Add systems when scene loads
        const scene = Core.scene;
        if (scene) {
            this._setupSystems(scene as Scene);
        }
    }

    /**
     * 卸载插件
     * Uninstall plugin
     */
    uninstall(): void {
        this._networkService?.disconnect();
    }

    private _setupSystems(scene: Scene): void {
        this._syncSystem = new NetworkSyncSystem(this._networkService);
        this._spawnSystem = new NetworkSpawnSystem(this._networkService, this._syncSystem);
        this._inputSystem = new NetworkInputSystem(this._networkService);

        scene.addSystem(this._syncSystem);
        scene.addSystem(this._spawnSystem);
        scene.addSystem(this._inputSystem);
    }

    /**
     * 连接到服务器
     * Connect to server
     */
    public async connect(serverUrl: string, playerName: string, roomId?: string): Promise<boolean> {
        return this._networkService.connect(serverUrl, playerName, roomId);
    }

    /**
     * 断开连接
     * Disconnect
     */
    public async disconnect(): Promise<void> {
        await this._networkService.disconnect();
    }

    /**
     * 注册预制体工厂
     * Register prefab factory
     */
    public registerPrefab(prefabType: string, factory: PrefabFactory): void {
        this._spawnSystem?.registerPrefab(prefabType, factory);
    }

    /**
     * 发送移动输入
     * Send move input
     */
    public sendMoveInput(x: number, y: number): void {
        this._inputSystem?.addMoveInput(x, y);
    }

    /**
     * 发送动作输入
     * Send action input
     */
    public sendActionInput(action: string): void {
        this._inputSystem?.addActionInput(action);
    }
}
