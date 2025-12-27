---
title: "Spatial Index System"
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

### IBounds

```typescript
interface IBounds {
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
}
```

### IRaycastHit

```typescript
interface IRaycastHit<T> {
    readonly target: T;       // Hit object
    readonly point: IVector2; // Hit point
    readonly normal: IVector2;// Hit normal
    readonly distance: number;// Distance from origin
}
```

## Spatial Index API

### createGridSpatialIndex

```typescript
function createGridSpatialIndex<T>(cellSize?: number): GridSpatialIndex<T>
```

**Choosing cellSize:**
- Too small: High memory, reduced query efficiency
- Too large: Many objects per cell, slow iteration
- Recommended: 1-2x average object spacing

### Management Methods

```typescript
spatialIndex.insert(entity, position);
spatialIndex.remove(entity);
spatialIndex.update(entity, newPosition);
spatialIndex.clear();
```

### Query Methods

#### findInRadius

```typescript
const enemies = spatialIndex.findInRadius(
    { x: 100, y: 200 },
    50,
    (entity) => entity.type === 'enemy' // Optional filter
);
```

#### findInRect

```typescript
import { createBounds } from '@esengine/spatial';

const bounds = createBounds(0, 0, 200, 200);
const entities = spatialIndex.findInRect(bounds);
```

#### findNearest

```typescript
const nearest = spatialIndex.findNearest(
    playerPosition,
    500, // maxDistance
    (entity) => entity.type === 'enemy'
);
```

#### findKNearest

```typescript
const nearestEnemies = spatialIndex.findKNearest(
    playerPosition,
    5,    // k
    500,  // maxDistance
    (entity) => entity.type === 'enemy'
);
```

#### raycast / raycastFirst

```typescript
const hits = spatialIndex.raycast(origin, direction, maxDistance);
const firstHit = spatialIndex.raycastFirst(origin, direction, maxDistance);
```

## AOI API

### createGridAOI

```typescript
function createGridAOI<T>(cellSize?: number): GridAOI<T>
```

### Observer Management

```typescript
// Add observer
aoi.addObserver(player, position, {
    viewRange: 200,
    observable: true  // Can be seen by others
});

// Remove observer
aoi.removeObserver(player);

// Update position
aoi.updatePosition(player, newPosition);

// Update view range
aoi.updateViewRange(player, 300);
```

### Query Methods

```typescript
// Get entities in observer's view
const visible = aoi.getEntitiesInView(player);

// Get observers who can see entity
const observers = aoi.getObserversOf(monster);

// Check visibility
if (aoi.canSee(player, enemy)) { ... }
```

### Event System

```typescript
// Global event listener
aoi.addListener((event) => {
    switch (event.type) {
        case 'enter': /* entered view */ break;
        case 'exit': /* left view */ break;
    }
});

// Entity-specific listener
aoi.addEntityListener(player, (event) => {
    if (event.type === 'enter') {
        sendToClient(player, 'entity_enter', event.target);
    }
});
```

## Utility Functions

### Bounds Creation

```typescript
import {
    createBounds,
    createBoundsFromCenter,
    createBoundsFromCircle
} from '@esengine/spatial';

const bounds1 = createBounds(0, 0, 100, 100);
const bounds2 = createBoundsFromCenter({ x: 50, y: 50 }, 100, 100);
const bounds3 = createBoundsFromCircle({ x: 50, y: 50 }, 50);
```

### Geometry Checks

```typescript
import {
    isPointInBounds,
    boundsIntersect,
    boundsIntersectsCircle,
    distance,
    distanceSquared
} from '@esengine/spatial';

if (isPointInBounds(point, bounds)) { ... }
if (boundsIntersect(boundsA, boundsB)) { ... }
if (boundsIntersectsCircle(bounds, center, radius)) { ... }
const dist = distance(pointA, pointB);
const distSq = distanceSquared(pointA, pointB); // Faster
```

## Practical Examples

### Range Attack Detection

```typescript
class CombatSystem {
    private spatialIndex: ISpatialIndex<Entity>;

    dealAreaDamage(center: IVector2, radius: number, damage: number): void {
        const targets = this.spatialIndex.findInRadius(
            center, radius,
            (entity) => entity.hasComponent(HealthComponent)
        );

        for (const target of targets) {
            target.getComponent(HealthComponent).takeDamage(damage);
        }
    }
}
```

### MMO Sync System

```typescript
class SyncSystem {
    private aoi: IAOIManager<Player>;

    constructor() {
        this.aoi = createGridAOI<Player>(100);

        this.aoi.addListener((event) => {
            const packet = this.createSyncPacket(event);
            this.sendToPlayer(event.observer, packet);
        });
    }

    onPlayerMove(player: Player, newPosition: IVector2): void {
        this.aoi.updatePosition(player, newPosition);
    }
}
```

## Blueprint Nodes

### Spatial Query Nodes
- `FindInRadius`, `FindInRect`, `FindNearest`, `FindKNearest`
- `Raycast`, `RaycastFirst`

### AOI Nodes
- `GetEntitiesInView`, `GetObserversOf`, `CanSee`
- `OnEntityEnterView`, `OnEntityExitView`

## Service Tokens

```typescript
import { SpatialIndexToken, AOIManagerToken } from '@esengine/spatial';

services.register(SpatialIndexToken, createGridSpatialIndex(100));
services.register(AOIManagerToken, createGridAOI(100));
```
