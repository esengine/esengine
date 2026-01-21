# @esengine/pathfinding

## 13.3.0

### Minor Changes

- [#468](https://github.com/esengine/esengine/pull/468) [`39b0ebf`](https://github.com/esengine/esengine/commit/39b0ebf69fe870dfb6bd1c3067af383d2927e66e) Thanks [@esengine](https://github.com/esengine)! - ## Pathfinding Module Refactoring

    ### New Features
    - Added `NavigationSystem` as unified navigation and avoidance system
    - Added `NavigationAgentComponent` combining pathfinding and avoidance functionality
    - Added `ORCAConfigComponent` for per-agent ORCA configuration
    - Added `RadiusAwarePathSmoother` for agent-radius-aware path smoothing
    - Added `CollisionResolver` for post-ORCA collision resolution
    - Added engine adapters (Cocos, Laya) in `adapters/` directory

    ### Improvements
    - Enhanced `ORCASolver` with configurable `yAxisDown` option for different coordinate systems
    - Improved `ObstacleBuilder` with automatic CCW vertex order detection and correction
    - Added `INavigationAgent` interface for unified agent representation
    - Improved path smoothing with radius-aware corner cutting

    ### Breaking Changes
    - Deprecated `PathfindingSystem`, `LocalAvoidanceSystem` in favor of unified `NavigationSystem`
    - Deprecated `PathfindingAgentComponent`, `AvoidanceAgentComponent` in favor of `NavigationAgentComponent`
    - Deprecated `AvoidanceWorldComponent` - configuration now on components

    ### Documentation
    - Updated pathfinding documentation to reflect new APIs
    - Added navigation system documentation
    - Fixed documentation errors in network, rpc modules

## 13.2.0

### Minor Changes

- [#464](https://github.com/esengine/esengine/pull/464) [`0f11191`](https://github.com/esengine/esengine/commit/0f11191da1e09890812bb80e03d2cdc960665773) Thanks [@esengine](https://github.com/esengine)! - feat(pathfinding): improve HPA\* algorithm with lazy intra-edges and better entrance node distribution
    - **Lazy Intra-Edges**: Delay intra-cluster path computation until first query, reducing preprocessing time from ~68s to ~52ms on large maps
    - **Entrance Node Distribution**: Fix path quality issue by distributing entrance nodes evenly across wide cluster boundaries instead of only placing at extremes
    - **Path Quality**: HPA* now produces near-optimal paths (ratio ~1.0 vs A*) on open maps, previously had significant detours

## 13.1.0

### Minor Changes

- [#462](https://github.com/esengine/esengine/pull/462) [`bbb7a2b`](https://github.com/esengine/esengine/commit/bbb7a2b7e2768e31d9ff9bc5d28181e7f51247ea) Thanks [@esengine](https://github.com/esengine)! - feat(pathfinding): add standalone avoidance subpath export

    Added `@esengine/pathfinding/avoidance` export path for direct access to ORCA local avoidance module without importing the full pathfinding package.

    ```typescript
    // New import path
    import { createORCASolver, createKDTree } from '@esengine/pathfinding/avoidance';
    ```

## 13.0.0

### Minor Changes

- [#460](https://github.com/esengine/esengine/pull/460) [`c6c8da1`](https://github.com/esengine/esengine/commit/c6c8da1f5b707a4ab43279b0a046a58797d08c66) Thanks [@esengine](https://github.com/esengine)! - feat(pathfinding): add ORCA local avoidance system

    ### New Features
    - **ORCA Algorithm**: Implement Optimal Reciprocal Collision Avoidance for multi-agent collision avoidance
    - **ECS Components**: Add `AvoidanceAgentComponent` and `AvoidanceWorldComponent` for easy integration
    - **LocalAvoidanceSystem**: System that automatically processes all avoidance agents each frame
    - **KD-Tree Spatial Index**: Efficient neighbor queries with `createKDTree()`
    - **Direct Solver API**: Use `createORCASolver()` for non-ECS usage
    - **Static Obstacle Support**: Define polygonal obstacles with CCW vertex ordering
    - **Pathfinding Integration**: Works seamlessly with `PathfindingAgentComponent`

    ### Usage

    ```typescript
    import { AvoidanceWorldComponent, AvoidanceAgentComponent, LocalAvoidanceSystem } from '@esengine/pathfinding/ecs';

    // Setup world
    const world = entity.addComponent(new AvoidanceWorldComponent());
    world.addRectObstacle(0, 0, 100, 10);

    // Setup agents
    const agent = entity.addComponent(new AvoidanceAgentComponent());
    agent.radius = 0.5;
    agent.maxSpeed = 5;

    // Add system
    scene.addSystem(new LocalAvoidanceSystem());

    // Each frame
    agent.setPreferredVelocityTowards(targetX, targetY);
    ```

### Patch Changes

- Updated dependencies [[`190924d`](https://github.com/esengine/esengine/commit/190924d2ad81df3d2b621ff70df8ba91ea2736c1)]:
    - @esengine/ecs-framework-math@2.11.0

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
