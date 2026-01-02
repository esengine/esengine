---
title: "Distributed Rooms"
description: "Multi-server room management with DistributedRoomManager"
---

## Overview

Distributed room support allows multiple server instances to share a room registry, enabling cross-server player routing and failover.

```
┌─────────────────────────────────────────────────────────┐
│  Server A          Server B          Server C          │
│  ┌─────────┐       ┌─────────┐       ┌─────────┐       │
│  │ Room 1  │       │ Room 3  │       │ Room 5  │       │
│  │ Room 2  │       │ Room 4  │       │ Room 6  │       │
│  └────┬────┘       └────┬────┘       └────┬────┘       │
│       │                 │                 │             │
│       └─────────────────┼─────────────────┘             │
│                         │                               │
│              ┌──────────▼──────────┐                    │
│              │  IDistributedAdapter │                   │
│              │  (Redis / Memory)    │                   │
│              └─────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Single Server Mode (Testing)

```typescript
import {
    DistributedRoomManager,
    MemoryAdapter,
    Room
} from '@esengine/server';

// Define room type
class GameRoom extends Room {
    maxPlayers = 4;
}

// Create adapter and manager
const adapter = new MemoryAdapter();
const manager = new DistributedRoomManager(adapter, {
    serverId: 'server-1',
    serverAddress: 'localhost',
    serverPort: 3000
}, (conn, type, data) => conn.send(JSON.stringify({ type, data })));

// Register room type
manager.define('game', GameRoom);

// Start manager
await manager.start();

// Distributed join/create room
const result = await manager.joinOrCreateDistributed('game', 'player-1', conn);
if ('redirect' in result) {
    // Player should connect to another server
    console.log(`Redirect to: ${result.redirect}`);
} else {
    // Player joined local room
    const { room, player } = result;
}

// Graceful shutdown
await manager.stop(true);
```

### Multi-Server Mode (Production)

```typescript
import Redis from 'ioredis';
import { DistributedRoomManager, RedisAdapter } from '@esengine/server';

const adapter = new RedisAdapter({
    factory: () => new Redis({
        host: 'redis.example.com',
        port: 6379
    }),
    prefix: 'game:',
    serverTtl: 30,
    snapshotTtl: 86400
});

const manager = new DistributedRoomManager(adapter, {
    serverId: process.env.SERVER_ID,
    serverAddress: process.env.PUBLIC_IP,
    serverPort: 3000,
    heartbeatInterval: 5000,
    snapshotInterval: 30000,
    enableFailover: true,
    capacity: 100
}, sendFn);
```

## DistributedRoomManager

### Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `serverId` | `string` | required | Unique server identifier |
| `serverAddress` | `string` | required | Public address for client connections |
| `serverPort` | `number` | required | Server port |
| `heartbeatInterval` | `number` | `5000` | Heartbeat interval (ms) |
| `snapshotInterval` | `number` | `30000` | State snapshot interval, 0 to disable |
| `migrationTimeout` | `number` | `10000` | Room migration timeout |
| `enableFailover` | `boolean` | `true` | Enable automatic failover |
| `capacity` | `number` | `100` | Max rooms on this server |

### Lifecycle Methods

#### start()

Start the distributed room manager. Connects to adapter, registers server, starts heartbeat.

```typescript
await manager.start();
```

#### stop(graceful?)

Stop the manager. If `graceful=true`, marks server as draining and saves all room snapshots.

```typescript
await manager.stop(true);
```

### Routing Methods

#### joinOrCreateDistributed()

Join or create a room with distributed awareness. Returns `{ room, player }` for local rooms or `{ redirect: string }` for remote rooms.

```typescript
const result = await manager.joinOrCreateDistributed('game', 'player-1', conn);

if ('redirect' in result) {
    // Client should redirect to another server
    res.json({ redirect: result.redirect });
} else {
    // Player joined local room
    const { room, player } = result;
}
```

#### route()

Route a player to the appropriate room/server.

```typescript
const result = await manager.route({
    roomType: 'game',
    playerId: 'p1'
});

