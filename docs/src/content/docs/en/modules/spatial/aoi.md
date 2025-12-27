---
title: "AOI (Area of Interest)"
description: "View management and enter/exit events"
---

AOI (Area of Interest) tracks visibility relationships between entities, commonly used for MMO synchronization and NPC AI perception.

## createGridAOI

```typescript
function createGridAOI<T>(cellSize?: number): GridAOI<T>
```

Creates a grid-based AOI manager.

**Parameters:**
- `cellSize` - Grid cell size (recommended: 1-2x average view range)

## Observer Management

### addObserver

Add an observer:

```typescript
aoi.addObserver(player, position, {
    viewRange: 200,      // View range
    observable: true     // Can be seen by other observers (default true)
});

// NPC that only observes but cannot be observed
aoi.addObserver(camera, position, {
    viewRange: 500,
    observable: false
});
```

### removeObserver

Remove an observer:

```typescript
aoi.removeObserver(player);
```

### updatePosition

Update position (automatically triggers enter/exit events):

```typescript
aoi.updatePosition(player, newPosition);
```

### updateViewRange

Update view range:

```typescript
// View range expanded after buff
aoi.updateViewRange(player, 300);
```

## Query Methods

### getEntitiesInView

Get all entities within an observer's view:

```typescript
const visible = aoi.getEntitiesInView(player);
for (const entity of visible) {
    updateEntityForPlayer(player, entity);
}
```

### getObserversOf

Get all observers who can see a specific entity:

```typescript
const observers = aoi.getObserversOf(monster);
for (const observer of observers) {
    notifyMonsterMoved(observer, monster);
}
```

### canSee

Check visibility:

```typescript
if (aoi.canSee(player, enemy)) {
    enemy.showHealthBar();
}
```

## Event System

### Global Event Listener

```typescript
aoi.addListener((event) => {
    switch (event.type) {
        case 'enter':
            console.log(`${event.observer} sees ${event.target}`);
            break;
        case 'exit':
            console.log(`${event.target} left ${event.observer}'s view`);
            break;
    }
});
```

### Entity-Specific Event Listener

```typescript
// Only listen to a specific player's view events
aoi.addEntityListener(player, (event) => {
    if (event.type === 'enter') {
        sendToClient(player, 'entity_enter', event.target);
    } else if (event.type === 'exit') {
        sendToClient(player, 'entity_exit', event.target);
    }
});
```

### Event Types

```typescript
interface IAOIEvent<T> {
    type: 'enter' | 'exit' | 'update';
    observer: T;  // Observer (who saw the change)
    target: T;    // Target (object that changed)
    position: IVector2; // Target position
}
```

## Blueprint Nodes

- `GetEntitiesInView` - Get entities in view
- `GetObserversOf` - Get observers
- `CanSee` - Check visibility
- `OnEntityEnterView` - Enter view event
- `OnEntityExitView` - Exit view event

## Service Tokens

For dependency injection scenarios:

```typescript
import {
    SpatialIndexToken,
    SpatialQueryToken,
    AOIManagerToken,
    createGridSpatialIndex,
    createGridAOI
} from '@esengine/spatial';

// Register services
services.register(SpatialIndexToken, createGridSpatialIndex(100));
services.register(AOIManagerToken, createGridAOI(100));

// Get services
const spatialIndex = services.get(SpatialIndexToken);
const aoiManager = services.get(AOIManagerToken);
```
