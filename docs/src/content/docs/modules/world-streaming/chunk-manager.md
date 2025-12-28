---
title: "区块管理器 API"
description: "ChunkManager 负责区块生命周期、加载队列和空间查询"
---

`ChunkManager` 是管理区块生命周期的核心服务，包括加载、卸载和空间查询。

## 基础用法

```typescript
import { ChunkManager } from '@esengine/world-streaming';

// 创建 512 单位大小的区块管理器
const chunkManager = new ChunkManager(512);
chunkManager.setScene(scene);

// 设置数据提供器
chunkManager.setDataProvider(myProvider);

// 设置事件回调
chunkManager.setEvents({
    onChunkLoaded: (coord, entities) => {
        console.log(`区块 (${coord.x}, ${coord.y}) 已加载，包含 ${entities.length} 个实体`);
    },
    onChunkUnloaded: (coord) => {
        console.log(`区块 (${coord.x}, ${coord.y}) 已卸载`);
    },
    onChunkLoadFailed: (coord, error) => {
        console.error(`加载区块 (${coord.x}, ${coord.y}) 失败:`, error);
    }
});
```

## 加载与卸载

### 请求加载

```typescript
import { EChunkPriority } from '@esengine/world-streaming';

// 按优先级请求加载
chunkManager.requestLoad({ x: 0, y: 0 }, EChunkPriority.Immediate);
chunkManager.requestLoad({ x: 1, y: 0 }, EChunkPriority.High);
chunkManager.requestLoad({ x: 2, y: 0 }, EChunkPriority.Normal);
chunkManager.requestLoad({ x: 3, y: 0 }, EChunkPriority.Low);
chunkManager.requestLoad({ x: 4, y: 0 }, EChunkPriority.Prefetch);
```

### 优先级说明

| 优先级 | 值 | 说明 |
|--------|------|------|
| `Immediate` | 0 | 当前区块（玩家所在） |
| `High` | 1 | 相邻区块 |
| `Normal` | 2 | 附近区块 |
| `Low` | 3 | 远处可见区块 |
| `Prefetch` | 4 | 移动方向预加载 |

### 请求卸载

```typescript
// 请求卸载，延迟 3 秒
chunkManager.requestUnload({ x: 5, y: 5 }, 3000);

// 取消待卸载请求（玩家返回了）
chunkManager.cancelUnload({ x: 5, y: 5 });
```

### 处理队列

```typescript
// 在更新循环或系统中
await chunkManager.processLoads(2);  // 每帧最多加载 2 个区块
chunkManager.processUnloads(1);       // 每帧最多卸载 1 个区块
```

## 空间查询

### 坐标转换

```typescript
// 世界坐标转区块坐标
const coord = chunkManager.worldToChunk(1500, 2300);
// 结果: { x: 2, y: 4 }（512单位区块）

// 获取区块世界边界
const bounds = chunkManager.getChunkBounds({ x: 2, y: 4 });
// 结果: { minX: 1024, minY: 2048, maxX: 1536, maxY: 2560 }
```

### 区块查询

```typescript
// 检查区块是否已加载
if (chunkManager.isChunkLoaded({ x: 0, y: 0 })) {
    const chunk = chunkManager.getChunk({ x: 0, y: 0 });
    console.log('实体数量:', chunk.entities.length);
}

// 获取半径内未加载的区块
const missing = chunkManager.getMissingChunks({ x: 0, y: 0 }, 2);
for (const coord of missing) {
    chunkManager.requestLoad(coord);
}

// 获取超出范围的区块（用于卸载）
const outside = chunkManager.getChunksOutsideRadius({ x: 0, y: 0 }, 4);
for (const coord of outside) {
    chunkManager.requestUnload(coord, 3000);
}

// 遍历所有已加载区块
chunkManager.forEachChunk((info, coord) => {
    console.log(`区块 (${coord.x}, ${coord.y}): ${info.state}`);
});
```

## 统计信息

```typescript
console.log('已加载区块:', chunkManager.loadedChunkCount);
console.log('待加载:', chunkManager.pendingLoadCount);
console.log('待卸载:', chunkManager.pendingUnloadCount);
console.log('区块大小:', chunkManager.chunkSize);
```

## 区块状态

```typescript
import { EChunkState } from '@esengine/world-streaming';

// 区块生命周期状态
EChunkState.Unloaded   // 未加载
EChunkState.Loading    // 加载中
EChunkState.Loaded     // 已加载
EChunkState.Unloading  // 卸载中
EChunkState.Failed     // 加载失败
```

## 数据提供器接口

```typescript
import type { IChunkDataProvider, IChunkCoord, IChunkData } from '@esengine/world-streaming';

class MyChunkProvider implements IChunkDataProvider {
    async loadChunkData(coord: IChunkCoord): Promise<IChunkData | null> {
        // 从数据库、文件或程序化生成加载
        const data = await fetchChunkFromServer(coord);
        return data;
    }

    async saveChunkData(data: IChunkData): Promise<void> {
        // 保存修改过的区块
        await saveChunkToServer(data);
    }
}
```

## 清理

```typescript
// 卸载所有区块
chunkManager.clear();

// 完全释放（实现 IService 接口）
chunkManager.dispose();
```
