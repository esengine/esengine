---
title: "Server Side"
description: "Build game servers with @esengine/server"
---

## Quick Start

Create a new game server project using the CLI:

```bash
# Using npm
npm create esengine-server my-game-server

# Using pnpm
pnpm create esengine-server my-game-server

# Using yarn
yarn create esengine-server my-game-server
```

Generated project structure:

```
my-game-server/
├── src/
│   ├── shared/              # Shared protocol (client & server)
│   │   ├── protocol.ts      # Type definitions
│   │   └── index.ts
│   ├── server/              # Server code
│   │   ├── main.ts          # Entry point
│   │   └── rooms/
│   │       └── GameRoom.ts  # Game room
│   └── client/              # Client example
│       └── index.ts
├── package.json
└── tsconfig.json
```

Start the server:

```bash
# Development mode (hot reload)
npm run dev

# Production mode
npm run start
```

## createServer

Create a game server instance:

```typescript
import { createServer } from '@esengine/server'
import { GameRoom } from './rooms/GameRoom.js'

const server = await createServer({
    port: 3000,
    onConnect(conn) {
        console.log('Client connected:', conn.id)
    },
    onDisconnect(conn) {
        console.log('Client disconnected:', conn.id)
    },
})

// Register room type
server.define('game', GameRoom)

// Start server
await server.start()
```

### Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `port` | `number` | `3000` | WebSocket port. Set to `0` to auto-assign a random available port |
| `tickRate` | `number` | `20` | Global tick rate (Hz) |
| `duplicateJoinPolicy` | `'auto-leave' \| 'reject'` | `'auto-leave'` | Behavior when a player calls JoinRoom while already in a room. `'auto-leave'` automatically leaves the current room first; `'reject'` throws an error |
| `apiDir` | `string` | `'src/api'` | API handlers directory |
| `msgDir` | `string` | `'src/msg'` | Message handlers directory |
| `httpDir` | `string` | `'src/http'` | HTTP routes directory |
| `httpPrefix` | `string` | `'/api'` | HTTP routes prefix |
| `cors` | `boolean \| CorsOptions` | - | CORS configuration |
| `onStart` | `(port) => void` | - | Start callback |
| `onConnect` | `(conn) => void` | - | Connection callback |
| `onDisconnect` | `(conn) => void` | - | Disconnect callback |

### GameServer

The object returned by `createServer()`:

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `server.port` | `number` (readonly) | Actual listening port. Useful when `port: 0` is used for auto-assignment |
| `server.tick` | `number` (readonly) | Current tick count |
| `server.connections` | `ReadonlyArray<ServerConnection>` | All active connections |
| `server.define(name, RoomClass)` | `void` | Register a room type |
| `server.start()` | `Promise<void>` | Start the server |
| `server.stop()` | `Promise<void>` | Stop the server |
| `server.broadcast(name, data)` | `void` | Broadcast to all connections |
| `server.send(conn, name, data)` | `void` | Send to a specific connection |

## HTTP Routing

Supports HTTP API sharing the same port with WebSocket, ideal for login, registration, and similar scenarios.

```typescript
const server = await createServer({
    port: 3000,
    httpDir: './src/http',   // HTTP routes directory
    httpPrefix: '/api',       // Route prefix
    cors: true,

    // Or inline definition
    http: {
        '/health': (req, res) => res.json({ status: 'ok' })
    }
})
```

> For detailed documentation, see [HTTP Routing](/en/modules/network/http)

## Room System

Room is the base class for game rooms, managing players and game state.

### Define a Room

