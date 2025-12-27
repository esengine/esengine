---
title: "导航网格 API"
description: "NavMesh 构建和查询"
---

## createNavMesh

```typescript
function createNavMesh(): NavMesh
```

## 构建导航网格

```typescript
const navmesh = createNavMesh();

// 添加凸多边形
const id1 = navmesh.addPolygon([
    { x: 0, y: 0 }, { x: 10, y: 0 },
    { x: 10, y: 10 }, { x: 0, y: 10 }
]);

const id2 = navmesh.addPolygon([
    { x: 10, y: 0 }, { x: 20, y: 0 },
    { x: 20, y: 10 }, { x: 10, y: 10 }
]);

// 方式1：自动检测共享边并建立连接
navmesh.build();

// 方式2：手动设置连接
navmesh.setConnection(id1, id2, {
    left: { x: 10, y: 0 },
    right: { x: 10, y: 10 }
});
```

## 查询和寻路

```typescript
// 查找包含点的多边形
const polygon = navmesh.findPolygonAt(5, 5);

// 检查位置是否可通行
navmesh.isWalkable(5, 5);

// 寻路（内部使用漏斗算法优化路径）
const result = navmesh.findPath(1, 1, 18, 8);
```

## 使用场景

导航网格适合：
- 复杂不规则地形
- 需要精确路径的场景
- 多边形数量远少于网格单元格的大地图

```typescript
// 从编辑器导出的导航网格数据
const navData = await loadNavMeshData('level1.navmesh');

const navmesh = createNavMesh();
for (const poly of navData.polygons) {
    navmesh.addPolygon(poly.vertices);
}
navmesh.build();
```
