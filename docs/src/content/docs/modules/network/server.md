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
| `port` | `number` | `3000` | WebSocket 端口。设为 `0` 时自动分配随机可用端口 |
| `tickRate` | `number` | `20` | 全局 Tick 频率 (Hz) |
| `duplicateJoinPolicy` | `'auto-leave' \| 'reject'` | `'auto-leave'` | 同一连接重复加入房间的策略。`'auto-leave'` 自动离开旧房间，`'reject'` 拒绝加入 |
| `apiDir` | `string` | `'src/api'` | API 处理器目录 |
| `msgDir` | `string` | `'src/msg'` | 消息处理器目录 |
| `httpDir` | `string` | `'src/http'` | HTTP 路由目录 |
| `httpPrefix` | `string` | `'/api'` | HTTP 路由前缀 |
| `http` | `HttpRoutes` | - | 内联 HTTP 路由定义 |
| `cors` | `boolean \| CorsOptions` | - | CORS 配置 |
| `onStart` | `(port) => void` | - | 启动回调 |
| `onConnect` | `(conn) => void` | - | 连接回调 |
| `onDisconnect` | `(conn) => void` | - | 断开回调 |

### GameServer 接口

```typescript
interface GameServer {
    readonly connections: ReadonlyArray<ServerConnection>  // 所有连接
    readonly tick: number                                  // 当前 tick
    readonly port: number                                  // 实际监听端口

    define(name: string, roomClass: new () => Room): void  // 注册房间类型
    start(): Promise<void>                                 // 启动服务器
    stop(): Promise<void>                                  // 停止服务器
    broadcast(name: string, data: unknown): void           // 广播给所有连接
    send(conn: ServerConnection, name: string, data: unknown): void  // 发送给指定连接
}
```

> 当 `port` 设为 `0` 时，服务器启动后可通过 `server.port` 获取实际分配的端口号，适用于测试场景。

## HTTP 路由

支持 HTTP API 与 WebSocket 共用端口，适用于登录、注册等场景。

```typescript
const server = await createServer({
    port: 3000,
    httpDir: './src/http',   // HTTP 路由目录
    httpPrefix: '/api',       // 路由前缀
    cors: true,

    // 或内联定义
    http: {
        '/health': (req, res) => res.json({ status: 'ok' })
    }
})
```

```typescript
// src/http/login.ts
import { defineHttp } from '@esengine/server'

export default defineHttp<{ username: string; password: string }>({
    method: 'POST',
    handler(req, res) {
        const { username, password } = req.body
        // 验证并返回 token...
        res.json({ token: '...' })
    }
})
```

> 详细文档请参考 [HTTP 路由](/modules/network/http)

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
    metadata = { gameMode: 'default' }

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
| `maxPlayers` | `number` | `16` | 最大玩家数 |
| `tickRate` | `number` | `0` | Tick 频率 (Hz)，`0` 表示不自动 tick |
| `autoDispose` | `boolean` | `true` | 空房间自动销毁 |
| `reconnectGracePeriod` | `number` | `0` | 断线重连宽限期（毫秒），`0` 表示禁用重连 |
| `metadata` | `Record<string, unknown>` | `{}` | 房间元数据，在 `ListRooms` 和 `GetRoomInfo` 中可见 |

### Room API

```typescript
class Room<TState, TPlayerData> {
    readonly id: string           // 房间 ID
    readonly players: Player[]    // 所有玩家
    readonly playerCount: number  // 玩家数量
    readonly isLocked: boolean    // 是否锁定
    state: TState                 // 房间状态
    metadata: Record<string, unknown>  // 房间元数据

    // 广播消息给所有玩家（可排除指定玩家）
    broadcast<T>(type: string, data: T, options?: {
        exclude?: Player | Player[]
    }): void

    // 已废弃，请使用 broadcast(type, data, { exclude: player }) 代替
    /** @deprecated */
    broadcastExcept<T>(except: Player, type: string, data: T): void

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

`broadcast` 方法通过 `options.exclude` 参数支持排除玩家：

```typescript
// 广播给所有人
this.broadcast('Chat', { text: 'hello' })

