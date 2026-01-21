---
title: "RPC 通信库"
description: "类型安全的 WebSocket RPC 通信库"
---

`@esengine/rpc` 是一个轻量级、类型安全的 RPC（远程过程调用）库，专为游戏和实时应用设计。

## 特性

- **类型安全**：完整的 TypeScript 类型推断，API 调用和消息处理都有类型检查
- **双向通信**：支持请求-响应（API）和发布-订阅（消息）两种模式
- **编解码灵活**：内置 JSON 和 MessagePack 编解码器
- **跨平台**：支持浏览器、Node.js 和微信小游戏

## 安装

```bash
npm install @esengine/rpc
```

## 快速开始

### 1. 定义协议

```typescript
import { rpc } from '@esengine/rpc';

// 定义协议（共享于客户端和服务器）
export const chatProtocol = rpc.define({
    api: {
        // 请求-响应 API
        login: rpc.api<{ username: string }, { userId: string; token: string }>(),
        sendMessage: rpc.api<{ text: string }, { messageId: string }>(),
    },
    msg: {
        // 单向消息（发布-订阅）
        newMessage: rpc.msg<{ from: string; text: string; time: number }>(),
        userJoined: rpc.msg<{ username: string }>(),
        userLeft: rpc.msg<{ username: string }>(),
    },
});

export type ChatProtocol = typeof chatProtocol;
```

### 2. 创建客户端

```typescript
import { RpcClient } from '@esengine/rpc/client';
import { chatProtocol } from './protocol';

// 创建客户端
const client = new RpcClient(chatProtocol, 'ws://localhost:3000', {
    onConnect: () => console.log('已连接'),
    onDisconnect: (reason) => console.log('已断开:', reason),
    onError: (error) => console.error('错误:', error),
});

// 连接服务器
await client.connect();

// 调用 API（类型安全）
const { userId, token } = await client.call('login', { username: 'player1' });
console.log('登录成功:', userId);

// 监听消息（类型安全）
client.on('newMessage', (data) => {
    console.log(`${data.from}: ${data.text}`);
});

// 发送消息
await client.call('sendMessage', { text: 'Hello!' });
```

### 3. 创建服务器

```typescript
import { serve } from '@esengine/rpc/server';
import { chatProtocol } from './protocol';

// 创建服务器（API 处理器在配置中定义）
const server = serve(chatProtocol, {
    port: 3000,
    onStart: (port) => console.log(`服务器启动: ws://localhost:${port}`),

    api: {
        login: async (input, conn) => {
            const userId = generateUserId();
            const token = generateToken();

            // 广播用户加入
            server.broadcast('userJoined', { username: input.username });

            return { userId, token };
        },

        sendMessage: async (input, conn) => {
            const messageId = generateMessageId();

            // 广播新消息
            server.broadcast('newMessage', {
                from: conn.id,
                text: input.text,
                time: Date.now(),
            });

            return { messageId };
        },
    },
});

// 启动服务器
await server.start();
```

## 核心概念

### 协议定义

协议是客户端和服务器之间通信的契约：

```typescript
const protocol = rpc.define({
    api: {
        // API：请求-响应模式，客户端发起，服务器处理并返回结果
        methodName: rpc.api<InputType, OutputType>(),
    },
    msg: {
        // 消息：发布-订阅模式，任意一方发送，对方监听
        messageName: rpc.msg<DataType>(),
    },
});
```

### API vs 消息

| 特性 | API | 消息 |
|------|-----|------|
| 模式 | 请求-响应 | 发布-订阅 |
| 返回值 | 有（Promise） | 无 |
| 确认 | 等待响应 | 发送即忘 |
| 用途 | 登录、查询、操作 | 实时通知、状态同步 |

## 编解码器

内置两种编解码器：

```typescript
import { json, msgpack } from '@esengine/rpc/codec';

// JSON（默认，可读性好）
const client = new RpcClient(protocol, url, {
    codec: json(),
});

// MessagePack（二进制，更高效）
const client = new RpcClient(protocol, url, {
    codec: msgpack(),
});
```

## 文档导航

- [客户端 API](/modules/rpc/client/) - RpcClient 详细 API
- [服务器 API](/modules/rpc/server/) - RpcServer 详细 API
- [编解码器](/modules/rpc/codec/) - 自定义编解码器
