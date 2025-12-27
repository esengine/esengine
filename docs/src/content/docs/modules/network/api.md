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
    get networkService(): NetworkService;
    get syncSystem(): NetworkSyncSystem;
    get spawnSystem(): NetworkSpawnSystem;
    get inputSystem(): NetworkInputSystem;
    get isConnected(): boolean;

    // 生命周期
    install(core: Core, services: ServiceContainer): void;
    uninstall(): void;

    // 连接管理
    connect(serverUrl: string, playerName: string, roomId?: string): Promise<boolean>;
    disconnect(): Promise<void>;

    // 预制体注册
    registerPrefab(prefabType: string, factory: PrefabFactory): void;

    // 输入发送
    sendMoveInput(x: number, y: number): void;
    sendActionInput(action: string): void;
}
```

## NetworkService

网络服务，管理 WebSocket 连接。

```typescript
class NetworkService {
    // 访问器
    get state(): ENetworkState;
    get isConnected(): boolean;
    get clientId(): number;
    get roomId(): string;

    // 连接管理
    connect(serverUrl: string, playerName: string, roomId?: string): Promise<boolean>;
    disconnect(): Promise<void>;

    // 输入发送
    sendInput(input: IPlayerInput): void;

    // 回调设置
    setCallbacks(callbacks: INetworkCallbacks): void;
}
```

## 枚举类型

### ENetworkState

```typescript
const enum ENetworkState {
    Disconnected = 0,
    Connecting = 1,
    Connected = 2
}
```

## 接口类型

### INetworkCallbacks

```typescript
interface INetworkCallbacks {
    onConnected?: (clientId: number, roomId: string) => void;
    onDisconnected?: () => void;
    onSync?: (msg: MsgSync) => void;
    onSpawn?: (msg: MsgSpawn) => void;
    onDespawn?: (msg: MsgDespawn) => void;
    onError?: (error: Error) => void;
}
```

### PrefabFactory

```typescript
type PrefabFactory = (scene: Scene, spawn: MsgSpawn) => Entity;
```

### IPlayerInput

```typescript
interface IPlayerInput {
    seq?: number;
    moveDir?: Vec2;
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
    NetworkInputSystemToken
} from '@esengine/network';

// 使用
const networkService = services.get(NetworkServiceToken);
```

## 服务器端 API

### GameServer

```typescript
class GameServer {
    constructor(config: IGameServerConfig);

    start(): Promise<void>;
    stop(): Promise<void>;

    getOrCreateRoom(roomId: string): Room;
    getRoom(roomId: string): Room | undefined;
    destroyRoom(roomId: string): void;
}
```

### Room

```typescript
class Room {
    readonly id: string;
    readonly playerCount: number;
    readonly isFull: boolean;

    addPlayer(name: string, connection: Connection): IPlayer | null;
    removePlayer(clientId: number): void;
    getPlayer(clientId: number): IPlayer | undefined;
    handleInput(clientId: number, input: IPlayerInput): void;
    destroy(): void;
}
```

### IPlayer

```typescript
interface IPlayer {
    clientId: number;
    name: string;
    connection: Connection;
    netId: number;
}
```

## 协议消息

### MsgSync

```typescript
interface MsgSync {
    time: number;
    entities: IEntityState[];
}
```

### MsgSpawn

```typescript
interface MsgSpawn {
    netId: number;
    ownerId: number;
    prefab: string;
    pos: Vec2;
    rot: number;
}
```

### MsgDespawn

```typescript
interface MsgDespawn {
    netId: number;
}
```

### IEntityState

```typescript
interface IEntityState {
    netId: number;
    pos?: Vec2;
    rot?: number;
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
