---
title: "网络同步系统 (Network)"
description: "基于 @esengine/rpc 的多人游戏网络同步解决方案"
---

`@esengine/network` 提供基于 `@esengine/rpc` 的类型安全网络同步解决方案，用于多人游戏的实体同步、输入处理和状态插值。

## 概述

网络模块由两个核心包组成：

| 包名 | 描述 |
|------|------|
| `@esengine/rpc` | 类型安全的 RPC 通信库 |
| `@esengine/network` | 基于 RPC 的游戏网络插件 |

## 安装

```bash
npm install @esengine/network
```

> `@esengine/rpc` 会作为依赖自动安装。

## 架构

```
客户端                              服务器
┌────────────────────┐            ┌────────────────┐
│ NetworkPlugin      │◄── WS ───►│  RpcServer     │
│ ├─ NetworkService  │            │  ├─ Protocol   │
│ ├─ SyncSystem      │            │  └─ Handlers   │
│ ├─ SpawnSystem     │            └────────────────┘
│ └─ InputSystem     │
└────────────────────┘
```

## 快速开始

### 客户端

```typescript
import { Core, Scene } from '@esengine/ecs-framework';
import { NetworkPlugin, NetworkIdentity, NetworkTransform } from '@esengine/network';

// 定义游戏场景
class GameScene extends Scene {
    initialize(): void {
        this.name = 'Game';
    }
}

// 初始化
Core.create({ debug: false });
const scene = new GameScene();
Core.setScene(scene);

// 安装网络插件
const networkPlugin = new NetworkPlugin();
await Core.installPlugin(networkPlugin);

// 注册预制体工厂
networkPlugin.registerPrefab('player', (scene, spawn) => {
    const entity = scene.createEntity(`player_${spawn.netId}`);

    const identity = entity.addComponent(new NetworkIdentity());
    identity.netId = spawn.netId;
    identity.ownerId = spawn.ownerId;
    identity.bIsLocalPlayer = spawn.ownerId === networkPlugin.localPlayerId;

    entity.addComponent(new NetworkTransform());
    return entity;
});

// 连接服务器
const success = await networkPlugin.connect({
    url: 'ws://localhost:3000',
    playerName: 'Player1',
    roomId: 'room-1'  // 可选
});

if (success) {
    console.log('Connected! Player ID:', networkPlugin.localPlayerId);
}
```

### 服务器端

```typescript
import { RpcServer } from '@esengine/rpc/server';
import { gameProtocol } from '@esengine/network';

const server = new RpcServer(gameProtocol, {
    port: 3000,
    onStart: (port) => console.log(`Server running on ws://localhost:${port}`)
});

// 注册 API 处理器
server.handle('join', async (input, ctx) => {
    const playerId = generatePlayerId();
    return { playerId, roomId: input.roomId ?? 'default' };
});

server.handle('leave', async (input, ctx) => {
    // 处理玩家离开
});

await server.start();
```

## 自定义协议

你可以基于 `@esengine/rpc` 定义自己的协议：

```typescript
import { rpc } from '@esengine/rpc';

// 定义自定义协议
export const myProtocol = rpc.define({
    api: {
        login: rpc.api<{ username: string }, { token: string }>(),
        getData: rpc.api<{ id: number }, { data: object }>(),
    },
    msg: {
        chat: rpc.msg<{ from: string; text: string }>(),
        notification: rpc.msg<{ type: string; content: string }>(),
    },
});

// 使用自定义协议创建服务
import { RpcService } from '@esengine/network';

const service = new RpcService(myProtocol);
await service.connect({ url: 'ws://localhost:3000' });

// 类型安全的 API 调用
const result = await service.call('login', { username: 'test' });
console.log(result.token);

// 类型安全的消息监听
service.on('chat', (data) => {
    console.log(`${data.from}: ${data.text}`);
});
```

## 文档导航

- [客户端使用](/modules/network/client/) - NetworkPlugin、组件和系统
- [服务器端](/modules/network/server/) - GameServer 和 Room 管理
- [分布式房间](/modules/network/distributed/) - 多服务器房间管理和玩家路由
- [状态同步](/modules/network/sync/) - 插值和快照缓冲
- [客户端预测](/modules/network/prediction/) - 输入预测和服务器校正
- [兴趣区域 (AOI)](/modules/network/aoi/) - 视野过滤和带宽优化
- [增量压缩](/modules/network/delta/) - 状态增量同步
- [API 参考](/modules/network/api/) - 完整 API 文档

## 服务令牌

用于依赖注入：

```typescript
import {
    NetworkServiceToken,
    NetworkSyncSystemToken,
    NetworkSpawnSystemToken,
    NetworkInputSystemToken,
    NetworkPredictionSystemToken,
    NetworkAOISystemToken,
} from '@esengine/network';

const networkService = services.get(NetworkServiceToken);
const predictionSystem = services.get(NetworkPredictionSystemToken);
const aoiSystem = services.get(NetworkAOISystemToken);
```

## 蓝图节点

网络模块提供可视化脚本支持：

- `IsLocalPlayer` - 检查实体是否为本地玩家
- `IsServer` - 检查是否运行在服务器端
- `HasAuthority` - 检查是否有权限控制实体
- `GetNetworkId` - 获取实体的网络 ID
- `GetLocalPlayerId` - 获取本地玩家 ID
