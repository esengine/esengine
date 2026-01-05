---
title: "状态同步"
description: "组件同步、插值、预测和快照缓冲区"
---

## @NetworkEntity 装饰器

`@NetworkEntity` 装饰器用于标记需要自动广播生成/销毁的组件。当包含此组件的实体被创建或销毁时，ECSRoom 会自动广播相应的消息给所有客户端。

### 基本用法

```typescript
import { Component, ECSComponent, sync, NetworkEntity } from '@esengine/ecs-framework';

@ECSComponent('Enemy')
@NetworkEntity('Enemy')
class EnemyComponent extends Component {
    @sync('float32') x: number = 0;
    @sync('float32') y: number = 0;
    @sync('uint16') health: number = 100;
}
```

当添加此组件到实体时，ECSRoom 会自动广播 spawn 消息：

```typescript
// 服务端
const entity = scene.createEntity('Enemy');
entity.addComponent(new EnemyComponent()); // 自动广播 spawn

// 销毁时自动广播 despawn
entity.destroy(); // 自动广播 despawn
```

### 配置选项

```typescript
@NetworkEntity('Bullet', {
    autoSpawn: true,    // 自动广播生成（默认 true）
    autoDespawn: false  // 禁用自动广播销毁
})
class BulletComponent extends Component { }
```

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `autoSpawn` | `boolean` | `true` | 添加组件时自动广播 spawn |
| `autoDespawn` | `boolean` | `true` | 销毁实体时自动广播 despawn |

### 初始化顺序

使用 `@NetworkEntity` 时，应在添加组件**之前**初始化数据：

```typescript
// ✅ 正确：先初始化，再添加
const comp = new PlayerComponent();
comp.playerId = player.id;
comp.x = 100;
comp.y = 200;
entity.addComponent(comp); // spawn 时数据已正确

// ❌ 错误：先添加，再初始化
const comp = entity.addComponent(new PlayerComponent());
comp.playerId = player.id; // spawn 时数据是默认值
```

### 简化 GameRoom

使用 `@NetworkEntity` 后，GameRoom 变得更加简洁：

```typescript
// 无需手动回调
class GameRoom extends ECSRoom {
    private setupSystems(): void {
        // 敌人生成系统（自动广播 spawn）
        this.addSystem(new EnemySpawnSystem());

        // 敌人 AI 系统
        const enemyAI = new EnemyAISystem();
        enemyAI.onDeath((enemy) => {
            enemy.destroy(); // 自动广播 despawn
        });
        this.addSystem(enemyAI);
    }
}
```

### ECSRoom 配置

可以在 ECSRoom 中禁用自动网络实体功能：

```typescript
class GameRoom extends ECSRoom {
    constructor() {
        super({
            enableAutoNetworkEntity: false // 禁用自动广播
        });
    }
}
```

## 组件同步系统

基于 `@sync` 装饰器的 ECS 组件状态同步。

### 定义同步组件

```typescript
import { Component, ECSComponent, sync } from '@esengine/ecs-framework';

@ECSComponent('Player')
class PlayerComponent extends Component {
    @sync("string") name: string = "";
    @sync("uint16") score: number = 0;
    @sync("float32") x: number = 0;
    @sync("float32") y: number = 0;

    // 不带 @sync 的字段不会同步
    localData: any;
}
```

### 服务端编码

```typescript
import { ComponentSyncSystem } from '@esengine/network';

const syncSystem = new ComponentSyncSystem({}, true);
scene.addSystem(syncSystem);

// 编码所有实体（首次连接）
const fullData = syncSystem.encodeAllEntities(true);
sendToClient(fullData);

// 编码增量（只发送变更）
const deltaData = syncSystem.encodeDelta();
if (deltaData) {
    broadcast(deltaData);
}
```

### 客户端解码

```typescript
const syncSystem = new ComponentSyncSystem();
scene.addSystem(syncSystem);

// 注册组件类型
syncSystem.registerComponent(PlayerComponent);

// 监听同步事件
syncSystem.addSyncListener((event) => {
    if (event.type === 'entitySpawned') {
        console.log('New entity:', event.entityId);
    }
});

// 应用状态
syncSystem.applySnapshot(data);
```

### 同步类型

| 类型 | 描述 | 字节数 |
|------|------|--------|
| `"boolean"` | 布尔值 | 1 |
| `"int8"` / `"uint8"` | 8位整数 | 1 |
| `"int16"` / `"uint16"` | 16位整数 | 2 |
| `"int32"` / `"uint32"` | 32位整数 | 4 |
| `"float32"` | 32位浮点 | 4 |
| `"float64"` | 64位浮点 | 8 |
| `"string"` | 字符串 | 变长 |

## 快照缓冲区

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

### 配置选项

| 属性 | 类型 | 描述 |
|------|------|------|
| `maxSnapshots` | `number` | 缓冲区最大快照数 |
| `interpolationDelay` | `number` | 插值延迟（毫秒） |

## 变换插值器

### 线性插值器

适用于简单的位置插值：

```typescript
import { createTransformInterpolator } from '@esengine/network';

const interpolator = createTransformInterpolator();

// 添加状态
interpolator.addState(time, { x: 0, y: 0, rotation: 0 });

// 获取插值结果
const state = interpolator.getInterpolatedState(currentTime);
```

### Hermite 插值器

使用 Hermite 样条实现更平滑的插值，适合需要考虑速度的场景：

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

### 插值器对比