```typescript
import { Room, Player, onMessage } from '@esengine/server'
import type { MsgMove, MsgChat } from '../../shared/index.js'

interface PlayerData {
    name: string
    x: number
    y: number
}

export class GameRoom extends Room<{ players: any[] }, PlayerData> {
    // Configuration
    maxPlayers = 8
    tickRate = 20
    autoDispose = true
    reconnectGracePeriod = 10000  // 10s reconnect window
    metadata = { gameMode: 'deathmatch' }

    // Room state
    state = {
        players: [],
    }

    // Lifecycle
    onCreate() {
        console.log(`Room ${this.id} created`)
    }

    onJoin(player: Player<PlayerData>) {
        player.data.name = 'Player_' + player.id.slice(-4)
        player.data.x = Math.random() * 800
        player.data.y = Math.random() * 600

        this.broadcast('Joined', {
            playerId: player.id,
            playerName: player.data.name,
        })
    }

    onLeave(player: Player<PlayerData>) {
        this.broadcast('Left', { playerId: player.id })
    }

    onPlayerDisconnected(player: Player<PlayerData>) {
        this.broadcast('PlayerOffline', { playerId: player.id })
    }

    onPlayerReconnected(player: Player<PlayerData>) {
        this.broadcast('PlayerOnline', { playerId: player.id })
    }

    onTick(dt: number) {
        // State synchronization
        this.broadcast('Sync', { players: this.state.players })
    }

    onDispose() {
        console.log(`Room ${this.id} disposed`)
    }

    // Message handlers
    @onMessage('Move')
    handleMove(data: MsgMove, player: Player<PlayerData>) {
        player.data.x = data.x
        player.data.y = data.y

        // Broadcast to everyone except the sender
        this.broadcast('Move', {
            playerId: player.id,
            x: data.x,
            y: data.y,
        }, { exclude: player })
    }

    @onMessage('Chat')
    handleChat(data: MsgChat, player: Player<PlayerData>) {
        this.broadcast('Chat', {
            from: player.data.name,
            text: data.text,
        })
    }
}
```

### Room Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxPlayers` | `number` | `16` | Maximum players |
| `tickRate` | `number` | `0` | Tick rate (Hz), 0 = no auto tick |
| `autoDispose` | `boolean` | `true` | Auto-dispose when empty |
| `reconnectGracePeriod` | `number` | `0` | Reconnection grace period in milliseconds. Disconnected players can reconnect within this window. 0 = reconnection disabled |
| `metadata` | `Record<string, unknown>` | `{}` | Room metadata, visible to clients via ListRooms and GetRoomInfo |

### Room API

```typescript
class Room<TState, TPlayerData> {
    readonly id: string           // Room ID
    readonly players: Player[]    // All players
    readonly playerCount: number  // Player count
    readonly isLocked: boolean    // Lock status
    state: TState                 // Room state
    metadata: Record<string, unknown>  // Room metadata

    // Broadcast to all players
    broadcast<T>(type: string, data: T, options?: {
        exclude?: Player | Player[]
    }): void

    // Broadcast to all except one (deprecated, use broadcast with exclude option)
    broadcastExcept<T>(except: Player, type: string, data: T): void

    // Get player by ID
    getPlayer(id: string): Player | undefined

    // Kick a player
    kick(player: Player, reason?: string): void

    // Lock/unlock room
    lock(): void
    unlock(): void

    // Dispose room
    dispose(): void
}
```

The `broadcast` method now supports an `exclude` option to skip specific players:

```typescript
// Broadcast to all
this.broadcast('Chat', { text: 'hello' })

// Exclude one player (e.g. the sender)
this.broadcast('Move', data, { exclude: player })

// Exclude multiple players
this.broadcast('Event', data, { exclude: [player1, player2] })
```

> `broadcastExcept` is deprecated. Use `broadcast(type, data, { exclude: player })` instead.

### Lifecycle Methods

| Method | Trigger | Purpose |
|--------|---------|---------|
| `onCreate(options?)` | Room created | Initialize game state |
| `onJoin(player)` | Player joins | Welcome message, assign position |
| `onLeave(player, reason?)` | Player truly leaves (not just disconnected) | Cleanup player data |
| `onPlayerDisconnected(player)` | Player disconnects (reconnect grace period active) | Notify others the player went offline |
| `onPlayerReconnected(player)` | Player reconnects within grace period | Restore state, notify others |
| `onTick(dt)` | Every frame | Game logic, state sync |
| `onDispose()` | Before disposal | Save data, cleanup resources |

`onPlayerDisconnected` only fires when `reconnectGracePeriod > 0`. The player is not yet removed from the room and can reconnect within the grace period. If the player does not reconnect in time, `onLeave` is called with the reason `'reconnect_timeout'`.

## Player Class

