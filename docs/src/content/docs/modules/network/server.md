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
| `httpDir` | `string` | `'src/http'` | HTTP 路由目录 |
| `httpPrefix` | `string` | `'/api'` | HTTP 路由前缀 |
| `cors` | `boolean \| CorsOptions` | - | CORS 配置 |
| `onStart` | `(port) => void` | - | 启动回调 |
| `onConnect` | `(conn) => void` | - | 连接回调 |
| `onDisconnect` | `(conn) => void` | - | 断开回调 |

## HTTP 路由

支持 HTTP API 与 WebSocket 共用端口，适用于登录、注册等场景。

### 文件路由

在 `httpDir` 目录下创建路由文件，自动映射为 HTTP 端点：

```
src/http/
├── login.ts       → POST /api/login
├── register.ts    → POST /api/register
├── health.ts      → GET  /api/health (需设置 method: 'GET')
└── users/
    └── [id].ts    → POST /api/users/:id (动态路由)
```

### 定义路由

使用 `defineHttp` 定义类型安全的路由处理器：

```typescript
// src/http/login.ts
import { defineHttp } from '@esengine/server'

interface LoginBody {
    username: string
    password: string
}

export default defineHttp<LoginBody>({
    method: 'POST',  // 默认 POST，可选 GET/PUT/DELETE/PATCH
    handler(req, res) {
        const { username, password } = req.body

        // 验证凭证...
        if (!isValid(username, password)) {
            res.error(401, 'Invalid credentials')
            return
        }

        // 生成 token...
        res.json({ token: '...', userId: '...' })
    }
})
```

### 请求对象 (HttpRequest)

```typescript
interface HttpRequest {
    raw: IncomingMessage     // Node.js 原始请求
    method: string           // 请求方法
    path: string             // 请求路径
    query: Record<string, string>  // 查询参数
    headers: Record<string, string | string[] | undefined>
    body: unknown            // 解析后的 JSON 请求体
    ip: string               // 客户端 IP
}
```

### 响应对象 (HttpResponse)

```typescript
interface HttpResponse {
    raw: ServerResponse      // Node.js 原始响应
    status(code: number): HttpResponse   // 设置状态码（链式）
    header(name: string, value: string): HttpResponse  // 设置头（链式）
    json(data: unknown): void            // 发送 JSON
    text(data: string): void             // 发送文本
    error(code: number, message: string): void  // 发送错误
}
```

### 使用示例

```typescript
// 完整的登录服务器示例
import { createServer, defineHttp } from '@esengine/server'
import { createJwtAuthProvider, withAuth } from '@esengine/server/auth'

const jwtProvider = createJwtAuthProvider({
    secret: process.env.JWT_SECRET!,
    expiresIn: 3600 * 24,
})

const server = await createServer({
    port: 8080,
    httpDir: 'src/http',
    httpPrefix: '/api',
    cors: true,
})

// 包装认证（WebSocket 连接验证 token）
const authServer = withAuth(server, {
    provider: jwtProvider,
    extractCredentials: (req) => {
        const url = new URL(req.url, 'http://localhost')
        return url.searchParams.get('token')
    },
})

await authServer.start()
// HTTP: http://localhost:8080/api/*
// WebSocket: ws://localhost:8080?token=xxx
```

### 内联路由

也可以直接在配置中定义路由（与文件路由合并，内联优先）：

```typescript
const server = await createServer({
    port: 8080,
    http: {
        '/health': {
            GET: (req, res) => res.json({ status: 'ok' }),
        },
        '/webhook': async (req, res) => {
            // 接受所有方法
            await handleWebhook(req.body)
            res.json({ received: true })
        },
    },
})
```

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

## ECSRoom

`ECSRoom` 是带有 ECS World 支持的房间基类，适用于需要 ECS 架构的游戏。

### 服务端启动

```typescript
import { Core } from '@esengine/ecs-framework';
import { createServer } from '@esengine/server';
import { GameRoom } from './rooms/GameRoom.js';

// 初始化 Core
Core.create();

// 全局游戏循环
setInterval(() => Core.update(1/60), 16);

// 创建服务器
const server = await createServer({ port: 3000 });
server.define('game', GameRoom);
await server.start();
```

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

4. **断线处理**
   - 实现断线重连逻辑
   - 使用 `onLeave` 保存玩家状态

5. **房间生命周期**
   - 使用 `autoDispose` 自动清理空房间
   - 在 `onDispose` 中保存重要数据