switch (result.type) {
    case 'local':      // Room is on this server
        break;
    case 'redirect':   // Room is on another server
        // result.serverAddress contains target server
        break;
    case 'create':     // No room exists, need to create
        break;
    case 'unavailable': // Cannot find or create room
        // result.reason contains error message
        break;
}
```

### State Management

#### saveSnapshot()

Manually save a room's state snapshot.

```typescript
await manager.saveSnapshot(roomId);
```

#### restoreFromSnapshot()

Restore a room from its saved snapshot.

```typescript
const success = await manager.restoreFromSnapshot(roomId);
```

### Query Methods

#### getServers()

Get all online servers.

```typescript
const servers = await manager.getServers();
```

#### queryDistributedRooms()

Query rooms across all servers.

```typescript
const rooms = await manager.queryDistributedRooms({
    roomType: 'game',
    hasSpace: true,
    notLocked: true
});
```

## IDistributedAdapter

Interface for distributed backends. Implement this to add support for Redis, message queues, etc.

### Built-in Adapters

#### MemoryAdapter

In-memory implementation for testing and single-server mode.

```typescript
const adapter = new MemoryAdapter({
    serverTtl: 15000,      // Server offline after no heartbeat (ms)
    enableTtlCheck: true,  // Enable automatic TTL checking
    ttlCheckInterval: 5000 // TTL check interval (ms)
});
```

#### RedisAdapter

Redis-based implementation for production multi-server deployments.

```typescript
import Redis from 'ioredis';
import { RedisAdapter } from '@esengine/server';

const adapter = new RedisAdapter({
    factory: () => new Redis('redis://localhost:6379'),
    prefix: 'game:',       // Key prefix (default: 'dist:')
    serverTtl: 30,         // Server TTL in seconds (default: 30)
    roomTtl: 0,            // Room TTL, 0 = never expire (default: 0)
    snapshotTtl: 86400,    // Snapshot TTL in seconds (default: 24h)
    channel: 'game:events' // Pub/Sub channel (default: 'distributed:events')
});
```

**RedisAdapter Configuration:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `factory` | `() => RedisClient` | required | Redis client factory (lazy connection) |
| `prefix` | `string` | `'dist:'` | Key prefix for all Redis keys |
| `serverTtl` | `number` | `30` | Server TTL in seconds |
| `roomTtl` | `number` | `0` | Room TTL in seconds, 0 = no expiry |
| `snapshotTtl` | `number` | `86400` | Snapshot TTL in seconds |
| `channel` | `string` | `'distributed:events'` | Pub/Sub channel name |

**Features:**
- Server registry with automatic heartbeat TTL
- Room registry with cross-server lookup
- State snapshots with configurable TTL
- Pub/Sub for cross-server events
- Distributed locks using Redis SET NX

### Custom Adapters

```typescript
import type { IDistributedAdapter } from '@esengine/server';

class MyAdapter implements IDistributedAdapter {
    // Lifecycle
    async connect(): Promise<void> { }
    async disconnect(): Promise<void> { }
    isConnected(): boolean { return true; }

    // Server Registry
    async registerServer(server: ServerRegistration): Promise<void> { }
    async unregisterServer(serverId: string): Promise<void> { }
    async heartbeat(serverId: string): Promise<void> { }
    async getServers(): Promise<ServerRegistration[]> { return []; }

    // Room Registry
    async registerRoom(room: RoomRegistration): Promise<void> { }
    async unregisterRoom(roomId: string): Promise<void> { }
    async queryRooms(query: RoomQuery): Promise<RoomRegistration[]> { return []; }
    async findAvailableRoom(roomType: string): Promise<RoomRegistration | null> { return null; }

    // State Snapshots
    async saveSnapshot(snapshot: RoomSnapshot): Promise<void> { }
    async loadSnapshot(roomId: string): Promise<RoomSnapshot | null> { return null; }

    // Pub/Sub
    async publish(event: DistributedEvent): Promise<void> { }
    async subscribe(pattern: string, handler: Function): Promise<() => void> { return () => {}; }