| 类型 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 线性插值 | 简单、计算快 | 可能不平滑 | 简单移动 |
| Hermite 插值 | 平滑、考虑速度 | 计算量较大 | 高速移动 |

## 客户端预测

实现客户端预测和服务器校正，减少输入延迟：

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

### 预测配置

| 属性 | 类型 | 描述 |
|------|------|------|
| `maxPredictedInputs` | `number` | 最大预测输入数 |
| `reconciliationThreshold` | `number` | 校正阈值 |

### 工作流程

```
客户端                              服务器
   │                                   │
   ├─ 1. 本地预测输入 ──────────────────►
   │                                   │
   ├─ 2. 发送输入到服务器              │
   │                                   │
   │                                   ├─ 3. 处理输入
   │                                   │
   ◄──────────────────── 4. 返回权威状态
   │                                   │
   ├─ 5. 校正本地状态                  │
   │                                   │
```

## 使用建议

### 插值延迟设置

- **低延迟网络**（局域网）：50-100ms
- **普通网络**：100-150ms
- **高延迟网络**：150-200ms

```typescript
const buffer = createSnapshotBuffer({
    interpolationDelay: 100  // 根据网络情况调整
});
```

### 预测校正

对于本地玩家使用客户端预测：

```typescript
// 本地玩家：预测 + 校正
if (identity.bIsLocalPlayer) {
    const predicted = prediction.predict(input, state, applyInput);
    // 使用预测状态渲染
}

// 远程玩家：纯插值
if (!identity.bIsLocalPlayer) {
    const interpolated = interpolator.getInterpolatedState(time);
    // 使用插值状态渲染
}
```

## 最佳实践

1. **合理设置插值延迟**：太小会导致抖动，太大会增加延迟感

2. **客户端预测仅用于本地玩家**：远程玩家使用插值

3. **校正阈值**：根据游戏精度需求设置合适的阈值

4. **快照数量**：保持足够的快照以应对网络抖动

---

## 定点数同步（帧同步）

以下内容用于**帧同步 (Lockstep)** 架构，使用定点数确保跨平台确定性。

> 定点数基础知识请参考 [定点数文档](/modules/network/fixed-point)

### FixedTransformState

定点数变换状态，用于网络传输：

```typescript
import {
    FixedTransformState,
    FixedTransformStateWithVelocity,
    type IFixedTransformStateRaw
} from '@esengine/network';

// 创建状态
const state = FixedTransformState.from(100, 200, Math.PI / 4);

// 序列化（发送方）
const raw: IFixedTransformStateRaw = state.toRaw();
socket.send(JSON.stringify({ type: 'sync', state: raw }));

// 反序列化（接收方）
const received = FixedTransformState.fromRaw(message.state);

// 用于渲染
const { x, y, rotation } = received.toFloat();
sprite.position.set(x, y);
```

带速度的状态（用于外推）：

```typescript
const state = FixedTransformStateWithVelocity.from(
    100, 200,    // 位置
    0,           // 旋转
    5, 3,        // 速度
    0.1          // 角速度
);
```

### 定点数插值器

```typescript
import {
    createFixedTransformInterpolator,
    createFixedHermiteTransformInterpolator
} from '@esengine/network';
import { Fixed32 } from '@esengine/ecs-framework-math';

// 线性插值器
const interpolator = createFixedTransformInterpolator();

const from = FixedTransformState.from(0, 0, 0);
const to = FixedTransformState.from(100, 50, Math.PI);
const t = Fixed32.from(0.5);

const result = interpolator.interpolate(from, to, t);

// Hermite 插值器（更平滑）
const hermite = createFixedHermiteTransformInterpolator(100);
```

### 定点数快照缓冲区

管理定点数状态历史，用于帧同步回放：

```typescript
import {
    FixedSnapshotBuffer,
    createFixedSnapshotBuffer
} from '@esengine/network';

// 创建缓冲区（最多 30 快照，2 帧延迟）
const buffer = createFixedSnapshotBuffer<FixedTransformState>(30, 2);

// 添加快照
buffer.push({
    frame: 100,
    state: FixedTransformState.from(100, 200, 0)
});

// 获取插值快照
const result = buffer.getInterpolationSnapshots(103);
if (result) {
    const { from, to, t } = result;
    const interpolated = interpolator.interpolate(from.state, to.state, t);
}

// 获取最新/指定帧快照
const latest = buffer.getLatest();
const atFrame = buffer.getAtFrame(100);

// 回滚重播
const snapshotsToReplay = buffer.getSnapshotsAfter(98);

// 清理旧快照
buffer.removeSnapshotsBefore(95);
```

子帧插值：

```typescript
// 使用 Fixed32 帧时间（支持小数帧）
const frameTime = Fixed32.from(102.5);
const result = buffer.getInterpolationSnapshotsFixed(frameTime);
```

### API 导出

```typescript
import {
    // 状态类
    FixedTransformState,
    FixedTransformStateWithVelocity,
    type IFixedTransformStateRaw,
    type IFixedTransformStateWithVelocityRaw,

    // 插值器
    FixedTransformInterpolator,
    FixedHermiteTransformInterpolator,
    createFixedTransformInterpolator,
    createFixedHermiteTransformInterpolator,

    // 快照缓冲区
    FixedSnapshotBuffer,
    createFixedSnapshotBuffer,
    type IFixedStateSnapshot,
    type IFixedInterpolationResult
} from '@esengine/network';
```
