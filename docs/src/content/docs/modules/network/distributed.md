---
title: "分布式房间"
description: "使用 DistributedRoomManager 实现多服务器房间管理"
---

## 概述

分布式房间支持允许多个服务器实例共享房间注册表，实现跨服务器玩家路由和故障转移。

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

## 快速开始

### 单机模式（测试用）

```typescript
import {
    DistributedRoomManager,
    MemoryAdapter,
    Room
} from '@esengine/server';

// 定义房间类型
class GameRoom extends Room {
    maxPlayers = 4;
}

// 创建适配器和管理器
const adapter = new MemoryAdapter();
const manager = new DistributedRoomManager(adapter, {
    serverId: 'server-1',
    serverAddress: 'localhost',
    serverPort: 3000
}, (conn, type, data) => conn.send(JSON.stringify({ type, data })));

// 注册房间类型
manager.define('game', GameRoom);

// 启动管理器
await manager.start();

// 分布式加入/创建房间
const result = await manager.joinOrCreateDistributed('game', 'player-1', conn);
if ('redirect' in result) {
    // 玩家应连接到其他服务器
    console.log(`重定向到: ${result.redirect}`);
} else {
    // 玩家加入本地房间
    const { room, player } = result;
}

// 优雅关闭
await manager.stop(true);
```

### 多服务器模式（生产用）

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

### 配置选项

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `serverId` | `string` | 必填 | 服务器唯一标识 |
| `serverAddress` | `string` | 必填 | 客户端连接的公开地址 |
| `serverPort` | `number` | 必填 | 服务器端口 |
| `heartbeatInterval` | `number` | `5000` | 心跳间隔（毫秒） |
| `snapshotInterval` | `number` | `30000` | 状态快照间隔，0 禁用 |
| `migrationTimeout` | `number` | `10000` | 房间迁移超时 |
| `enableFailover` | `boolean` | `true` | 启用自动故障转移 |
| `capacity` | `number` | `100` | 本服务器最大房间数 |

### 生命周期方法

#### start()

启动分布式房间管理器。连接适配器、注册服务器、启动心跳。

```typescript
await manager.start();
```

#### stop(graceful?)

停止管理器。如果 `graceful=true`，将服务器标记为 draining 并保存所有房间快照。

```typescript
await manager.stop(true);
```

### 路由方法

#### joinOrCreateDistributed()

分布式感知的加入或创建房间。返回本地房间的 `{ room, player }` 或远程房间的 `{ redirect: string }`。

```typescript
const result = await manager.joinOrCreateDistributed('game', 'player-1', conn);

if ('redirect' in result) {
    // 客户端应重定向到其他服务器
    res.json({ redirect: result.redirect });
} else {
    // 玩家加入了本地房间
    const { room, player } = result;
}
```

#### route()

将玩家路由到合适的房间/服务器。

```typescript
const result = await manager.route({
    roomType: 'game',
    playerId: 'p1'
});

switch (result.type) {
    case 'local':      // 房间在本服务器
        break;
    case 'redirect':   // 房间在其他服务器
        // result.serverAddress 包含目标服务器地址
        break;
    case 'create':     // 没有可用房间，需要创建
        break;
    case 'unavailable': // 无法找到或创建房间
        // result.reason 包含错误信息
        break;
}
```

### 状态管理

#### saveSnapshot()

手动保存房间状态快照。

```typescript
await manager.saveSnapshot(roomId);
```

#### restoreFromSnapshot()

从保存的快照恢复房间。

```typescript
const success = await manager.restoreFromSnapshot(roomId);
```

### 查询方法

#### getServers()

获取所有在线服务器。

```typescript
const servers = await manager.getServers();
```

#### queryDistributedRooms()

查询所有服务器上的房间。

```typescript
const rooms = await manager.queryDistributedRooms({
    roomType: 'game',
    hasSpace: true,
    notLocked: true
});
```

## IDistributedAdapter

分布式后端的接口。实现此接口以支持 Redis、消息队列等。

### 内置适配器

#### MemoryAdapter

用于测试和单机模式的内存实现。

```typescript
const adapter = new MemoryAdapter({
    serverTtl: 15000,      // 无心跳后服务器离线时间（毫秒）
    enableTtlCheck: true,  // 启用自动 TTL 检查
    ttlCheckInterval: 5000 // TTL 检查间隔（毫秒）
});
```

#### RedisAdapter

用于生产环境多服务器部署的 Redis 实现。

```typescript
import Redis from 'ioredis';
import { RedisAdapter } from '@esengine/server';

const adapter = new RedisAdapter({
    factory: () => new Redis('redis://localhost:6379'),
    prefix: 'game:',       // 键前缀（默认: 'dist:'）
    serverTtl: 30,         // 服务器 TTL（秒，默认: 30）
    roomTtl: 0,            // 房间 TTL，0 = 永不过期（默认: 0）
    snapshotTtl: 86400,    // 快照 TTL（秒，默认: 24 小时）
    channel: 'game:events' // Pub/Sub 频道（默认: 'distributed:events'）
});
```

**RedisAdapter 配置：**

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `factory` | `() => RedisClient` | 必填 | Redis 客户端工厂（惰性连接） |
| `prefix` | `string` | `'dist:'` | 所有 Redis 键的前缀 |
| `serverTtl` | `number` | `30` | 服务器 TTL（秒） |
| `roomTtl` | `number` | `0` | 房间 TTL（秒），0 = 不过期 |
| `snapshotTtl` | `number` | `86400` | 快照 TTL（秒） |
| `channel` | `string` | `'distributed:events'` | Pub/Sub 频道名 |

