import { WsServer, type BaseConnection } from 'tsrpc';
import { serviceProto, type ServiceType, type MsgInput } from '@esengine/network-protocols';
import { Room, type IRoomConfig } from './Room';

/**
 * 服务器配置
 * Server configuration
 */
export interface IServerConfig {
    port: number;
    roomConfig?: Partial<IRoomConfig>;
}

const DEFAULT_CONFIG: IServerConfig = {
    port: 3000
};

/**
 * 游戏服务器
 * Game server
 *
 * 管理 WebSocket 连接和房间。
 * Manages WebSocket connections and rooms.
 */
export class GameServer {
    private _server: WsServer<ServiceType>;
    private _config: IServerConfig;
    private _rooms: Map<string, Room> = new Map();
    private _connectionToRoom: Map<BaseConnection<ServiceType>, { roomId: string; clientId: number }> = new Map();

    constructor(config: Partial<IServerConfig> = {}) {
        this._config = { ...DEFAULT_CONFIG, ...config };
        this._server = new WsServer(serviceProto, {
            port: this._config.port,
            json: true,
            logLevel: 'info'
        });

        this._setupHandlers();
    }

    /**
     * 启动服务器
     * Start server
     */
    async start(): Promise<void> {
        await this._server.start();
        console.log(`[GameServer] 服务器已启动 | Server started on port ${this._config.port}`);
    }

    /**
     * 停止服务器
     * Stop server
     */
    async stop(): Promise<void> {
        // 销毁所有房间
        // Destroy all rooms
        for (const room of this._rooms.values()) {
            room.destroy();
        }
        this._rooms.clear();
        this._connectionToRoom.clear();

        await this._server.stop();
        console.log('[GameServer] 服务器已停止 | Server stopped');
    }

    /**
     * 获取或创建房间
     * Get or create room
     */
    getOrCreateRoom(roomId?: string): Room {
        // 如果没有指定房间 ID，寻找未满的房间或创建新房间
        // If no room ID specified, find a non-full room or create new one
        if (!roomId) {
            for (const room of this._rooms.values()) {
                if (!room.isFull) {
                    return room;
                }
            }
            roomId = this._generateRoomId();
        }

        let room = this._rooms.get(roomId);
        if (!room) {
            room = new Room(roomId, this._config.roomConfig);
            this._rooms.set(roomId, room);
            console.log(`[GameServer] 创建房间 | Room created: ${roomId}`);
        }

        return room;
    }

    /**
     * 获取房间
     * Get room
     */
    getRoom(roomId: string): Room | undefined {
        return this._rooms.get(roomId);
    }

    /**
     * 获取连接的房间信息
     * Get connection's room info
     */
    getConnectionInfo(connection: BaseConnection<ServiceType>): { roomId: string; clientId: number } | undefined {
        return this._connectionToRoom.get(connection);
    }

    /**
     * 设置连接的房间信息
     * Set connection's room info
     */
    setConnectionInfo(connection: BaseConnection<ServiceType>, roomId: string, clientId: number): void {
        this._connectionToRoom.set(connection, { roomId, clientId });
    }

    private _setupHandlers(): void {
        // 处理加入请求
        // Handle join request
        this._server.implementApi('Join', async (call) => {
            const { playerName, roomId } = call.req;

            const room = this.getOrCreateRoom(roomId);
            if (room.isFull) {
                call.error('房间已满 | Room is full');
                return;
            }

            const player = room.addPlayer(playerName, call.conn);
            if (!player) {
                call.error('加入房间失败 | Failed to join room');
                return;
            }

            this.setConnectionInfo(call.conn, room.id, player.clientId);

            // 向新玩家发送自己的生成消息
            // Send spawn message to new player for themselves
            call.conn.sendMsg('Spawn', {
                netId: player.netId,
                ownerId: player.clientId,
                prefab: 'player',
                pos: { x: 0, y: 0 },
                rot: 0
            });

            call.succ({
                clientId: player.clientId,
                roomId: room.id,
                playerCount: room.playerCount
            });

            console.log(`[GameServer] 玩家加入 | Player joined: ${playerName} (${player.clientId}) -> ${room.id}`);
        });

        // 处理输入消息
        // Handle input message
        this._server.listenMsg('Input', (call) => {
            const info = this.getConnectionInfo(call.conn);
            if (!info) return;

            const room = this.getRoom(info.roomId);
            if (!room) return;

            const msg = call.msg as MsgInput;
            room.handleInput(info.clientId, msg.input);
        });

        // 处理断开连接
        // Handle disconnect
        this._server.flows.postDisconnectFlow.push((v) => {
            const info = this._connectionToRoom.get(v.conn);
            if (info) {
                const room = this.getRoom(info.roomId);
                if (room) {
                    room.removePlayer(info.clientId);
                    console.log(`[GameServer] 玩家离开 | Player left: ${info.clientId} from ${info.roomId}`);

                    // 如果房间空了，删除房间
                    // If room is empty, delete it
                    if (room.playerCount === 0) {
                        room.destroy();
                        this._rooms.delete(info.roomId);
                        console.log(`[GameServer] 删除空房间 | Empty room deleted: ${info.roomId}`);
                    }
                }
                this._connectionToRoom.delete(v.conn);
            }
            return v;
        });
    }

    private _generateRoomId(): string {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
}
