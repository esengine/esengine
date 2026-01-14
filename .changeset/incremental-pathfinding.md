---
"@esengine/pathfinding": minor
---

### New Features

- **Incremental A* Pathfinder**: Time-sliced pathfinding that can execute across multiple frames without blocking
- **GridPathfinder**: Unified grid pathfinder with three modes:
  - `standard`: Classic A* implementation
  - `fast`: TypedArray optimized (1.76x speedup)
  - `bidirectional`: Dual-direction search for large maps
- **JPS Pathfinder**: Jump Point Search with 10x+ node reduction on open terrain
- **HPA* Pathfinder**: Hierarchical pathfinding for 1000x1000+ maps
- **Path Cache**: LRU cache with TTL and region invalidation (99x+ speedup for repeated queries)
- **IndexedBinaryHeap**: O(log n) update operations for efficient priority queue

### Breaking Changes

- **Multiple Entry Points**: The package now exports through separate entry points for better tree-shaking:
  - `@esengine/pathfinding` - Core pathfinding algorithms (no external dependencies except math)
  - `@esengine/pathfinding/ecs` - ECS components and systems (requires @esengine/ecs-framework)
  - `@esengine/pathfinding/nodes` - Blueprint nodes (requires @esengine/blueprint)
- `@esengine/ecs-framework` and `@esengine/blueprint` are now optional peer dependencies

### Performance

| Scenario | Result |
|----------|--------|
| Sync A* vs Incremental A* | ~1% overhead |
| A* vs GridPathfinder(fast) | 1.76x speedup |
| Cache warm vs cold | 99x+ speedup |
| JPS node reduction | 10x+ on open terrain |
| HPA* search speedup | 1.7-1.9x |
