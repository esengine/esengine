/**
 * @zh 玩家类
 * @en Player class
 */

import type { Connection } from '@esengine/rpc';

/**
 * @zh 玩家接口
 * @en Player interface
 */
export interface IPlayer<TData = Record<string, unknown>> {
    readonly id: string
    readonly roomId: string
    data: TData
    send<T>(type: string, data: T): void
    sendBinary(data: Uint8Array): void
    leave(reason?: string): void
}

/**
 * @zh 玩家实现
 * @en Player implementation
 */
export class Player<TData = Record<string, unknown>> implements IPlayer<TData> {
    readonly id: string;
    readonly roomId: string;
    data: TData;

    private _conn: Connection<any>;
    private _sendFn: (conn: Connection<any>, type: string, data: unknown) => void;
    private _sendBinaryFn?: (conn: Connection<any>, data: Uint8Array) => void;
    private _leaveFn: (player: Player<TData>, reason?: string) => void;

    constructor(options: {
        id: string
        roomId: string
        conn: Connection<any>
        sendFn: (conn: Connection<any>, type: string, data: unknown) => void
        sendBinaryFn?: (conn: Connection<any>, data: Uint8Array) => void
        leaveFn: (player: Player<TData>, reason?: string) => void
        initialData?: TData
    }) {
        this.id = options.id;
        this.roomId = options.roomId;
        this._conn = options.conn;
        this._sendFn = options.sendFn;
        this._sendBinaryFn = options.sendBinaryFn;
        this._leaveFn = options.leaveFn;
        this.data = options.initialData ?? ({} as TData);
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
        this._sendFn(this._conn, type, data);
    }

    /**
     * @zh 发送二进制数据给玩家
     * @en Send binary data to player
     *
     * @zh 如果底层连接支持原生二进制帧，则直接发送；否则降级为 base64 编码通过 JSON 发送
     * @en If underlying connection supports native binary frames, sends directly; otherwise falls back to base64 encoding via JSON
     */
    sendBinary(data: Uint8Array): void {
        if (this._sendBinaryFn) {
            this._sendBinaryFn(this._conn, data);
        } else {
            this.send('$binary', { data: this._toBase64(data) });
        }
    }

    /**
     * @zh 将 Uint8Array 转换为 base64 字符串
     * @en Convert Uint8Array to base64 string
     */
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

    /**
     * @zh 让玩家离开房间
     * @en Make player leave the room
     */
    leave(reason?: string): void {
        this._leaveFn(this, reason);
    }
}
