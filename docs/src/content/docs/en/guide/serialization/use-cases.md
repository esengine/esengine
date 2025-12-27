---
title: "Use Cases"
description: "Practical examples of the serialization system"
---

## Game Save System

```typescript
class SaveSystem {
  private static SAVE_KEY = 'game_save';

  // Save game
  public static saveGame(scene: Scene): void {
    const saveData = scene.serialize({
      format: 'json',
      pretty: false
    });

    localStorage.setItem(this.SAVE_KEY, saveData);
    console.log('Game saved');
  }

  // Load game
  public static loadGame(scene: Scene): boolean {
    const saveData = localStorage.getItem(this.SAVE_KEY);
    if (saveData) {
      scene.deserialize(saveData, {
        strategy: 'replace'
      });
      console.log('Game loaded');
      return true;
    }
    return false;
  }

  // Check if save exists
  public static hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }
}
```

## Network Synchronization

```typescript
class NetworkSync {
  private baseSnapshot?: any;
  private syncInterval: number = 100; // Sync every 100ms

  constructor(private scene: Scene, private socket: WebSocket) {
    this.setupSync();
  }

  private setupSync(): void {
    // Create base snapshot
    this.scene.createIncrementalSnapshot();

    // Periodically send incremental updates
    setInterval(() => {
      this.sendIncremental();
    }, this.syncInterval);

    // Receive remote incremental updates
    this.socket.onmessage = (event) => {
      this.receiveIncremental(event.data);
    };
  }

  private sendIncremental(): void {
    const incremental = this.scene.serializeIncremental();
    const stats = IncrementalSerializer.getIncrementalStats(incremental);

    // Only send when there are changes
    if (stats.totalChanges > 0) {
      // Use binary format to reduce network transmission
      const binaryData = IncrementalSerializer.serializeIncremental(incremental, {
        format: 'binary'
      });
      this.socket.send(binaryData);

      // Update base
      this.scene.updateIncrementalSnapshot();
    }
  }

  private receiveIncremental(data: ArrayBuffer): void {
    // Directly apply binary data (ArrayBuffer to Uint8Array)
    const uint8Array = new Uint8Array(data);
    this.scene.applyIncremental(uint8Array);
  }
}
```

## Undo/Redo System

```typescript
class UndoRedoSystem {
  private history: IncrementalSnapshot[] = [];
  private currentIndex: number = -1;
  private maxHistory: number = 50;

  constructor(private scene: Scene) {
    // Create initial snapshot
    this.scene.createIncrementalSnapshot();
    this.saveState('Initial');
  }

  // Save current state
  public saveState(label: string): void {
    const incremental = this.scene.serializeIncremental();

    // Remove history after current position
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state
    this.history.push(incremental);
    this.currentIndex++;

    // Limit history count
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }

    // Update snapshot base
    this.scene.updateIncrementalSnapshot();
  }

  // Undo
  public undo(): boolean {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      const incremental = this.history[this.currentIndex];
      this.scene.applyIncremental(incremental);
      return true;
    }
    return false;
  }

  // Redo
  public redo(): boolean {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const incremental = this.history[this.currentIndex];
      this.scene.applyIncremental(incremental);
      return true;
    }
    return false;
  }

  public canUndo(): boolean {
    return this.currentIndex > 0;
  }

  public canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }
}
```

## Level Editor

```typescript
class LevelEditor {
  // Export level
  public exportLevel(scene: Scene, filename: string): void {
    const levelData = scene.serialize({
      format: 'json',
      pretty: true,
      includeMetadata: true
    });

    // Browser environment
    const blob = new Blob([levelData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import level
  public importLevel(scene: Scene, fileContent: string): void {
    scene.deserialize(fileContent, {
      strategy: 'replace'
    });
  }

  // Validate level data
  public validateLevel(saveData: string): boolean {
    const validation = SceneSerializer.validate(saveData);
    if (!validation.valid) {
      console.error('Level data invalid:', validation.errors);
      return false;
    }
    return true;
  }

  // Get level info (without full deserialization)
  public getLevelInfo(saveData: string): any {
    const info = SceneSerializer.getInfo(saveData);
    return info;
  }
}
```

## Performance Tips

### 1. Choose the Right Format

- **Development**: Use JSON format for easy debugging and inspection
- **Production**: Use Binary format to reduce 30-50% data size

### 2. Serialize On-Demand

```typescript
// Only serialize components that need persistence
const saveData = scene.serialize({
  format: 'binary',
  components: [PlayerComponent, InventoryComponent, QuestComponent]
});
```

### 3. Optimize Incremental Serialization

```typescript
// For high-frequency sync, disable deep comparison for better performance
scene.createIncrementalSnapshot({
  deepComponentComparison: false  // Only detect component addition/removal
});
```

## Best Practices

### 1. Explicitly Mark Serialized Fields

```typescript
// Clearly mark fields that need serialization
@ECSComponent('Player')
@Serializable({ version: 1 })
class PlayerComponent extends Component {
  @Serialize()
  public name: string = '';

  @Serialize()
  public level: number = 1;

  // Runtime data not serialized
  private _cachedSprite: any = null;
}
```

### 2. Use Version Control

```typescript
// Specify version for components
@Serializable({ version: 2 })
class PlayerComponent extends Component {
  // Version 2 fields
}

// Register migration function to ensure compatibility
VersionMigrationManager.registerComponentMigration('Player', 1, 2, migrateV1ToV2);
```

### 3. Avoid Circular References

```typescript
// Don't directly reference other entities in components
@ECSComponent('Follower')
@Serializable({ version: 1 })
class FollowerComponent extends Component {
  // Store entity ID instead of entity reference
  @Serialize()
  public targetId: number = 0;

  // Find target entity through scene
  public getTarget(scene: Scene): Entity | null {
    return scene.entities.findEntityById(this.targetId);
  }
}
```

### 4. Compress Large Data

```typescript
// For large data structures, use custom serialization
@ECSComponent('LargeData')
@Serializable({ version: 1 })
class LargeDataComponent extends Component {
  @Serialize({
    serializer: (data: LargeObject) => compressData(data),
    deserializer: (data: CompressedData) => decompressData(data)
  })
  public data: LargeObject;
}
```

## Performance Comparison

| Scenario | JSON Format | Binary Format | Savings |
|----------|-------------|---------------|---------|
| Small save (100 entities) | 50KB | 35KB | 30% |
| Medium save (1000 entities) | 500KB | 300KB | 40% |
| Large save (10000 entities) | 5MB | 2.5MB | 50% |
