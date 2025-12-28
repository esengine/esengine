/**
 * @zh 玩家类
 * @en Player class
 */

import type { Connection } from '@esengine/rpc'

/**
 * @zh 玩家接口
 * @en Player interface
 */
export interface IPlayer<TData = Record<string, unknown>> {
    readonly id: string
    readonly roomId: string
    data: TData
    send<T>(type: string, data: T): void
    leave(reason?: string): void
}

/**
 * @zh 玩家实现
 * @en Player implementation
 */
export class Player<TData = Record<string, unknown>> implements IPlayer<TData> {
    readonly id: string
    readonly roomId: string
    data: TData

    private _conn: Connection<any>
    private _sendFn: (conn: Connection<any>, type: string, data: unknown) => void
    private _leaveFn: (player: Player<TData>, reason?: string) => void

    constructor(options: {
        id: string
        roomId: string
        conn: Connection<any>
        sendFn: (conn: Connection<any>, type: string, data: unknown) => void
        leaveFn: (player: Player<TData>, reason?: string) => void
        initialData?: TData
    }) {
        this.id = options.id
        this.roomId = options.roomId
        this._conn = options.conn
        this._sendFn = options.sendFn
        this._leaveFn = options.leaveFn
        this.data = options.initialData ?? ({} as TData)
    }

    /**
     * @zh 获取底层连接
     * @en Get underlying connection
     */
    get connection(): Connection<any> {
        return this._conn
    }

    /**
     * @zh 发送消息给玩家
     * @en Send message to player
     */
    send<T>(type: string, data: T): void {
        this._sendFn(this._conn, type, data)
    }

    /**
     * @zh 让玩家离开房间
     * @en Make player leave the room
     */
    leave(reason?: string): void {
        this._leaveFn(this, reason)
    }
}
