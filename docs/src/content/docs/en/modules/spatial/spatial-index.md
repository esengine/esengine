---
title: "Spatial Index API"
description: "Grid index, range queries, raycasting"
---

## createGridSpatialIndex

```typescript
function createGridSpatialIndex<T>(cellSize?: number): GridSpatialIndex<T>
```

Creates a uniform grid-based spatial index.

**Parameters:**
- `cellSize` - Grid cell size (default 100)

**Choosing cellSize:**
- Too small: High memory usage, reduced query efficiency
- Too large: Too many objects per cell, slow iteration
- Recommended: 1-2x average object spacing

## Management Methods

### insert

Insert an object into the index:

```typescript
spatialIndex.insert(enemy, { x: 100, y: 200 });
```

### remove

Remove an object:

```typescript
spatialIndex.remove(enemy);
```

### update

Update object position:

```typescript
spatialIndex.update(enemy, { x: 150, y: 250 });
```

### clear

Clear the index:

```typescript
spatialIndex.clear();
```

## Query Methods

### findInRadius

Find all objects within a circular area:

```typescript
// Find all enemies within radius 50 of point (100, 200)
const enemies = spatialIndex.findInRadius(
    { x: 100, y: 200 },
    50,
    (entity) => entity.type === 'enemy' // Optional filter
);
```

### findInRect

Find all objects within a rectangular area:

```typescript
import { createBounds } from '@esengine/spatial';

const bounds = createBounds(0, 0, 200, 200);
const entities = spatialIndex.findInRect(bounds);
```

### findNearest

Find the nearest object:

```typescript
// Find nearest enemy (max search distance 500)
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

Find the K nearest objects:

```typescript
// Find 5 nearest enemies
const nearestEnemies = spatialIndex.findKNearest(
    playerPosition,
    5,    // k
    500,  // maxDistance
    (entity) => entity.type === 'enemy'
);
```

### raycast

Raycast (returns all hits):

```typescript
const hits = spatialIndex.raycast(
    origin,      // Ray origin
    direction,   // Ray direction (should be normalized)
    maxDistance, // Maximum detection distance
    filter       // Optional filter
);

// hits are sorted by distance
for (const hit of hits) {
    console.log(`Hit ${hit.target} at ${hit.point}, distance ${hit.distance}`);
}
```

### raycastFirst

Raycast (returns only the first hit):

```typescript
const hit = spatialIndex.raycastFirst(origin, direction, 1000);
if (hit) {
    dealDamage(hit.target, calculateDamage(hit.distance));
}
```

## Properties

```typescript
// Get number of objects in index
console.log(spatialIndex.count);

// Get all objects
const all = spatialIndex.getAll();
```

## Blueprint Nodes

- `FindInRadius` - Find objects within radius
- `FindInRect` - Find objects within rectangle
- `FindNearest` - Find nearest object
- `FindKNearest` - Find K nearest objects
- `Raycast` - Raycast (all hits)
- `RaycastFirst` - Raycast (first hit only)
