---
title: "API Reference"
description: "Complete Network module API documentation"
---

## NetworkPlugin

```typescript
class NetworkPlugin implements IPlugin {
    readonly name: string;
    readonly version: string;

    get networkService(): NetworkService;
    get syncSystem(): NetworkSyncSystem;
    get spawnSystem(): NetworkSpawnSystem;
    get inputSystem(): NetworkInputSystem;
    get isConnected(): boolean;

    connect(serverUrl: string, playerName: string, roomId?: string): Promise<boolean>;
    disconnect(): Promise<void>;
    registerPrefab(prefabType: string, factory: PrefabFactory): void;
    sendMoveInput(x: number, y: number): void;
    sendActionInput(action: string): void;
}
```

## NetworkService

```typescript
class NetworkService {
    get state(): ENetworkState;
    get isConnected(): boolean;
    get clientId(): number;
    get roomId(): string;

    connect(serverUrl: string, playerName: string, roomId?: string): Promise<boolean>;
    disconnect(): Promise<void>;
    sendInput(input: IPlayerInput): void;
    setCallbacks(callbacks: INetworkCallbacks): void;
}
```

## Enums

```typescript
const enum ENetworkState {
    Disconnected = 0,
    Connecting = 1,
    Connected = 2
}
```

## Interfaces

```typescript
interface INetworkCallbacks {
    onConnected?: (clientId: number, roomId: string) => void;
    onDisconnected?: () => void;
    onSync?: (msg: MsgSync) => void;
    onSpawn?: (msg: MsgSpawn) => void;
    onDespawn?: (msg: MsgDespawn) => void;
    onError?: (error: Error) => void;
}

type PrefabFactory = (scene: Scene, spawn: MsgSpawn) => Entity;
```

## Components

```typescript
class NetworkIdentity extends Component {
    netId: number;
    ownerId: number;
    bIsLocalPlayer: boolean;
    bHasAuthority: boolean;
}

class NetworkTransform extends Component {
    position: { x: number; y: number };
    rotation: number;
    velocity: { x: number; y: number };
}
```

## Service Tokens

```typescript
import {
    NetworkServiceToken,
    NetworkSyncSystemToken,
    NetworkSpawnSystemToken,
    NetworkInputSystemToken
} from '@esengine/network';
```

## Server API

```typescript
class GameServer {
    start(): Promise<void>;
    stop(): Promise<void>;
    getOrCreateRoom(roomId: string): Room;
}

class Room {
    readonly id: string;
    readonly playerCount: number;
    addPlayer(name: string, connection: Connection): IPlayer | null;
    removePlayer(clientId: number): void;
}
```
