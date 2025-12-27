---
title: "网络同步系统 (Network)"
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

## 使用 CLI 快速创建服务端

推荐使用 ESEngine CLI 快速创建完整的游戏服务端项目：

```bash
# 创建项目目录
mkdir my-game-server && cd my-game-server
npm init -y

# 使用 CLI 初始化 Node.js 服务端
npx @esengine/cli init -p nodejs
```

CLI 会自动生成以下项目结构：

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

## 快速开始

### 客户端

```typescript
import { Core, Scene } from '@esengine/ecs-framework';
import {
    NetworkPlugin,
    NetworkIdentity,
    NetworkTransform
} from '@esengine/network';

// 定义游戏场景
class GameScene extends Scene {
    initialize(): void {
        this.name = 'Game';
        // 网络系统由 NetworkPlugin 自动添加
    }
}

// 初始化 Core
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
    identity.bIsLocalPlayer = spawn.ownerId === networkPlugin.networkService.localClientId;

    entity.addComponent(new NetworkTransform());
    return entity;
});

// 连接服务器
const success = await networkPlugin.connect('ws://localhost:3000', 'PlayerName');
if (success) {
    console.log('Connected!');
}

// 游戏循环
function gameLoop(dt: number) {
    Core.update(dt);
}

// 断开连接
await networkPlugin.disconnect();
```

### 服务器端

使用 CLI 创建服务端项目后，默认生成的代码已经配置好了 GameServer：

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

## 核心概念

### 架构

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

### 组件

#### NetworkIdentity

网络标识组件，每个网络同步的实体必须拥有：

```typescript
class NetworkIdentity extends Component {
    netId: number;           // 网络唯一 ID
    ownerId: number;         // 所有者客户端 ID
    bIsLocalPlayer: boolean; // 是否为本地玩家
    bHasAuthority: boolean;  // 是否有权限控制
}
```

#### NetworkTransform

网络变换组件，用于位置和旋转同步：

```typescript
class NetworkTransform extends Component {
    position: { x: number; y: number };
    rotation: number;
    velocity: { x: number; y: number };
}
```

### 系统

#### NetworkSyncSystem

处理服务器状态同步和插值：

- 接收服务器状态快照
- 将状态存入快照缓冲区
- 对远程实体进行插值平滑

#### NetworkSpawnSystem

处理实体的网络生成和销毁：

- 监听 Spawn/Despawn 消息
- 使用注册的预制体工厂创建实体
- 管理网络实体的生命周期

#### NetworkInputSystem

处理本地玩家输入的网络发送：

- 收集本地玩家输入
- 发送输入到服务器
- 支持移动和动作输入

## API 参考

### NetworkPlugin

```typescript
class NetworkPlugin {
    constructor(config: INetworkPluginConfig);

    // 安装插件
    install(services: ServiceContainer): void;

    // 连接服务器
    connect(playerName: string, roomId?: string): Promise<void>;

    // 断开连接
    disconnect(): void;

    // 注册预制体工厂
    registerPrefab(prefab: string, factory: PrefabFactory): void;

    // 属性
    readonly localPlayerId: number | null;
    readonly isConnected: boolean;
}
```

**配置选项：**

| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `serverUrl` | `string` | 是 | WebSocket 服务器地址 |

### NetworkService

网络服务，管理 WebSocket 连接：

```typescript
class NetworkService {
    // 连接状态
    readonly state: ENetworkState;
    readonly isConnected: boolean;
    readonly clientId: number | null;
    readonly roomId: string | null;

    // 连接控制
    connect(serverUrl: string): Promise<void>;
    disconnect(): void;

    // 加入房间
    join(playerName: string, roomId?: string): Promise<ResJoin>;

    // 发送输入
    sendInput(input: IPlayerInput): void;

    // 事件回调
    setCallbacks(callbacks: Partial<INetworkCallbacks>): void;
}
```

**网络状态枚举：**

```typescript
enum ENetworkState {
    Disconnected = 'disconnected',
    Connecting = 'connecting',
    Connected = 'connected',
    Joining = 'joining',
    Joined = 'joined'
}
```

**回调接口：**

```typescript
interface INetworkCallbacks {
    onConnected?: () => void;
    onDisconnected?: () => void;
    onJoined?: (clientId: number, roomId: string) => void;
    onSync?: (msg: MsgSync) => void;
    onSpawn?: (msg: MsgSpawn) => void;
    onDespawn?: (msg: MsgDespawn) => void;
}
```

