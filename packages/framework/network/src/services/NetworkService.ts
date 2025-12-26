import { WsClient } from 'tsrpc-browser';
import {
    serviceProto,
    type ServiceType,
    type MsgSync,
    type MsgSpawn,
    type MsgDespawn,
    type IPlayerInput
} from '@esengine/network-protocols';

/**
 * 连接状态
 * Connection state
 */
export const enum ENetworkState {
    Disconnected = 0,
    Connecting = 1,
    Connected = 2
}

/**
 * 网络事件回调
 * Network event callbacks
 */
export interface INetworkCallbacks {
    onConnected?: (clientId: number, roomId: string) => void;
    onDisconnected?: () => void;
    onSync?: (msg: MsgSync) => void;
    onSpawn?: (msg: MsgSpawn) => void;
    onDespawn?: (msg: MsgDespawn) => void;
    onError?: (error: Error) => void;
}

/**
 * 创建 TSRPC 客户端
 * Create TSRPC client
 */
function createClient(serverUrl: string): WsClient<ServiceType> {
    return new WsClient(serviceProto, {
        server: serverUrl,
        json: true,
        logLevel: 'warn'
    });
}

/**
 * 网络服务
 * Network service
 *
 * 基于 TSRPC 的网络服务封装，提供类型安全的网络通信。
 * TSRPC-based network service wrapper with type-safe communication.
 */
export class NetworkService {
    private _client: WsClient<ServiceType> | null = null;
    private _state: ENetworkState = ENetworkState.Disconnected;
    private _clientId: number = 0;
    private _roomId: string = '';
    private _callbacks: INetworkCallbacks = {};

    get state(): ENetworkState {
        return this._state;
    }

    get clientId(): number {
        return this._clientId;
    }

    get roomId(): string {
        return this._roomId;
    }

    get isConnected(): boolean {
        return this._state === ENetworkState.Connected;
    }

    /**
     * 设置回调
     * Set callbacks
     */
    setCallbacks(callbacks: INetworkCallbacks): void {
        this._callbacks = { ...this._callbacks, ...callbacks };
    }

    /**
     * 连接到服务器
     * Connect to server
     */
    async connect(serverUrl: string, playerName: string, roomId?: string): Promise<boolean> {
        if (this._state !== ENetworkState.Disconnected) {
            return false;
        }

        this._state = ENetworkState.Connecting;
        this._client = createClient(serverUrl);
        this._setupListeners();

        // 连接
        // Connect
        const connectResult = await this._client.connect();
        if (!connectResult.isSucc) {
            this._state = ENetworkState.Disconnected;
            this._callbacks.onError?.(new Error(connectResult.errMsg));
            return false;
        }

        // 加入房间
        // Join room
        const joinResult = await this._client.callApi('Join', {
            playerName,
            roomId
        });

        if (!joinResult.isSucc) {
            await this._client.disconnect();
            this._state = ENetworkState.Disconnected;
            this._callbacks.onError?.(new Error(joinResult.err.message));
            return false;
        }

        this._clientId = joinResult.res.clientId;
        this._roomId = joinResult.res.roomId;
        this._state = ENetworkState.Connected;
        this._callbacks.onConnected?.(this._clientId, this._roomId);

        return true;
    }

    /**
     * 断开连接
     * Disconnect
     */
    async disconnect(): Promise<void> {
        if (this._client) {
            await this._client.disconnect();
        }
        this._state = ENetworkState.Disconnected;
        this._clientId = 0;
        this._roomId = '';
        this._client = null;
    }

    /**
     * 发送输入
     * Send input
     */
    sendInput(input: IPlayerInput): void {
        if (!this.isConnected || !this._client) return;
        this._client.sendMsg('Input', { input });
    }

    private _setupListeners(): void {
        if (!this._client) return;

        this._client.listenMsg('Sync', (msg) => {
            this._callbacks.onSync?.(msg);
        });

        this._client.listenMsg('Spawn', (msg) => {
            this._callbacks.onSpawn?.(msg);
        });

        this._client.listenMsg('Despawn', (msg) => {
            this._callbacks.onDespawn?.(msg);
        });

        this._client.flows.postDisconnectFlow.push((v) => {
            this._state = ENetworkState.Disconnected;
            this._callbacks.onDisconnected?.();
            return v;
        });
    }
}
