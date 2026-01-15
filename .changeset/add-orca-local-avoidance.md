---
"@esengine/pathfinding": minor
---

feat(pathfinding): add ORCA local avoidance system

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
import {
  AvoidanceWorldComponent,
  AvoidanceAgentComponent,
  LocalAvoidanceSystem
} from '@esengine/pathfinding/ecs';

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