Player represents a connected player in a room.

```typescript
class Player<TData = Record<string, unknown>> {
    readonly id: string              // Player ID
    readonly roomId: string          // Room ID
    readonly sessionToken: string    // Session token (used for reconnection)
    readonly connected: boolean      // Whether the player is currently online
    data: TData                      // Custom data

    // Send message to this player
    send<T>(type: string, data: T): void

    // Send binary data to this player
    sendBinary(data: Uint8Array): void

    // Leave room
    leave(reason?: string): void
}
```

- `sessionToken` is a unique token generated when the player joins. The client should store it and pass it to `ReconnectRoom` if the connection is lost.
- `connected` is `true` when the player is online and `false` during the reconnection grace period after a disconnect.
- `sendBinary` sends raw binary data over a native WebSocket binary frame. If the underlying transport does not support binary frames, it falls back to base64-encoded JSON.

## @onMessage Decorator

Use decorators to simplify message handling:

```typescript
import { Room, Player, onMessage } from '@esengine/server'

class GameRoom extends Room {
    @onMessage('Move')
    handleMove(data: { x: number; y: number }, player: Player) {
        // Handle movement
    }

    @onMessage('Attack')
    handleAttack(data: { targetId: string }, player: Player) {
        // Handle attack
    }
}
```

## Built-in APIs

The server automatically registers several built-in APIs. Clients call them via `client.call(name, data)`.

### JoinRoom

Join or create a room. Returns `roomId`, `playerId`, and `sessionToken`.

```typescript
// Join by room type (joins an available room or creates a new one)
const result = await client.call('JoinRoom', {
    roomType: 'game',
    playerData: { name: 'Alice' },   // optional, passed to player.data
    options: { mapName: 'desert' },  // optional, passed to onCreate
})
// result: { roomId, playerId, sessionToken }

// Join by specific room ID
const result = await client.call('JoinRoom', {
    roomId: 'room_1',
    playerData: { name: 'Bob' },
})
```

The client should store `sessionToken` for reconnection.

### LeaveRoom

Leave the current room.

```typescript
await client.call('LeaveRoom', {})
// result: { success: true }
```

### ReconnectRoom

Reconnect to a room using a previously obtained session token.

```typescript
const result = await client.call('ReconnectRoom', {
    sessionToken: savedSessionToken,
})
// result: { roomId, playerId, sessionToken }
```

Only succeeds if the room still exists and the player is within the reconnection grace period.

### ListRooms

List available rooms, optionally filtered by type. Returns room metadata.

```typescript
// List all rooms
const { rooms } = await client.call('ListRooms', {})

// Filter by type
const { rooms } = await client.call('ListRooms', { type: 'game' })

// Each room entry:
// { roomId, playerCount, maxPlayers, locked, metadata }
```

### GetRoomInfo

Get detailed information about a specific room.

```typescript
const info = await client.call('GetRoomInfo', { roomId: 'room_1' })
// info: { roomId, playerCount, maxPlayers, locked, metadata, players: [{ id }] }
```

### Authenticate

Authenticate a connection (requires the `withAuth` mixin to be configured on the server).

```typescript
const result = await client.call('Authenticate', { token: 'my-jwt-token' })
// result: { success: true, user: { ... } }
```

## Reconnection

To support reconnection, set `reconnectGracePeriod` on the room and store the `sessionToken` on the client.

### Server Setup

```typescript
class GameRoom extends Room {
    reconnectGracePeriod = 15000  // 15 seconds

    onPlayerDisconnected(player: Player) {
        // Player went offline but is not removed yet
        console.log(`${player.id} disconnected, waiting for reconnect...`)
        this.broadcast('PlayerOffline', { playerId: player.id })
    }

    onPlayerReconnected(player: Player) {
        // Player came back
        console.log(`${player.id} reconnected!`)
        this.broadcast('PlayerOnline', { playerId: player.id })
    }

    onLeave(player: Player, reason?: string) {
        // Truly gone (voluntary leave, kicked, or grace period expired)
        console.log(`${player.id} left: ${reason}`)
    }
}
```

### Client Usage

