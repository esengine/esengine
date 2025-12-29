---
title: "Area of Interest (AOI)"
description: "View range based network entity filtering"
---

AOI (Area of Interest) is a key technique in large-scale multiplayer games for optimizing network bandwidth. By only synchronizing entities within a player's view range, network traffic can be significantly reduced.

## NetworkAOISystem

`NetworkAOISystem` provides grid-based area of interest management.

### Enable AOI

```typescript
import { NetworkPlugin } from '@esengine/network';

const networkPlugin = new NetworkPlugin({
    enableAOI: true,
    aoiConfig: {
        cellSize: 100,           // Grid cell size
        defaultViewRange: 500,   // Default view range
        enabled: true,
    }
});

await Core.installPlugin(networkPlugin);
```

### Adding Observers

Each player that needs to receive sync data must be added as an observer:

```typescript
// Add observer when player joins
networkPlugin.registerPrefab('player', (scene, spawn) => {
    const entity = scene.createEntity(`player_${spawn.netId}`);

    // ... setup components

    // Add player as AOI observer
    networkPlugin.addAOIObserver(
        spawn.netId,     // Network ID
        spawn.pos.x,     // Initial X position
        spawn.pos.y,     // Initial Y position
        600              // View range (optional)
    );

    return entity;
});

// Remove observer when player leaves
networkPlugin.removeAOIObserver(playerNetId);
```

### Updating Observer Position

When a player moves, update their AOI position:

```typescript
// Update in game loop or sync callback
networkPlugin.updateAOIObserverPosition(playerNetId, newX, newY);
```

## AOI Configuration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `cellSize` | `number` | 100 | Grid cell size |
| `defaultViewRange` | `number` | 500 | Default view range |
| `enabled` | `boolean` | true | Whether AOI is enabled |

### Grid Size Recommendations

Grid size should be set based on game view range:

```typescript
// Recommendation: cellSize = defaultViewRange / 3 to / 5
aoiConfig: {
    cellSize: 100,
    defaultViewRange: 500,  // Grid is about 1/5 of view range
}
```

## Query Interface

### Get Visible Entities

```typescript
// Get all entities visible to player
const visibleEntities = networkPlugin.getVisibleEntities(playerNetId);
console.log('Visible entities:', visibleEntities);
```

### Check Visibility

```typescript
// Check if player can see an entity
if (networkPlugin.canSee(playerNetId, targetEntityNetId)) {
    // Target is in view
}
```

## Event Listening

The AOI system triggers events when entities enter/exit view:

```typescript
const aoiSystem = networkPlugin.aoiSystem;

if (aoiSystem) {
    aoiSystem.addListener((event) => {
        if (event.type === 'enter') {
            console.log(`Entity ${event.targetNetId} entered view of ${event.observerNetId}`);
            // Can send entity's initial state here
        } else if (event.type === 'exit') {
            console.log(`Entity ${event.targetNetId} left view of ${event.observerNetId}`);
            // Can cleanup resources here
        }
    });
}
```

## Server-Side Filtering

AOI is most commonly used server-side to filter sync data for each client:

```typescript
// Server-side example
import { NetworkAOISystem, createNetworkAOISystem } from '@esengine/network';

class GameServer {
    private aoiSystem = createNetworkAOISystem({
        cellSize: 100,
        defaultViewRange: 500,
    });

    // Player joins
    onPlayerJoin(playerId: number, x: number, y: number) {
        this.aoiSystem.addObserver(playerId, x, y);
    }

    // Player moves
    onPlayerMove(playerId: number, x: number, y: number) {
        this.aoiSystem.updateObserverPosition(playerId, x, y);
    }

    // Send sync data
    broadcastSync(allEntities: EntitySyncState[]) {
        for (const playerId of this.players) {
            // Filter using AOI
            const filteredEntities = this.aoiSystem.filterSyncData(
                playerId,
                allEntities
            );

            // Send only visible entities
            this.sendToPlayer(playerId, { entities: filteredEntities });
        }
    }
}
```

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                        Game World                           │
│  ┌─────┬─────┬─────┬─────┬─────┐                            │
│  │     │     │  E  │     │     │                            │
│  ├─────┼─────┼─────┼─────┼─────┤   E = Enemy entity         │
│  │     │  P  │  ●  │     │     │   P = Player               │
│  ├─────┼─────┼─────┼─────┼─────┤   ● = Player view center   │
│  │     │     │  E  │  E  │     │   ○ = View range           │
│  ├─────┼─────┼─────┼─────┼─────┤                            │
│  │     │     │     │     │  E  │   Player only sees E in view│
│  └─────┴─────┴─────┴─────┴─────┘                            │
│                                                              │
│  View range (circle): Contains 3 enemies                     │
│  Grid optimization: Only check cells covered by view         │
└─────────────────────────────────────────────────────────────┘
```

### Grid Optimization

AOI uses spatial grid to accelerate queries:

1. **Add Entity**: Calculate grid cell based on position
2. **View Detection**: Only check cells covered by view range
3. **Move Update**: Update cell assignment when crossing cells
4. **Event Trigger**: Detect enter/exit view

## Dynamic View Range

Different player types can have different view ranges:

```typescript
// Regular player
networkPlugin.addAOIObserver(playerId, x, y, 500);

// VIP player (larger view)
networkPlugin.addAOIObserver(vipPlayerId, x, y, 800);

// Adjust view range at runtime
const aoiSystem = networkPlugin.aoiSystem;
if (aoiSystem) {
    aoiSystem.updateObserverViewRange(playerId, 600);
}
```

## Best Practices

### 1. Server-Side Usage

AOI filtering should be done server-side; clients should not trust their own AOI judgment:

```typescript
// Filter on server before sending
const filtered = aoiSystem.filterSyncData(playerId, entities);
sendToClient(playerId, filtered);
```

### 2. Edge Handling

Add buffer zone at view edge to prevent flickering:

```typescript
// Add immediately when entering view
// Remove with delay when exiting (keep for 1-2 extra seconds)
aoiSystem.addListener((event) => {
    if (event.type === 'exit') {
        setTimeout(() => {
            // Re-check if really exited
            if (!aoiSystem.canSee(event.observerNetId, event.targetNetId)) {
                removeFromClient(event.observerNetId, event.targetNetId);
            }
        }, 1000);
    }
});
```

### 3. Large Entities

Large entities (like bosses) may need special handling:

```typescript
// Boss is always visible to everyone
function filterWithBoss(playerId: number, entities: EntitySyncState[]) {
    const filtered = aoiSystem.filterSyncData(playerId, entities);

    // Add boss entity
    const bossState = entities.find(e => e.netId === bossNetId);
    if (bossState && !filtered.includes(bossState)) {
        filtered.push(bossState);
    }

    return filtered;
}
```

### 4. Performance Considerations

```typescript
// Large-scale game recommended config
aoiConfig: {
    cellSize: 200,           // Larger grid reduces cell count
    defaultViewRange: 800,   // Set based on actual view
}
```

## Debugging

```typescript
const aoiSystem = networkPlugin.aoiSystem;

if (aoiSystem) {
    console.log('AOI enabled:', aoiSystem.enabled);
    console.log('Observer count:', aoiSystem.observerCount);

    // Get visible entities for specific player
    const visible = aoiSystem.getVisibleEntities(playerId);
    console.log('Visible entities:', visible.length);
}
```
