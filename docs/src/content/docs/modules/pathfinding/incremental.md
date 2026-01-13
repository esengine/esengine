---
title: "增量寻路"
description: "时间切片执行，支持暂停/恢复和动态重规划"
---

增量寻路 (Incremental Pathfinding) 允许将寻路计算分散到多帧执行，避免阻塞主线程，适合大量代理同时寻路的场景。

## 核心特性

- **时间切片** - 每帧执行有限次迭代
- **暂停/恢复** - 随时暂停和恢复搜索
- **动态重规划** - 障碍物变化时自动处理
- **路径缓存** - 可选的结果缓存

## 基础用法

```typescript
import {
    createIncrementalAStarPathfinder,
    PathfindingState,
    GridMap
} from '@esengine/pathfinding';

const grid = new GridMap(200, 200);
const pathfinder = createIncrementalAStarPathfinder(grid);

// 1. 请求寻路（非阻塞）
const request = pathfinder.requestPath(0, 0, 199, 199);
console.log('Request ID:', request.id);

// 2. 每帧执行一定次数的迭代
function gameLoop() {
    const progress = pathfinder.step(request.id, 100); // 每帧 100 次迭代

    console.log('Progress:', (progress.progress * 100).toFixed(1) + '%');

    if (progress.state === PathfindingState.Completed) {
        const result = pathfinder.getResult(request.id);
        console.log('Path found!', result?.path);
        pathfinder.cleanup(request.id); // 清理资源
    } else if (progress.state === PathfindingState.InProgress) {
        requestAnimationFrame(gameLoop);
    } else {
        console.log('Failed or cancelled');
    }
}

gameLoop();
```

## 状态管理

### PathfindingState 枚举

| 状态 | 说明 |
|------|------|
| `Idle` | 空闲，未开始 |
| `InProgress` | 搜索进行中 |
| `Paused` | 已暂停 |
| `Completed` | 搜索完成，找到路径 |
| `Failed` | 搜索完成，未找到路径 |
| `Cancelled` | 已取消 |

### 暂停和恢复

```typescript
const request = pathfinder.requestPath(0, 0, 199, 199);

// 执行一些步骤
pathfinder.step(request.id, 500);

// 暂停
pathfinder.pause(request.id);
console.log(pathfinder.getProgress(request.id)?.state); // 'paused'

// 恢复
pathfinder.resume(request.id);
pathfinder.step(request.id, 500); // 继续执行
```

### 取消请求

```typescript
const request = pathfinder.requestPath(0, 0, 199, 199);

// 不需要这个路径了
pathfinder.cancel(request.id);

// 清理资源
pathfinder.cleanup(request.id);
```

## 多代理管理

### 优先级队列模式

```typescript
class PathfindingManager {
    private pathfinder: IncrementalAStarPathfinder;
    private requests: Map<number, { id: number; priority: number; entityId: string }>;
    private budgetPerFrame = 2000; // 每帧总迭代预算

    requestPath(entityId: string, sx: number, sy: number, ex: number, ey: number, priority = 50) {
        const request = this.pathfinder.requestPath(sx, sy, ex, ey);
        this.requests.set(request.id, { id: request.id, priority, entityId });
        return request.id;
    }

    update() {
        // 按优先级排序
        const sorted = [...this.requests.values()].sort((a, b) => b.priority - a.priority);

        let budget = this.budgetPerFrame;
        const iterPerAgent = Math.max(10, Math.floor(budget / sorted.length));

        for (const req of sorted) {
            if (budget <= 0) break;

            const progress = this.pathfinder.getProgress(req.id);
            if (!progress || progress.state !== PathfindingState.InProgress) continue;

            this.pathfinder.step(req.id, iterPerAgent);
            budget -= iterPerAgent;
        }
    }
}
```

### ECS 集成示例

```typescript
class PathfindingSystem extends EntitySystem {
    private pathfinder: IncrementalAStarPathfinder;

    constructor(grid: GridMap) {
        super();
        this.pathfinder = createIncrementalAStarPathfinder(grid);
    }

    protected getMatcher() {
        return Matcher.allOf(PathfindingAgent, Transform);
    }

    protected process(entities: readonly Entity[]) {
        const budget = 2000;
        const iterPerEntity = Math.floor(budget / entities.length);

        for (const entity of entities) {
            const agent = entity.get(PathfindingAgent);
            if (!agent.requestId) continue;

            const progress = this.pathfinder.step(agent.requestId, iterPerEntity);

            if (progress.state === PathfindingState.Completed) {
                agent.path = this.pathfinder.getResult(agent.requestId)?.path ?? [];
                this.pathfinder.cleanup(agent.requestId);
                agent.requestId = undefined;
            }
        }
    }
}
```

## 动态重规划

### 障碍物变化通知

