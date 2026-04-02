/**
 * @zh 玩家类
 * @en Player class
 */

import { randomBytes } from 'crypto';
import type { Connection } from '@esengine/rpc';

/**
 * @zh 玩家接口
 * @en Player interface
 */
export interface IPlayer<TData = Record<string, unknown>> {
    readonly id: string;
    readonly roomId: string;
    readonly sessionToken: string;
    readonly connected: boolean;
    data: TData;
    send<T>(type: string, data: T): void;
    sendBinary(data: Uint8Array): void;
    leave(reason?: string): void;
}

/**
 * @zh 玩家实现
 * @en Player implementation
 */
export class Player<TData = Record<string, unknown>> implements IPlayer<TData> {
    readonly id: string;
    readonly roomId: string;
    readonly sessionToken: string;
    data: TData;

    private _conn: Connection<any>;
    private _sendFn: (conn: Connection<any>, type: string, data: unknown) => void;
    private _sendBinaryFn?: (conn: Connection<any>, data: Uint8Array) => void;
    private _leaveFn: (player: Player<TData>, reason?: string) => void;
    private _connected = true;

    constructor(options: {
        id: string;
        roomId: string;
        conn: Connection<any>;
        sendFn: (conn: Connection<any>, type: string, data: unknown) => void;
        sendBinaryFn?: (conn: Connection<any>, data: Uint8Array) => void;
        leaveFn: (player: Player<TData>, reason?: string) => void;
        initialData?: TData;
    }) {
        this.id = options.id;
        this.roomId = options.roomId;
        this._conn = options.conn;
        this._sendFn = options.sendFn;
        this._sendBinaryFn = options.sendBinaryFn;
        this._leaveFn = options.leaveFn;
        this.data = options.initialData ?? ({} as TData);
        this.sessionToken = this._generateToken();
    }

    /**
     * @zh 玩家是否在线
     * @en Whether player is currently connected
     */
    get connected(): boolean {
        return this._connected;
    }

    /**
     * @zh 获取底层连接
     * @en Get underlying connection
     */
    get connection(): Connection<any> {
        return this._conn;
    }

    /**
     * @zh 发送消息给玩家
     * @en Send message to player
     */
    send<T>(type: string, data: T): void {
        if (!this._connected) return;
        this._sendFn(this._conn, type, data);
    }

    /**
     * @zh 发送二进制数据给玩家
     * @en Send binary data to player
     */
    sendBinary(data: Uint8Array): void {
        if (!this._connected) return;
        if (this._sendBinaryFn) {
            this._sendBinaryFn(this._conn, data);
        } else {
            this.send('$binary', { data: this._toBase64(data) });
        }
    }

    /**
     * @zh 让玩家离开房间
     * @en Make player leave the room
     */
    leave(reason?: string): void {
        this._leaveFn(this, reason);
    }

    /**
     * @zh 更新底层连接（重连时使用）
     * @en Update underlying connection (used on reconnect)
     * @internal
     */
    _setConnection(
        conn: Connection<any>,
        sendFn: (conn: Connection<any>, type: string, data: unknown) => void,
        sendBinaryFn?: (conn: Connection<any>, data: Uint8Array) => void
    ): void {
        this._conn = conn;
        this._sendFn = sendFn;
        this._sendBinaryFn = sendBinaryFn;
        this._connected = true;
    }

    /**
     * @zh 标记为断线
     * @en Mark as disconnected
     * @internal
     */
    _setDisconnected(): void {
        this._connected = false;
    }

    private _toBase64(data: Uint8Array): string {
        if (typeof Buffer !== 'undefined') {
            return Buffer.from(data).toString('base64');
        }
        let binary = '';
        for (let i = 0; i < data.length; i++) {
            binary += String.fromCharCode(data[i]);
        }
        return btoa(binary);
    }

    private _generateToken(): string {
        return randomBytes(24).toString('base64url');
    }
}
