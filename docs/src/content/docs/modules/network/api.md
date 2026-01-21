---
title: "API 参考"
description: "Network 模块完整 API 文档"
---

## NetworkPlugin

客户端网络插件核心类。

```typescript
class NetworkPlugin implements IPlugin {
    readonly name: string;
    readonly version: string;

    // 访问器
    get networkService(): GameNetworkService;
    get syncSystem(): NetworkSyncSystem;
    get spawnSystem(): NetworkSpawnSystem;
    get inputSystem(): NetworkInputSystem;
    get localPlayerId(): number;
    get isConnected(): boolean;

    // 生命周期
    install(core: Core, services: ServiceContainer): void;
    uninstall(): void;

    // 连接管理
    connect(options: NetworkServiceOptions & {
        playerName: string;
        roomId?: string;
    }): Promise<boolean>;
    disconnect(): Promise<void>;

    // 预制体注册
    registerPrefab(prefabType: string, factory: PrefabFactory): void;

    // 输入发送
    sendMoveInput(x: number, y: number): void;
    sendActionInput(action: string): void;
}
```

## RpcService

通用 RPC 服务基类，支持自定义协议。

```typescript
class RpcService<P extends ProtocolDef> {
    // 访问器
    get state(): NetworkState;
    get isConnected(): boolean;
    get client(): RpcClient<P> | null;

    constructor(protocol: P);

    // 连接管理
    connect(options: NetworkServiceOptions): Promise<void>;
    disconnect(): void;

    // RPC 调用
    call<K extends ApiNames<P>>(
        name: K,
        input: ApiInput<P['api'][K]>
    ): Promise<ApiOutput<P['api'][K]>>;

    // 消息发送
    send<K extends MsgNames<P>>(name: K, data: MsgData<P['msg'][K]>): void;

    // 消息监听
    on<K extends MsgNames<P>>(name: K, handler: (data: MsgData<P['msg'][K]>) => void): this;
    off<K extends MsgNames<P>>(name: K, handler?: (data: MsgData<P['msg'][K]>) => void): this;
    once<K extends MsgNames<P>>(name: K, handler: (data: MsgData<P['msg'][K]>) => void): this;
}
```

## GameNetworkService

游戏网络服务，继承自 RpcService，提供游戏特定的便捷方法。

```typescript
class GameNetworkService extends RpcService<GameProtocol> {
    // 发送玩家输入
    sendInput(input: PlayerInput): void;

    // 监听状态同步（链式调用）
    onSync(handler: (data: SyncData) => void): this;

    // 监听实体生成
    onSpawn(handler: (data: SpawnData) => void): this;

    // 监听实体销毁
    onDespawn(handler: (data: DespawnData) => void): this;
}
```

## 枚举类型

### NetworkState

```typescript
const enum NetworkState {
    Disconnected = 0,
    Connecting = 1,
    Connected = 2
}
```

## 接口类型

### NetworkServiceOptions

```typescript
interface NetworkServiceOptions extends RpcClientOptions {
    url: string;
}
```

### RpcClientOptions

```typescript
interface RpcClientOptions {
    codec?: Codec;
    onConnect?: () => void;
    onDisconnect?: (reason?: string) => void;
    onError?: (error: Error) => void;
}
```

### PrefabFactory

```typescript
type PrefabFactory = (scene: Scene, spawn: SpawnData) => Entity;
```

### PlayerInput

```typescript
interface PlayerInput {
    seq: number;               // 输入序列号（用于客户端预测）
    frame: number;             // 帧序号
    timestamp: number;         // 客户端时间戳
    moveDir?: { x: number; y: number };
    actions?: string[];
}
```

## 组件

### NetworkIdentity

```typescript
class NetworkIdentity extends Component {
    netId: number;
    ownerId: number;
    bIsLocalPlayer: boolean;
    bHasAuthority: boolean;
}
```

### NetworkTransform

```typescript
class NetworkTransform extends Component {
    position: { x: number; y: number };
    rotation: number;
    velocity: { x: number; y: number };
}
```

## 系统

### NetworkSyncSystem

```typescript
class NetworkSyncSystem extends EntitySystem {
    // 内部使用，由 NetworkPlugin 自动管理
}
```