```typescript
const pathfinder = createIncrementalAStarPathfinder(grid);

// 创建寻路请求
const request = pathfinder.requestPath(0, 0, 99, 99);
pathfinder.step(request.id, 500);

// 动态添加障碍物
grid.setWalkable(50, 50, false);

// 通知寻路器障碍物变化区域
pathfinder.notifyObstacleChange(45, 45, 55, 55);

// 继续执行 - 受影响的请求会自动标记
const progress = pathfinder.getProgress(request.id);
if (progress?.obstaclesChanged) {
    console.log('Path may be affected by obstacle change');
    // 可以选择取消并重新请求，或继续执行
}
```

### 路径验证器

```typescript
import { createPathValidator } from '@esengine/pathfinding';

const validator = createPathValidator(grid);

// 验证现有路径
const path = result.path;
const validation = validator.validate(path);

if (!validation.valid) {
    console.log('Path blocked at index:', validation.blockedIndex);
    console.log('Blocked point:', validation.blockedPoint);
    // 需要重新寻路
}
```

## 路径缓存

启用缓存可大幅提升重复查询性能：

```typescript
const pathfinder = createIncrementalAStarPathfinder(grid, {
    enableCache: true,
    cacheConfig: {
        maxEntries: 1000,  // 最大缓存数
        ttlMs: 60000,      // 过期时间 60 秒
    }
});

// 第一次请求 - 实际计算
const req1 = pathfinder.requestPath(0, 0, 99, 99);
pathfinder.step(req1.id, 10000);

// 第二次相同请求 - 从缓存返回
const req2 = pathfinder.requestPath(0, 0, 99, 99);
pathfinder.step(req2.id, 10000); // 立即完成

// 查看缓存统计
const stats = pathfinder.getCacheStats();
console.log('Hit rate:', (stats.hitRate * 100).toFixed(1) + '%');
```

## 配置选项

```typescript
interface IIncrementalPathfinderConfig {
    maxNodes?: number;        // 最大搜索节点数，默认 10000
    heuristicWeight?: number; // 启发式权重，默认 1.0
    enableCache?: boolean;    // 启用缓存，默认 false
    cacheConfig?: IPathCacheConfig; // 缓存配置
}

const pathfinder = createIncrementalAStarPathfinder(grid, {
    maxNodes: 50000,
    heuristicWeight: 1.2,
    enableCache: true,
    cacheConfig: {
        maxEntries: 500,
        ttlMs: 30000
    }
});
```

## 性能调优

### 迭代次数选择

| 场景 | 建议每帧迭代数 | 说明 |
|------|---------------|------|
| 单个代理 | 500-2000 | 1-2 帧完成 |
| 10 个代理 | 总计 2000 | 每个约 200 |
| 100 个代理 | 总计 2000-5000 | 每个约 20-50 |
| 1000 个代理 | 总计 5000-10000 | 分批处理 |

### 帧时间预算

```typescript
class AdaptivePathfinding {
    private targetFrameTime = 2; // 目标帧时间 2ms
    private iterationsPerStep = 100;

    step(requestId: number) {
        const start = performance.now();
        this.pathfinder.step(requestId, this.iterationsPerStep);
        const elapsed = performance.now() - start;

        // 自适应调整迭代次数
        if (elapsed < this.targetFrameTime * 0.8) {
            this.iterationsPerStep = Math.min(1000, this.iterationsPerStep + 10);
        } else if (elapsed > this.targetFrameTime) {
            this.iterationsPerStep = Math.max(10, this.iterationsPerStep - 20);
        }
    }
}
```

## 完整示例

### 游戏中的代理移动

```typescript
class Agent {
    x: number;
    y: number;
    path: IPoint[] = [];
    pathIndex = 0;
    requestId?: number;

    private pathfinder: IncrementalAStarPathfinder;

    moveTo(targetX: number, targetY: number) {
        // 取消之前的请求
        if (this.requestId !== undefined) {
            this.pathfinder.cancel(this.requestId);
            this.pathfinder.cleanup(this.requestId);
        }

        // 请求新路径
        const request = this.pathfinder.requestPath(
            Math.floor(this.x),
            Math.floor(this.y),
            targetX,
            targetY
        );
        this.requestId = request.id;
        this.pathIndex = 0;
    }

    update(dt: number) {
        // 处理寻路
        if (this.requestId !== undefined) {
            const progress = this.pathfinder.step(this.requestId, 100);

            if (progress.state === PathfindingState.Completed) {
                const result = this.pathfinder.getResult(this.requestId);
                this.path = result?.path ?? [];
                this.pathfinder.cleanup(this.requestId);
                this.requestId = undefined;
            }
        }

        // 沿路径移动
        if (this.path.length > 0 && this.pathIndex < this.path.length) {
            const target = this.path[this.pathIndex];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.1) {
                this.pathIndex++;
            } else {
                const speed = 5 * dt;
                this.x += (dx / dist) * speed;
                this.y += (dy / dist) * speed;
            }
        }
    }
}
```

## 相关文档

- [高级寻路算法](./advanced-algorithms) - GridPathfinder、JPS、HPA*
- [网格地图 API](./grid-map) - GridMap 操作
- [实际示例](./examples) - 更多使用案例
