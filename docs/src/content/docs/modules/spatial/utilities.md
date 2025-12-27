---
title: "工具与优化"
description: "几何检测函数与性能优化技巧"
---

## 边界框创建

```typescript
import {
    createBounds,
    createBoundsFromCenter,
    createBoundsFromCircle
} from '@esengine/spatial';

// 从角点创建
const bounds1 = createBounds(0, 0, 100, 100);

// 从中心点和尺寸创建
const bounds2 = createBoundsFromCenter({ x: 50, y: 50 }, 100, 100);

// 从圆形创建（包围盒）
const bounds3 = createBoundsFromCircle({ x: 50, y: 50 }, 50);
```

## 几何检测

```typescript
import {
    isPointInBounds,
    boundsIntersect,
    boundsIntersectsCircle,
    distance,
    distanceSquared
} from '@esengine/spatial';

// 点在边界内？
if (isPointInBounds(point, bounds)) { ... }

// 两个边界框相交？
if (boundsIntersect(boundsA, boundsB)) { ... }

// 边界框与圆形相交？
if (boundsIntersectsCircle(bounds, center, radius)) { ... }

// 距离计算
const dist = distance(pointA, pointB);
const distSq = distanceSquared(pointA, pointB); // 更快，避免 sqrt
```

## 性能优化

### 1. 选择合适的 cellSize

- **太小**：内存占用高，单元格数量多
- **太大**：单元格内对象多，遍历慢
- **经验法则**：对象平均间距的 1-2 倍

```typescript
// 场景中对象平均间距约 50 单位
const spatialIndex = createGridSpatialIndex(75); // 1.5 倍
```

### 2. 使用过滤器减少结果

```typescript
// 在空间查询阶段就过滤，而不是事后过滤
spatialIndex.findInRadius(center, radius, (e) => e.type === 'enemy');

// 避免这样做
const all = spatialIndex.findInRadius(center, radius);
const enemies = all.filter(e => e.type === 'enemy'); // 多余的遍历
```

### 3. 使用 distanceSquared 代替 distance

```typescript
// 避免 sqrt 计算
const thresholdSq = threshold * threshold;

if (distanceSquared(a, b) < thresholdSq) {
    // 在范围内
}
```

### 4. 批量更新优化

```typescript
// 如果需要同时更新大量对象
// 考虑在批量更新前后禁用/启用事件
aoi.disableEvents();
for (const entity of entities) {
    aoi.updatePosition(entity, entity.position);
}
aoi.enableEvents();
aoi.flushEvents(); // 一次性发送所有事件
```

### 5. 分层索引

对于超大场景，可以使用多个空间索引：

```typescript
// 静态物体使用大网格（查询少）
const staticIndex = createGridSpatialIndex(500);

// 动态物体使用小网格（更新频繁）
const dynamicIndex = createGridSpatialIndex(50);

// 查询时合并结果
function findInRadius(center: IVector2, radius: number): Entity[] {
    return [
        ...staticIndex.findInRadius(center, radius),
        ...dynamicIndex.findInRadius(center, radius)
    ];
}
```

### 6. 减少查询频率

```typescript
class AISystem {
    private lastQueryTime = new Map<Entity, number>();
    private queryInterval = 100; // 每 100ms 查询一次

    update(dt: number): void {
        const now = performance.now();

        for (const entity of this.entities) {
            const lastTime = this.lastQueryTime.get(entity) ?? 0;

            if (now - lastTime >= this.queryInterval) {
                this.updateAIPerception(entity);
                this.lastQueryTime.set(entity, now);
            }
        }
    }
}
```

## 内存管理

```typescript
// 及时清理不需要的索引
spatialIndex.remove(destroyedEntity);

// 场景切换时完全清空
spatialIndex.clear();
aoi.clear();
```
