---
title: "Worker System"
description: "Web Worker based multi-threaded parallel processing system"
---

Worker System (WorkerEntitySystem) is a multi-threaded processing system based on Web Workers, designed for compute-intensive tasks.

## Core Features

- **True Parallel Computing**: Execute tasks in background threads via Web Workers
- **Auto Load Balancing**: Distribute workload based on CPU cores
- **SharedArrayBuffer Optimization**: Zero-copy data sharing
- **Fallback Support**: Auto fallback to main thread when Workers unavailable
- **Type Safety**: Full TypeScript support

## Quick Start

```typescript
interface PhysicsData {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

@ECSSystem('Physics')
class PhysicsWorkerSystem extends WorkerEntitySystem<PhysicsData> {
  constructor() {
    super(Matcher.all(Position, Velocity), {
      enableWorker: true,
      workerCount: 4,
      systemConfig: { gravity: 100 }
    });
  }

  protected getDefaultEntityDataSize(): number {
    return 5;
  }

  protected extractEntityData(entity: Entity): PhysicsData {
    const pos = entity.getComponent(Position);
    const vel = entity.getComponent(Velocity);
    return { id: entity.id, x: pos.x, y: pos.y, vx: vel.x, vy: vel.y };
  }

  protected workerProcess(entities: PhysicsData[], dt: number, config: any): PhysicsData[] {
    return entities.map(e => {
      e.vy += config.gravity * dt;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      return e;
    });
  }

  protected applyResult(entity: Entity, result: PhysicsData): void {
    const pos = entity.getComponent(Position);
    const vel = entity.getComponent(Velocity);
    pos.x = result.x;
    pos.y = result.y;
    vel.x = result.vx;
    vel.y = result.vy;
  }

  protected writeEntityToBuffer(data: PhysicsData, offset: number): void {
    if (!this.sharedFloatArray) return;
    this.sharedFloatArray[offset] = data.id;
    this.sharedFloatArray[offset + 1] = data.x;
    this.sharedFloatArray[offset + 2] = data.y;
    this.sharedFloatArray[offset + 3] = data.vx;
    this.sharedFloatArray[offset + 4] = data.vy;
  }

  protected readEntityFromBuffer(offset: number): PhysicsData | null {
    if (!this.sharedFloatArray) return null;
    return {
      id: this.sharedFloatArray[offset],
      x: this.sharedFloatArray[offset + 1],
      y: this.sharedFloatArray[offset + 2],
      vx: this.sharedFloatArray[offset + 3],
      vy: this.sharedFloatArray[offset + 4]
    };
  }
}
```

## Use Cases

| Scenario | Examples |
|----------|----------|
| **Physics Simulation** | Gravity, collision detection, fluid |
| **AI Computing** | Pathfinding, behavior trees, flocking |
| **Data Processing** | State machines, statistics, image processing |

## Documentation

- [Configuration](/en/guide/worker-system/configuration/) - Options and processing modes
- [Examples](/en/guide/worker-system/examples/) - Complete particle physics example
- [WeChat Mini Game](/en/guide/worker-system/wechat/) - WeChat Worker support
- [Best Practices](/en/guide/worker-system/best-practices/) - Performance optimization

## Live Demo

[Worker System Demo](https://esengine.github.io/esengine/demos/worker-system/)
