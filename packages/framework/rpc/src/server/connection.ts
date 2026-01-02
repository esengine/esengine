/**
 * @zh 服务端连接模块
 * @en Server Connection Module
 */

import type { WebSocket } from 'ws';
import type { Connection, ConnectionStatus } from '../types';

/**
 * @zh 服务端连接实现
 * @en Server connection implementation
 */
export class ServerConnection<TData = unknown> implements Connection<TData> {
    readonly id: string;
    readonly ip: string;
    data: TData;

    private _status: ConnectionStatus = 'open';
    private _socket: WebSocket;
    private _onClose?: () => void;

    constructor(options: {
        id: string
        ip: string
        socket: WebSocket
        initialData: TData
        onClose?: () => void
    }) {
        this.id = options.id;
        this.ip = options.ip;
        this.data = options.initialData;
        this._socket = options.socket;
        this._onClose = options.onClose;
    }

    get status(): ConnectionStatus {
        return this._status;
    }

    /**
     * @zh 发送原始数据
     * @en Send raw data
     */
    send(data: string | Uint8Array): void {
        if (this._status !== 'open') return;
        this._socket.send(data);
    }

    /**
     * @zh 发送二进制数据（原生 WebSocket 二进制帧）
     * @en Send binary data (native WebSocket binary frame)
     *
     * @zh 直接发送 Uint8Array，不经过 JSON 编码，效率更高
     * @en Directly sends Uint8Array without JSON encoding, more efficient
     */
    sendBinary(data: Uint8Array): void {
        if (this._status !== 'open') return;
        this._socket.send(data, { binary: true });
    }

    /**
     * @zh 关闭连接
     * @en Close connection
     */
    close(reason?: string): void {
        if (this._status !== 'open') return;

        this._status = 'closing';
        this._socket.close(1000, reason);
        this._status = 'closed';
        this._onClose?.();
    }

    /**
     * @zh 标记连接已关闭（内部使用）
     * @en Mark connection as closed (internal use)
     */
    _markClosed(): void {
        this._status = 'closed';
    }
}