### 预制体工厂

```typescript
type PrefabFactory = (scene: Scene, spawn: MsgSpawn) => Entity;
```

注册预制体工厂用于网络实体的创建：

```typescript
networkPlugin.registerPrefab('enemy', (scene, spawn) => {
    const entity = scene.createEntity(`enemy_${spawn.netId}`);

    const identity = entity.addComponent(new NetworkIdentity());
    identity.netId = spawn.netId;
    identity.ownerId = spawn.ownerId;

    entity.addComponent(new NetworkTransform());
    entity.addComponent(new EnemyComponent());
    return entity;
});
```

### 输入系统

#### NetworkInputSystem

```typescript
class NetworkInputSystem extends EntitySystem {
    // 添加移动输入
    addMoveInput(x: number, y: number): void;

    // 添加动作输入
    addActionInput(action: string): void;

    // 清除输入
    clearInput(): void;
}
```

使用示例：

```typescript
// 通过 NetworkPlugin 发送输入（推荐）
networkPlugin.sendMoveInput(0, 1);      // 移动
networkPlugin.sendActionInput('jump');  // 动作

// 或直接使用 inputSystem
const inputSystem = networkPlugin.inputSystem;
if (keyboard.isPressed('W')) {
    inputSystem.addMoveInput(0, 1);
}
if (keyboard.isPressed('Space')) {
    inputSystem.addActionInput('jump');
}
```

## 状态同步

### 快照缓冲区

用于存储服务器状态快照并进行插值：

```typescript
import { createSnapshotBuffer, type IStateSnapshot } from '@esengine/network';

const buffer = createSnapshotBuffer<IStateSnapshot>({
    maxSnapshots: 30,          // 最大快照数
    interpolationDelay: 100    // 插值延迟 (ms)
});

// 添加快照
buffer.addSnapshot({
    time: serverTime,
    entities: states
});

// 获取插值状态
const interpolated = buffer.getInterpolatedState(clientTime);
```

### 变换插值器

#### 线性插值器

```typescript
import { createTransformInterpolator } from '@esengine/network';

const interpolator = createTransformInterpolator();

// 添加状态
interpolator.addState(time, { x: 0, y: 0, rotation: 0 });

// 获取插值结果
const state = interpolator.getInterpolatedState(currentTime);
```

#### Hermite 插值器

使用 Hermite 样条实现更平滑的插值：

```typescript
import { createHermiteTransformInterpolator } from '@esengine/network';

const interpolator = createHermiteTransformInterpolator({
    bufferSize: 10
});

// 添加带速度的状态
interpolator.addState(time, {
    x: 100,
    y: 200,
    rotation: 0,
    vx: 5,
    vy: 0
});

// 获取平滑的插值结果
const state = interpolator.getInterpolatedState(currentTime);
```

### 客户端预测

实现客户端预测和服务器校正：

```typescript
import { createClientPrediction } from '@esengine/network';

const prediction = createClientPrediction({
    maxPredictedInputs: 60,
    reconciliationThreshold: 0.1
});

// 预测输入
const seq = prediction.predict(inputState, currentState, (state, input) => {
    // 应用输入到状态
    return applyInput(state, input);
});

// 服务器校正
const corrected = prediction.reconcile(
    serverState,
    serverSeq,
    (state, input) => applyInput(state, input)
);
```

## 服务器端

### GameServer

```typescript
import { GameServer } from '@esengine/network-server';

const server = new GameServer({
    port: 3000,
    roomConfig: {
        maxPlayers: 16,    // 房间最大玩家数
        tickRate: 20       // 同步频率 (Hz)
    }
});

// 启动服务器
await server.start();

// 获取房间
const room = server.getOrCreateRoom('room-id');

// 停止服务器
await server.stop();
```

### Room

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

**玩家接口：**

