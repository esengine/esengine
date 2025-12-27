---
title: "空间索引系统 (Spatial)"
description: "高效的空间查询和 AOI 管理"
---

`@esengine/spatial` 提供了高效的空间查询和索引功能，包括范围查询、最近邻查询、射线检测和 AOI（兴趣区域）管理。

## 安装

```bash
npm install @esengine/spatial
```

## 快速开始

### 空间索引

```typescript
import { createGridSpatialIndex } from '@esengine/spatial';

// 创建空间索引（网格单元格大小为 100）
const spatialIndex = createGridSpatialIndex<Entity>(100);

// 插入对象
spatialIndex.insert(player, { x: 100, y: 200 });
spatialIndex.insert(enemy1, { x: 150, y: 250 });
spatialIndex.insert(enemy2, { x: 500, y: 600 });

// 查找半径内的对象
const nearby = spatialIndex.findInRadius({ x: 100, y: 200 }, 100);
console.log(nearby); // [player, enemy1]

// 查找最近的对象
const nearest = spatialIndex.findNearest({ x: 100, y: 200 });
console.log(nearest); // enemy1

// 更新位置
spatialIndex.update(player, { x: 120, y: 220 });
```

### AOI 兴趣区域

```typescript
import { createGridAOI } from '@esengine/spatial';

// 创建 AOI 管理器
const aoi = createGridAOI<Entity>(100);

// 添加观察者（玩家）
aoi.addObserver(player, { x: 100, y: 100 }, { viewRange: 200 });
aoi.addObserver(npc, { x: 150, y: 150 }, { viewRange: 150 });

// 监听进入/离开事件
aoi.addListener((event) => {
    if (event.type === 'enter') {
        console.log(`${event.observer} 看到了 ${event.target}`);
    } else if (event.type === 'exit') {
        console.log(`${event.target} 离开了 ${event.observer} 的视野`);
    }
});

// 更新位置（会自动触发进入/离开事件）
aoi.updatePosition(player, { x: 200, y: 200 });

// 获取视野内的实体
const visible = aoi.getEntitiesInView(player);
```

## 核心概念

### 空间索引 vs AOI

| 特性 | 空间索引 (SpatialIndex) | AOI (Area of Interest) |
|------|------------------------|------------------------|
| 用途 | 通用空间查询 | 实体可见性追踪 |
| 事件 | 无事件通知 | 进入/离开事件 |
| 方向 | 单向查询 | 双向追踪（谁看到谁） |
| 场景 | 碰撞检测、范围攻击 | MMO 同步、NPC AI 感知 |

### 核心接口

#### IBounds 边界框

```typescript
interface IBounds {
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
}
```

#### IRaycastHit 射线检测结果

```typescript
interface IRaycastHit<T> {
    readonly target: T;     // 命中的对象
    readonly point: IVector2; // 命中点坐标
    readonly normal: IVector2; // 命中点法线
    readonly distance: number; // 距离射线起点的距离
}
```

## 文档导航

- [空间索引 API](./spatial-index) - 网格索引、范围查询、射线检测
- [AOI 兴趣区域](./aoi) - 视野管理、进入/离开事件
- [实际示例](./examples) - 范围攻击、MMO 同步、AI 感知
- [工具与优化](./utilities) - 几何检测、性能优化技巧
