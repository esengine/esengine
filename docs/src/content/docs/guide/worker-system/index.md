---
title: "Worker 系统"
description: "基于 Web Worker 的多线程并行处理系统"
---

Worker 系统（WorkerEntitySystem）是 ECS 框架中基于 Web Worker 的多线程处理系统，专为计算密集型任务设计。

## 核心特性

- **真正的并行计算**：利用 Web Worker 在后台线程执行任务
- **自动负载均衡**：根据 CPU 核心数自动分配工作负载
- **SharedArrayBuffer 优化**：零拷贝数据共享，提升大规模计算性能
- **降级支持**：不支持 Worker 时自动回退到主线程
- **类型安全**：完整的 TypeScript 支持

## 快速开始

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

  // 必须实现的方法
  protected getDefaultEntityDataSize(): number {
    return 5; // id, x, y, vx, vy
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

## 适用场景

| 场景 | 示例 |
|------|------|
| **物理模拟** | 重力、碰撞检测、流体模拟 |
| **AI 计算** | 路径寻找、行为树、群体智能 |
| **数据处理** | 状态机、统计计算、图像处理 |

## 文档导航

- [配置选项](/guide/worker-system/configuration/) - 详细配置和处理模式
- [完整示例](/guide/worker-system/examples/) - 粒子物理等复杂示例
- [微信小游戏](/guide/worker-system/wechat/) - 微信小游戏 Worker 支持
- [最佳实践](/guide/worker-system/best-practices/) - 性能优化建议

## 在线演示

[Worker 系统演示](https://esengine.github.io/ecs-framework/demos/worker-system/) - 多线程物理计算、实时性能对比
