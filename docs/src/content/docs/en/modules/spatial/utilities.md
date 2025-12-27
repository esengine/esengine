---
title: "Utilities & Optimization"
description: "Geometry detection functions and performance tips"
---

## Bounds Creation

```typescript
import {
    createBounds,
    createBoundsFromCenter,
    createBoundsFromCircle
} from '@esengine/spatial';

// Create from corners
const bounds1 = createBounds(0, 0, 100, 100);

// Create from center point and size
const bounds2 = createBoundsFromCenter({ x: 50, y: 50 }, 100, 100);

// Create from circle (bounding box)
const bounds3 = createBoundsFromCircle({ x: 50, y: 50 }, 50);
```

## Geometry Detection

```typescript
import {
    isPointInBounds,
    boundsIntersect,
    boundsIntersectsCircle,
    distance,
    distanceSquared
} from '@esengine/spatial';

// Point inside bounds?
if (isPointInBounds(point, bounds)) { ... }

// Two bounds intersect?
if (boundsIntersect(boundsA, boundsB)) { ... }

// Bounds intersects circle?
if (boundsIntersectsCircle(bounds, center, radius)) { ... }

// Distance calculation
const dist = distance(pointA, pointB);
const distSq = distanceSquared(pointA, pointB); // Faster, avoids sqrt
```

## Performance Optimization

### 1. Choose the Right cellSize

- **Too small**: High memory usage, many cells
- **Too large**: Many objects per cell, slow iteration
- **Rule of thumb**: 1-2x average object spacing

```typescript
// Scene with objects spaced about 50 units apart
const spatialIndex = createGridSpatialIndex(75); // 1.5x
```

### 2. Use Filters to Reduce Results

```typescript
// Filter during spatial query, not afterward
spatialIndex.findInRadius(center, radius, (e) => e.type === 'enemy');

// Avoid this pattern
const all = spatialIndex.findInRadius(center, radius);
const enemies = all.filter(e => e.type === 'enemy'); // Extra iteration
```

### 3. Use distanceSquared Instead of distance

```typescript
// Avoid sqrt calculation
const thresholdSq = threshold * threshold;

if (distanceSquared(a, b) < thresholdSq) {
    // Within range
}
```

### 4. Batch Update Optimization

```typescript
// When updating many objects at once
// Consider disabling/enabling events around batch updates
aoi.disableEvents();
for (const entity of entities) {
    aoi.updatePosition(entity, entity.position);
}
aoi.enableEvents();
aoi.flushEvents(); // Send all events at once
```

### 5. Layered Indexing

For very large scenes, use multiple spatial indexes:

```typescript
// Static objects use large grid (queried less frequently)
const staticIndex = createGridSpatialIndex(500);

// Dynamic objects use small grid (updated frequently)
const dynamicIndex = createGridSpatialIndex(50);

// Merge results when querying
function findInRadius(center: IVector2, radius: number): Entity[] {
    return [
        ...staticIndex.findInRadius(center, radius),
        ...dynamicIndex.findInRadius(center, radius)
    ];
}
```

### 6. Reduce Query Frequency

```typescript
class AISystem {
    private lastQueryTime = new Map<Entity, number>();
    private queryInterval = 100; // Query every 100ms

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

## Memory Management

```typescript
// Remove destroyed entities promptly
spatialIndex.remove(destroyedEntity);

// Clear completely when switching scenes
spatialIndex.clear();
aoi.clear();
```
