---
title: "最佳实践"
description: "系统设计最佳实践和复杂示例"
---

## 设计原则

### 1. 系统单一职责

```typescript
// ✅ 好的系统设计 - 职责单一
@ECSSystem('Movement')
class MovementSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Position, Velocity));
  }
}

@ECSSystem('Rendering')
class RenderingSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Sprite, Transform));
  }
}

// ❌ 避免的系统设计 - 职责过多
@ECSSystem('GameSystem')
class GameSystem extends EntitySystem {
  // 一个系统处理移动、渲染、音效等多种逻辑
}
```

### 2. 使用 @ECSSystem 装饰器

`@ECSSystem` 是系统类必须使用的装饰器，它为系统提供类型标识和元数据管理。

| 功能 | 说明 |
|------|------|
| **类型识别** | 提供稳定的系统名称，代码混淆后仍能正确识别 |
| **调试支持** | 在性能监控、日志和调试工具中显示可读的系统名称 |
| **系统管理** | 通过名称查找和管理系统 |
| **序列化支持** | 场景序列化时可以记录系统配置 |

```typescript
// ✅ 正确的用法
@ECSSystem('Physics')
class PhysicsSystem extends EntitySystem {
  // 系统实现
}

// ✅ 推荐：使用描述性的名称
@ECSSystem('PlayerMovement')
class PlayerMovementSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Player, Position, Velocity));
  }
}

// ❌ 错误的用法 - 没有装饰器
class BadSystem extends EntitySystem {
  // 这样定义的系统可能在生产环境出现问题
}
```

### 3. 合理的更新顺序

```typescript
// 按逻辑顺序设置系统的更新时序
@ECSSystem('Input')
class InputSystem extends EntitySystem {
  constructor() {
    super();
    this.updateOrder = -100; // 最先处理输入
  }
}

@ECSSystem('Logic')
class GameLogicSystem extends EntitySystem {
  constructor() {
    super();
    this.updateOrder = 0; // 处理游戏逻辑
  }
}

@ECSSystem('Render')
class RenderSystem extends EntitySystem {
  constructor() {
    super();
    this.updateOrder = 100; // 最后进行渲染
  }
}
```

### 4. 避免在系统间直接引用

```typescript
// ❌ 避免：系统间直接引用
@ECSSystem('Bad')
class BadSystem extends EntitySystem {
  private otherSystem: SomeOtherSystem; // 避免直接引用其他系统
}

// ✅ 推荐：通过事件系统通信
@ECSSystem('Good')
class GoodSystem extends EntitySystem {
  protected process(entities: readonly Entity[]): void {
    // 通过事件系统与其他系统通信
    this.scene?.eventSystem.emitSync('data_updated', { entities });
  }
}
```

### 5. 及时清理资源

```typescript
@ECSSystem('Resource')
class ResourceSystem extends EntitySystem {
  private resources: Map<string, any> = new Map();

  protected onDestroy(): void {
    // 清理资源
    for (const [key, resource] of this.resources) {
      if (resource.dispose) {
        resource.dispose();
      }
    }
    this.resources.clear();
  }
}
```

## 复杂系统示例

### 碰撞检测系统

```typescript
@ECSSystem('Collision')
class CollisionSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Transform, Collider));
  }

  protected process(entities: readonly Entity[]): void {
    // 简单的 n² 碰撞检测
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        this.checkCollision(entities[i], entities[j]);
      }
    }
  }

  private checkCollision(entityA: Entity, entityB: Entity): void {
    const transformA = entityA.getComponent(Transform);
    const transformB = entityB.getComponent(Transform);
    const colliderA = entityA.getComponent(Collider);
    const colliderB = entityB.getComponent(Collider);

    if (this.isColliding(transformA, colliderA, transformB, colliderB)) {
      // 发送碰撞事件
      this.scene?.eventSystem.emitSync('collision', {
        entityA,
        entityB
      });
    }
  }

  private isColliding(
    transformA: Transform, colliderA: Collider,
    transformB: Transform, colliderB: Collider
  ): boolean {
    // 碰撞检测逻辑
    const dx = transformA.x - transformB.x;
    const dy = transformA.y - transformB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < colliderA.radius + colliderB.radius;
  }
}
```

### 状态机系统

