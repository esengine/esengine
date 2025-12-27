---
title: "客户端使用"
description: "NetworkPlugin、组件和系统的客户端使用指南"
---

## NetworkPlugin

NetworkPlugin 是客户端网络功能的核心入口。

### 基本用法

```typescript
import { Core } from '@esengine/ecs-framework';
import { NetworkPlugin } from '@esengine/network';

// 创建并安装插件
const networkPlugin = new NetworkPlugin();
await Core.installPlugin(networkPlugin);

// 连接服务器
const success = await networkPlugin.connect('ws://localhost:3000', 'PlayerName');

// 断开连接
await networkPlugin.disconnect();
```

### 属性和方法

```typescript
class NetworkPlugin {
    readonly name: string;
    readonly version: string;

    // 访问器
    get networkService(): NetworkService;
    get syncSystem(): NetworkSyncSystem;
    get spawnSystem(): NetworkSpawnSystem;
    get inputSystem(): NetworkInputSystem;
    get isConnected(): boolean;

    // 连接服务器
    connect(serverUrl: string, playerName: string, roomId?: string): Promise<boolean>;

    // 断开连接
    disconnect(): Promise<void>;

    // 注册预制体工厂
    registerPrefab(prefabType: string, factory: PrefabFactory): void;

    // 发送输入
    sendMoveInput(x: number, y: number): void;
    sendActionInput(action: string): void;
}
```

## 组件

### NetworkIdentity

网络标识组件，每个网络同步的实体必须拥有：

```typescript
class NetworkIdentity extends Component {
    netId: number;           // 网络唯一 ID
    ownerId: number;         // 所有者客户端 ID
    bIsLocalPlayer: boolean; // 是否为本地玩家
    bHasAuthority: boolean;  // 是否有权限控制
}
```

**使用示例：**

```typescript
networkPlugin.registerPrefab('player', (scene, spawn) => {
    const entity = scene.createEntity(`player_${spawn.netId}`);

    const identity = entity.addComponent(new NetworkIdentity());
    identity.netId = spawn.netId;
    identity.ownerId = spawn.ownerId;
    identity.bIsLocalPlayer = spawn.ownerId === networkPlugin.networkService.clientId;

    return entity;
});
```

### NetworkTransform

网络变换组件，用于位置和旋转同步：

```typescript
class NetworkTransform extends Component {
    position: { x: number; y: number };
    rotation: number;
    velocity: { x: number; y: number };
}
```

## 系统

### NetworkSyncSystem

处理服务器状态同步和插值：

- 接收服务器状态快照
- 将状态存入快照缓冲区
- 对远程实体进行插值平滑

### NetworkSpawnSystem

处理实体的网络生成和销毁：

- 监听 Spawn/Despawn 消息
- 使用注册的预制体工厂创建实体
- 管理网络实体的生命周期

### NetworkInputSystem

处理本地玩家输入的网络发送：

```typescript
class NetworkInputSystem extends EntitySystem {
    addMoveInput(x: number, y: number): void;
    addActionInput(action: string): void;
    clearInput(): void;
}
```

**使用示例：**

```typescript
// 方式 1：通过 NetworkPlugin（推荐）
networkPlugin.sendMoveInput(0, 1);
networkPlugin.sendActionInput('jump');

// 方式 2：直接使用 inputSystem
const inputSystem = networkPlugin.inputSystem;
inputSystem.addMoveInput(0, 1);
inputSystem.addActionInput('jump');
```

## 预制体工厂

预制体工厂用于创建网络实体：

```typescript
type PrefabFactory = (scene: Scene, spawn: MsgSpawn) => Entity;
```

**完整示例：**

```typescript
// 注册玩家预制体
networkPlugin.registerPrefab('player', (scene, spawn) => {
    const entity = scene.createEntity(`player_${spawn.netId}`);

    const identity = entity.addComponent(new NetworkIdentity());
    identity.netId = spawn.netId;
    identity.ownerId = spawn.ownerId;
    identity.bIsLocalPlayer = spawn.ownerId === networkPlugin.networkService.clientId;

    entity.addComponent(new NetworkTransform());

    // 本地玩家添加输入组件
    if (identity.bIsLocalPlayer) {
        entity.addComponent(new LocalInputComponent());
    }

    return entity;
});

// 注册敌人预制体
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

## 处理输入

创建自定义输入处理系统：

```typescript
import { EntitySystem, Matcher, Entity } from '@esengine/ecs-framework';
import { NetworkPlugin, NetworkIdentity } from '@esengine/network';

class LocalInputHandler extends EntitySystem {
    private _networkPlugin: NetworkPlugin | null = null;

    constructor() {
        super(Matcher.empty().all(NetworkIdentity, LocalInputComponent));
    }

    protected onAddedToScene(): void {
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

## 连接状态监听

```typescript
networkPlugin.networkService.setCallbacks({
    onConnected: (clientId, roomId) => {
        console.log(`已连接: 客户端 ${clientId}, 房间 ${roomId}`);
    },
    onDisconnected: () => {
        console.log('已断开');
        // 处理重连逻辑
    },
    onError: (error) => {
        console.error('网络错误:', error);
    }
});
```

## 最佳实践

1. **权限检查**：使用 `bHasAuthority` 检查是否有权限修改实体

2. **本地玩家标识**：通过 `bIsLocalPlayer` 区分本地和远程玩家

3. **预制体管理**：为每种网络实体类型注册对应的预制体工厂

4. **输入发送**：推荐使用 `NetworkPlugin.sendMoveInput()` 和 `sendActionInput()` 方法