**功能特性：**
- 带自动心跳 TTL 的服务器注册
- 跨服务器查找的房间注册
- 可配置 TTL 的状态快照
- 跨服务器事件的 Pub/Sub
- 使用 Redis SET NX 的分布式锁

### 自定义适配器

```typescript
import type { IDistributedAdapter } from '@esengine/server';

class MyAdapter implements IDistributedAdapter {
    // 生命周期
    async connect(): Promise<void> { }
    async disconnect(): Promise<void> { }
    isConnected(): boolean { return true; }

    // 服务器注册
    async registerServer(server: ServerRegistration): Promise<void> { }
    async unregisterServer(serverId: string): Promise<void> { }
    async heartbeat(serverId: string): Promise<void> { }
    async getServers(): Promise<ServerRegistration[]> { return []; }

    // 房间注册
    async registerRoom(room: RoomRegistration): Promise<void> { }
    async unregisterRoom(roomId: string): Promise<void> { }
    async queryRooms(query: RoomQuery): Promise<RoomRegistration[]> { return []; }
    async findAvailableRoom(roomType: string): Promise<RoomRegistration | null> { return null; }

    // 状态快照
    async saveSnapshot(snapshot: RoomSnapshot): Promise<void> { }
    async loadSnapshot(roomId: string): Promise<RoomSnapshot | null> { return null; }

    // 发布/订阅
    async publish(event: DistributedEvent): Promise<void> { }
    async subscribe(pattern: string, handler: Function): Promise<() => void> { return () => {}; }

    // 分布式锁
    async acquireLock(key: string, ttlMs: number): Promise<boolean> { return true; }
    async releaseLock(key: string): Promise<void> { }
}
```

## 玩家路由流程

```
客户端                    服务器 A                    服务器 B
  │                          │                           │
  │─── joinOrCreate ────────►│                           │
  │                          │                           │
  │                          │── findAvailableRoom() ───►│
  │                          │◄──── 服务器 B 上有房间 ────│
  │                          │                           │
  │◄─── redirect: B:3001 ────│                           │
  │                          │                           │
  │───────────────── 连接到服务器 B ────────────────────►│
  │                          │                           │
  │◄─────────────────────────────── 已加入 ─────────────│
```

## 事件类型

分布式系统发布以下事件：

| 事件 | 描述 |
|------|------|
| `server:online` | 服务器上线 |
| `server:offline` | 服务器离线 |
| `server:draining` | 服务器正在排空 |
| `room:created` | 房间已创建 |
| `room:disposed` | 房间已销毁 |
| `room:updated` | 房间信息已更新 |
| `room:message` | 跨服务器房间消息 |
| `room:migrated` | 房间已迁移到其他服务器 |
| `player:joined` | 玩家加入房间 |
| `player:left` | 玩家离开房间 |

## 最佳实践

1. **使用唯一服务器 ID** - 使用主机名、容器 ID 或 UUID

2. **配置合适的心跳** - 在新鲜度和网络开销之间平衡

3. **为有状态房间启用快照** - 确保房间状态在服务器重启后存活

4. **优雅处理重定向** - 客户端应重新连接到目标服务器
   ```typescript
   // 客户端处理重定向
   if (response.redirect) {
       await client.disconnect();
       await client.connect(response.redirect);
       await client.joinRoom(roomId);
   }
   ```

5. **使用分布式锁** - 防止 joinOrCreate 中的竞态条件

## 使用 createServer 集成

最简单的使用方式是通过 `createServer` 的 `distributed` 配置：

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

当客户端调用 `JoinRoom` API 时，服务器会自动：
1. 查找可用房间（本地或远程）
2. 如果房间在其他服务器，发送 `$redirect` 消息给客户端
3. 客户端收到重定向消息后连接到目标服务器

## 负载均衡

使用 `LoadBalancedRouter` 进行服务器选择：

```typescript
import { LoadBalancedRouter, createLoadBalancedRouter } from '@esengine/server';

// 使用工厂函数
const router = createLoadBalancedRouter('least-players');

// 或直接创建
const router = new LoadBalancedRouter({
    strategy: 'least-rooms',  // 选择房间数最少的服务器
    preferLocal: true         // 优先选择本地服务器
});

// 可用策略
// - 'round-robin': 轮询
// - 'least-rooms': 最少房间数
// - 'least-players': 最少玩家数
// - 'random': 随机选择
// - 'weighted': 权重（基于容量使用率）
```

## 故障转移

当服务器离线时，启用 `enableFailover` 后系统会自动：

1. 检测到服务器离线（通过心跳超时）
2. 查询该服务器上的所有房间
3. 使用分布式锁防止多服务器同时恢复
4. 从快照恢复房间状态
5. 发布 `room:migrated` 事件通知其他服务器

```typescript
// 确保定期保存快照
const manager = new DistributedRoomManager(adapter, {
    serverId: 'server-1',
    serverAddress: 'localhost',
    serverPort: 3000,
    snapshotInterval: 30000,  // 每 30 秒保存快照
    enableFailover: true      // 启用故障转移
}, sendFn);
```

## 后续版本

- Redis Cluster 支持
- 更多负载均衡策略（地理位置、延迟感知）
