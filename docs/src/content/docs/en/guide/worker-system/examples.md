---
title: "Examples"
description: "Complete Worker system examples"
---

## Particle Physics System

A complete particle physics system with collision detection. See the [Chinese version](/guide/worker-system/examples/) for the full code example with:

- Gravity and velocity updates
- Boundary collision
- Particle-particle collision with elastic response
- SharedArrayBuffer optimization
- Performance monitoring

## Key Implementation Points

```typescript
@ECSSystem('ParticlePhysics')
class ParticlePhysicsWorkerSystem extends WorkerEntitySystem<ParticleData> {
  constructor() {
    super(Matcher.all(Position, Velocity, Physics), {
      enableWorker: true,
      workerCount: 6,
      entitiesPerWorker: 150,
      useSharedArrayBuffer: true,
      entityDataSize: 9,
      maxEntities: 5000,
      systemConfig: {
        gravity: 100,
        canvasWidth: 800,
        canvasHeight: 600
      }
    });
  }

  // Implement required abstract methods...
}
```
