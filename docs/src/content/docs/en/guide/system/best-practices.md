---
title: "Best Practices"
description: "System design best practices and complex examples"
---

## Design Principles

### 1. Single Responsibility for Systems

```typescript
// ✅ Good system design - single responsibility
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

// ❌ Avoid - too many responsibilities
@ECSSystem('GameSystem')
class GameSystem extends EntitySystem {
  // One system handling movement, rendering, sound effects, and more
}
```

### 2. Use @ECSSystem Decorator

`@ECSSystem` is a required decorator for system classes, providing type identification and metadata management.

| Feature | Description |
|---------|-------------|
| **Type Identification** | Provides stable system names that remain correct after code obfuscation |
| **Debug Support** | Shows readable system names in performance monitoring, logs, and debug tools |
| **System Management** | Find and manage systems by name |
| **Serialization Support** | Records system configuration during scene serialization |

```typescript
// ✅ Correct usage
@ECSSystem('Physics')
class PhysicsSystem extends EntitySystem {
  // System implementation
}

// ✅ Recommended: Use descriptive names
@ECSSystem('PlayerMovement')
class PlayerMovementSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Player, Position, Velocity));
  }
}

// ❌ Wrong - no decorator
class BadSystem extends EntitySystem {
  // Systems defined this way may have issues in production
}
```

### 3. Proper Update Order

```typescript
// Set system update order by logical sequence
@ECSSystem('Input')
class InputSystem extends EntitySystem {
  constructor() {
    super();
    this.updateOrder = -100; // Process input first
  }
}

@ECSSystem('Logic')
class GameLogicSystem extends EntitySystem {
  constructor() {
    super();
    this.updateOrder = 0; // Process game logic
  }
}

@ECSSystem('Render')
class RenderSystem extends EntitySystem {
  constructor() {
    super();
    this.updateOrder = 100; // Render last
  }
}
```

### 4. Avoid Direct References Between Systems

```typescript
// ❌ Avoid: Direct system references
@ECSSystem('Bad')
class BadSystem extends EntitySystem {
  private otherSystem: SomeOtherSystem; // Avoid direct references to other systems
}

// ✅ Recommended: Communicate through event system
@ECSSystem('Good')
class GoodSystem extends EntitySystem {
  protected process(entities: readonly Entity[]): void {
    // Communicate with other systems through event system
    this.scene?.eventSystem.emitSync('data_updated', { entities });
  }
}
```

### 5. Clean Up Resources Promptly

```typescript
@ECSSystem('Resource')
class ResourceSystem extends EntitySystem {
  private resources: Map<string, any> = new Map();

  protected onDestroy(): void {
    // Clean up resources
    for (const [key, resource] of this.resources) {
      if (resource.dispose) {
        resource.dispose();
      }
    }
    this.resources.clear();
  }
}
```

## Complex System Examples

### Collision Detection System

```typescript
@ECSSystem('Collision')
class CollisionSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Transform, Collider));
  }

  protected process(entities: readonly Entity[]): void {
    // Simple n² collision detection
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
      // Send collision event
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
    // Collision detection logic
    const dx = transformA.x - transformB.x;
    const dy = transformA.y - transformB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < colliderA.radius + colliderB.radius;
  }
}
```

### State Machine System

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
    // Check for movement input
    const input = entity.getComponent(InputComponent);
    if (input && input.hasMovementInput()) {
      sm.changeState(EntityState.Moving);
    }
  }

  private handleMovingState(entity: Entity, sm: StateMachine): void {
    // Check if movement stopped
    const input = entity.getComponent(InputComponent);
    if (!input || !input.hasMovementInput()) {
      sm.changeState(EntityState.Idle);
    }
  }

  private handleAttackingState(entity: Entity, sm: StateMachine): void {
    // Return to idle after attack animation
    if (sm.stateTimer > 0.5) {
      sm.changeState(EntityState.Idle);
    }
  }
}
```

### AI Behavior System

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
    // Move to patrol point
    const target = ai.patrolPoints[ai.currentPatrolIndex];
    const dx = target.x - transform.x;
    const dy = target.y - transform.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      // Reached patrol point, move to next
      ai.currentPatrolIndex = (ai.currentPatrolIndex + 1) % ai.patrolPoints.length;
    } else {
      // Move towards patrol point
      const speed = ai.moveSpeed * Time.deltaTime;
      transform.x += (dx / distance) * speed;
      transform.y += (dy / distance) * speed;
    }

    // Detect player
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
      // Chase player
      const speed = ai.chaseSpeed * Time.deltaTime;
      transform.x += (dx / distance) * speed;
      transform.y += (dy / distance) * speed;
    }
  }

  private attack(entity: Entity, ai: AIComponent): void {
    ai.attackCooldown -= Time.deltaTime;
    if (ai.attackCooldown <= 0) {
      // Execute attack
      this.scene?.eventSystem.emitSync('ai_attack', { attacker: entity });
      ai.attackCooldown = ai.attackInterval;
    }
  }

  private detectPlayer(entity: Entity, ai: AIComponent): boolean {
    // Player detection logic
    return false;
  }

  private findPlayer(): Entity | null {
    const result = this.scene?.querySystem.queryByTag(Tags.PLAYER);
    return result?.entities[0] ?? null;
  }
}
```

## FAQ

### Q: How big should a system be?

**A**: Follow the single responsibility principle. If a system handles multiple unrelated logic, split it into multiple systems.

### Q: How to share data between systems?

**A**:
1. Share data through components (recommended)
2. Communicate through event system
3. Inject shared services through service container

### Q: When to use CommandBuffer?

**A**: When you need to destroy entities during iteration, use CommandBuffer. Adding/removing components can be done directly.

### Q: How to optimize processing of many entities?

**A**:
1. Use change detection, only process changed entities
2. Use WorkerEntitySystem for parallel processing
3. Optimize Matcher conditions, reduce matched entities
4. Consider using Spatial Partitioning

---

Systems are the logic processing core of ECS architecture. Properly designing and using systems makes your game code more modular, efficient, and maintainable.
