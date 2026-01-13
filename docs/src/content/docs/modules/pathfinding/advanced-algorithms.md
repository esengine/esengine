---
title: "高级寻路算法"
description: "GridPathfinder、JPS、HPA* 等高级寻路算法详解"
---

本页介绍 `@esengine/pathfinding` 提供的高级寻路算法，适用于性能敏感场景。

## GridPathfinder

统一的高性能网格寻路器，支持三种模式切换：

```typescript
import { createGridPathfinder, GridMap } from '@esengine/pathfinding';

const grid = new GridMap(500, 500);

// fast 模式（默认）- 适合中大地图
const pathfinder = createGridPathfinder(grid, { mode: 'fast' });

// bidirectional 模式 - 适合超大开放地图
const biPathfinder = createGridPathfinder(grid, { mode: 'bidirectional' });

// standard 模式 - 基础 A*
const basicPathfinder = createGridPathfinder(grid, { mode: 'standard' });

const result = pathfinder.findPath(0, 0, 499, 499);
```

### 模式对比

| 模式 | 适用场景 | 优化策略 | 性能特点 |
|------|----------|----------|----------|
| `standard` | 小地图 | 基础 A* | 通用 |
| `fast` | 中大地图 | TypedArray + 版本重置 | 快约 1.5-2x |
| `bidirectional` | 超大开放地图 | 双向搜索 | 大地图快约 2-3x |

### 选择建议

```typescript
function chooseMode(width: number, height: number): GridPathfinderMode {
    const size = width * height;
    if (size < 10000) return 'standard';      // < 100x100
    if (size < 250000) return 'fast';          // < 500x500
    return 'bidirectional';                     // 大型开放地图
}
```

## JPS (Jump Point Search)

跳点搜索算法，在开放地图上比 A* 快 10-100 倍。

```typescript
import { createJPSPathfinder, GridMap } from '@esengine/pathfinding';

const grid = new GridMap(300, 300);
const jps = createJPSPathfinder(grid);

const result = jps.findPath(0, 0, 299, 299);
console.log('搜索节点数:', result.nodesSearched); // 远少于 A*
```

### JPS 原理

JPS 通过"跳跃"跳过对称路径，只在以下位置展开节点：
- 起点和终点
- 转折点（强制邻居）
- 跳跃终点

### JPS vs A* 性能对比

| 地图类型 | JPS 优势 | 说明 |
|----------|----------|------|
| 开放地图 | 10-100x 更少节点 | 效果最佳 |
| 障碍物密集 | 3-10x 更少节点 | 仍有优势 |
| 迷宫地图 | 1-2x | 优势较小 |

### 适用场景

```typescript
// ✅ 适合 JPS
// - 开放草原、沙漠地形
// - 障碍物稀疏的地图
// - 需要高频寻路的场景

// ❌ 不适合 JPS
// - 迷宫类地图
// - 障碍物非常密集
// - 需要非对角线移动
```

## HPA* (分层寻路)

Hierarchical Pathfinding A*，适用于超大地图的分层寻路算法。

```typescript
import { createHPAPathfinder, GridMap } from '@esengine/pathfinding';

const grid = new GridMap(1000, 1000);

// 创建 HPA* 寻路器
const hpa = createHPAPathfinder(grid, {
    clusterSize: 32,  // 区块大小
});

// 预处理（构建分层图）
hpa.preprocess();

// 寻路
const result = hpa.findPath(10, 10, 990, 990);
```

### HPA* 原理

1. **分区阶段**：将地图划分为多个区块 (Cluster)
2. **构建入口**：识别区块之间的通道入口 (Entrance)
3. **抽象图**：建立区块间的连接图
4. **分层搜索**：先在抽象图搜索，再在区块内细化

### 配置选项

```typescript
interface IHPAConfig {
    clusterSize?: number;  // 区块大小，默认 16
}
```

| 区块大小 | 预处理时间 | 搜索速度 | 内存占用 |
|----------|-----------|----------|----------|
| 10x10 | 较长 | 较快 | 较高 |
| 20x20 | 中等 | 中等 | 中等 |
| 40x40 | 较短 | 较慢 | 较低 |

### 使用场景

```typescript
// ✅ 适合 HPA*
// - 超大地图 (1000x1000+)
// - 地图结构相对稳定
// - 需要大量寻路请求

// ❌ 不适合 HPA*
// - 小地图（预处理开销不值得）
// - 地图频繁变化
// - 单次寻路场景
```

### 动态更新

```typescript
// 障碍物变化时需要重新预处理
grid.setWalkable(100, 100, false);
hpa.preprocess(); // 重新构建分层图
```

## 路径缓存

对重复的寻路请求进行缓存，显著提升性能：

```typescript
import { createPathCache, createAStarPathfinder } from '@esengine/pathfinding';

const pathfinder = createAStarPathfinder(grid);

// 创建缓存
const cache = createPathCache({
    maxEntries: 1000,  // 最大缓存条目
    ttlMs: 60000,      // 过期时间（毫秒）
});

// 带缓存的寻路
function findPathCached(sx: number, sy: number, ex: number, ey: number) {
    const key = `${sx},${sy}-${ex},${ey}`;

    const cached = cache.get(key);
    if (cached) return cached;

    const result = pathfinder.findPath(sx, sy, ex, ey);
    cache.set(key, result);
    return result;
}
```

### 缓存策略

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| 完全匹配 | 起点终点完全相同 | 固定目标点（如建筑） |
| 区域匹配 | 起点终点在同一区域 | 大量代理前往相似位置 |
| TTL 过期 | 超时后自动清除 | 地图会变化的场景 |

## 算法选择指南

```
需要选择寻路算法？
    │
    ├── 地图 < 100x100？
    │   └── AStarPathfinder 或 GridPathfinder(standard)
    │
    ├── 地图 100x100 ~ 500x500？
    │   ├── 开放地图？ → JPSPathfinder
    │   └── 有障碍物？ → GridPathfinder(fast)
    │
    ├── 地图 > 500x500？
    │   ├── 开放地图？ → GridPathfinder(bidirectional)
    │   └── 需要大量寻路？ → HPAPathfinder
    │
    └── 需要不阻塞？
        └── IncrementalAStarPathfinder
```

## 性能基准测试

在 500x500 开放地图上的对角线寻路 (0,0 → 499,499)：

| 算法 | 时间 | 搜索节点数 |
|------|------|-----------|
| A* | ~3ms | ~500 |
| GridPathfinder(fast) | ~1.5ms | ~500 |
| GridPathfinder(bidirectional) | ~1ms | ~250 |
| JPS | ~0.5ms | ~3 |
| HPA* (预处理后) | ~0.2ms | - |

*实际性能因地图结构和硬件而异*

## 相关文档

- [网格地图 API](./grid-map) - GridMap 基础操作
- [增量寻路](./incremental) - 时间切片执行
- [实际示例](./examples) - 完整使用案例
