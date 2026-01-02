/**
 * @zh 房间管理器
 * @en Room manager
 */

import { Room, type RoomOptions } from './Room.js';
import type { Player } from './Player.js';
import { createLogger } from '../logger.js';

const logger = createLogger('Room');

/**
 * @zh 房间类型
 * @en Room class type
 */
export type RoomClass<T extends Room = Room> = new () => T

/**
 * @zh 房间定义
 * @en Room definition
 */
interface RoomDefinition {
    roomClass: RoomClass
}

/**
 * @zh 房间管理器
 * @en Room manager
 *
 * @zh 管理房间的创建、加入、离开等操作。可被 DistributedRoomManager 继承以支持分布式功能。
 * @en Manages room creation, joining, leaving, etc. Can be extended by DistributedRoomManager for distributed features.
 */
export class RoomManager {
    /**
     * @zh 房间类型定义映射
     * @en Room type definitions map
     */
    protected _definitions: Map<string, RoomDefinition> = new Map();

    /**
     * @zh 房间实例映射
     * @en Room instances map
     */
    protected _rooms: Map<string, Room> = new Map();

    /**
     * @zh 玩家到房间的映射
     * @en Player to room mapping
     */
    protected _playerToRoom: Map<string, string> = new Map();

    /**
     * @zh 下一个房间 ID 计数器
     * @en Next room ID counter
     */
    protected _nextRoomId = 1;

    /**
     * @zh 消息发送函数
     * @en Message send function
     */
    protected _sendFn: (conn: any, type: string, data: unknown) => void;

    constructor(sendFn: (conn: any, type: string, data: unknown) => void) {
        this._sendFn = sendFn;
    }

    /**
     * @zh 注册房间类型
     * @en Define room type
     */
    define<T extends Room>(name: string, roomClass: RoomClass<T>): void {
        this._definitions.set(name, { roomClass });
    }

    /**
     * @zh 创建房间
     * @en Create room
     *
     * @param name - 房间类型名称 | Room type name
     * @param options - 房间配置 | Room options
     * @returns 房间实例或 null | Room instance or null
     */
    async create(name: string, options?: RoomOptions): Promise<Room | null> {
        const room = await this._createRoomInstance(name, options);
        if (room) {
            await this._onRoomCreated(name, room);
            logger.info(`Created: ${name} (${room.id})`);
        }
        return room;
    }

    /**
     * @zh 房间创建后的回调
     * @en Callback after room is created
     *
     * @param _name - 房间类型名称 | Room type name
     * @param _room - 房间实例 | Room instance
     */
    protected async _onRoomCreated(_name: string, _room: Room): Promise<void> {
        // 子类可覆盖以添加分布式注册等逻辑 | Subclass can override to add distributed registration logic
    }

    /**
     * @zh 加入或创建房间
     * @en Join or create room
     *
     * @param name - 房间类型名称 | Room type name
     * @param playerId - 玩家 ID | Player ID
     * @param conn - 玩家连接 | Player connection
     * @param options - 房间配置 | Room options
     * @returns 房间和玩家实例或 null | Room and player instance or null
     */
    async joinOrCreate(
        name: string,
        playerId: string,
        conn: any,
        options?: RoomOptions
    ): Promise<{ room: Room; player: Player } | null> {
        // 查找可加入的房间 | Find available room
        let room = this._findAvailableRoom(name);

        // 没有则创建 | Create if none exists
        if (!room) {
            room = await this.create(name, options);
            if (!room) return null;
        }

        // 加入房间 | Join room
        const player = await room._addPlayer(playerId, conn);
        if (!player) return null;

        this._onPlayerJoined(playerId, room.id, player);

        logger.info(`Player ${playerId} joined ${room.id}`);
        return { room, player };
    }

    /**
     * @zh 加入指定房间
     * @en Join specific room
     *
     * @param roomId - 房间 ID | Room ID
     * @param playerId - 玩家 ID | Player ID
     * @param conn - 玩家连接 | Player connection
     * @returns 房间和玩家实例或 null | Room and player instance or null
     */
    async joinById(
        roomId: string,
        playerId: string,
        conn: any
    ): Promise<{ room: Room; player: Player } | null> {
        const room = this._rooms.get(roomId);
        if (!room) return null;

        const player = await room._addPlayer(playerId, conn);
        if (!player) return null;

        this._onPlayerJoined(playerId, room.id, player);

        logger.info(`Player ${playerId} joined ${room.id}`);
        return { room, player };
    }

