---
title: "Network System"
description: "Type-safe multiplayer game network synchronization based on @esengine/rpc"
---

`@esengine/network` provides a type-safe network synchronization solution based on `@esengine/rpc` for multiplayer games, including entity synchronization, input handling, and state interpolation.

## Overview

The network module consists of two core packages:

| Package | Description |
|---------|-------------|
| `@esengine/rpc` | Type-safe RPC communication library |
| `@esengine/network` | RPC-based game networking plugin |

## Installation

```bash
npm install @esengine/network
```

> `@esengine/rpc` is automatically installed as a dependency.

## Architecture

```
Client                              Server
┌────────────────────┐            ┌────────────────┐
│ NetworkPlugin      │◄── WS ───►│  RpcServer     │
│ ├─ NetworkService  │            │  ├─ Protocol   │
│ ├─ SyncSystem      │            │  └─ Handlers   │
│ ├─ SpawnSystem     │            └────────────────┘
│ └─ InputSystem     │
└────────────────────┘
```

## Quick Start

### Client

```typescript
import { Core, Scene } from '@esengine/ecs-framework';
import { NetworkPlugin, NetworkIdentity, NetworkTransform } from '@esengine/network';

// Define game scene
class GameScene extends Scene {
    initialize(): void {
        this.name = 'Game';
    }
}

// Initialize
Core.create({ debug: false });
const scene = new GameScene();
Core.setScene(scene);

// Install network plugin
const networkPlugin = new NetworkPlugin();
await Core.installPlugin(networkPlugin);

// Register prefab factory
networkPlugin.registerPrefab('player', (scene, spawn) => {
    const entity = scene.createEntity(`player_${spawn.netId}`);

    const identity = entity.addComponent(new NetworkIdentity());
    identity.netId = spawn.netId;
    identity.ownerId = spawn.ownerId;
    identity.bIsLocalPlayer = spawn.ownerId === networkPlugin.localPlayerId;

    entity.addComponent(new NetworkTransform());
    return entity;
});

// Connect to server
const success = await networkPlugin.connect({
    url: 'ws://localhost:3000',
    playerName: 'Player1',
    roomId: 'room-1'  // optional
});

if (success) {
    console.log('Connected! Player ID:', networkPlugin.localPlayerId);
}
```

### Server

```typescript
import { RpcServer } from '@esengine/rpc/server';
import { gameProtocol } from '@esengine/network';

const server = new RpcServer(gameProtocol, {
    port: 3000,
    onStart: (port) => console.log(`Server running on ws://localhost:${port}`)
});

// Register API handlers
server.handle('join', async (input, ctx) => {
    const playerId = generatePlayerId();
    return { playerId, roomId: input.roomId ?? 'default' };
});

server.handle('leave', async (input, ctx) => {
    // Handle player leaving
});

await server.start();
```

## Custom Protocol

You can define your own protocol using `@esengine/rpc`:

```typescript
import { rpc } from '@esengine/rpc';

// Define custom protocol
export const myProtocol = rpc.define({
    api: {
        login: rpc.api<{ username: string }, { token: string }>(),
        getData: rpc.api<{ id: number }, { data: object }>(),
    },
    msg: {
        chat: rpc.msg<{ from: string; text: string }>(),
        notification: rpc.msg<{ type: string; content: string }>(),
    },
});

// Create service with custom protocol
import { RpcService } from '@esengine/network';

const service = new RpcService(myProtocol);
await service.connect({ url: 'ws://localhost:3000' });

// Type-safe API calls
const result = await service.call('login', { username: 'test' });
console.log(result.token);

// Type-safe message listening
service.on('chat', (data) => {
    console.log(`${data.from}: ${data.text}`);
});
```

## Documentation

- [Client Usage](/en/modules/network/client/) - NetworkPlugin, components and systems
- [Server Side](/en/modules/network/server/) - GameServer and Room management
- [Distributed Rooms](/en/modules/network/distributed/) - Multi-server room management and player routing
- [State Sync](/en/modules/network/sync/) - Interpolation and snapshot buffering
- [Client Prediction](/en/modules/network/prediction/) - Input prediction and server reconciliation
- [Area of Interest (AOI)](/en/modules/network/aoi/) - View filtering and bandwidth optimization
- [Delta Compression](/en/modules/network/delta/) - State delta synchronization
- [API Reference](/en/modules/network/api/) - Complete API documentation

## Service Tokens

For dependency injection:

```typescript
import {
    NetworkServiceToken,
    NetworkSyncSystemToken,
    NetworkSpawnSystemToken,
    NetworkInputSystemToken,
    NetworkPredictionSystemToken,
    NetworkAOISystemToken,
} from '@esengine/network';

const networkService = services.get(NetworkServiceToken);
const predictionSystem = services.get(NetworkPredictionSystemToken);
const aoiSystem = services.get(NetworkAOISystemToken);
```

## Blueprint Nodes

The network module provides visual scripting support:

- `IsLocalPlayer` - Check if entity is local player
- `IsServer` - Check if running on server
- `HasAuthority` - Check if has authority over entity
- `GetNetworkId` - Get entity's network ID
- `GetLocalPlayerId` - Get local player ID
