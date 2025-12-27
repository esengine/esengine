---
title: "服务器端"
description: "GameServer 和 Room 管理"
---

## GameServer

GameServer 是服务器端的核心类，管理 WebSocket 连接和房间。

### 基本用法

```typescript
import { GameServer } from '@esengine/network-server';

const server = new GameServer({
    port: 3000,
    roomConfig: {
        maxPlayers: 16,
        tickRate: 20
    }
});

// 启动服务器
await server.start();
console.log('Server started on ws://localhost:3000');

// 停止服务器
await server.stop();
```

### 配置选项

| 属性 | 类型 | 描述 |
|------|------|------|
| `port` | `number` | WebSocket 端口 |
| `roomConfig.maxPlayers` | `number` | 房间最大玩家数 |
| `roomConfig.tickRate` | `number` | 同步频率 (Hz) |

### 房间管理

```typescript
// 获取或创建房间
const room = server.getOrCreateRoom('room-id');

// 获取已存在的房间
const existingRoom = server.getRoom('room-id');

// 销毁房间
server.destroyRoom('room-id');
```

## Room

Room 类管理单个游戏房间的玩家和状态。

### API

```typescript
class Room {
    readonly id: string;
    readonly playerCount: number;
    readonly isFull: boolean;

    // 添加玩家
    addPlayer(name: string, connection: Connection): IPlayer | null;

    // 移除玩家
    removePlayer(clientId: number): void;

    // 获取玩家
    getPlayer(clientId: number): IPlayer | undefined;

    // 处理输入
    handleInput(clientId: number, input: IPlayerInput): void;

    // 销毁房间
    destroy(): void;
}
```

### 玩家接口

```typescript
interface IPlayer {
    clientId: number;        // 客户端 ID
    name: string;            // 玩家名称
    connection: Connection;  // 连接对象
    netId: number;           // 网络实体 ID
}
```

## 协议类型

### 消息类型

```typescript
// 状态同步消息
interface MsgSync {
    time: number;
    entities: IEntityState[];
}

// 实体状态
interface IEntityState {
    netId: number;
    pos?: Vec2;
    rot?: number;
}

// 生成消息
interface MsgSpawn {
    netId: number;
    ownerId: number;
    prefab: string;
    pos: Vec2;
    rot: number;
}

// 销毁消息
interface MsgDespawn {
    netId: number;
}

// 输入消息
interface MsgInput {
    input: IPlayerInput;
}

// 玩家输入
interface IPlayerInput {
    seq?: number;
    moveDir?: Vec2;
    actions?: string[];
}
```

### API 类型

```typescript
// 加入请求
interface ReqJoin {
    playerName: string;
    roomId?: string;
}

// 加入响应
interface ResJoin {
    clientId: number;
    roomId: string;
    playerCount: number;
}
```

## 使用 CLI 创建服务端

推荐使用 ESEngine CLI 快速创建完整的游戏服务端：

```bash
mkdir my-game-server && cd my-game-server
npm init -y
npx @esengine/cli init -p nodejs
```

生成的项目结构：

```
my-game-server/
├── src/
│   ├── index.ts                    # 入口文件
│   ├── server/
│   │   └── GameServer.ts           # 网络服务器配置
│   └── game/
│       ├── Game.ts                 # ECS 游戏主类
│       ├── scenes/
│       │   └── MainScene.ts        # 主场景
│       ├── components/             # ECS 组件
│       │   ├── PositionComponent.ts
│       │   └── VelocityComponent.ts
│       └── systems/                # ECS 系统
│           └── MovementSystem.ts
├── tsconfig.json
├── package.json
└── README.md
```

启动服务端：

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm run start
```

## 最佳实践

1. **合理设置同步频率**：根据游戏类型选择合适的 `tickRate`
   - 回合制游戏：5-10 Hz
   - 休闲游戏：10-20 Hz
   - 动作游戏：20-60 Hz

2. **房间大小控制**：根据服务器性能设置合理的 `maxPlayers`

3. **连接管理**：监听玩家连接/断开事件，处理异常情况

4. **状态验证**：服务器应验证客户端输入，防止作弊
