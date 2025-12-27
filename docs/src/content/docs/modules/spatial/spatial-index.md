---
title: "空间索引 API"
description: "网格索引、范围查询、射线检测"
---

## createGridSpatialIndex

```typescript
function createGridSpatialIndex<T>(cellSize?: number): GridSpatialIndex<T>
```

创建基于均匀网格的空间索引。

**参数：**
- `cellSize` - 网格单元格大小（默认 100）

**选择合适的 cellSize：**
- 太小：内存占用高，查询效率降低
- 太大：单元格内对象过多，遍历耗时
- 建议：设置为对象平均分布间距的 1-2 倍

## 管理方法

### insert

插入对象到索引：

```typescript
spatialIndex.insert(enemy, { x: 100, y: 200 });
```

### remove

移除对象：

```typescript
spatialIndex.remove(enemy);
```

### update

更新对象位置：

```typescript
spatialIndex.update(enemy, { x: 150, y: 250 });
```

### clear

清空索引：

```typescript
spatialIndex.clear();
```

## 查询方法

### findInRadius

查找圆形范围内的所有对象：

```typescript
// 查找中心点 (100, 200) 半径 50 内的所有敌人
const enemies = spatialIndex.findInRadius(
    { x: 100, y: 200 },
    50,
    (entity) => entity.type === 'enemy' // 可选过滤器
);
```

### findInRect

查找矩形区域内的所有对象：

```typescript
import { createBounds } from '@esengine/spatial';

const bounds = createBounds(0, 0, 200, 200);
const entities = spatialIndex.findInRect(bounds);
```

### findNearest

查找最近的对象：

```typescript
// 查找最近的敌人（最大搜索距离 500）
const nearest = spatialIndex.findNearest(
    playerPosition,
    500, // maxDistance
    (entity) => entity.type === 'enemy'
);

if (nearest) {
    attackTarget(nearest);
}
```

### findKNearest

查找最近的 K 个对象：

```typescript
// 查找最近的 5 个敌人
const nearestEnemies = spatialIndex.findKNearest(
    playerPosition,
    5,    // k
    500,  // maxDistance
    (entity) => entity.type === 'enemy'
);
```

### raycast

射线检测（返回所有命中）：

```typescript
const hits = spatialIndex.raycast(
    origin,      // 射线起点
    direction,   // 射线方向（应归一化）
    maxDistance, // 最大检测距离
    filter       // 可选过滤器
);

// hits 按距离排序
for (const hit of hits) {
    console.log(`命中 ${hit.target} at ${hit.point}, 距离 ${hit.distance}`);
}
```

### raycastFirst

射线检测（仅返回第一个命中）：

```typescript
const hit = spatialIndex.raycastFirst(origin, direction, 1000);
if (hit) {
    dealDamage(hit.target, calculateDamage(hit.distance));
}
```

## 属性

```typescript
// 获取索引中的对象数量
console.log(spatialIndex.count);

// 获取所有对象
const all = spatialIndex.getAll();
```

## 蓝图节点

- `FindInRadius` - 查找半径内的对象
- `FindInRect` - 查找矩形内的对象
- `FindNearest` - 查找最近的对象
- `FindKNearest` - 查找最近的 K 个对象
- `Raycast` - 射线检测
- `RaycastFirst` - 射线检测（仅第一个）