```typescript
const client = await connect('ws://localhost:3000')

// Join room and save session token
const { roomId, sessionToken } = await client.call('JoinRoom', {
    roomType: 'game',
})
localStorage.setItem('sessionToken', sessionToken)

// ... connection lost, client reconnects ...

const newClient = await connect('ws://localhost:3000')
const saved = localStorage.getItem('sessionToken')
if (saved) {
    try {
        const result = await newClient.call('ReconnectRoom', {
            sessionToken: saved,
        })
        console.log('Reconnected to room:', result.roomId)
    } catch (e) {
        // Grace period expired or room no longer exists
        console.log('Reconnection failed, joining new room')
        const result = await newClient.call('JoinRoom', { roomType: 'game' })
        localStorage.setItem('sessionToken', result.sessionToken)
    }
}
```

## Schema Validation

Use the built-in Schema validation system for runtime type validation:

### Basic Usage

```typescript
import { s, defineApiWithSchema } from '@esengine/server'

// Define schema
const MoveSchema = s.object({
    x: s.number(),
    y: s.number(),
    speed: s.number().optional()
})

// Auto type inference
type Move = s.infer<typeof MoveSchema>  // { x: number; y: number; speed?: number }

// Use schema to define API (auto validation)
export default defineApiWithSchema(MoveSchema, {
    handler(req, ctx) {
        // req is validated, type-safe
        console.log(req.x, req.y)
    }
})
```

### Validator Types

| Type | Example | Description |
|------|---------|-------------|
| `s.string()` | `s.string().min(1).max(50)` | String with length constraints |
| `s.number()` | `s.number().min(0).int()` | Number with range and integer constraints |
| `s.boolean()` | `s.boolean()` | Boolean |
| `s.literal()` | `s.literal('admin')` | Literal type |
| `s.object()` | `s.object({ name: s.string() })` | Object |
| `s.array()` | `s.array(s.number())` | Array |
| `s.enum()` | `s.enum(['a', 'b'] as const)` | Enum |
| `s.union()` | `s.union([s.string(), s.number()])` | Union type |
| `s.record()` | `s.record(s.any())` | Record type |

### Modifiers

```typescript
// Optional field
s.string().optional()

// Default value
s.number().default(0)

// Nullable
s.string().nullable()

// String validation
s.string().min(1).max(100).email().url().regex(/^[a-z]+$/)

// Number validation
s.number().min(0).max(100).int().positive()

// Array validation
s.array(s.string()).min(1).max(10).nonempty()

// Object validation
s.object({ ... }).strict()  // No extra fields allowed
s.object({ ... }).partial() // All fields optional
s.object({ ... }).pick('name', 'age')  // Pick fields
s.object({ ... }).omit('password')     // Omit fields
```

### Message Validation

```typescript
import { s, defineMsgWithSchema } from '@esengine/server'

const InputSchema = s.object({
    keys: s.array(s.string()),
    timestamp: s.number()
})

export default defineMsgWithSchema(InputSchema, {
    handler(msg, ctx) {
        // msg is validated
        console.log(msg.keys, msg.timestamp)
    }
})
```

### Manual Validation

```typescript
import { s, parse, safeParse, createGuard } from '@esengine/server'

const UserSchema = s.object({
    name: s.string(),
    age: s.number().int().min(0)
})

// Throws on error
const user = parse(UserSchema, data)

// Returns result object
const result = safeParse(UserSchema, data)
if (result.success) {
    console.log(result.data)
} else {
    console.error(result.error)
}

// Type guard
const isUser = createGuard(UserSchema)
if (isUser(data)) {
    // data is User type
}
```

## Protocol Definition

Define shared types in `src/shared/protocol.ts`:

```typescript
// API request/response
export interface JoinRoomReq {
    roomType: string
    playerName: string
}

export interface JoinRoomRes {
    roomId: string
    playerId: string
    sessionToken: string
}

// Game messages
export interface MsgMove {
    x: number
    y: number
}

export interface MsgChat {
    text: string
}

// Server broadcasts
export interface BroadcastSync {
    players: PlayerState[]
}

export interface PlayerState {
    id: string
    name: string
    x: number
    y: number
}
```

## Client Connection

