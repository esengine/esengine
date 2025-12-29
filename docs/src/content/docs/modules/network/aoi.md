---
title: "兴趣区域管理 (AOI)"
description: "基于视野范围的网络实体过滤"
---

AOI（Area of Interest，兴趣区域）是大规模多人游戏中用于优化网络带宽的关键技术。通过只同步玩家视野范围内的实体，可以大幅减少网络流量。

## NetworkAOISystem

`NetworkAOISystem` 提供基于网格的兴趣区域管理。

### 启用 AOI

```typescript
import { NetworkPlugin } from '@esengine/network';

const networkPlugin = new NetworkPlugin({
    enableAOI: true,
    aoiConfig: {
        cellSize: 100,           // 网格单元大小
        defaultViewRange: 500,   // 默认视野范围
        enabled: true,
    }
});

await Core.installPlugin(networkPlugin);
```

### 添加观察者

每个需要接收同步数据的玩家都需要作为观察者添加：

```typescript
// 玩家加入时添加观察者
networkPlugin.registerPrefab('player', (scene, spawn) => {
    const entity = scene.createEntity(`player_${spawn.netId}`);

    // ... 设置组件

    // 将玩家添加为 AOI 观察者
    networkPlugin.addAOIObserver(
        spawn.netId,     // 网络 ID
        spawn.pos.x,     // 初始 X 位置
        spawn.pos.y,     // 初始 Y 位置
        600              // 视野范围（可选）
    );

    return entity;
});

// 玩家离开时移除观察者
networkPlugin.removeAOIObserver(playerNetId);
```

### 更新观察者位置

当玩家移动时，需要更新其 AOI 位置：

```typescript
// 在游戏循环或同步回调中更新
networkPlugin.updateAOIObserverPosition(playerNetId, newX, newY);
```

## AOI 配置

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `cellSize` | `number` | 100 | 网格单元大小 |
| `defaultViewRange` | `number` | 500 | 默认视野范围 |
| `enabled` | `boolean` | true | 是否启用 AOI |

### 网格大小建议

网格大小应根据游戏视野范围设置：

```typescript
// 建议：cellSize = defaultViewRange / 3 到 / 5
aoiConfig: {
    cellSize: 100,
    defaultViewRange: 500,  // 网格大约是视野的 1/5
}
```

## 查询接口

### 获取可见实体

```typescript
// 获取玩家能看到的所有实体
const visibleEntities = networkPlugin.getVisibleEntities(playerNetId);
console.log('Visible entities:', visibleEntities);
```

### 检查可见性

```typescript
// 检查玩家是否能看到某个实体
if (networkPlugin.canSee(playerNetId, targetEntityNetId)) {
    // 目标在视野内
}
```

## 事件监听

AOI 系统会在实体进入/离开视野时触发事件：

```typescript
const aoiSystem = networkPlugin.aoiSystem;

if (aoiSystem) {
    aoiSystem.addListener((event) => {
        if (event.type === 'enter') {
            console.log(`Entity ${event.targetNetId} entered view of ${event.observerNetId}`);
            // 可以在这里发送实体的初始状态
        } else if (event.type === 'exit') {
            console.log(`Entity ${event.targetNetId} left view of ${event.observerNetId}`);
            // 可以在这里清理资源
        }
    });
}
```

## 服务器端过滤

AOI 最常用于服务器端，过滤发送给每个客户端的同步数据：

```typescript
// 服务器端示例
import { NetworkAOISystem, createNetworkAOISystem } from '@esengine/network';

class GameServer {
    private aoiSystem = createNetworkAOISystem({
        cellSize: 100,
        defaultViewRange: 500,
    });

    // 玩家加入
    onPlayerJoin(playerId: number, x: number, y: number) {
        this.aoiSystem.addObserver(playerId, x, y);
    }

    // 玩家移动
    onPlayerMove(playerId: number, x: number, y: number) {
        this.aoiSystem.updateObserverPosition(playerId, x, y);
    }

    // 发送同步数据
    broadcastSync(allEntities: EntitySyncState[]) {
        for (const playerId of this.players) {
            // 使用 AOI 过滤
            const filteredEntities = this.aoiSystem.filterSyncData(
                playerId,
                allEntities
            );

            // 只发送可见实体
            this.sendToPlayer(playerId, { entities: filteredEntities });
        }
    }
}
```

