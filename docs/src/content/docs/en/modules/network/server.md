---
title: "Server Side"
description: "GameServer and Room management"
---

## GameServer

GameServer is the core server-side class managing WebSocket connections and rooms.

### Basic Usage

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
await server.stop();
```

### Configuration

| Property | Type | Description |
|----------|------|-------------|
| `port` | `number` | WebSocket port |
| `roomConfig.maxPlayers` | `number` | Max players per room |
| `roomConfig.tickRate` | `number` | Sync rate (Hz) |

## Room

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

## Protocol Types

```typescript
interface MsgSync {
    time: number;
    entities: IEntityState[];
}

interface MsgSpawn {
    netId: number;
    ownerId: number;
    prefab: string;
    pos: Vec2;
    rot: number;
}

interface MsgDespawn {
    netId: number;
}
```

## Best Practices

1. **Set appropriate tick rate**: Choose based on game type (20-60 Hz for action games)
2. **Room size control**: Set reasonable `maxPlayers` based on server capacity
3. **State validation**: Server should validate client inputs to prevent cheating
