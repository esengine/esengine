---
title: "Compiled Query"
description: "CompiledQuery type-safe query tool"
---

> **v2.4.0+**

CompiledQuery is a lightweight query tool providing type-safe component access and change detection support. Suitable for ad-hoc queries, tool development, and simple iteration scenarios.

## Basic Usage

```typescript
// Create compiled query
const query = scene.querySystem.compile(Position, Velocity);

// Type-safe iteration - component parameters auto-infer types
query.forEach((entity, pos, vel) => {
    pos.x += vel.vx * deltaTime;
    pos.y += vel.vy * deltaTime;
});

// Get entity count
console.log(`Matched entities: ${query.count}`);

// Get first matched entity
const first = query.first();
if (first) {
    const [entity, pos, vel] = first;
    console.log(`First entity: ${entity.name}`);
}
```

## Change Detection

CompiledQuery supports epoch-based change detection:

```typescript
class RenderSystem extends EntitySystem {
    private _query: CompiledQuery<[typeof Transform, typeof Sprite]>;
    private _lastEpoch = 0;

    protected onInitialize(): void {
        this._query = this.scene!.querySystem.compile(Transform, Sprite);
    }

    protected process(entities: readonly Entity[]): void {
        // Only process entities where Transform or Sprite changed
        this._query.forEachChanged(this._lastEpoch, (entity, transform, sprite) => {
            this.updateRenderData(entity, transform, sprite);
        });

        // Save current epoch as next check starting point
        this._lastEpoch = this.scene!.epochManager.current;
    }

    private updateRenderData(entity: Entity, transform: Transform, sprite: Sprite): void {
        // Update render data
    }
}
```

## Functional API

CompiledQuery provides rich functional APIs:

```typescript
const query = scene.querySystem.compile(Position, Health);

// map - Transform entity data
const positions = query.map((entity, pos, health) => ({
    x: pos.x,
    y: pos.y,
    healthPercent: health.current / health.max
}));

// filter - Filter entities
const lowHealthEntities = query.filter((entity, pos, health) => {
    return health.current < health.max * 0.2;
});

// find - Find first matching entity
const target = query.find((entity, pos, health) => {
    return health.current > 0 && pos.x > 100;
});

// toArray - Convert to array
const allData = query.toArray();
for (const [entity, pos, health] of allData) {
    console.log(`${entity.name}: ${pos.x}, ${pos.y}`);
}

// any/empty - Check for matches
if (query.any()) {
    console.log('Has matching entities');
}
if (query.empty()) {
    console.log('No matching entities');
}
```

## CompiledQuery vs EntitySystem

| Feature | CompiledQuery | EntitySystem |
|---------|---------------|--------------|
| **Purpose** | Lightweight query tool | Complete system logic |
| **Lifecycle** | None | Full (onInitialize, onDestroy, etc.) |
| **Scheduling Integration** | None | Supports @Stage, @Before, @After |
| **Change Detection** | forEachChanged | forEachChanged |
| **Event Listening** | None | addEventListener |
| **Command Buffer** | None | this.commands |
| **Type-Safe Components** | forEach params auto-infer | Need manual getComponent |
| **Use Cases** | Ad-hoc queries, tools, prototypes | Core game logic |

**Selection Advice**:

- Use **EntitySystem** for core game logic (movement, combat, AI, etc.)
- Use **CompiledQuery** for one-time queries, tool development, or simple iteration

## API Reference

| Method | Description |
|--------|-------------|
| `forEach(callback)` | Iterate all matched entities, type-safe component params |
| `forEachChanged(sinceEpoch, callback)` | Only iterate changed entities |
| `first()` | Get first matched entity and components |
| `toArray()` | Convert to [entity, ...components] array |
| `map(callback)` | Map transformation |
| `filter(predicate)` | Filter entities |
| `find(predicate)` | Find first entity meeting condition |
| `any()` | Whether any matches exist |
| `empty()` | Whether no matches exist |
| `count` | Number of matched entities |
| `entities` | Matched entity list (read-only) |