```typescript
import { connect } from '@esengine/rpc/client'

const client = await connect('ws://localhost:3000')

// Join room (now returns sessionToken)
const { roomId, playerId, sessionToken } = await client.call('JoinRoom', {
    roomType: 'game',
    playerData: { name: 'Alice' },
})

// Store sessionToken for reconnection
localStorage.setItem('sessionToken', sessionToken)

// List available rooms
const { rooms } = await client.call('ListRooms', { type: 'game' })
console.log('Available rooms:', rooms)

// Listen for broadcasts
client.onMessage('Sync', (data) => {
    console.log('State:', data.players)
})

client.onMessage('Joined', (data) => {
    console.log('Player joined:', data.playerName)
})

// Send message
client.send('RoomMessage', {
    type: 'Move',
    payload: { x: 100, y: 200 },
})
```

## ECSRoom

`ECSRoom` is a room base class with ECS World support, suitable for games that need ECS architecture.

ECSRoom automatically initializes `Core` if it has not been created yet, so you do not need to call `Core.create()` manually.

### Server Startup

```typescript
import { createServer } from '@esengine/server';
import { GameRoom } from './rooms/GameRoom.js';

// No need to call Core.create() -- ECSRoom handles it automatically

// Global game loop
setInterval(() => Core.update(1/60), 16);

// Create server
const server = await createServer({ port: 3000 });
server.define('game', GameRoom);
await server.start();
```

### Define ECSRoom

```typescript
import { ECSRoom, Player } from '@esengine/server/ecs';
import { Component, ECSComponent, sync } from '@esengine/ecs-framework';

// Define sync component
@ECSComponent('Player')
class PlayerComponent extends Component {
    @sync("string") name: string = "";
    @sync("uint16") score: number = 0;
    @sync("float32") x: number = 0;
    @sync("float32") y: number = 0;
}

// Define room
class GameRoom extends ECSRoom {
    onCreate() {
        this.addSystem(new MovementSystem());
    }

    onJoin(player: Player) {
        const entity = this.createPlayerEntity(player.id);
        const comp = entity.addComponent(new PlayerComponent());
        comp.name = player.id;
    }
}
```

### ECSRoom API

```typescript
abstract class ECSRoom<TState, TPlayerData> extends Room<TState, TPlayerData> {
    protected readonly world: World;     // ECS World
    protected readonly scene: Scene;     // Main scene

    // Scene management
    protected addSystem(system: EntitySystem): void;
    protected createEntity(name?: string): Entity;
    protected createPlayerEntity(playerId: string, name?: string): Entity;
    protected getPlayerEntity(playerId: string): Entity | undefined;
    protected destroyPlayerEntity(playerId: string): void;

    // State sync
    protected sendFullState(player: Player): void;
    protected broadcastSpawn(entity: Entity, prefabType?: string): void;
    protected broadcastDelta(): void;
}
```

### @sync Decorator

Mark component fields that need network synchronization:

| Type | Description | Bytes |
|------|-------------|-------|
| `"boolean"` | Boolean | 1 |
| `"int8"` / `"uint8"` | 8-bit integer | 1 |
| `"int16"` / `"uint16"` | 16-bit integer | 2 |
| `"int32"` / `"uint32"` | 32-bit integer | 4 |
| `"float32"` | 32-bit float | 4 |
| `"float64"` | 64-bit float | 8 |
| `"string"` | String | Variable |

## Best Practices

1. **Set Appropriate Tick Rate**
   - Turn-based games: 5-10 Hz
   - Casual games: 10-20 Hz
   - Action games: 20-60 Hz

2. **Use Shared Protocol**
   - Define all types in `shared/` directory
   - Import from here in both client and server

3. **State Validation**
   - Server should validate all client inputs
   - Never trust client-sent data

4. **Reconnection Handling**
   - Set `reconnectGracePeriod` to enable reconnection
   - Use `onPlayerDisconnected` / `onPlayerReconnected` to manage player state during disconnects
   - Store `sessionToken` on the client for `ReconnectRoom`

5. **Room Lifecycle**
   - Use `autoDispose` to clean up empty rooms
   - Save important data in `onDispose`
   - Use `metadata` to expose room info to the lobby (ListRooms)