### NetworkSpawnSystem

```typescript
class NetworkSpawnSystem extends EntitySystem {
    registerPrefab(prefabType: string, factory: PrefabFactory): void;
}
```

### NetworkInputSystem

```typescript
class NetworkInputSystem extends EntitySystem {
    addMoveInput(x: number, y: number): void;
    addActionInput(action: string): void;
    clearInput(): void;
}
```

## 服务令牌

```typescript
import {
    NetworkServiceToken,
    NetworkSyncSystemToken,
    NetworkSpawnSystemToken,
    NetworkInputSystemToken,
    NetworkPredictionSystemToken,
    NetworkAOISystemToken,
} from '@esengine/network';

// 使用
const networkService = services.get(NetworkServiceToken);
const predictionSystem = services.get(NetworkPredictionSystemToken);
const aoiSystem = services.get(NetworkAOISystemToken);
```

## 服务器端 API

### RpcServer

```typescript
class RpcServer<P extends ProtocolDef> {
    constructor(protocol: P, options: RpcServerOptions);

    // 启动/停止服务器
    start(): Promise<void>;
    stop(): void;

    // 注册 API 处理器
    handle<K extends ApiNames<P>>(
        name: K,
        handler: (input: ApiInput<P['api'][K]>, ctx: RpcContext) => Promise<ApiOutput<P['api'][K]>>
    ): void;

    // 广播消息
    broadcast<K extends MsgNames<P>>(name: K, data: MsgData<P['msg'][K]>): void;

    // 发送给特定客户端
    sendTo<K extends MsgNames<P>>(clientId: string, name: K, data: MsgData<P['msg'][K]>): void;
}
```

### RpcServerOptions

```typescript
interface RpcServerOptions {
    port: number;
    codec?: Codec;
    onStart?: (port: number) => void;
    onConnection?: (clientId: string) => void;
    onDisconnection?: (clientId: string, reason?: string) => void;
    onError?: (error: Error) => void;
}
```

### RpcContext

```typescript
interface RpcContext {
    clientId: string;
}
```

## 协议定义

### gameProtocol

默认游戏协议，包含加入/离开 API 和状态同步消息：

```typescript
const gameProtocol = rpc.define({
    api: {
        join: rpc.api<JoinRequest, JoinResponse>(),
        leave: rpc.api<void, void>(),
    },
    msg: {
        input: rpc.msg<PlayerInput>(),
        sync: rpc.msg<SyncData>(),
        spawn: rpc.msg<SpawnData>(),
        despawn: rpc.msg<DespawnData>(),
    },
});
```

## 协议消息类型

### SyncData

```typescript
interface SyncData {
    frame: number;              // 服务器帧号
    timestamp: number;          // 服务器时间戳
    ackSeq?: number;            // 已确认的输入序列号
    entities: EntitySyncState[];
}
```

### SpawnData

```typescript
interface SpawnData {
    netId: number;
    ownerId: number;
    prefab: string;
    pos: { x: number; y: number };
    rot?: number;
}
```

### DespawnData

```typescript
interface DespawnData {
    netId: number;
}
```

### JoinRequest

```typescript
interface JoinRequest {
    playerName: string;
    roomId?: string;
}
```

### JoinResponse

```typescript
interface JoinResponse {
    playerId: number;
    roomId: string;
}
```

### EntitySyncState

```typescript
interface EntitySyncState {
    netId: number;
    pos?: { x: number; y: number };
    rot?: number;
    vel?: { x: number; y: number };
    angVel?: number;
    custom?: Record<string, unknown>;
}
```

## 工具函数

### createSnapshotBuffer

```typescript
function createSnapshotBuffer<T>(config: {
    maxSnapshots: number;
    interpolationDelay: number;
}): ISnapshotBuffer<T>;
```

### createTransformInterpolator

```typescript
function createTransformInterpolator(): ITransformInterpolator;
```

### createHermiteTransformInterpolator

```typescript
function createHermiteTransformInterpolator(config: {
    bufferSize: number;
}): IHermiteTransformInterpolator;
```

### createClientPrediction

```typescript
function createClientPrediction(config: {
    maxPredictedInputs: number;
    reconciliationThreshold: number;
}): IClientPrediction;
```
