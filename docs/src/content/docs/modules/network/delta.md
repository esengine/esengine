---
title: "状态增量压缩"
description: "减少网络带宽的增量同步"
---

状态增量压缩通过只发送变化的字段来减少网络带宽。对于频繁同步的游戏状态，这可以显著降低数据传输量。

## StateDeltaCompressor

`StateDeltaCompressor` 类用于压缩和解压状态增量。

### 基本用法

```typescript
import { createStateDeltaCompressor, type SyncData } from '@esengine/network';

// 创建压缩器
const compressor = createStateDeltaCompressor({
    positionThreshold: 0.01,      // 位置变化阈值
    rotationThreshold: 0.001,     // 旋转变化阈值（弧度）
    velocityThreshold: 0.1,       // 速度变化阈值
    fullSnapshotInterval: 60,     // 完整快照间隔（帧数）
});

// 压缩同步数据
const syncData: SyncData = {
    frame: 100,
    timestamp: Date.now(),
    entities: [
        { netId: 1, pos: { x: 100, y: 200 }, rot: 0 },
        { netId: 2, pos: { x: 300, y: 400 }, rot: 1.5 },
    ],
};

const deltaData = compressor.compress(syncData);
// deltaData 只包含变化的字段

// 解压增量数据
const fullData = compressor.decompress(deltaData);
```

## 配置选项

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `positionThreshold` | `number` | 0.01 | 位置变化阈值 |
| `rotationThreshold` | `number` | 0.001 | 旋转变化阈值（弧度） |
| `velocityThreshold` | `number` | 0.1 | 速度变化阈值 |
| `fullSnapshotInterval` | `number` | 60 | 完整快照间隔（帧数） |

## 增量标志

使用位标志表示哪些字段发生了变化：

```typescript
import { DeltaFlags } from '@esengine/network';

// 位标志定义
DeltaFlags.NONE           // 0 - 无变化
DeltaFlags.POSITION       // 1 - 位置变化
DeltaFlags.ROTATION       // 2 - 旋转变化
DeltaFlags.VELOCITY       // 4 - 速度变化
DeltaFlags.ANGULAR_VELOCITY // 8 - 角速度变化
DeltaFlags.CUSTOM         // 16 - 自定义数据变化
```

## 数据格式

### 完整状态

```typescript
interface EntitySyncState {
    netId: number;
    pos?: { x: number; y: number };
    rot?: number;
    vel?: { x: number; y: number };
    angVel?: number;
    custom?: Record<string, unknown>;
}
```

### 增量状态

```typescript
interface EntityDeltaState {
    netId: number;
    flags: number;        // 变化标志位
    pos?: { x: number; y: number };   // 仅在 POSITION 标志时存在
    rot?: number;         // 仅在 ROTATION 标志时存在
    vel?: { x: number; y: number };   // 仅在 VELOCITY 标志时存在
    angVel?: number;      // 仅在 ANGULAR_VELOCITY 标志时存在
    custom?: Record<string, unknown>; // 仅在 CUSTOM 标志时存在
}
```

## 工作原理

```
帧 1 (完整快照)：
  Entity 1: pos=(100, 200), rot=0

帧 2 (增量)：
  Entity 1: flags=POSITION, pos=(101, 200)  // 只有 X 变化

帧 3 (增量)：
  Entity 1: flags=0  // 无变化，不发送

帧 4 (增量)：
  Entity 1: flags=POSITION|ROTATION, pos=(105, 200), rot=0.5

帧 60 (强制完整快照)：
  Entity 1: pos=(200, 300), rot=1.0, vel=(5, 0)
```

## 服务器端使用

```typescript
import { createStateDeltaCompressor } from '@esengine/network';

class GameServer {
    private compressor = createStateDeltaCompressor();

    // 广播状态更新
    broadcastState(entities: EntitySyncState[]) {
        const syncData: SyncData = {
            frame: this.currentFrame,
            timestamp: Date.now(),
            entities,
        };

        // 压缩数据
        const deltaData = this.compressor.compress(syncData);

        // 发送增量数据
        this.broadcast('sync', deltaData);
    }

    // 玩家离开时清理
    onPlayerLeave(netId: number) {
        this.compressor.removeEntity(netId);
    }
}
```

