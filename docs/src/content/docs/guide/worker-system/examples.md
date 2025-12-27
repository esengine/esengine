---
title: "完整示例"
description: "粒子物理系统等复杂 Worker 示例"
---

## 粒子物理系统

包含碰撞检测的完整粒子物理系统：

```typescript
interface ParticleData {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  mass: number;
  radius: number;
  bounce: number;
  friction: number;
}

@ECSSystem('ParticlePhysics')
class ParticlePhysicsWorkerSystem extends WorkerEntitySystem<ParticleData> {
  constructor() {
    super(Matcher.all(Position, Velocity, Physics, Renderable), {
      enableWorker: true,
      workerCount: 6,
      entitiesPerWorker: 150,
      useSharedArrayBuffer: true,
      entityDataSize: 9,
      maxEntities: 5000,
      systemConfig: {
        gravity: 100,
        canvasWidth: 800,
        canvasHeight: 600,
        groundFriction: 0.98
      }
    });
  }

  protected extractEntityData(entity: Entity): ParticleData {
    const pos = entity.getComponent(Position);
    const vel = entity.getComponent(Velocity);
    const physics = entity.getComponent(Physics);
    const render = entity.getComponent(Renderable);

    return {
      id: entity.id,
      x: pos.x,
      y: pos.y,
      dx: vel.dx,
      dy: vel.dy,
      mass: physics.mass,
      radius: render.size,
      bounce: physics.bounce,
      friction: physics.friction
    };
  }

  protected workerProcess(
    entities: ParticleData[],
    deltaTime: number,
    config: any
  ): ParticleData[] {
    const result = entities.map(e => ({ ...e }));

    // 基础物理更新
    for (const p of result) {
      p.dy += config.gravity * deltaTime;
      p.x += p.dx * deltaTime;
      p.y += p.dy * deltaTime;

      // 边界碰撞
      if (p.x <= p.radius || p.x >= config.canvasWidth - p.radius) {
        p.dx = -p.dx * p.bounce;
        p.x = Math.max(p.radius, Math.min(config.canvasWidth - p.radius, p.x));
      }
      if (p.y <= p.radius || p.y >= config.canvasHeight - p.radius) {
        p.dy = -p.dy * p.bounce;
        p.y = Math.max(p.radius, Math.min(config.canvasHeight - p.radius, p.y));
        p.dx *= config.groundFriction;
      }

      p.dx *= p.friction;
      p.dy *= p.friction;
    }

    // 粒子间碰撞检测
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const p1 = result[i];
        const p2 = result[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = p1.radius + p2.radius;

        if (dist < minDist && dist > 0) {
          // 分离粒子
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;

          p1.x -= nx * overlap * 0.5;
          p1.y -= ny * overlap * 0.5;
          p2.x += nx * overlap * 0.5;
          p2.y += ny * overlap * 0.5;

          // 弹性碰撞
          const relVx = p2.dx - p1.dx;
          const relVy = p2.dy - p1.dy;
          const velNormal = relVx * nx + relVy * ny;

          if (velNormal > 0) continue;

          const restitution = (p1.bounce + p2.bounce) * 0.5;
          const impulse = -(1 + restitution) * velNormal / (1/p1.mass + 1/p2.mass);

          p1.dx -= impulse * nx / p1.mass;
          p1.dy -= impulse * ny / p1.mass;
          p2.dx += impulse * nx / p2.mass;
          p2.dy += impulse * ny / p2.mass;
        }
      }
    }

    return result;
  }

  protected applyResult(entity: Entity, result: ParticleData): void {
    if (!entity?.enabled) return;

    const pos = entity.getComponent(Position);
    const vel = entity.getComponent(Velocity);

    if (pos && vel) {
      pos.set(result.x, result.y);
      vel.set(result.dx, result.dy);
    }
  }

  protected getDefaultEntityDataSize(): number {
    return 9;
  }

  protected writeEntityToBuffer(data: ParticleData, offset: number): void {
    if (!this.sharedFloatArray) return;

    this.sharedFloatArray[offset + 0] = data.id;
    this.sharedFloatArray[offset + 1] = data.x;
    this.sharedFloatArray[offset + 2] = data.y;
    this.sharedFloatArray[offset + 3] = data.dx;
    this.sharedFloatArray[offset + 4] = data.dy;
    this.sharedFloatArray[offset + 5] = data.mass;
    this.sharedFloatArray[offset + 6] = data.radius;
    this.sharedFloatArray[offset + 7] = data.bounce;
    this.sharedFloatArray[offset + 8] = data.friction;
  }

  protected readEntityFromBuffer(offset: number): ParticleData | null {
    if (!this.sharedFloatArray) return null;

    return {
      id: this.sharedFloatArray[offset + 0],
      x: this.sharedFloatArray[offset + 1],
      y: this.sharedFloatArray[offset + 2],
      dx: this.sharedFloatArray[offset + 3],
      dy: this.sharedFloatArray[offset + 4],
      mass: this.sharedFloatArray[offset + 5],
      radius: this.sharedFloatArray[offset + 6],
      bounce: this.sharedFloatArray[offset + 7],
      friction: this.sharedFloatArray[offset + 8]
    };
  }
}
```

## 性能监控

```typescript
public getPerformanceInfo() {
  const info = this.getWorkerInfo();
  return {
    ...info,
    entityCount: this.entities.length
  };
}
```
