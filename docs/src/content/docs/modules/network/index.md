---
title: "网络同步系统 (Network)"
description: "基于 TSRPC 的多人游戏网络同步解决方案"
---

`@esengine/network` 提供基于 TSRPC 的客户端-服务器网络同步解决方案，用于多人游戏的实体同步、输入处理和状态插值。

## 概述

网络模块由三个包组成：

| 包名 | 描述 |
|------|------|
| `@esengine/network` | 客户端 ECS 插件 |
| `@esengine/network-protocols` | 共享协议定义 |
| `@esengine/network-server` | 服务器端实现 |

## 安装

```bash
# 客户端
npm install @esengine/network

# 服务器端
npm install @esengine/network-server
```

## 架构

```
客户端                              服务器
┌────────────────┐                ┌────────────────┐
│ NetworkPlugin  │◄──── WS ────► │  GameServer    │
│ ├─ Service     │                │  ├─ Room       │
│ ├─ SyncSystem  │                │  └─ Players    │
│ ├─ SpawnSystem │                └────────────────┘
│ └─ InputSystem │
└────────────────┘
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
    identity.bIsLocalPlayer = spawn.ownerId === networkPlugin.networkService.clientId;

    entity.addComponent(new NetworkTransform());
    return entity;
});

// 连接服务器
const success = await networkPlugin.connect('ws://localhost:3000', 'PlayerName');
if (success) {
    console.log('Connected!');
}
```

### 服务器端

```typescript
import { GameServer } from '@esengine/network-server';

const server = new GameServer({
    port: 3000,
    roomConfig: {
        maxPlayers: 16,
        tickRate: 20
    }
});

await server.start();
console.log('Server started on ws://localhost:3000');
```

## 使用 CLI 快速创建

推荐使用 ESEngine CLI 快速创建完整的游戏服务端项目：

```bash
mkdir my-game-server && cd my-game-server
npm init -y
npx @esengine/cli init -p nodejs
```

生成的项目结构：

```
my-game-server/
├── src/
│   ├── index.ts
│   ├── server/
│   │   └── GameServer.ts
│   └── game/
│       ├── Game.ts
│       ├── scenes/
│       ├── components/
│       └── systems/
├── tsconfig.json
└── package.json
```

## 文档导航

- [客户端使用](/modules/network/client/) - NetworkPlugin、组件和系统
- [服务器端](/modules/network/server/) - GameServer 和 Room 管理
- [状态同步](/modules/network/sync/) - 插值、预测和快照
- [API 参考](/modules/network/api/) - 完整 API 文档

## 服务令牌

用于依赖注入：

```typescript
import {
    NetworkServiceToken,
    NetworkSyncSystemToken,
    NetworkSpawnSystemToken,
    NetworkInputSystemToken
} from '@esengine/network';

const networkService = services.get(NetworkServiceToken);
```

## 蓝图节点

网络模块提供可视化脚本支持：

- `IsLocalPlayer` - 检查实体是否为本地玩家
- `IsServer` - 检查是否运行在服务器端
- `HasAuthority` - 检查是否有权限控制实体
- `GetNetworkId` - 获取实体的网络 ID
- `GetLocalPlayerId` - 获取本地玩家 ID
