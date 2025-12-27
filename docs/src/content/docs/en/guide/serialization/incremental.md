---
title: "Incremental Serialization"
description: "Only serialize changes in the scene"
---

Incremental serialization only saves the changed parts of a scene, suitable for network synchronization, undo/redo, time rewinding, and other scenarios requiring frequent state saving.

## Basic Usage

### 1. Create Base Snapshot

```typescript
// Create base snapshot before starting to record changes
scene.createIncrementalSnapshot();
```

### 2. Modify Scene

```typescript
// Add entity
const enemy = scene.createEntity('Enemy');
enemy.addComponent(new PositionComponent(100, 200));
enemy.addComponent(new HealthComponent(50));

// Modify component
const player = scene.findEntity('Player');
const pos = player.getComponent(PositionComponent);
pos.x = 300;
pos.y = 400;

// Remove component
player.removeComponentByType(BuffComponent);

// Delete entity
const oldEntity = scene.findEntity('ToDelete');
oldEntity.destroy();

// Modify scene data
scene.sceneData.set('score', 1000);
```

### 3. Get Incremental Changes

```typescript
// Get all changes relative to base snapshot
const incremental = scene.serializeIncremental();

// View change statistics
const stats = IncrementalSerializer.getIncrementalStats(incremental);
console.log('Total changes:', stats.totalChanges);
console.log('Added entities:', stats.addedEntities);
console.log('Removed entities:', stats.removedEntities);
console.log('Added components:', stats.addedComponents);
console.log('Updated components:', stats.updatedComponents);
```

### 4. Serialize Incremental Data

```typescript
// JSON format (default)
const jsonData = IncrementalSerializer.serializeIncremental(incremental, {
  format: 'json'
});

// Binary format (smaller size, higher performance)
const binaryData = IncrementalSerializer.serializeIncremental(incremental, {
  format: 'binary'
});

// Pretty print JSON output (for debugging)
const prettyJson = IncrementalSerializer.serializeIncremental(incremental, {
  format: 'json',
  pretty: true
});

// Send or save
socket.send(binaryData);  // Use binary for network transmission
localStorage.setItem('changes', jsonData);  // JSON for local storage
```

### 5. Apply Incremental Changes

```typescript
// Apply changes to another scene
const otherScene = new Scene();

// Directly apply incremental object
otherScene.applyIncremental(incremental);

// Apply from JSON string
const jsonData = IncrementalSerializer.serializeIncremental(incremental, { format: 'json' });
otherScene.applyIncremental(jsonData);

// Apply from binary Uint8Array
const binaryData = IncrementalSerializer.serializeIncremental(incremental, { format: 'binary' });
otherScene.applyIncremental(binaryData);
```

## Incremental Snapshot Management

### Update Snapshot Base

After applying incremental changes, you can update the snapshot base:

```typescript
// Create initial snapshot
scene.createIncrementalSnapshot();

// First modification
entity.addComponent(new VelocityComponent(5, 0));
const incremental1 = scene.serializeIncremental();

// Update base (set current state as new base)
scene.updateIncrementalSnapshot();

// Second modification (incremental will be based on updated base)
entity.getComponent(VelocityComponent).dx = 10;
const incremental2 = scene.serializeIncremental();
```

### Clear Snapshot

```typescript
// Release memory used by snapshot
scene.clearIncrementalSnapshot();

// Check if snapshot exists
if (scene.hasIncrementalSnapshot()) {
  console.log('Incremental snapshot exists');
}
```

## Incremental Serialization Options

```typescript
interface IncrementalSerializationOptions {
  // Whether to perform deep comparison of component data
  // Default true, set to false to improve performance but may miss internal field changes
  deepComponentComparison?: boolean;

  // Whether to track scene data changes
  // Default true
  trackSceneData?: boolean;

  // Whether to compress snapshot (using JSON serialization)
  // Default false
  compressSnapshot?: boolean;

  // Serialization format
  // 'json': JSON format (readable, convenient for debugging)
  // 'binary': MessagePack binary format (smaller, higher performance)
  // Default 'json'
  format?: 'json' | 'binary';

  // Whether to pretty print JSON output (only effective when format='json')
  // Default false
  pretty?: boolean;
}

// Using options
scene.createIncrementalSnapshot({
  deepComponentComparison: true,
  trackSceneData: true
});
```

## Incremental Data Structure

Incremental snapshots contain the following change types:

```typescript
interface IncrementalSnapshot {
  version: number;           // Snapshot version number
  timestamp: number;         // Timestamp
  sceneName: string;         // Scene name
  baseVersion: number;       // Base version number
  entityChanges: EntityChange[];      // Entity changes
  componentChanges: ComponentChange[]; // Component changes
  sceneDataChanges: SceneDataChange[]; // Scene data changes
}

// Change operation types
enum ChangeOperation {
  EntityAdded = 'entity_added',
  EntityRemoved = 'entity_removed',
  EntityUpdated = 'entity_updated',
  ComponentAdded = 'component_added',
  ComponentRemoved = 'component_removed',
  ComponentUpdated = 'component_updated',
  SceneDataUpdated = 'scene_data_updated'
}
```

## Performance Optimization

### For High-Frequency Sync

```typescript
// Disable deep comparison to improve performance
scene.createIncrementalSnapshot({
  deepComponentComparison: false  // Only detect component addition/removal
});
```

### Batch Operations

```typescript
// Batch modify then serialize
scene.entities.buffer.forEach(entity => {
  // Batch modifications
});

// Serialize all changes at once
const incremental = scene.serializeIncremental();
```

## API Reference

| Method | Description |
|--------|-------------|
| `scene.createIncrementalSnapshot(options?)` | Create base snapshot |
| `scene.serializeIncremental()` | Get incremental changes |
| `scene.applyIncremental(data)` | Apply incremental changes |
| `scene.updateIncrementalSnapshot()` | Update snapshot base |
| `scene.clearIncrementalSnapshot()` | Clear snapshot |
| `scene.hasIncrementalSnapshot()` | Check if snapshot exists |
| `IncrementalSerializer.getIncrementalStats(snapshot)` | Get change statistics |
| `IncrementalSerializer.serializeIncremental(snapshot, options)` | Serialize incremental data |
