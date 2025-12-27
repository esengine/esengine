---
title: "变更检测"
description: "帧级变更检测优化系统性能"
---

> **v2.4.0+**

框架提供了基于 epoch 的帧级变更检测机制，让系统可以只处理发生变化的实体，大幅提升性能。

## 核心概念

- **Epoch**：全局帧计数器，每帧递增
- **lastWriteEpoch**：组件最后被修改时的 epoch
- **变更检测**：通过比较 epoch 判断组件是否在指定时间点后发生变化

## 标记组件为已修改

修改组件数据后，需要标记组件为已变更。有两种方式：

### 方式 1：通过 Entity 辅助方法（推荐）

```typescript
// 修改组件后通过 entity.markDirty() 标记
const pos = entity.getComponent(Position)!;
pos.x = 100;
pos.y = 200;
entity.markDirty(pos);

// 可以同时标记多个组件
const vel = entity.getComponent(Velocity)!;
vel.vx = 10;
entity.markDirty(pos, vel);
```

### 方式 2：在组件内部封装

```typescript
class VelocityComponent extends Component {
    private _vx: number = 0;
    private _vy: number = 0;

    // 提供修改方法，接收 epoch 参数
    public setVelocity(vx: number, vy: number, epoch: number): void {
        this._vx = vx;
        this._vy = vy;
        this.markDirty(epoch);
    }

    public get vx(): number { return this._vx; }
    public get vy(): number { return this._vy; }
}

// 在系统中使用
const vel = entity.getComponent(VelocityComponent)!;
vel.setVelocity(10, 20, this.currentEpoch);
```

## 在系统中使用变更检测

EntitySystem 提供了多个变更检测辅助方法：

### forEachChanged - 遍历变更实体

```typescript
@ECSSystem('Physics')
class PhysicsSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(Position, Velocity));
    }

    protected process(entities: readonly Entity[]): void {
        // 使用 forEachChanged 只处理变更的实体
        // 自动保存 epoch 检查点
        this.forEachChanged(entities, [Velocity], (entity) => {
            const pos = this.requireComponent(entity, Position);
            const vel = this.requireComponent(entity, Velocity);

            // 只有 Velocity 变化时才更新位置
            pos.x += vel.vx * Time.deltaTime;
            pos.y += vel.vy * Time.deltaTime;
        });
    }
}
```

### filterChanged - 获取变更实体列表

```typescript
@ECSSystem('Transform')
class TransformSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(Transform, RigidBody));
    }

    protected process(entities: readonly Entity[]): void {
        // 使用 filterChanged 获取变更的实体列表
        const changedEntities = this.filterChanged(entities, [RigidBody]);

        for (const entity of changedEntities) {
            // 处理物理状态变化的实体
            this.updatePhysics(entity);
        }

        // 手动保存 epoch 检查点
        this.saveEpoch();
    }

    protected updatePhysics(entity: Entity): void {
        // 物理更新逻辑
    }
}
```

### hasChanged - 检查单个实体

```typescript
protected process(entities: readonly Entity[]): void {
    for (const entity of entities) {
        // 检查单个实体的指定组件是否发生变更
        if (this.hasChanged(entity, [Transform])) {
            this.updateRenderData(entity);
        }
    }
}
```

## 变更检测 API 参考

| 方法 | 说明 |
|------|------|
| `forEachChanged(entities, [Types], callback)` | 遍历指定组件发生变更的实体，自动保存检查点 |
| `filterChanged(entities, [Types])` | 返回指定组件发生变更的实体数组 |
| `hasChanged(entity, [Types])` | 检查单个实体的指定组件是否发生变更 |
| `saveEpoch()` | 手动保存当前 epoch 作为检查点 |
| `lastProcessEpoch` | 获取上次保存的 epoch 检查点 |
| `currentEpoch` | 获取当前场景的 epoch |

## 使用场景

变更检测特别适合以下场景：

### 1. 脏标记优化

只在数据变化时更新渲染：

```typescript
@ECSSystem('RenderUpdate')
class RenderUpdateSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(Transform, Sprite));
    }

    protected process(entities: readonly Entity[]): void {
        // 只更新变化的精灵
        this.forEachChanged(entities, [Transform, Sprite], (entity) => {
            const transform = this.requireComponent(entity, Transform);
            const sprite = this.requireComponent(entity, Sprite);

            this.updateSpriteMatrix(sprite, transform);
        });
    }
}
```

### 2. 网络同步

只发送变化的组件数据：

```typescript
@ECSSystem('NetworkSync')
class NetworkSyncSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(NetworkComponent, Transform));
    }

    protected process(entities: readonly Entity[]): void {
        // 只同步变化的实体，大幅减少网络流量
        this.forEachChanged(entities, [Transform], (entity) => {
            const transform = this.requireComponent(entity, Transform);
            const network = this.requireComponent(entity, NetworkComponent);

            this.sendTransformUpdate(network.id, transform);
        });
    }

    private sendTransformUpdate(id: string, transform: Transform): void {
        // 发送网络更新
    }
}
```

### 3. 物理同步

只同步位置/速度发生变化的实体：

```typescript
@ECSSystem('PhysicsSync')
class PhysicsSyncSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(Transform, RigidBody));
    }

    protected process(entities: readonly Entity[]): void {
        // 从物理引擎同步变化的实体
        this.forEachChanged(entities, [RigidBody], (entity) => {
            const transform = entity.getComponent(Transform)!;
            const rigidBody = entity.getComponent(RigidBody)!;

            // 更新 Transform
            transform.position = rigidBody.getPosition();
            transform.rotation = rigidBody.getRotation();

            // 标记 Transform 已变更
            entity.markDirty(transform);
        });
    }
}
```

### 4. 缓存失效

只在依赖数据变化时重新计算：

```typescript
@ECSSystem('PathCache')
class PathCacheSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(PathFinder, Transform));
    }

    protected process(entities: readonly Entity[]): void {
        // 只有位置变化时才重新计算路径
        this.forEachChanged(entities, [Transform], (entity) => {
            const pathFinder = entity.getComponent(PathFinder)!;
            pathFinder.invalidateCache();
            pathFinder.recalculatePath();
        });
    }
}
```

## 性能对比

| 场景 | 无变更检测 | 有变更检测 | 提升 |
|------|------------|------------|------|
| 1000 实体，10% 变化 | 1000 次处理 | 100 次处理 | 10x |
| 1000 实体，1% 变化 | 1000 次处理 | 10 次处理 | 100x |
| 网络同步 | 全量发送 | 增量发送 | 带宽节省 90%+ |

:::tip
变更检测最适合"大量实体，少量变化"的场景。如果大部分实体每帧都变化，变更检测的开销可能得不偿失。
:::
