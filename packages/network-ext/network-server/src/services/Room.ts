import type { BaseConnection } from 'tsrpc';
import type { ServiceType, IEntityState } from '@esengine/network-protocols';

/**
 * 连接类型别名
 * Connection type alias
 */
type Connection = BaseConnection<ServiceType>;

/**
 * 玩家信息
 * Player information
 */
export interface IPlayer {
    clientId: number;
    name: string;
    connection: Connection;
    netId: number;
}

/**
 * 房间配置
 * Room configuration
 */
export interface IRoomConfig {
    maxPlayers: number;
    tickRate: number;
}

const DEFAULT_CONFIG: IRoomConfig = {
    maxPlayers: 16,
    tickRate: 20
};

/**
 * 游戏房间
 * Game room
 *
 * 管理房间内的玩家和实体状态同步。
 * Manages players and entity state synchronization within a room.
 */
export class Room {
    private _id: string;
    private _config: IRoomConfig;
    private _players: Map<number, IPlayer> = new Map();
    private _entities: Map<number, IEntityState> = new Map();
    private _nextClientId: number = 1;
    private _nextNetId: number = 1;
    private _syncInterval: ReturnType<typeof setInterval> | null = null;

    constructor(id: string, config: Partial<IRoomConfig> = {}) {
        this._id = id;
        this._config = { ...DEFAULT_CONFIG, ...config };
    }

    get id(): string {
        return this._id;
    }

    get playerCount(): number {
        return this._players.size;
    }

    get isFull(): boolean {
        return this._players.size >= this._config.maxPlayers;
    }

    /**
     * 添加玩家
     * Add player
     */
    addPlayer(name: string, connection: Connection): IPlayer | null {
        if (this.isFull) {
            return null;
        }

        const clientId = this._nextClientId++;
        const netId = this._nextNetId++;

        const player: IPlayer = {
            clientId,
            name,
            connection,
            netId
        };

        this._players.set(clientId, player);

        // 创建玩家实体
        // Create player entity
        const entityState: IEntityState = {
            netId,
            pos: { x: 0, y: 0 },
            rot: 0
        };
        this._entities.set(netId, entityState);

        // 通知其他玩家
        // Notify other players
        this._broadcastSpawn(player, entityState);

        // 同步现有实体给新玩家
        // Sync existing entities to new player
        this._syncExistingEntities(player);

        // 启动同步循环
        // Start sync loop
        if (this._syncInterval === null) {
            this._startSyncLoop();
        }

        return player;
    }

    /**
     * 移除玩家
     * Remove player
     */
    removePlayer(clientId: number): void {
        const player = this._players.get(clientId);
        if (!player) return;

        this._players.delete(clientId);
        this._entities.delete(player.netId);

        // 通知其他玩家
        // Notify other players
        this._broadcastDespawn(player.netId);

        // 停止同步循环
        // Stop sync loop
        if (this._players.size === 0 && this._syncInterval !== null) {
            clearInterval(this._syncInterval);
            this._syncInterval = null;
        }
    }

    /**
     * 处理玩家输入
     * Handle player input
     */
    handleInput(
        clientId: number,
        input: { moveDir?: { x: number; y: number }; actions?: string[] }
    ): void {
        const player = this._players.get(clientId);
        if (!player) return;

        const entity = this._entities.get(player.netId);
        if (!entity || !entity.pos) return;

        // 简单的移动处理
        // Simple movement handling
        if (input.moveDir) {
            const speed = 5;
            entity.pos.x += input.moveDir.x * speed;
            entity.pos.y += input.moveDir.y * speed;
        }
    }

    /**
     * 获取玩家
     * Get player
     */
    getPlayer(clientId: number): IPlayer | undefined {
        return this._players.get(clientId);
    }

    /**
     * 销毁房间
     * Destroy room
     */
    destroy(): void {
        if (this._syncInterval !== null) {
            clearInterval(this._syncInterval);
            this._syncInterval = null;
        }
        this._players.clear();
        this._entities.clear();
    }

    private _startSyncLoop(): void {
        const interval = 1000 / this._config.tickRate;
        this._syncInterval = setInterval(() => {
            this._broadcastSync();
        }, interval);
    }

    private _broadcastSync(): void {
        if (this._players.size === 0) return;

        const entities = Array.from(this._entities.values());
        const time = Date.now();

        for (const player of this._players.values()) {
            player.connection.sendMsg('Sync', { time, entities });
        }
    }

    private _broadcastSpawn(newPlayer: IPlayer, state: IEntityState): void {
        for (const player of this._players.values()) {
            if (player.clientId === newPlayer.clientId) continue;

            player.connection.sendMsg('Spawn', {
                netId: state.netId,
                ownerId: newPlayer.clientId,
                prefab: 'player',
                pos: state.pos ?? { x: 0, y: 0 },
                rot: state.rot ?? 0
            });
        }
    }

    private _broadcastDespawn(netId: number): void {
        for (const player of this._players.values()) {
            player.connection.sendMsg('Despawn', { netId });
        }
    }

    private _syncExistingEntities(newPlayer: IPlayer): void {
        for (const [netId, state] of this._entities) {
            const owner = Array.from(this._players.values()).find((p) => p.netId === netId);
            if (!owner || owner.clientId === newPlayer.clientId) continue;

            newPlayer.connection.sendMsg('Spawn', {
                netId,
                ownerId: owner.clientId,
                prefab: 'player',
                pos: state.pos ?? { x: 0, y: 0 },
                rot: state.rot ?? 0
            });
        }
    }
}
