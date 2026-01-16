---
title: "ORCA Local Avoidance Demo"
description: "Interactive multi-agent collision avoidance demo using ECS architecture"
---

This is an interactive demo showcasing the ORCA (Optimal Reciprocal Collision Avoidance) algorithm, implemented with ECS architecture.

## Live Demo

<div style="text-align: center; margin: 30px 0;">
  <a href="/esengine/demos/orca-avoidance/index.html" target="_blank" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4); transition: all 0.3s ease;">
    🤖 Open ORCA Avoidance Demo
  </a>
</div>

> **Tip**: The demo opens in a new window. Try different scenario presets and adjust parameters to observe agent behavior changes.

## Demo Features

### Scenario Presets

| Scenario | Description |
|----------|-------------|
| **Circle Swap** | Agents start on a circle and move to opposite positions |
| **Crossroads** | Four groups cross through the center from different directions |
| **Funnel** | Many agents pass through a narrow channel |
| **Random** | Agents randomly distributed, each heading to random targets |

### Adjustable Parameters

| Parameter | Description | Recommended |
|-----------|-------------|-------------|
| Agent Count | Total number of agents | 50-100 |
| Agent Radius | Collision radius | 6-12 |
| Max Speed | Movement speed limit | 80-150 |
| Neighbor Distance | Avoidance detection range | 60-100 |
| Time Horizon | Collision prediction time range | 1.5-3.0 |

## ECS Architecture Code

Here's the core ECS code structure used in the demo:

### Component Definitions

```typescript
// Transform Component - stores position
class TransformComponent {
    position = { x: 0, y: 0 };
}

// Avoidance Agent Component - stores avoidance data
class AvoidanceAgentComponent {
    velocity = { x: 0, y: 0 };           // Current velocity
    preferredVelocity = { x: 0, y: 0 };  // Desired velocity
    targetPosition = null;                // Target position
    radius = 8;                           // Agent radius
    maxSpeed = 100;                       // Maximum speed
    neighborDist = 80;                    // Neighbor detection distance
    maxNeighbors = 10;                    // Maximum neighbors
    timeHorizon = 2;                      // Time horizon

    // Set preferred velocity towards target
    setPreferredVelocityTowards(targetX, targetY) {
        const transform = this.entity.getComponent(TransformComponent);
        const dx = targetX - transform.position.x;
        const dy = targetY - transform.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            this.preferredVelocity = {
                x: (dx / dist) * this.maxSpeed,
                y: (dy / dist) * this.maxSpeed
            };
        } else {
            this.preferredVelocity = { x: 0, y: 0 };
        }
    }
}

// Render Component
class RenderComponent {
    color = '#00d4ff';
}
```

### System Definitions

```typescript
// Target Follow System - updates each agent's preferred velocity
class TargetFollowSystem {
    update(entities, dt) {
        for (const entity of entities) {
            const avoidance = entity.getComponent(AvoidanceAgentComponent);
            if (!avoidance || !avoidance.targetPosition) continue;

            avoidance.setPreferredVelocityTowards(
                avoidance.targetPosition.x,
                avoidance.targetPosition.y
            );
        }
    }
}

// Local Avoidance System - ORCA core
class LocalAvoidanceSystem {
    constructor() {
        this.kdTree = new KDTree();
        this.solver = new ORCASolver();
    }

    update(entities, dt) {
        // 1. Collect all agent data
        const agents = [];
        for (const entity of entities) {
            const transform = entity.getComponent(TransformComponent);
            const avoidance = entity.getComponent(AvoidanceAgentComponent);
            if (!transform || !avoidance) continue;

            agents.push({
                id: entity.id,
                entity,
                position: transform.position,
                velocity: avoidance.velocity,
                preferredVelocity: avoidance.preferredVelocity,
                radius: avoidance.radius,
                maxSpeed: avoidance.maxSpeed,
                neighborDist: avoidance.neighborDist,
                maxNeighbors: avoidance.maxNeighbors,
                timeHorizon: avoidance.timeHorizon
            });
        }

        // 2. Build KDTree for neighbor queries
        this.kdTree.build(agents);

        // 3. Compute avoidance velocity for each agent
        const newVelocities = new Map();
        for (const agent of agents) {
            const neighbors = this.kdTree.queryNeighbors(
                agent.position,
                agent.neighborDist,
                agent.maxNeighbors,
                agent.id
            ).map(r => r.agent);

            const newVel = this.solver.computeNewVelocity(agent, neighbors, []);
            newVelocities.set(agent.entity, newVel);
        }

        // 4. Apply velocities and update positions
        for (const [entity, newVel] of newVelocities) {
            const transform = entity.getComponent(TransformComponent);
            const avoidance = entity.getComponent(AvoidanceAgentComponent);

            avoidance.velocity = newVel;
            transform.position.x += newVel.x * dt;
            transform.position.y += newVel.y * dt;
        }
    }
}
```

### Creation and Running

```typescript
// Create world
const world = new World();

// Add systems (order matters)
world.addSystem(new TargetFollowSystem());
world.addSystem(new LocalAvoidanceSystem());
world.addSystem(new RenderSystem(ctx));

// Create agent entity
function createAgent(x, y, targetX, targetY) {
    const entity = world.createEntity();
    entity.addComponent(new TransformComponent(x, y));

    const avoidance = entity.addComponent(new AvoidanceAgentComponent());
    avoidance.targetPosition = { x: targetX, y: targetY };

    entity.addComponent(new RenderComponent());
    return entity;
}

// Circle swap scenario
const count = 50;
const radius = 200;
for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const targetX = centerX - Math.cos(angle) * radius;
    const targetY = centerY - Math.sin(angle) * radius;
    createAgent(x, y, targetX, targetY);
}

// Game loop
function gameLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    world.update(dt);
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

## Using the Actual Package

In real projects, use the `@esengine/pathfinding` package directly:

```typescript
import {
    AvoidanceWorldComponent,
    AvoidanceAgentComponent,
    LocalAvoidanceSystem
} from '@esengine/pathfinding/ecs';

// Scene setup
const worldEntity = scene.createEntity();
const world = worldEntity.addComponent(new AvoidanceWorldComponent());

// Create agent
const agentEntity = scene.createEntity();
const agent = agentEntity.addComponent(new AvoidanceAgentComponent());
agent.radius = 0.5;
agent.maxSpeed = 5;

// Add system
scene.addSystem(new LocalAvoidanceSystem());

// Update target each frame
agent.setPreferredVelocityTowards(targetX, targetY);
```

## Related Documentation

- [ORCA Local Avoidance API](/en/modules/pathfinding/local-avoidance) - Complete API documentation
- [Pathfinding System](/en/modules/pathfinding) - Pathfinding module overview