// 排除发送者
this.broadcast('Move', data, { exclude: player })

// 排除多个玩家
this.broadcast('Event', data, { exclude: [p1, p2] })
```

### 生命周期方法

| 方法 | 触发时机 | 用途 |
|------|----------|------|
| `onCreate(options?)` | 房间创建时 | 初始化游戏状态 |
| `onJoin(player)` | 玩家加入时 | 欢迎消息、分配位置 |
| `onLeave(player, reason?)` | 玩家真正离开时 | 清理玩家数据 |
| `onPlayerDisconnected(player)` | 玩家断线时（宽限期内） | 通知其他玩家、暂停逻辑 |
| `onPlayerReconnected(player)` | 玩家重连时 | 恢复状态、通知其他玩家 |
| `onTick(dt)` | 每帧调用 | 游戏逻辑、状态同步 |
| `onDispose()` | 房间销毁前 | 保存数据、清理资源 |

> `onPlayerDisconnected` 和 `onPlayerReconnected` 仅在 `reconnectGracePeriod > 0` 时触发。断线后如果超过宽限期未重连，才会触发 `onLeave`。

## Player 类

Player 代表房间中的一个玩家连接。

```typescript
class Player<TData = Record<string, unknown>> {
    readonly id: string          // 玩家 ID
    readonly roomId: string      // 所在房间 ID
    readonly sessionToken: string  // 会话令牌（用于断线重连）
    readonly connected: boolean  // 是否在线
    data: TData                  // 自定义数据

    // 发送消息给此玩家
    send<T>(type: string, data: T): void

    // 发送二进制数据给此玩家
    sendBinary(data: Uint8Array): void

    // 离开房间
    leave(reason?: string): void
}
```

`sessionToken` 在玩家加入房间时自动生成，客户端应保存此令牌以便断线后重连。`connected` 属性反映玩家当前的连接状态，断线后变为 `false`，重连后恢复为 `true`。

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

## 内置 API

服务器启动后自动注册以下 API，客户端通过 `client.call(name, input)` 调用。

### JoinRoom

加入或创建房间。

- **输入**: `{ roomType?: string, roomId?: string, options?: Record<string, unknown>, playerData?: Record<string, unknown> }`
- **返回**: `{ roomId: string, playerId: string, sessionToken: string }`

传入 `roomType` 时自动匹配或创建房间，传入 `roomId` 时加入指定房间。`playerData` 会作为玩家的初始数据。返回的 `sessionToken` 用于断线重连。

### LeaveRoom

离开当前房间。

- **输入**: `{}`
- **返回**: `{ success: true }`

### ReconnectRoom

使用会话令牌重连到之前的房间。

- **输入**: `{ sessionToken: string }`
- **返回**: `{ roomId: string, playerId: string, sessionToken: string }`

重连成功后触发房间的 `onPlayerReconnected` 回调。仅在房间设置了 `reconnectGracePeriod > 0` 且在宽限期内有效。

### ListRooms

列出所有房间（可按类型筛选）。

- **输入**: `{ type?: string }`
- **返回**: `{ rooms: Array<{ roomId: string, playerCount: number, maxPlayers: number, locked: boolean, metadata: Record<string, unknown> }> }`

### GetRoomInfo

获取指定房间的详细信息。

- **输入**: `{ roomId: string }`
- **返回**: `{ roomId: string, playerCount: number, maxPlayers: number, locked: boolean, metadata: Record<string, unknown>, players: Array<{ id: string }> }`

### Authenticate

认证连接。需要先通过 `withAuth()` 配置认证提供者。

- **输入**: `{ token: string }`
- **返回**: `{ success: boolean, user?: unknown, error?: string }`

## 断线重连

通过设置 `reconnectGracePeriod` 启用断线重连功能。断线后玩家不会立即被移除，而是在宽限期内保留状态，等待重连。

### 服务端配置

```typescript
import { Room, Player } from '@esengine/server'

