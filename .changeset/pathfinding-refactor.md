---
"@esengine/pathfinding": minor
---

## Pathfinding Module Refactoring

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
