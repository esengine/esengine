---
title: "世界流式加载"
description: "基于区块的开放世界流式加载系统"
---

`@esengine/world-streaming` 提供基于区块的世界流式加载与管理，适用于开放世界游戏。根据玩家位置动态加载/卸载世界区块。

## 安装

```bash
npm install @esengine/world-streaming
```

## 快速开始

### 基础设置

```typescript
import {
    ChunkManager,
    ChunkStreamingSystem,
    StreamingAnchorComponent,
    ChunkLoaderComponent
} from '@esengine/world-streaming';

// 创建区块管理器 (512单位区块)
const chunkManager = new ChunkManager(512);
chunkManager.setScene(scene);

// 添加流式加载系统
const streamingSystem = new ChunkStreamingSystem();
streamingSystem.setChunkManager(chunkManager);
scene.addSystem(streamingSystem);

// 创建加载器实体
const loaderEntity = scene.createEntity('ChunkLoader');
const loader = loaderEntity.addComponent(new ChunkLoaderComponent());
loader.chunkSize = 512;
loader.loadRadius = 2;
loader.unloadRadius = 4;

// 创建玩家作为流式锚点
const playerEntity = scene.createEntity('Player');
const anchor = playerEntity.addComponent(new StreamingAnchorComponent());

// 每帧更新锚点位置
function update() {
    anchor.x = player.position.x;
    anchor.y = player.position.y;
}
```

### 程序化生成

```typescript
import type { IChunkDataProvider, IChunkCoord, IChunkData } from '@esengine/world-streaming';

class ProceduralChunkProvider implements IChunkDataProvider {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    async loadChunkData(coord: IChunkCoord): Promise<IChunkData | null> {
        // 使用种子+坐标生成确定性随机数
        const chunkSeed = this.hashCoord(coord);
        const rng = this.createRNG(chunkSeed);

        // 生成区块内容
        const entities = this.generateEntities(coord, rng);

        return {
            coord,
            entities,
            version: 1
        };
    }

    async saveChunkData(data: IChunkData): Promise<void> {
        // 可选：持久化已修改的区块
    }

    private hashCoord(coord: IChunkCoord): number {
        return this.seed ^ (coord.x * 73856093) ^ (coord.y * 19349663);
    }

    private createRNG(seed: number) {
        // 简单的种子随机数生成器
        return () => {
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            return seed / 0x7fffffff;
        };
    }

    private generateEntities(coord: IChunkCoord, rng: () => number) {
        // 生成资源、树木等
        return [];
    }
}

// 使用数据提供器
chunkManager.setDataProvider(new ProceduralChunkProvider(12345));
```

## 核心概念

### 区块生命周期

```
未加载 → 加载中 → 已加载 → 卸载中 → 未加载
              ↓         ↓
           失败    (发生错误时)
```

### 流式锚点

`StreamingAnchorComponent` 用于标记作为区块加载锚点的实体。系统会在所有锚点周围加载区块，在超出范围时卸载区块。

```typescript
// StreamingAnchorComponent 实现 IPositionable 接口
interface IPositionable {
    readonly position: { x: number; y: number };
}
```

### 配置参数

| 属性 | 默认值 | 说明 |
|------|--------|------|
| `chunkSize` | 512 | 区块大小（世界单位） |
| `loadRadius` | 2 | 锚点周围加载的区块半径 |
| `unloadRadius` | 4 | 超过此半径的区块会被卸载 |
| `maxLoadsPerFrame` | 2 | 每帧最大异步加载数 |
| `unloadDelay` | 3000 | 卸载前的延迟（毫秒） |
| `bEnablePrefetch` | true | 沿移动方向预加载 |

## 模块设置（可选）

使用模块辅助函数快速配置：

```typescript
import { worldStreamingModule } from '@esengine/world-streaming';

const chunkManager = worldStreamingModule.setup(
    scene,
    services,
    componentRegistry,
    { chunkSize: 256, bEnableCulling: true }
);
```

## 文档

- [区块管理器 API](./chunk-manager) - 加载队列、区块生命周期
- [流式系统](./streaming-system) - 基于锚点的加载
- [序列化](./serialization) - 自定义区块序列化
- [示例](./examples) - 程序化世界、MMO 区块