    // Distributed Locks
    async acquireLock(key: string, ttlMs: number): Promise<boolean> { return true; }
    async releaseLock(key: string): Promise<void> { }
}
```

## Player Routing Flow

```
Client                    Server A                    Server B
  │                          │                           │
  │─── joinOrCreate ────────►│                           │
  │                          │                           │
  │                          │── findAvailableRoom() ───►│
  │                          │◄──── room on Server B ────│
  │                          │                           │
  │◄─── redirect: B:3001 ────│                           │
  │                          │                           │
  │───────────────── connect to Server B ───────────────►│
  │                          │                           │
  │◄─────────────────────────────── joined ─────────────│
```

## Event Types

The distributed system publishes these events:

| Event | Description |
|-------|-------------|
| `server:online` | Server came online |
| `server:offline` | Server went offline |
| `server:draining` | Server is draining |
| `room:created` | Room was created |
| `room:disposed` | Room was disposed |
| `room:updated` | Room info updated |
| `room:message` | Cross-server room message |
| `room:migrated` | Room migrated to another server |
| `player:joined` | Player joined room |
| `player:left` | Player left room |

## Best Practices

1. **Use Unique Server IDs** - Use hostname, container ID, or UUID

2. **Configure Proper Heartbeat** - Balance between freshness and network overhead

3. **Enable Snapshots for Stateful Rooms** - Ensure room state survives server restarts

4. **Handle Redirects Gracefully** - Client should reconnect to target server
   ```typescript
   // Client handling redirect
   if (response.redirect) {
       await client.disconnect();
       await client.connect(response.redirect);
       await client.joinRoom(roomId);
   }
   ```

5. **Use Distributed Locks** - Prevent race conditions in joinOrCreate

## Using createServer Integration

The simplest way to use distributed rooms is through `createServer`'s `distributed` config:

```typescript
import { createServer } from '@esengine/server';
import { RedisAdapter, Room } from '@esengine/server';
import Redis from 'ioredis';

class GameRoom extends Room {
    maxPlayers = 4;
}

const server = await createServer({
    port: 3000,
    distributed: {
        enabled: true,
        adapter: new RedisAdapter({ factory: () => new Redis() }),
        serverId: 'server-1',
        serverAddress: 'ws://192.168.1.100',
        serverPort: 3000,
        enableFailover: true,
        capacity: 100
    }
});

server.define('game', GameRoom);
await server.start();
```

When clients call the `JoinRoom` API, the server will automatically:
1. Find available rooms (local or remote)
2. If room is on another server, send `$redirect` message to client
3. Client receives redirect and connects to target server

## Load Balancing

Use `LoadBalancedRouter` for server selection:

```typescript
import { LoadBalancedRouter, createLoadBalancedRouter } from '@esengine/server';

// Using factory function
const router = createLoadBalancedRouter('least-players');

// Or create directly
const router = new LoadBalancedRouter({
    strategy: 'least-rooms',  // Select server with fewest rooms
    preferLocal: true         // Prefer local server
});

// Available strategies
// - 'round-robin': Round robin selection
// - 'least-rooms': Fewest rooms
// - 'least-players': Fewest players
// - 'random': Random selection
// - 'weighted': Weighted by capacity usage
```

## Failover

When a server goes offline with `enableFailover` enabled, the system will automatically:

1. Detect server offline (via heartbeat timeout)
2. Query all rooms on that server
3. Use distributed lock to prevent multiple servers recovering same room
4. Restore room state from snapshot
5. Publish `room:migrated` event to notify other servers

```typescript
// Ensure periodic snapshots
const manager = new DistributedRoomManager(adapter, {
    serverId: 'server-1',
    serverAddress: 'localhost',
    serverPort: 3000,
    snapshotInterval: 30000,  // Save snapshot every 30 seconds
    enableFailover: true      // Enable failover
}, sendFn);
```

## Future Releases

- Redis Cluster support
- More load balancing strategies (geo-location, latency-aware)
