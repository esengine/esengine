---
title: "Serialization System"
description: "ECS serialization system overview and full serialization"
---

The serialization system provides a complete solution for persisting scene, entity, and component data. It supports both full serialization and incremental serialization modes, suitable for game saves, network synchronization, scene editors, time rewinding, and more.

## Basic Concepts

The serialization system has two layers:

- **Full Serialization**: Serializes the complete scene state, including all entities, components, and scene data
- **Incremental Serialization**: Only serializes changes relative to a base snapshot, greatly reducing data size

### Supported Data Formats

- **JSON Format**: Human-readable, convenient for debugging and editing
- **Binary Format**: Uses MessagePack, smaller size and better performance

> **v2.2.2 Important Change**
>
> Starting from v2.2.2, binary serialization returns `Uint8Array` instead of Node.js `Buffer` to ensure browser compatibility:
> - `serialize({ format: 'binary' })` returns `string | Uint8Array` (was `string | Buffer`)
> - `deserialize(data)` accepts `string | Uint8Array` (was `string | Buffer`)
> - `applyIncremental(data)` accepts `IncrementalSnapshot | string | Uint8Array` (was including `Buffer`)
>
> **Migration Impact**:
> - **Runtime Compatible**: Node.js `Buffer` inherits from `Uint8Array`, existing code works directly
> - **Type Checking**: If your TypeScript code explicitly uses `Buffer` type, change to `Uint8Array`
> - **Browser Support**: `Uint8Array` is a standard JavaScript type supported by all modern browsers

## Full Serialization

### Basic Usage

#### 1. Mark Serializable Components

Use `@Serializable` and `@Serialize` decorators to mark components and fields for serialization:

```typescript
import { Component, ECSComponent, Serializable, Serialize } from '@esengine/ecs-framework';

@ECSComponent('Player')
@Serializable({ version: 1 })
class PlayerComponent extends Component {
  @Serialize()
  public name: string = '';

  @Serialize()
  public level: number = 1;

  @Serialize()
  public experience: number = 0;

  @Serialize()
  public position: { x: number; y: number } = { x: 0, y: 0 };

  // Fields without @Serialize() won't be serialized
  private tempData: any = null;
}
```

#### 2. Serialize Scene

```typescript
// JSON format serialization
const jsonData = scene.serialize({
  format: 'json',
  pretty: true  // Pretty print output
});

// Save to local storage
localStorage.setItem('gameSave', jsonData);

// Binary format serialization (smaller size)
const binaryData = scene.serialize({
  format: 'binary'
});

// Save to file (Node.js environment)
// Note: binaryData is Uint8Array type, Node.js fs can write it directly
fs.writeFileSync('save.bin', binaryData);
```

#### 3. Deserialize Scene

```typescript
// Restore from JSON
const saveData = localStorage.getItem('gameSave');
if (saveData) {
  scene.deserialize(saveData, {
    strategy: 'replace'  // Replace current scene content
  });
}

// Restore from Binary
const binaryData = fs.readFileSync('save.bin');
scene.deserialize(binaryData, {
  strategy: 'merge'  // Merge into existing scene
});
```

### Serialization Options

#### SerializationOptions

```typescript
interface SceneSerializationOptions {
  // Component types to serialize (optional)
  components?: ComponentType[];

  // Serialization format: 'json' or 'binary'
  format?: 'json' | 'binary';

  // Pretty print JSON output
  pretty?: boolean;

  // Include metadata
  includeMetadata?: boolean;
}
```

Example:

```typescript
// Only serialize specific component types
const saveData = scene.serialize({
  format: 'json',
  components: [PlayerComponent, InventoryComponent],
  pretty: true,
  includeMetadata: true
});
```

#### DeserializationOptions

```typescript
interface SceneDeserializationOptions {
  // Deserialization strategy
  strategy?: 'merge' | 'replace';

  // Component type registry (optional, uses global registry by default)
  componentRegistry?: Map<string, ComponentType>;
}
```

### Scene Custom Data

Besides entities and components, you can also serialize scene-level configuration data:

```typescript
// Set scene data
scene.sceneData.set('weather', 'rainy');
scene.sceneData.set('difficulty', 'hard');
scene.sceneData.set('checkpoint', { x: 100, y: 200 });

// Scene data is automatically included when serializing
const saveData = scene.serialize({ format: 'json' });

// Scene data is restored after deserialization
scene.deserialize(saveData);
console.log(scene.sceneData.get('weather')); // 'rainy'
```

## More Topics

- [Decorators & Inheritance](/en/guide/serialization/decorators) - Advanced decorator usage and component inheritance
- [Incremental Serialization](/en/guide/serialization/incremental) - Only serialize changes
- [Version Migration](/en/guide/serialization/migration) - Handle data structure changes
- [Use Cases](/en/guide/serialization/use-cases) - Save system, network sync, undo/redo examples
