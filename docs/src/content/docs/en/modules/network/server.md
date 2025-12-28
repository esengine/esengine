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
| `port` | `number` | `3000` | WebSocket port |
| `tickRate` | `number` | `20` | Global tick rate (Hz) |
| `apiDir` | `string` | `'src/api'` | API handlers directory |
| `msgDir` | `string` | `'src/msg'` | Message handlers directory |
| `onStart` | `(port) => void` | - | Start callback |
| `onConnect` | `(conn) => void` | - | Connection callback |
| `onDisconnect` | `(conn) => void` | - | Disconnect callback |

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
| `maxPlayers` | `number` | `10` | Maximum players |
| `tickRate` | `number` | `20` | Tick rate (Hz) |
| `autoDispose` | `boolean` | `true` | Auto-dispose empty rooms |

### Room API

```typescript
class Room<TState, TPlayerData> {
    readonly id: string           // Room ID
    readonly players: Player[]    // All players
    readonly playerCount: number  // Player count
    readonly isLocked: boolean    // Lock status
    state: TState                 // Room state

    // Broadcast to all players
    broadcast<T>(type: string, data: T): void

    // Broadcast to all except one
    broadcastExcept<T>(type: string, data: T, except: Player): void

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

### Lifecycle Methods

| Method | Trigger | Purpose |
|--------|---------|---------|
| `onCreate()` | Room created | Initialize game state |
| `onJoin(player)` | Player joins | Welcome message, assign position |
| `onLeave(player)` | Player leaves | Cleanup player data |
| `onTick(dt)` | Every frame | Game logic, state sync |
| `onDispose()` | Before disposal | Save data, cleanup resources |

## Player Class

Player represents a connected player in a room.

```typescript
class Player<TData = Record<string, unknown>> {
    readonly id: string          // Player ID
    readonly roomId: string      // Room ID
    data: TData                  // Custom data

    // Send message to this player
    send<T>(type: string, data: T): void

    // Leave room
    leave(): void
}
```

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

// Join room
const { roomId, playerId } = await client.call('JoinRoom', {
    roomType: 'game',
    playerName: 'Alice',
})

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

4. **Disconnect Handling**
   - Implement reconnection logic
   - Use `onLeave` to save player state

5. **Room Lifecycle**
   - Use `autoDispose` to clean up empty rooms
   - Save important data in `onDispose`
