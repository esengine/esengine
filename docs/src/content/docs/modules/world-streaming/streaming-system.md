---
title: "流式加载系统"
description: "ChunkStreamingSystem 根据锚点位置自动管理区块加载"
---

`ChunkStreamingSystem` 根据 `StreamingAnchorComponent` 的位置自动管理区块的加载和卸载。

## 设置

```typescript
import {
    ChunkManager,
    ChunkStreamingSystem,
    ChunkLoaderComponent,
    StreamingAnchorComponent
} from '@esengine/world-streaming';

// 创建并配置区块管理器
const chunkManager = new ChunkManager(512);
chunkManager.setScene(scene);
chunkManager.setDataProvider(myProvider);

// 创建流式系统
const streamingSystem = new ChunkStreamingSystem();
streamingSystem.setChunkManager(chunkManager);
scene.addSystem(streamingSystem);

// 创建加载器实体
const loaderEntity = scene.createEntity('ChunkLoader');
const loader = loaderEntity.addComponent(new ChunkLoaderComponent());
loader.chunkSize = 512;
loader.loadRadius = 2;
loader.unloadRadius = 4;
```

## 流式锚点

`StreamingAnchorComponent` 标记实体为区块加载锚点。区块会在所有锚点周围加载。

```typescript
// 创建玩家作为流式锚点
const playerEntity = scene.createEntity('Player');
const anchor = playerEntity.addComponent(new StreamingAnchorComponent());

// 每帧更新位置
function update() {
    anchor.x = player.worldX;
    anchor.y = player.worldY;
}
```

### 锚点属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `x` | number | 0 | 世界 X 坐标 |
| `y` | number | 0 | 世界 Y 坐标 |
| `weight` | number | 1.0 | 加载半径倍数 |
| `bEnablePrefetch` | boolean | true | 是否启用预加载 |

### 多锚点

```typescript
// 主玩家 - 完整加载半径
const playerAnchor = player.addComponent(new StreamingAnchorComponent());
playerAnchor.weight = 1.0;

// 相机预览 - 较小半径
const cameraAnchor = camera.addComponent(new StreamingAnchorComponent());
cameraAnchor.weight = 0.5;  // 加载半径减半
cameraAnchor.bEnablePrefetch = false;
```

## 加载器配置

`ChunkLoaderComponent` 配置流式加载行为。

```typescript
const loader = entity.addComponent(new ChunkLoaderComponent());

// 区块尺寸
loader.chunkSize = 512;         // 每区块世界单位

// 加载半径
loader.loadRadius = 2;          // 锚点周围 2 个区块内加载
loader.unloadRadius = 4;        // 超过 4 个区块卸载

// 性能调优
loader.maxLoadsPerFrame = 2;    // 每帧最大异步加载数
loader.maxUnloadsPerFrame = 1;  // 每帧最大卸载数
loader.unloadDelay = 3000;      // 卸载前延迟（毫秒）

// 预加载
loader.bEnablePrefetch = true;  // 启用移动方向预加载
loader.prefetchRadius = 1;      // 预加载额外区块数
```

### 坐标辅助方法

```typescript
// 世界坐标转区块坐标
const coord = loader.worldToChunk(1500, 2300);

// 获取区块边界
const bounds = loader.getChunkBounds(coord);
```

## 预加载系统

启用后，系统会沿移动方向预加载区块：

```
移动方向 →

    [ ][ ][ ]      [ ][P][P]    P = 预加载
    [L][L][L]  →   [L][L][L]    L = 已加载
    [ ][ ][ ]      [ ][ ][ ]
```

```typescript
// 启用预加载
loader.bEnablePrefetch = true;
loader.prefetchRadius = 2;  // 向前预加载 2 个区块

// 单独控制锚点的预加载
anchor.bEnablePrefetch = true;   // 主玩家启用
cameraAnchor.bEnablePrefetch = false;  // 相机禁用
```

## 系统处理流程

系统每帧运行：

1. 更新锚点速度
2. 请求加载范围内的区块
3. 取消已回到范围内的区块卸载
4. 请求卸载超出范围的区块
5. 处理加载/卸载队列

```typescript
// 从系统访问区块管理器
const system = scene.getSystem(ChunkStreamingSystem);
const manager = system?.chunkManager;

if (manager) {
    console.log('已加载:', manager.loadedChunkCount);
}
```

## 基于优先级的加载

区块按距离分配加载优先级：

| 距离 | 优先级 | 说明 |
|------|--------|------|
| 0 | Immediate | 玩家当前区块 |
| 1 | High | 相邻区块 |
| 2-4 | Normal | 附近区块 |
| 5+ | Low | 远处区块 |
| 预加载 | Prefetch | 移动方向 |

## 事件

```typescript
chunkManager.setEvents({
    onChunkLoaded: (coord, entities) => {
        // 区块就绪 - 生成 NPC，启用碰撞
        for (const entity of entities) {
            entity.getComponent(ColliderComponent)?.enable();
        }
    },
    onChunkUnloaded: (coord) => {
        // 清理 - 保存状态，释放资源
    }
});
```