    /**
     * @zh 玩家离开
     * @en Player leave
     *
     * @param playerId - 玩家 ID | Player ID
     * @param reason - 离开原因 | Leave reason
     */
    async leave(playerId: string, reason?: string): Promise<void> {
        const roomId = this._playerToRoom.get(playerId);
        if (!roomId) return;

        const room = this._rooms.get(roomId);
        if (room) {
            await room._removePlayer(playerId, reason);
        }

        this._onPlayerLeft(playerId, roomId);
        logger.info(`Player ${playerId} left ${roomId}`);
    }

    /**
     * @zh 处理消息
     * @en Handle message
     */
    handleMessage(playerId: string, type: string, data: unknown): void {
        const roomId = this._playerToRoom.get(playerId);
        if (!roomId) return;

        const room = this._rooms.get(roomId);
        if (room) {
            room._handleMessage(type, data, playerId);
        }
    }

    /**
     * @zh 获取房间
     * @en Get room
     */
    getRoom(roomId: string): Room | undefined {
        return this._rooms.get(roomId);
    }

    /**
     * @zh 获取玩家所在房间
     * @en Get player's room
     */
    getPlayerRoom(playerId: string): Room | undefined {
        const roomId = this._playerToRoom.get(playerId);
        return roomId ? this._rooms.get(roomId) : undefined;
    }

    /**
     * @zh 获取所有房间
     * @en Get all rooms
     */
    getRooms(): ReadonlyArray<Room> {
        return Array.from(this._rooms.values());
    }

    /**
     * @zh 获取指定类型的所有房间
     * @en Get all rooms of a type
     */
    getRoomsByType(name: string): Room[] {
        const def = this._definitions.get(name);
        if (!def) return [];

        return Array.from(this._rooms.values()).filter(
            (room) => room instanceof def.roomClass
        );
    }

    /**
     * @zh 查找可用房间
     * @en Find available room
     *
     * @param name - 房间类型名称 | Room type name
     * @returns 可用房间或 null | Available room or null
     */
    protected _findAvailableRoom(name: string): Room | null {
        const def = this._definitions.get(name);
        if (!def) return null;

        for (const room of this._rooms.values()) {
            if (
                room instanceof def.roomClass &&
                !room.isFull &&
                !room.isLocked &&
                !room.isDisposed
            ) {
                return room;
            }
        }

        return null;
    }

    /**
     * @zh 生成房间 ID
     * @en Generate room ID
     *
     * @returns 新的房间 ID | New room ID
     */
    protected _generateRoomId(): string {
        return `room_${this._nextRoomId++}`;
    }

    /**
     * @zh 获取房间定义
     * @en Get room definition
     *
     * @param name - 房间类型名称 | Room type name
     * @returns 房间定义或 undefined | Room definition or undefined
     */
    protected _getDefinition(name: string): RoomDefinition | undefined {
        return this._definitions.get(name);
    }

    /**
     * @zh 内部创建房间实例
     * @en Internal create room instance
     *
     * @param name - 房间类型名称 | Room type name
     * @param options - 房间配置 | Room options
     * @param roomId - 可选的房间 ID（用于分布式恢复） | Optional room ID (for distributed recovery)
     * @returns 房间实例或 null | Room instance or null
     */
    protected async _createRoomInstance(
        name: string,
        options?: RoomOptions,
        roomId?: string
    ): Promise<Room | null> {
        const def = this._definitions.get(name);
        if (!def) {
            logger.warn(`Room type not found: ${name}`);
            return null;
        }

        const finalRoomId = roomId ?? this._generateRoomId();
        const room = new def.roomClass();

        room._init({
            id: finalRoomId,
            sendFn: this._sendFn,
            broadcastFn: (type, data) => {
                for (const player of room.players) {
                    player.send(type, data);
                }
            },
            disposeFn: () => {
                this._onRoomDisposed(finalRoomId);
            }
        });

        this._rooms.set(finalRoomId, room);
        await room._create(options);

        return room;
    }

    /**
     * @zh 房间销毁回调
     * @en Room disposed callback
     *
     * @param roomId - 房间 ID | Room ID
     */
    protected _onRoomDisposed(roomId: string): void {
        this._rooms.delete(roomId);
    }

    /**
     * @zh 玩家加入房间后的回调
     * @en Callback after player joins room
     *
     * @param playerId - 玩家 ID | Player ID
     * @param roomId - 房间 ID | Room ID
     * @param player - 玩家实例 | Player instance
     */
    protected _onPlayerJoined(playerId: string, roomId: string, _player: Player): void {
        this._playerToRoom.set(playerId, roomId);
    }

    /**
     * @zh 玩家离开房间后的回调
     * @en Callback after player leaves room
     *
     * @param playerId - 玩家 ID | Player ID
     * @param _roomId - 房间 ID | Room ID
     */
    protected _onPlayerLeft(playerId: string, _roomId: string): void {
        this._playerToRoom.delete(playerId);
    }
}
