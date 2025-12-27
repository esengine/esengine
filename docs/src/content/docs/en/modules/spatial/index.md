---
title: "Spatial Index System"
description: "Efficient spatial queries and AOI management"
---

`@esengine/spatial` provides efficient spatial querying and indexing, including range queries, nearest neighbor queries, raycasting, and AOI (Area of Interest) management.

## Installation

```bash
npm install @esengine/spatial
```

## Quick Start

### Spatial Index

```typescript
import { createGridSpatialIndex } from '@esengine/spatial';

// Create spatial index (cell size 100)
const spatialIndex = createGridSpatialIndex<Entity>(100);

// Insert objects
spatialIndex.insert(player, { x: 100, y: 200 });
spatialIndex.insert(enemy1, { x: 150, y: 250 });
spatialIndex.insert(enemy2, { x: 500, y: 600 });

// Find objects within radius
const nearby = spatialIndex.findInRadius({ x: 100, y: 200 }, 100);
console.log(nearby); // [player, enemy1]

// Find nearest object
const nearest = spatialIndex.findNearest({ x: 100, y: 200 });
console.log(nearest); // enemy1

// Update position
spatialIndex.update(player, { x: 120, y: 220 });
```

### AOI (Area of Interest)

```typescript
import { createGridAOI } from '@esengine/spatial';

// Create AOI manager
const aoi = createGridAOI<Entity>(100);

// Add observers
aoi.addObserver(player, { x: 100, y: 100 }, { viewRange: 200 });
aoi.addObserver(npc, { x: 150, y: 150 }, { viewRange: 150 });

// Listen to enter/exit events
aoi.addListener((event) => {
    if (event.type === 'enter') {
        console.log(`${event.observer} saw ${event.target}`);
    } else if (event.type === 'exit') {
        console.log(`${event.target} left ${event.observer}'s view`);
    }
});

// Update position (triggers enter/exit events)
aoi.updatePosition(player, { x: 200, y: 200 });

// Get visible entities
const visible = aoi.getEntitiesInView(player);
```

## Core Concepts

### Spatial Index vs AOI

| Feature | SpatialIndex | AOI |
|---------|--------------|-----|
| Purpose | General spatial queries | Entity visibility tracking |
| Events | No event notification | Enter/exit events |
| Direction | One-way query | Two-way tracking |
| Use Cases | Collision, range attacks | MMO sync, NPC AI perception |

### Core Interfaces

#### IBounds

```typescript
interface IBounds {
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
}
```

#### IRaycastHit

```typescript
interface IRaycastHit<T> {
    readonly target: T;       // Hit object
    readonly point: IVector2; // Hit point
    readonly normal: IVector2;// Hit normal
    readonly distance: number;// Distance from origin
}
```

## Documentation

- [Spatial Index API](./spatial-index) - Grid index, range queries, raycasting
- [AOI (Area of Interest)](./aoi) - View management, enter/exit events
- [Examples](./examples) - Area attacks, MMO sync, AI perception
- [Utilities & Optimization](./utilities) - Geometry detection, performance tips