## 工作原理

```
┌─────────────────────────────────────────────────────────────┐
│                        游戏世界                              │
│  ┌─────┬─────┬─────┬─────┬─────┐                            │
│  │     │     │  E  │     │     │                            │
│  ├─────┼─────┼─────┼─────┼─────┤   E = 敌人实体             │
│  │     │  P  │  ●  │     │     │   P = 玩家                 │
│  ├─────┼─────┼─────┼─────┼─────┤   ● = 玩家视野中心         │
│  │     │     │  E  │  E  │     │   ○ = 视野范围             │
│  ├─────┼─────┼─────┼─────┼─────┤                            │
│  │     │     │     │     │  E  │   玩家只能看到视野内的 E    │
│  └─────┴─────┴─────┴─────┴─────┘                            │
│                                                              │
│  视野范围（圆形）：包含 3 个敌人                              │
│  网格优化：只检查视野覆盖的网格单元                           │
└─────────────────────────────────────────────────────────────┘
```

### 网格优化

AOI 使用空间网格加速查询：

1. **添加实体**：根据位置计算所在网格
2. **视野检测**：只检查视野范围覆盖的网格
3. **移动更新**：跨网格时更新网格归属
4. **事件触发**：检测进入/离开视野

## 动态视野范围

可以为不同类型的玩家设置不同的视野：

```typescript
// 普通玩家
networkPlugin.addAOIObserver(playerId, x, y, 500);

// VIP 玩家（更大视野）
networkPlugin.addAOIObserver(vipPlayerId, x, y, 800);

// 运行时调整视野
const aoiSystem = networkPlugin.aoiSystem;
if (aoiSystem) {
    aoiSystem.updateObserverViewRange(playerId, 600);
}
```

## 最佳实践

### 1. 服务器端使用

AOI 过滤应在服务器端进行，客户端不应信任自己的 AOI 判断：

```typescript
// 服务器端过滤后再发送
const filtered = aoiSystem.filterSyncData(playerId, entities);
sendToClient(playerId, filtered);
```

### 2. 边界处理

在视野边缘添加缓冲区防止闪烁：

```typescript
// 进入视野时立即添加
// 离开视野时延迟移除（保持额外 1-2 秒）
aoiSystem.addListener((event) => {
    if (event.type === 'exit') {
        setTimeout(() => {
            // 再次检查是否真的离开
            if (!aoiSystem.canSee(event.observerNetId, event.targetNetId)) {
                removeFromClient(event.observerNetId, event.targetNetId);
            }
        }, 1000);
    }
});
```

### 3. 大型实体

对于大型实体（如 Boss），可能需要特殊处理：

```typescript
// Boss 总是对所有人可见
function filterWithBoss(playerId: number, entities: EntitySyncState[]) {
    const filtered = aoiSystem.filterSyncData(playerId, entities);

    // 添加 Boss 实体
    const bossState = entities.find(e => e.netId === bossNetId);
    if (bossState && !filtered.includes(bossState)) {
        filtered.push(bossState);
    }

    return filtered;
}
```

### 4. 性能考虑

```typescript
// 大规模游戏建议配置
aoiConfig: {
    cellSize: 200,           // 较大的网格减少网格数量
    defaultViewRange: 800,   // 根据实际视野设置
}
```

## 调试

```typescript
const aoiSystem = networkPlugin.aoiSystem;

if (aoiSystem) {
    console.log('AOI enabled:', aoiSystem.enabled);
    console.log('Observer count:', aoiSystem.observerCount);

    // 获取特定玩家的可见实体
    const visible = aoiSystem.getVisibleEntities(playerId);
    console.log('Visible entities:', visible.length);
}
```
