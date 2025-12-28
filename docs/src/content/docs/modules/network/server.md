---
title: "服务器端"
description: "使用 @esengine/server 构建游戏服务器"
---

## 快速开始

使用 CLI 创建新的游戏服务器项目：

```bash
# 使用 npm
npm create esengine-server my-game-server

# 使用 pnpm
pnpm create esengine-server my-game-server

# 使用 yarn
yarn create esengine-server my-game-server
```

生成的项目结构：

```
my-game-server/
├── src/
│   ├── shared/              # 共享协议（客户端服务端通用）
│   │   ├── protocol.ts      # 类型定义
│   │   └── index.ts
│   ├── server/              # 服务端代码
│   │   ├── main.ts          # 入口
│   │   └── rooms/
│   │       └── GameRoom.ts  # 游戏房间
│   └── client/              # 客户端示例
│       └── index.ts
├── package.json
└── tsconfig.json
```

启动服务器：

```bash
# 开发模式（热重载）
npm run dev

# 生产模式
npm run start
```

## createServer

创建游戏服务器实例：

```typescript
import { createServer } from '@esengine/server'
import { GameRoom } from './rooms/GameRoom.js'

const server = await createServer({
    port: 3000,
    onConnect(conn) {
        console.log('Client connected:', conn.id)
    },
    onDisconnect(conn) {
        console.log('Client disconnected:', conn.id)
    },
})

// 注册房间类型
server.define('game', GameRoom)

// 启动服务器
await server.start()
```

### 配置选项

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `port` | `number` | `3000` | WebSocket 端口 |
| `tickRate` | `number` | `20` | 全局 Tick 频率 (Hz) |
| `apiDir` | `string` | `'src/api'` | API 处理器目录 |
| `msgDir` | `string` | `'src/msg'` | 消息处理器目录 |
| `onStart` | `(port) => void` | - | 启动回调 |
| `onConnect` | `(conn) => void` | - | 连接回调 |
| `onDisconnect` | `(conn) => void` | - | 断开回调 |

## Room 系统

Room 是游戏房间的基类，管理玩家和游戏状态。

### 定义房间

```typescript
import { Room, Player, onMessage } from '@esengine/server'
import type { MsgMove, MsgChat } from '../../shared/index.js'

interface PlayerData {
    name: string
    x: number
    y: number
}

export class GameRoom extends Room<{ players: any[] }, PlayerData> {
    // 配置
    maxPlayers = 8
    tickRate = 20
    autoDispose = true

    // 房间状态
    state = {
        players: [],
    }

    // 生命周期
    onCreate() {
        console.log(`Room ${this.id} created`)
    }

    onJoin(player: Player<PlayerData>) {
        player.data.name = 'Player_' + player.id.slice(-4)
        player.data.x = Math.random() * 800
        player.data.y = Math.random() * 600

        this.broadcast('Joined', {
            playerId: player.id,
            playerName: player.data.name,
        })
    }

    onLeave(player: Player<PlayerData>) {
        this.broadcast('Left', { playerId: player.id })
    }

    onTick(dt: number) {
        // 状态同步
        this.broadcast('Sync', { players: this.state.players })
    }

    onDispose() {
        console.log(`Room ${this.id} disposed`)
    }

    // 消息处理
    @onMessage('Move')
    handleMove(data: MsgMove, player: Player<PlayerData>) {
        player.data.x = data.x
        player.data.y = data.y
    }

    @onMessage('Chat')
    handleChat(data: MsgChat, player: Player<PlayerData>) {
        this.broadcast('Chat', {
            from: player.data.name,
            text: data.text,
        })
    }
}
```

### Room 配置

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `maxPlayers` | `number` | `10` | 最大玩家数 |
| `tickRate` | `number` | `20` | Tick 频率 (Hz) |
| `autoDispose` | `boolean` | `true` | 空房间自动销毁 |

### Room API

```typescript
class Room<TState, TPlayerData> {
    readonly id: string           // 房间 ID
    readonly players: Player[]    // 所有玩家
    readonly playerCount: number  // 玩家数量
    readonly isLocked: boolean    // 是否锁定
    state: TState                 // 房间状态

    // 广播消息给所有玩家
    broadcast<T>(type: string, data: T): void

    // 广播消息给除某玩家外的所有人
    broadcastExcept<T>(type: string, data: T, except: Player): void

    // 获取玩家
    getPlayer(id: string): Player | undefined

    // 踢出玩家
    kick(player: Player, reason?: string): void

    // 锁定/解锁房间
    lock(): void
    unlock(): void

    // 销毁房间
    dispose(): void
}
```

### 生命周期方法

| 方法 | 触发时机 | 用途 |
|------|----------|------|
| `onCreate()` | 房间创建时 | 初始化游戏状态 |
| `onJoin(player)` | 玩家加入时 | 欢迎消息、分配位置 |
| `onLeave(player)` | 玩家离开时 | 清理玩家数据 |
| `onTick(dt)` | 每帧调用 | 游戏逻辑、状态同步 |
| `onDispose()` | 房间销毁前 | 保存数据、清理资源 |

## Player 类

Player 代表房间中的一个玩家连接。

```typescript
class Player<TData = Record<string, unknown>> {
    readonly id: string          // 玩家 ID
    readonly roomId: string      // 所在房间 ID
    data: TData                  // 自定义数据

    // 发送消息给此玩家
    send<T>(type: string, data: T): void

    // 离开房间
    leave(): void
}
```

## @onMessage 装饰器

使用装饰器简化消息处理：

```typescript
import { Room, Player, onMessage } from '@esengine/server'

class GameRoom extends Room {
    @onMessage('Move')
    handleMove(data: { x: number; y: number }, player: Player) {
        // 处理移动
    }

    @onMessage('Attack')
    handleAttack(data: { targetId: string }, player: Player) {
        // 处理攻击
    }
}
```

## 协议定义

在 `src/shared/protocol.ts` 中定义客户端和服务端共享的类型：

```typescript
// API 请求/响应
export interface JoinRoomReq {
    roomType: string
    playerName: string
}

export interface JoinRoomRes {
    roomId: string
    playerId: string
}

// 游戏消息
export interface MsgMove {
    x: number
    y: number
}

export interface MsgChat {
    text: string
}

// 服务端广播
export interface BroadcastSync {
    players: PlayerState[]
}

export interface PlayerState {
    id: string
    name: string
    x: number
    y: number
}
```

## 客户端连接

```typescript
import { connect } from '@esengine/rpc/client'

const client = await connect('ws://localhost:3000')

// 加入房间
const { roomId, playerId } = await client.call('JoinRoom', {
    roomType: 'game',
    playerName: 'Alice',
})

// 监听广播
client.onMessage('Sync', (data) => {
    console.log('State:', data.players)
})

client.onMessage('Joined', (data) => {
    console.log('Player joined:', data.playerName)
})

// 发送消息
client.send('RoomMessage', {
    type: 'Move',
    payload: { x: 100, y: 200 },
})
```

## 最佳实践

1. **合理设置 Tick 频率**
   - 回合制游戏：5-10 Hz
   - 休闲游戏：10-20 Hz
   - 动作游戏：20-60 Hz

2. **使用共享协议**
   - 在 `shared/` 目录定义所有类型
   - 客户端和服务端都从这里导入

3. **状态验证**
   - 服务器应验证客户端输入
   - 不信任客户端发送的任何数据

4. **断线处理**
   - 实现断线重连逻辑
   - 使用 `onLeave` 保存玩家状态

5. **房间生命周期**
   - 使用 `autoDispose` 自动清理空房间
   - 在 `onDispose` 中保存重要数据
