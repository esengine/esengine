---
title: "Network System"
description: "TSRPC-based multiplayer game network synchronization solution"
---

`@esengine/network` provides a TSRPC-based client-server network synchronization solution for multiplayer games, including entity synchronization, input handling, and state interpolation.

## Overview

The network module consists of three packages:

| Package | Description |
|---------|-------------|
| `@esengine/network` | Client-side ECS plugin |
| `@esengine/network-protocols` | Shared protocol definitions |
| `@esengine/network-server` | Server-side implementation |

## Installation

```bash
# Client
npm install @esengine/network

# Server
npm install @esengine/network-server
```

## Architecture

```
Client                              Server
┌────────────────┐                ┌────────────────┐
│ NetworkPlugin  │◄──── WS ────► │  GameServer    │
│ ├─ Service     │                │  ├─ Room       │
│ ├─ SyncSystem  │                │  └─ Players    │
│ ├─ SpawnSystem │                └────────────────┘
│ └─ InputSystem │
└────────────────┘
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
    identity.bIsLocalPlayer = spawn.ownerId === networkPlugin.networkService.clientId;

    entity.addComponent(new NetworkTransform());
    return entity;
});

// Connect to server
const success = await networkPlugin.connect('ws://localhost:3000', 'PlayerName');
if (success) {
    console.log('Connected!');
}
```

### Server

```typescript
import { GameServer } from '@esengine/network-server';

const server = new GameServer({
    port: 3000,
    roomConfig: {
        maxPlayers: 16,
        tickRate: 20
    }
});

await server.start();
console.log('Server started on ws://localhost:3000');
```

## Quick Setup with CLI

We recommend using ESEngine CLI to quickly create a complete game server project:

```bash
mkdir my-game-server && cd my-game-server
npm init -y
npx @esengine/cli init -p nodejs
```

Generated project structure:

```
my-game-server/
├── src/
│   ├── index.ts
│   ├── server/
│   │   └── GameServer.ts
│   └── game/
│       ├── Game.ts
│       ├── scenes/
│       ├── components/
│       └── systems/
├── tsconfig.json
└── package.json
```

## Documentation

- [Client Usage](/en/modules/network/client/) - NetworkPlugin, components and systems
- [Server Side](/en/modules/network/server/) - GameServer and Room management
- [State Sync](/en/modules/network/sync/) - Interpolation, prediction and snapshots
- [API Reference](/en/modules/network/api/) - Complete API documentation

## Service Tokens

For dependency injection:

```typescript
import {
    NetworkServiceToken,
    NetworkSyncSystemToken,
    NetworkSpawnSystemToken,
    NetworkInputSystemToken
} from '@esengine/network';

const networkService = services.get(NetworkServiceToken);
```

## Blueprint Nodes

The network module provides visual scripting support:

- `IsLocalPlayer` - Check if entity is local player
- `IsServer` - Check if running on server
- `HasAuthority` - Check if has authority over entity
- `GetNetworkId` - Get entity's network ID
- `GetLocalPlayerId` - Get local player ID