```typescript
enum EntityState {
  Idle,
  Moving,
  Attacking,
  Dead
}

@ECSSystem('StateMachine')
class StateMachineSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(StateMachine));
  }

  protected process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const stateMachine = entity.getComponent(StateMachine);
      if (stateMachine) {
        stateMachine.updateTimer(Time.deltaTime);
        this.updateState(entity, stateMachine);
      }
    }
  }

  private updateState(entity: Entity, stateMachine: StateMachine): void {
    switch (stateMachine.currentState) {
      case EntityState.Idle:
        this.handleIdleState(entity, stateMachine);
        break;
      case EntityState.Moving:
        this.handleMovingState(entity, stateMachine);
        break;
      case EntityState.Attacking:
        this.handleAttackingState(entity, stateMachine);
        break;
    }
  }

  private handleIdleState(entity: Entity, sm: StateMachine): void {
    // 检查是否有移动输入
    const input = entity.getComponent(InputComponent);
    if (input && input.hasMovementInput()) {
      sm.changeState(EntityState.Moving);
    }
  }

  private handleMovingState(entity: Entity, sm: StateMachine): void {
    // 检查是否停止移动
    const input = entity.getComponent(InputComponent);
    if (!input || !input.hasMovementInput()) {
      sm.changeState(EntityState.Idle);
    }
  }

  private handleAttackingState(entity: Entity, sm: StateMachine): void {
    // 攻击动画完成后返回空闲
    if (sm.stateTimer > 0.5) {
      sm.changeState(EntityState.Idle);
    }
  }
}
```

### AI 行为系统

```typescript
@ECSSystem('AIBehavior')
class AIBehaviorSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(AIComponent, Transform).none(Dead));
  }

  protected process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const ai = entity.getComponent(AIComponent)!;
      const transform = entity.getComponent(Transform)!;

      switch (ai.state) {
        case AIState.Patrol:
          this.patrol(entity, ai, transform);
          break;
        case AIState.Chase:
          this.chase(entity, ai, transform);
          break;
        case AIState.Attack:
          this.attack(entity, ai);
          break;
      }
    }
  }

  private patrol(entity: Entity, ai: AIComponent, transform: Transform): void {
    // 移动到巡逻点
    const target = ai.patrolPoints[ai.currentPatrolIndex];
    const dx = target.x - transform.x;
    const dy = target.y - transform.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // 到达巡逻点，前往下一个
      ai.currentPatrolIndex = (ai.currentPatrolIndex + 1) % ai.patrolPoints.length;
    } else {
      // 朝巡逻点移动
      const speed = ai.moveSpeed * Time.deltaTime;
      transform.x += (dx / distance) * speed;
      transform.y += (dy / distance) * speed;
    }

    // 检测玩家
    if (this.detectPlayer(entity, ai)) {
      ai.state = AIState.Chase;
    }
  }

  private chase(entity: Entity, ai: AIComponent, transform: Transform): void {
    const player = this.findPlayer();
    if (!player) {
      ai.state = AIState.Patrol;
      return;
    }

    const playerTransform = player.getComponent(Transform)!;
    const dx = playerTransform.x - transform.x;
    const dy = playerTransform.y - transform.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ai.attackRange) {
      ai.state = AIState.Attack;
    } else if (distance > ai.chaseRange) {
      ai.state = AIState.Patrol;
    } else {
      // 追逐玩家
      const speed = ai.chaseSpeed * Time.deltaTime;
      transform.x += (dx / distance) * speed;
      transform.y += (dy / distance) * speed;
    }
  }

  private attack(entity: Entity, ai: AIComponent): void {
    ai.attackCooldown -= Time.deltaTime;
    if (ai.attackCooldown <= 0) {
      // 执行攻击
      this.scene?.eventSystem.emitSync('ai_attack', { attacker: entity });
      ai.attackCooldown = ai.attackInterval;
    }
  }

  private detectPlayer(entity: Entity, ai: AIComponent): boolean {
    // 玩家检测逻辑
    return false;
  }

  private findPlayer(): Entity | null {
    const result = this.scene?.querySystem.queryByTag(Tags.PLAYER);
    return result?.entities[0] ?? null;
  }
}
```

## 常见问题

### 问：系统应该有多大？

**答**：遵循单一职责原则。如果一个系统处理多种不相关的逻辑，应该拆分成多个系统。

### 问：如何处理系统间的数据共享？

**答**：
1. 通过组件共享数据（推荐）
2. 通过事件系统通信
3. 通过服务容器注入共享服务

### 问：什么时候用 CommandBuffer？

**答**：当需要在迭代过程中销毁实体时，使用 CommandBuffer。添加/移除组件可以直接操作。

### 问：如何优化大量实体的处理？

**答**：
1. 使用变更检测，只处理变化的实体
2. 使用 WorkerEntitySystem 并行处理
3. 优化 Matcher 条件，减少匹配的实体数量
4. 考虑使用空间分区（Spatial Partitioning）

---

系统是 ECS 架构的逻辑处理核心，正确设计和使用系统能让你的游戏代码更加模块化、高效和易于维护。