class GameRoom extends Room {
    reconnectGracePeriod = 10000  // 10 秒宽限期

    onPlayerDisconnected(player: Player) {
        // 玩家断线，通知其他人
        this.broadcast('PlayerOffline', { playerId: player.id }, { exclude: player })
    }

    onPlayerReconnected(player: Player) {
        // 玩家重连，恢复状态
        this.broadcast('PlayerOnline', { playerId: player.id }, { exclude: player })
        // 发送当前游戏状态给重连玩家
        player.send('GameState', this.state)
    }

    onLeave(player: Player) {
        // 宽限期超时或主动离开，才会触发
        this.broadcast('PlayerLeft', { playerId: player.id })
    }
}
```

### 客户端重连

```typescript
const client = await connect('ws://localhost:3000')

// 加入房间时保存 sessionToken
const { roomId, playerId, sessionToken } = await client.call('JoinRoom', {
    roomType: 'game',
})

// 断线后使用 sessionToken 重连
const result = await client.call('ReconnectRoom', { sessionToken })
```

## Schema 验证

使用内置的 Schema 验证系统进行运行时类型验证：

### 基础用法

```typescript
import { s, defineApiWithSchema } from '@esengine/server'

// 定义 Schema
const MoveSchema = s.object({
    x: s.number(),
    y: s.number(),
    speed: s.number().optional()
})

// 类型自动推断
type Move = s.infer<typeof MoveSchema>  // { x: number; y: number; speed?: number }

// 使用 Schema 定义 API（自动验证）
export default defineApiWithSchema(MoveSchema, {
    handler(req, ctx) {
        // req 已验证，类型安全
        console.log(req.x, req.y)
    }
})
```

### 验证器类型

| 类型 | 示例 | 描述 |
|------|------|------|
| `s.string()` | `s.string().min(1).max(50)` | 字符串，支持长度限制 |
| `s.number()` | `s.number().min(0).int()` | 数字，支持范围和整数限制 |
| `s.boolean()` | `s.boolean()` | 布尔值 |
| `s.literal()` | `s.literal('admin')` | 字面量类型 |
| `s.object()` | `s.object({ name: s.string() })` | 对象 |
| `s.array()` | `s.array(s.number())` | 数组 |
| `s.enum()` | `s.enum(['a', 'b'] as const)` | 枚举 |
| `s.union()` | `s.union([s.string(), s.number()])` | 联合类型 |
| `s.record()` | `s.record(s.any())` | 记录类型 |

### 修饰符

```typescript
// 可选字段
s.string().optional()

// 默认值
s.number().default(0)

// 可为 null
s.string().nullable()

// 字符串验证
s.string().min(1).max(100).email().url().regex(/^[a-z]+$/)

// 数字验证
s.number().min(0).max(100).int().positive()

// 数组验证
s.array(s.string()).min(1).max(10).nonempty()

// 对象验证
s.object({ ... }).strict()  // 不允许额外字段
s.object({ ... }).partial() // 所有字段可选
s.object({ ... }).pick('name', 'age')  // 选择字段
s.object({ ... }).omit('password')     // 排除字段
```

### 消息验证

```typescript
import { s, defineMsgWithSchema } from '@esengine/server'

const InputSchema = s.object({
    keys: s.array(s.string()),
    timestamp: s.number()
})

export default defineMsgWithSchema(InputSchema, {
    handler(msg, ctx) {
        // msg 已验证
        console.log(msg.keys, msg.timestamp)
    }
})
```

### 手动验证

```typescript
import { s, parse, safeParse, createGuard } from '@esengine/server'

const UserSchema = s.object({
    name: s.string(),
    age: s.number().int().min(0)
})

// 抛出错误
const user = parse(UserSchema, data)

// 返回结果对象
const result = safeParse(UserSchema, data)
if (result.success) {
    console.log(result.data)
} else {
    console.error(result.error)
}

