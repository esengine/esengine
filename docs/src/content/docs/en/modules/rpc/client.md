---
title: "RPC Client API"
description: "RpcClient for connecting to RPC servers"
---

The `RpcClient` class provides a type-safe WebSocket client for RPC communication.

## Basic Usage

```typescript
import { RpcClient } from '@esengine/rpc/client';
import { gameProtocol } from './protocol';

const client = new RpcClient(gameProtocol, 'ws://localhost:3000', {
    onConnect: () => console.log('Connected'),
    onDisconnect: (reason) => console.log('Disconnected:', reason),
    onError: (error) => console.error('Error:', error),
});

await client.connect();
```

## Constructor Options

```typescript
interface RpcClientOptions {
    // Codec for serialization (default: json())
    codec?: Codec;

    // API call timeout in ms (default: 30000)
    timeout?: number;

    // Auto reconnect on disconnect (default: true)
    autoReconnect?: boolean;

    // Reconnect interval in ms (default: 3000)
    reconnectInterval?: number;

    // Custom WebSocket factory (for WeChat Mini Games, etc.)
    webSocketFactory?: (url: string) => WebSocketAdapter;

    // Callbacks
    onConnect?: () => void;
    onDisconnect?: (reason?: string) => void;
    onError?: (error: Error) => void;
}
```

## Connection

### Connect

```typescript
// Connect returns a promise
await client.connect();

// Or chain
client.connect().then(() => {
    console.log('Ready');
});
```

### Check Status

```typescript
// Connection status: 'connecting' | 'open' | 'closing' | 'closed'
console.log(client.status);

// Convenience boolean
if (client.isConnected) {
    // Safe to call APIs
}
```

### Disconnect

```typescript
// Manually disconnect (disables auto-reconnect)
client.disconnect();
```

## Calling APIs

APIs use request-response pattern with full type safety:

```typescript
// Define protocol
const protocol = rpc.define({
    api: {
        login: rpc.api<{ username: string }, { userId: string; token: string }>(),
        getProfile: rpc.api<{ userId: string }, { name: string; level: number }>(),
    },
    msg: {}
});

// Call with type inference
const { userId, token } = await client.call('login', { username: 'player1' });
const profile = await client.call('getProfile', { userId });
```

### Error Handling

```typescript
import { RpcError, ErrorCode } from '@esengine/rpc/client';

try {
    await client.call('login', { username: 'player1' });
} catch (error) {
    if (error instanceof RpcError) {
        switch (error.code) {
            case ErrorCode.TIMEOUT:
                console.log('Request timed out');
                break;
            case ErrorCode.CONNECTION_CLOSED:
                console.log('Not connected');
                break;
            case ErrorCode.NOT_FOUND:
                console.log('API not found');
                break;
            default:
                console.log('Server error:', error.message);
        }
    }
}
```

## Sending Messages

Messages are fire-and-forget (no response):

```typescript
// Send message to server
client.send('playerMove', { x: 100, y: 200 });
client.send('chat', { text: 'Hello!' });
```

## Receiving Messages

Listen for server-pushed messages:

```typescript
// Subscribe to message
client.on('newMessage', (data) => {
    console.log(`${data.from}: ${data.text}`);
});

client.on('playerJoined', (data) => {
    console.log(`${data.name} joined the game`);
});

// Unsubscribe specific handler
const handler = (data) => console.log(data);
client.on('event', handler);
client.off('event', handler);

// Unsubscribe all handlers for a message
client.off('event');

// One-time listener
client.once('gameStart', (data) => {
    console.log('Game started!');
});
```

## Custom WebSocket (Platform Adapters)

For platforms like WeChat Mini Games:

```typescript
// WeChat Mini Games adapter
const wxWebSocketFactory = (url: string) => {
    const ws = wx.connectSocket({ url });

    return {
        get readyState() { return ws.readyState; },
        send: (data) => ws.send({ data }),
        close: (code, reason) => ws.close({ code, reason }),
        set onopen(fn) { ws.onOpen(fn); },
        set onclose(fn) { ws.onClose((e) => fn({ code: e.code, reason: e.reason })); },
        set onerror(fn) { ws.onError(fn); },
        set onmessage(fn) { ws.onMessage((e) => fn({ data: e.data })); },
    };
};

const client = new RpcClient(protocol, 'wss://game.example.com', {
    webSocketFactory: wxWebSocketFactory,
});
```

## Convenience Function

```typescript
import { connect } from '@esengine/rpc/client';

// Connect and return client in one call
const client = await connect(protocol, 'ws://localhost:3000', {
    onConnect: () => console.log('Connected'),
});

const result = await client.call('join', { name: 'Alice' });
```

## Full Example

```typescript
import { RpcClient } from '@esengine/rpc/client';
import { gameProtocol } from './protocol';

class GameClient {
    private client: RpcClient<typeof gameProtocol>;
    private userId: string | null = null;

    constructor() {
        this.client = new RpcClient(gameProtocol, 'ws://localhost:3000', {
            onConnect: () => this.onConnected(),
            onDisconnect: () => this.onDisconnected(),
            onError: (e) => console.error('RPC Error:', e),
        });

        // Setup message handlers
        this.client.on('gameState', (state) => this.updateState(state));
        this.client.on('playerJoined', (p) => this.addPlayer(p));
        this.client.on('playerLeft', (p) => this.removePlayer(p));
    }

    async connect() {
        await this.client.connect();
    }

    private async onConnected() {
        const { userId, token } = await this.client.call('login', {
            username: localStorage.getItem('username') || 'Guest',
        });
        this.userId = userId;
        console.log('Logged in as', userId);
    }

    private onDisconnected() {
        console.log('Disconnected, will auto-reconnect...');
    }

    async move(x: number, y: number) {
        if (!this.client.isConnected) return;
        this.client.send('move', { x, y });
    }

    async chat(text: string) {
        await this.client.call('sendChat', { text });
    }
}
```
