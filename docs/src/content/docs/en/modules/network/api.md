---
title: "API Reference"
description: "Complete Network module API documentation"
---

## NetworkPlugin

Client network plugin core class.

```typescript
class NetworkPlugin implements IPlugin {
    readonly name: string;
    readonly version: string;

    // Accessors
    get networkService(): GameNetworkService;
    get syncSystem(): NetworkSyncSystem;
    get spawnSystem(): NetworkSpawnSystem;
    get inputSystem(): NetworkInputSystem;
    get localPlayerId(): number;
    get isConnected(): boolean;

    // Lifecycle
    install(core: Core, services: ServiceContainer): void;
    uninstall(): void;

    // Connection management
    connect(options: NetworkServiceOptions & {
        playerName: string;
        roomId?: string;
    }): Promise<boolean>;
    disconnect(): Promise<void>;

    // Prefab registration
    registerPrefab(prefabType: string, factory: PrefabFactory): void;

    // Input sending
    sendMoveInput(x: number, y: number): void;
    sendActionInput(action: string): void;
}
```

## RpcService

Generic RPC service base class with custom protocol support.

```typescript
class RpcService<P extends ProtocolDef> {
    // Accessors
    get state(): NetworkState;
    get isConnected(): boolean;
    get client(): RpcClient<P> | null;

    constructor(protocol: P);

    // Connection management
    connect(options: NetworkServiceOptions): Promise<void>;
    disconnect(): void;

    // RPC calls
    call<K extends ApiNames<P>>(
        name: K,
        input: ApiInput<P['api'][K]>
    ): Promise<ApiOutput<P['api'][K]>>;

    // Message sending
    send<K extends MsgNames<P>>(name: K, data: MsgData<P['msg'][K]>): void;

    // Message listening
    on<K extends MsgNames<P>>(name: K, handler: (data: MsgData<P['msg'][K]>) => void): this;
    off<K extends MsgNames<P>>(name: K, handler?: (data: MsgData<P['msg'][K]>) => void): this;
    once<K extends MsgNames<P>>(name: K, handler: (data: MsgData<P['msg'][K]>) => void): this;
}
```

## GameNetworkService

Game network service extending RpcService with game-specific convenience methods.

```typescript
class GameNetworkService extends RpcService<GameProtocol> {
    // Send player input
    sendInput(input: PlayerInput): void;

    // Listen to state sync (chainable)
    onSync(handler: (data: SyncData) => void): this;

    // Listen to entity spawn
    onSpawn(handler: (data: SpawnData) => void): this;

    // Listen to entity despawn
    onDespawn(handler: (data: DespawnData) => void): this;
}
```

## Enums

### NetworkState

```typescript
const enum NetworkState {
    Disconnected = 0,
    Connecting = 1,
    Connected = 2
}
```

## Interface Types

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
    seq: number;               // Input sequence number (for client prediction)
    frame: number;             // Frame number
    timestamp: number;         // Client timestamp
    moveDir?: { x: number; y: number };
    actions?: string[];
}
```

## Components

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

## Systems

### NetworkSyncSystem

```typescript
class NetworkSyncSystem extends EntitySystem {
    // Internal use, automatically managed by NetworkPlugin
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

## Service Tokens

```typescript
import {
    NetworkServiceToken,
    NetworkSyncSystemToken,
    NetworkSpawnSystemToken,
    NetworkInputSystemToken,
    NetworkPredictionSystemToken,
    NetworkAOISystemToken,
} from '@esengine/network';

// Usage
const networkService = services.get(NetworkServiceToken);
const predictionSystem = services.get(NetworkPredictionSystemToken);
const aoiSystem = services.get(NetworkAOISystemToken);
```

## Server API

### RpcServer

```typescript
class RpcServer<P extends ProtocolDef> {
    constructor(protocol: P, options: RpcServerOptions);

    // Start/stop server
    start(): Promise<void>;
    stop(): void;

    // Register API handlers
    handle<K extends ApiNames<P>>(
        name: K,
        handler: (input: ApiInput<P['api'][K]>, ctx: RpcContext) => Promise<ApiOutput<P['api'][K]>>
    ): void;

    // Broadcast message
    broadcast<K extends MsgNames<P>>(name: K, data: MsgData<P['msg'][K]>): void;

    // Send to specific client
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

## Protocol Definition

### gameProtocol

Default game protocol with join/leave API and state sync messages:

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

## Protocol Message Types

### SyncData

```typescript
interface SyncData {
    frame: number;              // Server frame number
    timestamp: number;          // Server timestamp
    ackSeq?: number;            // Acknowledged input sequence number
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

## Utility Functions

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
