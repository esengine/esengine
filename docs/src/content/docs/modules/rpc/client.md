---
title: "RPC 客户端 API"
description: "RpcClient 连接 RPC 服务器"
---

`RpcClient` 类提供类型安全的 WebSocket 客户端，用于 RPC 通信。

## 基础用法

```typescript
import { RpcClient } from '@esengine/rpc/client';
import { gameProtocol } from './protocol';

const client = new RpcClient(gameProtocol, 'ws://localhost:3000', {
    onConnect: () => console.log('已连接'),
    onDisconnect: (reason) => console.log('已断开:', reason),
    onError: (error) => console.error('错误:', error),
});

await client.connect();
```

## 构造选项

```typescript
interface RpcClientOptions {
    // 序列化编解码器（默认: json()）
    codec?: Codec;

    // API 调用超时，毫秒（默认: 30000）
    timeout?: number;

    // 断开后自动重连（默认: true）
    autoReconnect?: boolean;

    // 重连间隔，毫秒（默认: 3000）
    reconnectInterval?: number;

    // 自定义 WebSocket 工厂（用于微信小游戏等）
    webSocketFactory?: (url: string) => WebSocketAdapter;

    // 回调函数
    onConnect?: () => void;
    onDisconnect?: (reason?: string) => void;
    onError?: (error: Error) => void;
}
```

## 连接管理

### 连接

```typescript
// connect 返回 Promise
await client.connect();

// 或链式调用
client.connect().then(() => {
    console.log('已就绪');
});
```

### 检查状态

```typescript
// 连接状态: 'connecting' | 'open' | 'closing' | 'closed'
console.log(client.status);

// 便捷布尔值
if (client.isConnected) {
    // 可以安全调用 API
}
```

### 断开连接

```typescript
// 手动断开（禁用自动重连）
client.disconnect();
```

## 调用 API

API 使用请求-响应模式，完全类型安全：

```typescript
// 定义协议
const protocol = rpc.define({
    api: {
        login: rpc.api<{ username: string }, { userId: string; token: string }>(),
        getProfile: rpc.api<{ userId: string }, { name: string; level: number }>(),
    },
    msg: {}
});

// 调用时类型自动推断
const { userId, token } = await client.call('login', { username: 'player1' });
const profile = await client.call('getProfile', { userId });
```

### 错误处理

```typescript
import { RpcError, ErrorCode } from '@esengine/rpc/client';

try {
    await client.call('login', { username: 'player1' });
} catch (error) {
    if (error instanceof RpcError) {
        switch (error.code) {
            case ErrorCode.TIMEOUT:
                console.log('请求超时');
                break;
            case ErrorCode.CONNECTION_CLOSED:
                console.log('未连接');
                break;
            case ErrorCode.NOT_FOUND:
                console.log('API 不存在');
                break;
            default:
                console.log('服务器错误:', error.message);
        }
    }
}
```

## 发送消息

消息是发送即忘模式（无响应）：

```typescript
// 向服务器发送消息
client.send('playerMove', { x: 100, y: 200 });
client.send('chat', { text: 'Hello!' });
```

## 接收消息

监听服务器推送的消息：

```typescript
// 订阅消息
client.on('newMessage', (data) => {
    console.log(`${data.from}: ${data.text}`);
});

client.on('playerJoined', (data) => {
    console.log(`${data.name} 加入游戏`);
});

// 取消特定处理器
const handler = (data) => console.log(data);
client.on('event', handler);
client.off('event', handler);

// 取消某消息的所有处理器
client.off('event');

// 一次性监听
client.once('gameStart', (data) => {
    console.log('游戏开始!');
});
```

## 自定义 WebSocket（平台适配器）

用于微信小游戏等平台：

```typescript
// 微信小游戏适配器
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

## 便捷函数

```typescript
import { connect } from '@esengine/rpc/client';

// 一次调用完成连接
const client = await connect(protocol, 'ws://localhost:3000', {
    onConnect: () => console.log('已连接'),
});

const result = await client.call('join', { name: 'Alice' });
```

## 完整示例

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
            onError: (e) => console.error('RPC 错误:', e),
        });

        // 设置消息处理器
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
        console.log('登录为', userId);
    }

    private onDisconnected() {
        console.log('已断开，将自动重连...');
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
