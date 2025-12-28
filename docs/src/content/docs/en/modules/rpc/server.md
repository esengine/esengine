---
title: "RPC Server API"
description: "RpcServer for handling client connections"
---

The `serve` function creates a type-safe RPC server that handles client connections and API calls.

## Basic Usage

```typescript
import { serve } from '@esengine/rpc/server';
import { gameProtocol } from './protocol';

const server = serve(gameProtocol, {
    port: 3000,
    api: {
        login: async (input, conn) => {
            console.log(`${input.username} connected from ${conn.ip}`);
            return { userId: conn.id, token: generateToken() };
        },
        sendChat: async (input, conn) => {
            server.broadcast('newMessage', {
                from: conn.id,
                text: input.text,
                time: Date.now(),
            });
            return { success: true };
        },
    },
    onStart: (port) => console.log(`Server started on port ${port}`),
});

await server.start();
```

## Server Options

```typescript
interface ServeOptions<P, TConnData> {
    // Required
    port: number;
    api: ApiHandlers<P, TConnData>;

    // Optional
    msg?: MsgHandlers<P, TConnData>;
    codec?: Codec;
    createConnData?: () => TConnData;

    // Callbacks
    onConnect?: (conn: Connection<TConnData>) => void | Promise<void>;
    onDisconnect?: (conn: Connection<TConnData>, reason?: string) => void | Promise<void>;
    onError?: (error: Error, conn?: Connection<TConnData>) => void;
    onStart?: (port: number) => void;
}
```

## API Handlers

Each API handler receives the input and connection context:

```typescript
const server = serve(protocol, {
    port: 3000,
    api: {
        // Sync handler
        ping: (input, conn) => {
            return { pong: true, time: Date.now() };
        },

        // Async handler
        getProfile: async (input, conn) => {
            const user = await database.findUser(input.userId);
            return { name: user.name, level: user.level };
        },

        // Access connection context
        getMyInfo: (input, conn) => {
            return {
                connectionId: conn.id,
                ip: conn.ip,
                data: conn.data,
            };
        },
    },
});
```

### Throwing Errors

```typescript
import { RpcError, ErrorCode } from '@esengine/rpc/server';

const server = serve(protocol, {
    port: 3000,
    api: {
        login: async (input, conn) => {
            const user = await database.findUser(input.username);

            if (!user) {
                throw new RpcError(ErrorCode.NOT_FOUND, 'User not found');
            }

            if (!await verifyPassword(input.password, user.hash)) {
                throw new RpcError('AUTH_FAILED', 'Invalid password');
            }

            return { userId: user.id, token: generateToken() };
        },
    },
});
```

## Message Handlers

Handle messages sent by clients:

```typescript
const server = serve(protocol, {
    port: 3000,
    api: { /* ... */ },
    msg: {
        playerMove: (data, conn) => {
            // Update player position
            const player = players.get(conn.id);
            if (player) {
                player.x = data.x;
                player.y = data.y;
            }

            // Broadcast to others
            server.broadcast('playerMoved', {
                playerId: conn.id,
                x: data.x,
                y: data.y,
            }, { exclude: conn });
        },

        chat: async (data, conn) => {
            // Async handlers work too
            await logChat(conn.id, data.text);
        },
    },
});
```

## Connection Context

The `Connection` object provides access to client info:

```typescript
interface Connection<TData> {
    // Unique connection ID
    readonly id: string;

    // Client IP address
    readonly ip: string;

    // Connection status
    readonly isOpen: boolean;

    // Custom data attached to this connection
    data: TData;

    // Close the connection
    close(reason?: string): void;
}
```

### Custom Connection Data

Store per-connection state:

```typescript
interface PlayerData {
    playerId: string;
    username: string;
    room: string | null;
}

const server = serve(protocol, {
    port: 3000,
    createConnData: () => ({
        playerId: '',
        username: '',
        room: null,
    } as PlayerData),
    api: {
        login: async (input, conn) => {
            // Store data on connection
            conn.data.playerId = generateId();
            conn.data.username = input.username;
            return { playerId: conn.data.playerId };
        },
        joinRoom: async (input, conn) => {
            conn.data.room = input.roomId;
            return { success: true };
        },
    },
    onDisconnect: (conn) => {
        console.log(`${conn.data.username} left room ${conn.data.room}`);
    },
});
```

## Sending Messages

### To Single Connection

```typescript
server.send(conn, 'notification', { text: 'Hello!' });
```

### Broadcast to All

```typescript
// To everyone
server.broadcast('announcement', { text: 'Server restart in 5 minutes' });

// Exclude sender
server.broadcast('playerMoved', { id: conn.id, x, y }, { exclude: conn });

// Exclude multiple
server.broadcast('gameEvent', data, { exclude: [conn1, conn2] });
```

### To Specific Group

```typescript
// Custom broadcasting
function broadcastToRoom(roomId: string, name: string, data: any) {
    for (const conn of server.connections) {
        if (conn.data.room === roomId) {
            server.send(conn, name, data);
        }
    }
}

broadcastToRoom('room1', 'roomMessage', { text: 'Hello room!' });
```

## Server Lifecycle

```typescript
const server = serve(protocol, { /* ... */ });

// Start
await server.start();
console.log('Server running');

// Access connections
console.log(`${server.connections.length} clients connected`);

// Stop (closes all connections)
await server.stop();
console.log('Server stopped');
```

## Full Example

```typescript
import { serve, RpcError } from '@esengine/rpc/server';
import { gameProtocol } from './protocol';

interface PlayerData {
    id: string;
    name: string;
    x: number;
    y: number;
}

const players = new Map<string, PlayerData>();

const server = serve(gameProtocol, {
    port: 3000,
    createConnData: () => ({ id: '', name: '', x: 0, y: 0 }),

    api: {
        join: async (input, conn) => {
            const player: PlayerData = {
                id: conn.id,
                name: input.name,
                x: 0,
                y: 0,
            };
            players.set(conn.id, player);
            conn.data = player;

            // Notify others
            server.broadcast('playerJoined', {
                id: player.id,
                name: player.name,
            }, { exclude: conn });

            // Send current state to new player
            return {
                playerId: player.id,
                players: Array.from(players.values()),
            };
        },

        chat: async (input, conn) => {
            server.broadcast('chatMessage', {
                from: conn.data.name,
                text: input.text,
                time: Date.now(),
            });
            return { sent: true };
        },
    },

    msg: {
        move: (data, conn) => {
            const player = players.get(conn.id);
            if (player) {
                player.x = data.x;
                player.y = data.y;

                server.broadcast('playerMoved', {
                    id: conn.id,
                    x: data.x,
                    y: data.y,
                }, { exclude: conn });
            }
        },
    },

    onConnect: (conn) => {
        console.log(`Client connected: ${conn.id} from ${conn.ip}`);
    },

    onDisconnect: (conn) => {
        const player = players.get(conn.id);
        if (player) {
            players.delete(conn.id);
            server.broadcast('playerLeft', { id: conn.id });
            console.log(`${player.name} disconnected`);
        }
    },

    onError: (error, conn) => {
        console.error(`Error from ${conn?.id}:`, error);
    },

    onStart: (port) => {
        console.log(`Game server running on ws://localhost:${port}`);
    },
});

server.start();
```
