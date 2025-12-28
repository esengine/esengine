---
title: "RPC Library"
description: "Type-safe WebSocket RPC communication library"
---

`@esengine/rpc` is a lightweight, type-safe RPC (Remote Procedure Call) library designed for games and real-time applications.

## Features

- **Type-Safe**: Complete TypeScript type inference for API calls and message handling
- **Bidirectional**: Supports both request-response (API) and publish-subscribe (message) patterns
- **Flexible Codecs**: Built-in JSON and MessagePack codecs
- **Cross-Platform**: Works in browsers, Node.js, and WeChat Mini Games

## Installation

```bash
npm install @esengine/rpc
```

## Quick Start

### 1. Define Protocol

```typescript
import { rpc } from '@esengine/rpc';

// Define protocol (shared between client and server)
export const chatProtocol = rpc.define({
    api: {
        // Request-response APIs
        login: rpc.api<{ username: string }, { userId: string; token: string }>(),
        sendMessage: rpc.api<{ text: string }, { messageId: string }>(),
    },
    msg: {
        // One-way messages (publish-subscribe)
        newMessage: rpc.msg<{ from: string; text: string; time: number }>(),
        userJoined: rpc.msg<{ username: string }>(),
        userLeft: rpc.msg<{ username: string }>(),
    },
});

export type ChatProtocol = typeof chatProtocol;
```

### 2. Create Client

```typescript
import { RpcClient } from '@esengine/rpc/client';
import { chatProtocol } from './protocol';

// Create client
const client = new RpcClient(chatProtocol, 'ws://localhost:3000', {
    onConnect: () => console.log('Connected'),
    onDisconnect: (reason) => console.log('Disconnected:', reason),
    onError: (error) => console.error('Error:', error),
});

// Connect to server
await client.connect();

// Call API (type-safe)
const { userId, token } = await client.call('login', { username: 'player1' });
console.log('Logged in:', userId);

// Listen to messages (type-safe)
client.on('newMessage', (data) => {
    console.log(`${data.from}: ${data.text}`);
});

// Send message
await client.call('sendMessage', { text: 'Hello!' });
```

### 3. Create Server

```typescript
import { RpcServer } from '@esengine/rpc/server';
import { chatProtocol } from './protocol';

// Create server
const server = new RpcServer(chatProtocol, {
    port: 3000,
    onStart: (port) => console.log(`Server started: ws://localhost:${port}`),
});

// Register API handlers
server.handle('login', async (input, ctx) => {
    const userId = generateUserId();
    const token = generateToken();

    // Broadcast user joined
    server.broadcast('userJoined', { username: input.username });

    return { userId, token };
});

server.handle('sendMessage', async (input, ctx) => {
    const messageId = generateMessageId();

    // Broadcast new message
    server.broadcast('newMessage', {
        from: ctx.clientId,
        text: input.text,
        time: Date.now(),
    });

    return { messageId };
});

// Start server
await server.start();
```

## Core Concepts

### Protocol Definition

A protocol is the contract between client and server:

```typescript
const protocol = rpc.define({
    api: {
        // API: Request-response pattern, client initiates, server handles and returns
        methodName: rpc.api<InputType, OutputType>(),
    },
    msg: {
        // Message: Publish-subscribe pattern, either side can send, other side listens
        messageName: rpc.msg<DataType>(),
    },
});
```

### API vs Messages

| Feature | API | Message |
|---------|-----|---------|
| Pattern | Request-Response | Publish-Subscribe |
| Return Value | Yes (Promise) | No |
| Confirmation | Waits for response | Fire-and-forget |
| Use Cases | Login, queries, operations | Real-time notifications, state sync |

## Codecs

Two built-in codecs are available:

```typescript
import { json, msgpack } from '@esengine/rpc/codec';

// JSON (default, human-readable)
const client = new RpcClient(protocol, url, {
    codec: json(),
});

// MessagePack (binary, more efficient)
const client = new RpcClient(protocol, url, {
    codec: msgpack(),
});
```

## Documentation

- [Client API](/en/modules/rpc/client/) - Detailed RpcClient API
- [Server API](/en/modules/rpc/server/) - Detailed RpcServer API
- [Codecs](/en/modules/rpc/codec/) - Custom codecs