```typescript
interface IPlayer {
    clientId: number;    // 客户端 ID
    name: string;        // 玩家名称
    connection: Connection;  // 连接对象
    netId: number;       // 网络实体 ID
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

## 蓝图节点

网络模块提供了可视化脚本支持的蓝图节点：

- `IsLocalPlayer` - 检查实体是否为本地玩家
- `IsServer` - 检查是否运行在服务器端
- `HasAuthority` - 检查是否有权限控制实体
- `GetNetworkId` - 获取实体的网络 ID
- `GetLocalPlayerId` - 获取本地玩家 ID

## 服务令牌

用于依赖注入：

```typescript
import {
    NetworkServiceToken,
    NetworkSyncSystemToken,
    NetworkSpawnSystemToken,
    NetworkInputSystemToken
} from '@esengine/network';

// 获取服务
const networkService = services.get(NetworkServiceToken);
```

## 实际示例

### 完整的多人游戏客户端

```typescript
import { Core, Scene, EntitySystem, Matcher, Entity } from '@esengine/ecs-framework';
import {
    NetworkPlugin,
    NetworkIdentity,
    NetworkTransform
} from '@esengine/network';

// 定义游戏场景
class GameScene extends Scene {
    initialize(): void {
        this.name = 'MultiplayerGame';
        // 网络系统由 NetworkPlugin 自动添加
        // 添加自定义系统
        this.addSystem(new LocalInputHandler());
    }
}

// 初始化
async function initGame() {
    Core.create({ debug: false });

    const scene = new GameScene();
    Core.setScene(scene);

    // 安装网络插件
    const networkPlugin = new NetworkPlugin();
    await Core.installPlugin(networkPlugin);

    // 注册玩家预制体
    networkPlugin.registerPrefab('player', (scene, spawn) => {
        const entity = scene.createEntity(`player_${spawn.netId}`);

        const identity = entity.addComponent(new NetworkIdentity());
        identity.netId = spawn.netId;
        identity.ownerId = spawn.ownerId;
        identity.bIsLocalPlayer = spawn.ownerId === networkPlugin.networkService.localClientId;

        entity.addComponent(new NetworkTransform());

        // 如果是本地玩家，添加输入标记
        if (identity.bIsLocalPlayer) {
            entity.addComponent(new LocalInputComponent());
        }

        return entity;
    });

    // 连接服务器
    const success = await networkPlugin.connect('ws://localhost:3000', 'Player1');
    if (success) {
        console.log('已连接!');
    } else {
        console.error('连接失败');
    }

    return networkPlugin;
}

// 游戏循环
function gameLoop(deltaTime: number) {
    Core.update(deltaTime);
}

initGame();
```

### 处理输入

```typescript
class LocalInputHandler extends EntitySystem {
    private _networkPlugin: NetworkPlugin | null = null;

    constructor() {
        super(Matcher.empty().all(NetworkIdentity, LocalInputComponent));
    }

    protected onAddedToScene(): void {
        // 获取 NetworkPlugin 引用
        this._networkPlugin = Core.getPlugin(NetworkPlugin);
    }

    protected processEntity(entity: Entity, dt: number): void {
        if (!this._networkPlugin) return;

        const identity = entity.getComponent(NetworkIdentity)!;
        if (!identity.bIsLocalPlayer) return;

        // 读取键盘输入
        let moveX = 0;
        let moveY = 0;

        if (keyboard.isPressed('A')) moveX -= 1;
        if (keyboard.isPressed('D')) moveX += 1;
        if (keyboard.isPressed('W')) moveY += 1;
        if (keyboard.isPressed('S')) moveY -= 1;

        if (moveX !== 0 || moveY !== 0) {
            this._networkPlugin.sendMoveInput(moveX, moveY);
        }

        if (keyboard.isJustPressed('Space')) {
            this._networkPlugin.sendActionInput('jump');
        }
    }
}
```

## 最佳实践

1. **合理设置同步频率**：根据游戏类型选择合适的 `tickRate`，动作游戏通常需要 20-60 Hz

2. **使用插值延迟**：设置适当的 `interpolationDelay` 来平衡延迟和平滑度

3. **客户端预测**：对于本地玩家使用客户端预测减少输入延迟

4. **预制体管理**：为每种网络实体类型注册对应的预制体工厂

5. **权限检查**：使用 `bHasAuthority` 检查是否有权限修改实体

6. **连接状态**：监听连接状态变化，处理断线重连

```typescript
networkService.setCallbacks({
    onConnected: () => console.log('已连接'),
    onDisconnected: () => {
        console.log('已断开');
        // 处理重连逻辑
    }
});
```