## 客户端使用

```typescript
class GameClient {
    private compressor = createStateDeltaCompressor();

    // 接收增量数据
    onSyncReceived(deltaData: DeltaSyncData) {
        // 解压为完整状态
        const fullData = this.compressor.decompress(deltaData);

        // 应用状态
        for (const entity of fullData.entities) {
            this.applyEntityState(entity);
        }
    }
}
```

## 带宽节省示例

假设每个实体有以下数据：

| 字段 | 大小（字节） |
|------|------------|
| netId | 4 |
| pos.x | 8 |
| pos.y | 8 |
| rot | 8 |
| vel.x | 8 |
| vel.y | 8 |
| angVel | 8 |
| **总计** | **52** |

使用增量压缩：

| 场景 | 原始 | 压缩后 | 节省 |
|------|------|--------|------|
| 只有位置变化 | 52 | 4+1+16 = 21 | 60% |
| 只有旋转变化 | 52 | 4+1+8 = 13 | 75% |
| 静止不动 | 52 | 0 | 100% |
| 位置+旋转变化 | 52 | 4+1+24 = 29 | 44% |

## 强制完整快照

某些情况下需要发送完整快照：

```typescript
// 新玩家加入时
compressor.forceFullSnapshot();
const data = compressor.compress(syncData);
// 这次会发送完整状态

// 重连时
compressor.clear();  // 清除历史状态
compressor.forceFullSnapshot();
```

## 自定义数据

支持同步自定义游戏数据：

```typescript
const syncData: SyncData = {
    frame: 100,
    timestamp: Date.now(),
    entities: [
        {
            netId: 1,
            pos: { x: 100, y: 200 },
            custom: {
                health: 80,
                mana: 50,
                buffs: ['speed', 'shield'],
            },
        },
    ],
};

// 自定义数据也会进行增量压缩
const deltaData = compressor.compress(syncData);
```

## 最佳实践

### 1. 合理设置阈值

```typescript
// 高精度游戏（如竞技游戏）
const compressor = createStateDeltaCompressor({
    positionThreshold: 0.001,
    rotationThreshold: 0.0001,
});

// 普通游戏
const compressor = createStateDeltaCompressor({
    positionThreshold: 0.1,
    rotationThreshold: 0.01,
});
```

### 2. 调整完整快照间隔

```typescript
// 高可靠性（网络不稳定）
fullSnapshotInterval: 30,  // 每 30 帧发送完整快照

// 低带宽优先
fullSnapshotInterval: 120, // 每 120 帧发送完整快照
```

### 3. 配合 AOI 使用

```typescript
// 先用 AOI 过滤，再用增量压缩
const filteredEntities = aoiSystem.filterSyncData(playerId, allEntities);
const syncData = { frame, timestamp, entities: filteredEntities };
const deltaData = compressor.compress(syncData);
```

### 4. 处理实体移除

```typescript
// 实体销毁时清理压缩器状态
function onEntityDespawn(netId: number) {
    compressor.removeEntity(netId);
}
```

## 与其他功能配合

```
                    ┌─────────────────┐
                    │    游戏状态      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   AOI 过滤      │  ← 只处理视野内实体
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   增量压缩      │  ← 只发送变化的字段
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   网络传输      │
                    └─────────────────┘
```

## 调试

```typescript
const compressor = createStateDeltaCompressor();

// 检查压缩效果
const original = syncData;
const compressed = compressor.compress(original);

console.log('Original entities:', original.entities.length);
console.log('Compressed entities:', compressed.entities.length);
console.log('Is full snapshot:', compressed.isFullSnapshot);

// 查看每个实体的变化
for (const delta of compressed.entities) {
    console.log(`Entity ${delta.netId}:`, {
        hasPosition: !!(delta.flags & DeltaFlags.POSITION),
        hasRotation: !!(delta.flags & DeltaFlags.ROTATION),
        hasVelocity: !!(delta.flags & DeltaFlags.VELOCITY),
        hasCustom: !!(delta.flags & DeltaFlags.CUSTOM),
    });
}
```
