---
title: "Advanced Pathfinding Algorithms"
description: "GridPathfinder, JPS, HPA* and other advanced pathfinding algorithms"
---

This page covers advanced pathfinding algorithms in `@esengine/pathfinding` for performance-sensitive scenarios.

## GridPathfinder

A unified high-performance grid pathfinder with three configurable modes:

```typescript
import { createGridPathfinder, GridMap } from '@esengine/pathfinding';

const grid = new GridMap(500, 500);

// fast mode (default) - suitable for medium to large maps
const pathfinder = createGridPathfinder(grid, { mode: 'fast' });

// bidirectional mode - suitable for very large open maps
const biPathfinder = createGridPathfinder(grid, { mode: 'bidirectional' });

// standard mode - basic A*
const basicPathfinder = createGridPathfinder(grid, { mode: 'standard' });

const result = pathfinder.findPath(0, 0, 499, 499);
```

### Mode Comparison

| Mode | Use Case | Optimization | Performance |
|------|----------|--------------|-------------|
| `standard` | Small maps | Basic A* | Baseline |
| `fast` | Medium-large maps | TypedArray + version reset | ~1.5-2x faster |
| `bidirectional` | Very large open maps | Dual-direction search | ~2-3x faster on large maps |

### Selection Guide

```typescript
function chooseMode(width: number, height: number): GridPathfinderMode {
    const size = width * height;
    if (size < 10000) return 'standard';       // < 100x100
    if (size < 250000) return 'fast';           // < 500x500
    return 'bidirectional';                      // Large open maps
}
```

## JPS (Jump Point Search)

Jump Point Search algorithm, 10-100x faster than A* on open maps.

```typescript
import { createJPSPathfinder, GridMap } from '@esengine/pathfinding';

const grid = new GridMap(300, 300);
const jps = createJPSPathfinder(grid);

const result = jps.findPath(0, 0, 299, 299);
console.log('Nodes searched:', result.nodesSearched); // Much fewer than A*
```

### How JPS Works

JPS "jumps" over symmetric paths, only expanding nodes at:
- Start and end points
- Turning points (forced neighbors)
- Jump endpoints

### JPS vs A* Performance

| Map Type | JPS Advantage | Notes |
|----------|---------------|-------|
| Open terrain | 10-100x fewer nodes | Best performance |
| Scattered obstacles | 3-10x fewer nodes | Still beneficial |
| Maze-like | 1-2x | Minimal advantage |

### When to Use JPS

```typescript
// ✅ Good for JPS
// - Open grasslands, desert terrain
// - Sparse obstacles
// - High-frequency pathfinding

// ❌ Not ideal for JPS
// - Maze-like maps
// - Very dense obstacles
// - Non-diagonal movement required
```

## HPA* (Hierarchical Pathfinding)

Hierarchical Pathfinding A* for very large maps.

```typescript
import { createHPAPathfinder, GridMap } from '@esengine/pathfinding';

const grid = new GridMap(1000, 1000);

// Create HPA* pathfinder
const hpa = createHPAPathfinder(grid, {
    clusterSize: 32,  // Cluster size
});

// Preprocess (build hierarchical graph)
hpa.preprocess();

// Find path
const result = hpa.findPath(10, 10, 990, 990);
```

### How HPA* Works

1. **Clustering**: Divide map into clusters
2. **Entrances**: Identify inter-cluster passages
3. **Abstract Graph**: Build cluster connectivity graph
4. **Hierarchical Search**: Search abstract graph first, then refine within clusters

### Configuration

```typescript
interface IHPAConfig {
    clusterSize: number;           // Cluster size, default 64
    maxEntranceWidth: number;      // Max entrance width, default 16
    cacheInternalPaths: boolean;   // Internal path caching, default true
    entranceStrategy?: 'middle' | 'end';  // Entrance strategy, default 'end'
    lazyIntraEdges?: boolean;      // Lazy intra-edge computation, default true
}
```

| Cluster Size | Preprocess Time | Search Speed | Memory |
|--------------|-----------------|--------------|--------|
| 10x10 | Longer | Faster | Higher |
| 20x20 | Medium | Medium | Medium |
| 40x40 | Shorter | Slower | Lower |

### When to Use HPA*

```typescript
// ✅ Good for HPA*
// - Very large maps (1000x1000+)
// - Relatively stable map structure
// - Many pathfinding requests

// ❌ Not ideal for HPA*
// - Small maps (preprocessing overhead not worth it)
// - Frequently changing maps
// - Single pathfinding scenarios
```

### Dynamic Updates

```typescript
// Need to reprocess when obstacles change
grid.setWalkable(100, 100, false);
hpa.preprocess(); // Rebuild hierarchical graph
```

## Path Caching

Cache repeated pathfinding requests for significant speedup:

```typescript
import { createPathCache, createAStarPathfinder } from '@esengine/pathfinding';

const pathfinder = createAStarPathfinder(grid);

// Create cache
const cache = createPathCache({
    maxEntries: 1000,  // Max cache entries
    ttlMs: 60000,      // TTL in milliseconds
});

// Cached pathfinding
function findPathCached(sx: number, sy: number, ex: number, ey: number) {
    const key = `${sx},${sy}-${ex},${ey}`;

    const cached = cache.get(key);
    if (cached) return cached;

    const result = pathfinder.findPath(sx, sy, ex, ey);
    cache.set(key, result);
    return result;
}
```

### Caching Strategies

| Strategy | Description | Use Case |
|----------|-------------|----------|
| Exact match | Same start and end | Fixed targets (buildings) |
| Region match | Start/end in same region | Many agents going to similar locations |
| TTL expiry | Auto-clear after timeout | Maps that change |

## Algorithm Selection Guide

```
Need to choose a pathfinding algorithm?
    │
    ├── Map < 100x100?
    │   └── AStarPathfinder or GridPathfinder(standard)
    │
    ├── Map 100x100 ~ 500x500?
    │   ├── Open terrain? → JPSPathfinder
    │   └── Has obstacles? → GridPathfinder(fast)
    │
    ├── Map > 500x500?
    │   ├── Open terrain? → GridPathfinder(bidirectional)
    │   └── Many pathfinding requests? → HPAPathfinder
    │
    └── Need non-blocking?
        └── IncrementalAStarPathfinder
```

## Performance Benchmarks

Diagonal path on 500x500 open map (0,0 → 499,499):

| Algorithm | Time | Nodes Searched |
|-----------|------|----------------|
| A* | ~3ms | ~500 |
| GridPathfinder(fast) | ~1.5ms | ~500 |
| GridPathfinder(bidirectional) | ~1ms | ~250 |
| JPS | ~0.5ms | ~3 |
| HPA* (after preprocess) | ~0.2ms | - |

*Actual performance varies by map structure and hardware*

## Related Documentation

- [Grid Map API](./grid-map) - GridMap basics
- [Incremental Pathfinding](./incremental) - Time-sliced execution
- [Examples](./examples) - Complete usage examples
