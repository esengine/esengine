---
title: "Navigation Mesh API"
description: "NavMesh building and querying"
---

## createNavMesh

```typescript
function createNavMesh(): NavMesh
```

## Building Navigation Mesh

```typescript
const navmesh = createNavMesh();

// Add convex polygons
const id1 = navmesh.addPolygon([
    { x: 0, y: 0 }, { x: 10, y: 0 },
    { x: 10, y: 10 }, { x: 0, y: 10 }
]);

const id2 = navmesh.addPolygon([
    { x: 10, y: 0 }, { x: 20, y: 0 },
    { x: 20, y: 10 }, { x: 10, y: 10 }
]);

// Method 1: Auto-detect shared edges and build connections
navmesh.build();

// Method 2: Manually set connections
navmesh.setConnection(id1, id2, {
    left: { x: 10, y: 0 },
    right: { x: 10, y: 10 }
});
```

## Querying and Pathfinding

```typescript
// Find polygon containing point
const polygon = navmesh.findPolygonAt(5, 5);

// Check if position is walkable
navmesh.isWalkable(5, 5);

// Pathfinding (uses funnel algorithm internally)
const result = navmesh.findPath(1, 1, 18, 8);
```

## Use Cases

Navigation mesh is suitable for:
- Complex irregular terrain
- Scenarios requiring precise paths
- Large maps where polygon count is much less than grid cells

```typescript
// Load navigation mesh data from editor
const navData = await loadNavMeshData('level1.navmesh');

const navmesh = createNavMesh();
for (const poly of navData.polygons) {
    navmesh.addPolygon(poly.vertices);
}
navmesh.build();
```
