---
title: "RPC 服务器 API"
description: "RpcServer 处理客户端连接"
---

`serve` 函数创建类型安全的 RPC 服务器，处理客户端连接和 API 调用。

## 基础用法

```typescript
import { serve } from '@esengine/rpc/server';
import { gameProtocol } from './protocol';

const server = serve(gameProtocol, {
    port: 3000,
    api: {
        login: async (input, conn) => {
            console.log(`${input.username} 从 ${conn.ip} 连接`);
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
    onStart: (port) => console.log(`服务器启动于端口 ${port}`),
});

await server.start();
```

## 服务器选项

```typescript
interface ServeOptions<P, TConnData> {
    // 必需
    api: ApiHandlers<P, TConnData>;

    // 端口配置（二选一）
    port?: number;           // 独立端口
    server?: HttpServer;     // 或附加到已有 HTTP 服务器

    // 可选
    msg?: MsgHandlers<P, TConnData>;
    codec?: Codec;
    createConnData?: () => TConnData;

    // 回调
    onConnect?: (conn: Connection<TConnData>) => void | Promise<void>;
    onDisconnect?: (conn: Connection<TConnData>, reason?: string) => void | Promise<void>;
    onError?: (error: Error, conn?: Connection<TConnData>) => void;
    onStart?: (port: number) => void;
}
```

## API 处理器

每个 API 处理器接收输入和连接上下文：

```typescript
const server = serve(protocol, {
    port: 3000,
    api: {
        // 同步处理器
        ping: (input, conn) => {
            return { pong: true, time: Date.now() };
        },

        // 异步处理器
        getProfile: async (input, conn) => {
            const user = await database.findUser(input.userId);
            return { name: user.name, level: user.level };
        },

        // 访问连接上下文
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

### 抛出错误

```typescript
import { RpcError, ErrorCode } from '@esengine/rpc/server';

const server = serve(protocol, {
    port: 3000,
    api: {
        login: async (input, conn) => {
            const user = await database.findUser(input.username);

            if (!user) {
                throw new RpcError(ErrorCode.NOT_FOUND, '用户不存在');
            }

            if (!await verifyPassword(input.password, user.hash)) {
                throw new RpcError('AUTH_FAILED', '密码错误');
            }

            return { userId: user.id, token: generateToken() };
        },
    },
});
```

## 消息处理器

处理客户端发送的消息：

```typescript
const server = serve(protocol, {
    port: 3000,
    api: { /* ... */ },
    msg: {
        playerMove: (data, conn) => {
            // 更新玩家位置
            const player = players.get(conn.id);
            if (player) {
                player.x = data.x;
                player.y = data.y;
            }

            // 广播给其他玩家
            server.broadcast('playerMoved', {
                playerId: conn.id,
                x: data.x,
                y: data.y,
            }, { exclude: conn });
        },

        chat: async (data, conn) => {
            // 异步处理器也可以
            await logChat(conn.id, data.text);
        },
    },
});
```

## 连接上下文

`Connection` 对象提供客户端信息：

```typescript
interface Connection<TData> {
    // 唯一连接 ID
    readonly id: string;

    // 客户端 IP 地址
    readonly ip: string;

    // 连接状态
    readonly isOpen: boolean;

    // 附加到此连接的自定义数据
    data: TData;

    // 关闭连接
    close(reason?: string): void;
}
```

### 自定义连接数据

存储每连接的状态：

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
            // 在连接上存储数据
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
        console.log(`${conn.data.username} 离开房间 ${conn.data.room}`);
    },
});
```

## 发送消息

### 发送给单个连接

```typescript
server.send(conn, 'notification', { text: 'Hello!' });
```

### 广播给所有人

```typescript
// 给所有人
server.broadcast('announcement', { text: '服务器将在5分钟后重启' });

// 排除发送者
server.broadcast('playerMoved', { id: conn.id, x, y }, { exclude: conn });

// 排除多个
server.broadcast('gameEvent', data, { exclude: [conn1, conn2] });
```

### 发送给特定群组

```typescript
// 自定义广播
function broadcastToRoom(roomId: string, name: string, data: any) {
    for (const conn of server.connections) {
        if (conn.data.room === roomId) {
            server.send(conn, name, data);
        }
    }
}

broadcastToRoom('room1', 'roomMessage', { text: '房间内消息!' });
```

## 服务器生命周期

```typescript
const server = serve(protocol, { /* ... */ });

// 启动
await server.start();
console.log('服务器运行中');

// 访问连接列表
console.log(`${server.connections.length} 个客户端已连接`);

// 停止（关闭所有连接）
await server.stop();
console.log('服务器已停止');
```

## 完整示例

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

            // 通知其他玩家
            server.broadcast('playerJoined', {
                id: player.id,
                name: player.name,
            }, { exclude: conn });

            // 发送当前状态给新玩家
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
        console.log(`客户端已连接: ${conn.id} 来自 ${conn.ip}`);
    },

    onDisconnect: (conn) => {
        const player = players.get(conn.id);
        if (player) {
            players.delete(conn.id);
            server.broadcast('playerLeft', { id: conn.id });
            console.log(`${player.name} 已断开`);
        }
    },

    onError: (error, conn) => {
        console.error(`来自 ${conn?.id} 的错误:`, error);
    },

    onStart: (port) => {
        console.log(`游戏服务器运行于 ws://localhost:${port}`);
    },
});

server.start();
```
