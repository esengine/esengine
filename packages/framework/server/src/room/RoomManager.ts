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
 */
export class RoomManager {
    private _definitions: Map<string, RoomDefinition> = new Map();
    private _rooms: Map<string, Room> = new Map();
    private _playerToRoom: Map<string, string> = new Map();
    private _nextRoomId = 1;

    private _sendFn: (conn: any, type: string, data: unknown) => void;

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
     */
    async create(name: string, options?: RoomOptions): Promise<Room | null> {
        const def = this._definitions.get(name);
        if (!def) {
            logger.warn(`Room type not found: ${name}`);
            return null;
        }

        const roomId = this._generateRoomId();
        const room = new def.roomClass();

        room._init({
            id: roomId,
            sendFn: this._sendFn,
            broadcastFn: (type, data) => {
                for (const player of room.players) {
                    player.send(type, data);
                }
            },
            disposeFn: () => {
                this._rooms.delete(roomId);
            }
        });

        this._rooms.set(roomId, room);
        await room._create(options);

        logger.info(`Created: ${name} (${roomId})`);
        return room;
    }

    /**
     * @zh 加入或创建房间
     * @en Join or create room
     */
    async joinOrCreate(
        name: string,
        playerId: string,
        conn: any,
        options?: RoomOptions
    ): Promise<{ room: Room; player: Player } | null> {
        // 查找可加入的房间
        let room = this._findAvailableRoom(name);

        // 没有则创建
        if (!room) {
            room = await this.create(name, options);
            if (!room) return null;
        }

        // 加入房间
        const player = await room._addPlayer(playerId, conn);
        if (!player) return null;

        this._playerToRoom.set(playerId, room.id);

        logger.info(`Player ${playerId} joined ${room.id}`);
        return { room, player };
    }

    /**
     * @zh 加入指定房间
     * @en Join specific room
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

        this._playerToRoom.set(playerId, room.id);

        logger.info(`Player ${playerId} joined ${room.id}`);
        return { room, player };
    }

    /**
     * @zh 玩家离开
     * @en Player leave
     */
    async leave(playerId: string, reason?: string): Promise<void> {
        const roomId = this._playerToRoom.get(playerId);
        if (!roomId) return;

        const room = this._rooms.get(roomId);
        if (room) {
            await room._removePlayer(playerId, reason);
        }

        this._playerToRoom.delete(playerId);
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

    private _findAvailableRoom(name: string): Room | null {
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

    private _generateRoomId(): string {
        return `room_${this._nextRoomId++}`;
    }
}
