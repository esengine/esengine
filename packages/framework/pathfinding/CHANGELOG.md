# @esengine/pathfinding

## 12.1.2

### Patch Changes

- [`32f3343`](https://github.com/esengine/esengine/commit/32f33432ad25ef987efb34bc18bf5b105b0a26ea) Thanks [@esengine](https://github.com/esengine)! - fix: remove publishConfig.directory to fix npm publish

- Updated dependencies [[`32f3343`](https://github.com/esengine/esengine/commit/32f33432ad25ef987efb34bc18bf5b105b0a26ea)]:
    - @esengine/ecs-framework-math@2.10.3

## 12.1.1

### Patch Changes

- Updated dependencies [[`3364107`](https://github.com/esengine/esengine/commit/33641075d1a96523d27bed59abf28c026ba34a90)]:
    - @esengine/ecs-framework-math@2.10.2

## 12.1.0

### Minor Changes

- [#451](https://github.com/esengine/esengine/pull/451) [`03c6ecf`](https://github.com/esengine/esengine/commit/03c6ecfb63586f0bed9ea1ef03314d7f08ca9006) Thanks [@esengine](https://github.com/esengine)! - ### New Features
    - **Incremental A\* Pathfinder**: Time-sliced pathfinding that can execute across multiple frames without blocking
    - **GridPathfinder**: Unified grid pathfinder with three modes:
        - `standard`: Classic A\* implementation
        - `fast`: TypedArray optimized (1.76x speedup)
        - `bidirectional`: Dual-direction search for large maps
    - **JPS Pathfinder**: Jump Point Search with 10x+ node reduction on open terrain
    - **HPA\* Pathfinder**: Hierarchical pathfinding for 1000x1000+ maps
    - **Path Cache**: LRU cache with TTL and region invalidation (99x+ speedup for repeated queries)
    - **IndexedBinaryHeap**: O(log n) update operations for efficient priority queue

    ### Breaking Changes
    - **Multiple Entry Points**: The package now exports through separate entry points for better tree-shaking:
        - `@esengine/pathfinding` - Core pathfinding algorithms (no external dependencies except math)
        - `@esengine/pathfinding/ecs` - ECS components and systems (requires @esengine/ecs-framework)
        - `@esengine/pathfinding/nodes` - Blueprint nodes (requires @esengine/blueprint)
    - `@esengine/ecs-framework` and `@esengine/blueprint` are now optional peer dependencies

    ### Performance

    | Scenario                    | Result               |
    | --------------------------- | -------------------- |
    | Sync A* vs Incremental A*   | ~1% overhead         |
    | A\* vs GridPathfinder(fast) | 1.76x speedup        |
    | Cache warm vs cold          | 99x+ speedup         |
    | JPS node reduction          | 10x+ on open terrain |
    | HPA\* search speedup        | 1.7-1.9x             |

## 12.0.0

### Patch Changes

- Updated dependencies [[`4e66bd8`](https://github.com/esengine/esengine/commit/4e66bd8e2be80b366a7723dcc48b99df0457aed4)]:
    - @esengine/blueprint@4.5.0
    - @esengine/ecs-framework-math@2.10.1

## 11.0.0

### Patch Changes

- Updated dependencies [[`fa593a3`](https://github.com/esengine/esengine/commit/fa593a3c69292207800750f8106f418465cb7c0f)]:
    - @esengine/ecs-framework-math@2.10.0

## 10.0.0

### Patch Changes

- Updated dependencies [[`bffe90b`](https://github.com/esengine/esengine/commit/bffe90b6a17563cc90709faf339b229dc3abd22d)]:
    - @esengine/ecs-framework-math@2.9.0

## 9.0.0

### Patch Changes

- Updated dependencies [[`30173f0`](https://github.com/esengine/esengine/commit/30173f076415c9770a429b236b8bab95a2fdc498)]:
    - @esengine/ecs-framework-math@2.8.0

## 8.0.0

### Patch Changes

- Updated dependencies [[`0d33cf0`](https://github.com/esengine/esengine/commit/0d33cf00977d16e6282931aba2cf771ec2c84c6b)]:
    - @esengine/blueprint@4.4.0

## 7.0.0

### Patch Changes

- Updated dependencies [[`c2acd14`](https://github.com/esengine/esengine/commit/c2acd14fce83af6cd116b3f2e40607229ccc3d6e)]:
    - @esengine/blueprint@4.3.0

## 6.0.0

### Patch Changes

- Updated dependencies [[`2e84942`](https://github.com/esengine/esengine/commit/2e84942ea14c5326620398add05840fa8bea16f8)]:
    - @esengine/blueprint@4.2.0

## 5.0.0

### Patch Changes

- Updated dependencies [[`caf3be7`](https://github.com/esengine/esengine/commit/caf3be72cdcc730492c63abe5f1715893f3579ac)]:
    - @esengine/blueprint@4.1.0

## 4.0.1

### Patch Changes

- Updated dependencies [[`3e5b778`](https://github.com/esengine/esengine/commit/3e5b7783beec08e247f7525184935401923ecde8)]:
    - @esengine/ecs-framework@2.7.1
    - @esengine/blueprint@4.0.1

## 4.0.0

### Patch Changes

- Updated dependencies [[`1f3a76a`](https://github.com/esengine/esengine/commit/1f3a76aabea2d3eb8a5eb8b73e29127da57e2028)]:
    - @esengine/ecs-framework@2.7.0
    - @esengine/blueprint@4.0.0

## 3.0.1

### Patch Changes

- Updated dependencies [[`04b08f3`](https://github.com/esengine/esengine/commit/04b08f3f073d69beb8f4be399c774bea0acb612e)]:
    - @esengine/ecs-framework@2.6.1
    - @esengine/blueprint@3.0.1

## 3.0.0

### Patch Changes

- Updated dependencies []:
    - @esengine/ecs-framework@2.6.0
    - @esengine/blueprint@3.0.0

## 2.0.1

### Patch Changes

- Updated dependencies [[`a08a84b`](https://github.com/esengine/esengine/commit/a08a84b7db28e1140cbc637d442552747ad81c76)]:
    - @esengine/ecs-framework@2.5.1
    - @esengine/blueprint@2.0.1

## 2.0.0

### Patch Changes

- Updated dependencies [[`1f297ac`](https://github.com/esengine/esengine/commit/1f297ac769e37700f72fb4425639af7090898256)]:
    - @esengine/ecs-framework@2.5.0
    - @esengine/blueprint@2.0.0

## 1.0.4

### Patch Changes

- [#376](https://github.com/esengine/esengine/pull/376) [`0662b07`](https://github.com/esengine/esengine/commit/0662b074454906ad7c0264fe1d3a241f13730ba1) Thanks [@esengine](https://github.com/esengine)! - fix: update pathfinding package to resolve npm version conflict

## 1.0.3

### Patch Changes

- Updated dependencies [[`7d74623`](https://github.com/esengine/esengine/commit/7d746237100084ac3456f1af92ff664db4e50cc8)]:
    - @esengine/ecs-framework@2.4.4
    - @esengine/blueprint@1.0.2

## 1.0.2

### Patch Changes

- Updated dependencies [[`ce2db4e`](https://github.com/esengine/esengine/commit/ce2db4e48a7cdac44265420ef16e83f6424f4dea)]:
    - @esengine/ecs-framework@2.4.3
    - @esengine/blueprint@1.0.1

## 1.0.1

### Patch Changes

- [#347](https://github.com/esengine/esengine/pull/347) [`ede440d`](https://github.com/esengine/esengine/commit/ede440d277e5834f7ccf5e771d2186873570438b) Thanks [@esengine](https://github.com/esengine)! - fix: 补充 peerDependencies, repository 和 keywords 配置