// 类型守卫
const isUser = createGuard(UserSchema)
if (isUser(data)) {
    // data 是 User 类型
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
    sessionToken: string
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

// 加入房间（返回 sessionToken 用于断线重连）
const { roomId, playerId, sessionToken } = await client.call('JoinRoom', {
    roomType: 'game',
    playerData: { name: 'Alice' },
})

// 查询房间列表
const { rooms } = await client.call('ListRooms', { type: 'game' })
console.log('Available rooms:', rooms)

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

// 断线后重连
const reconnected = await client.call('ReconnectRoom', { sessionToken })
```

## ECSRoom

`ECSRoom` 是带有 ECS World 支持的房间基类，适用于需要 ECS 架构的游戏。ECSRoom 会自动初始化 Core（如果尚未初始化），无需手动调用 `Core.create()`。

### 服务端启动

```typescript
import { createServer } from '@esengine/server';
import { GameRoom } from './rooms/GameRoom.js';

const server = await createServer({ port: 3000 });
server.define('game', GameRoom);
await server.start();
```

> ECSRoom 在构造时自动检测 Core 是否已初始化，若未初始化则自动调用 `Core.create({ runtimeEnvironment: 'server' })`。如需自定义 Core 初始化参数，可在创建服务器前手动调用 `Core.create()`。

### 定义 ECSRoom

```typescript
import { ECSRoom, Player } from '@esengine/server/ecs';
import { Component, ECSComponent, sync } from '@esengine/ecs-framework';

// 定义同步组件
@ECSComponent('Player')
class PlayerComponent extends Component {
    @sync("string") name: string = "";
    @sync("uint16") score: number = 0;
    @sync("float32") x: number = 0;
    @sync("float32") y: number = 0;
}

// 定义房间
class GameRoom extends ECSRoom {
    onCreate() {
        this.addSystem(new MovementSystem());
    }

    onJoin(player: Player) {
        const entity = this.createPlayerEntity(player.id);
        const comp = entity.addComponent(new PlayerComponent());
        comp.name = player.id;
    }
}
```

### ECSRoom API

```typescript
abstract class ECSRoom<TState, TPlayerData> extends Room<TState, TPlayerData> {
    protected readonly world: World;     // ECS World
    protected readonly scene: Scene;     // 主场景

    // 场景管理
    protected addSystem(system: EntitySystem): void;
    protected createEntity(name?: string): Entity;
    protected createPlayerEntity(playerId: string, name?: string): Entity;
    protected getPlayerEntity(playerId: string): Entity | undefined;
    protected destroyPlayerEntity(playerId: string): void;

    // 状态同步
    protected sendFullState(player: Player): void;
    protected broadcastSpawn(entity: Entity, prefabType?: string): void;
    protected broadcastDelta(): void;
}
```

### @sync 装饰器

标记需要网络同步的组件字段：

| 类型 | 描述 | 字节数 |
|------|------|--------|
| `"boolean"` | 布尔值 | 1 |
| `"int8"` / `"uint8"` | 8位整数 | 1 |
| `"int16"` / `"uint16"` | 16位整数 | 2 |
| `"int32"` / `"uint32"` | 32位整数 | 4 |
| `"float32"` | 32位浮点 | 4 |
| `"float64"` | 64位浮点 | 8 |
| `"string"` | 字符串 | 变长 |

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

4. **断线重连**
   - 设置 `reconnectGracePeriod` 启用重连
   - 在 `onPlayerDisconnected` 中通知其他玩家
   - 在 `onPlayerReconnected` 中恢复游戏状态
   - 客户端保存 `sessionToken` 用于重连

5. **房间生命周期**
   - 使用 `autoDispose` 自动清理空房间
   - 在 `onDispose` 中保存重要数据

6. **房间元数据**
   - 在 `onCreate` 中设置 `metadata` 提供房间筛选信息
   - 客户端通过 `ListRooms` 查看房间的 `metadata`
