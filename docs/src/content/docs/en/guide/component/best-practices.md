---
title: "Best Practices"
description: "Component design patterns and complex examples"
---

## Design Principles

### 1. Keep Components Simple

```typescript
// ✅ Good component design - single responsibility
@ECSComponent('Position')
class Position extends Component {
  x: number = 0;
  y: number = 0;
}

@ECSComponent('Velocity')
class Velocity extends Component {
  dx: number = 0;
  dy: number = 0;
}

// ❌ Avoid this design - too many responsibilities
@ECSComponent('GameObject')
class GameObject extends Component {
  x: number;
  y: number;
  dx: number;
  dy: number;
  health: number;
  damage: number;
  sprite: string;
  // Too many unrelated properties
}
```

### 2. Use Constructor for Initialization

```typescript
@ECSComponent('Transform')
class Transform extends Component {
  x: number;
  y: number;
  rotation: number;
  scale: number;

  constructor(x = 0, y = 0, rotation = 0, scale = 1) {
    super();
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.scale = scale;
  }
}
```

### 3. Clear Type Definitions

```typescript
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  type: 'weapon' | 'consumable' | 'misc';
}

@ECSComponent('Inventory')
class Inventory extends Component {
  items: InventoryItem[] = [];
  maxSlots: number;

  constructor(maxSlots: number = 20) {
    super();
    this.maxSlots = maxSlots;
  }

  addItem(item: InventoryItem): boolean {
    if (this.items.length < this.maxSlots) {
      this.items.push(item);
      return true;
    }
    return false;
  }

  removeItem(itemId: string): InventoryItem | null {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      return this.items.splice(index, 1)[0];
    }
    return null;
  }
}
```

### 4. Referencing Other Entities

When components need to reference other entities (like parent-child relationships, follow targets), **the recommended approach is to store entity IDs**, then look up in System:

```typescript
@ECSComponent('Follower')
class Follower extends Component {
  targetId: number;
  followDistance: number = 50;

  constructor(targetId: number) {
    super();
    this.targetId = targetId;
  }
}

// Look up target entity and handle logic in System
class FollowerSystem extends EntitySystem {
  constructor() {
    super(new Matcher().all(Follower, Position));
  }

  process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const follower = entity.getComponent(Follower)!;
      const position = entity.getComponent(Position)!;

      // Look up target entity through scene
      const target = entity.scene?.findEntityById(follower.targetId);
      if (target) {
        const targetPos = target.getComponent(Position);
        if (targetPos) {
          // Follow logic
          const dx = targetPos.x - position.x;
          const dy = targetPos.y - position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > follower.followDistance) {
            // Move closer to target
          }
        }
      }
    }
  }
}
```

Advantages of this approach:
- Components stay simple, only store basic data types
- Follows data-oriented design
- Unified lookup and logic handling in System
- Easy to understand and maintain

**Avoid storing entity references directly in components**:

```typescript
// ❌ Wrong example: Storing entity reference directly
@ECSComponent('BadFollower')
class BadFollower extends Component {
  target: Entity; // Still holds reference after entity destroyed, may cause memory leak
}
```

## Complex Component Examples

### State Machine Component

```typescript
enum EntityState {
  Idle,
  Moving,
  Attacking,
  Dead
}

@ECSComponent('StateMachine')
class StateMachine extends Component {
  private _currentState: EntityState = EntityState.Idle;
  private _previousState: EntityState = EntityState.Idle;
  private _stateTimer: number = 0;

  get currentState(): EntityState {
    return this._currentState;
  }

  get previousState(): EntityState {
    return this._previousState;
  }

  get stateTimer(): number {
    return this._stateTimer;
  }

  changeState(newState: EntityState): void {
    if (this._currentState !== newState) {
      this._previousState = this._currentState;
      this._currentState = newState;
      this._stateTimer = 0;
    }
  }

  updateTimer(deltaTime: number): void {
    this._stateTimer += deltaTime;
  }

  isInState(state: EntityState): boolean {
    return this._currentState === state;
  }
}
```

### Configuration Data Component

```typescript
interface WeaponData {
  damage: number;
  range: number;
  fireRate: number;
  ammo: number;
}

@ECSComponent('WeaponConfig')
class WeaponConfig extends Component {
  data: WeaponData;

  constructor(weaponData: WeaponData) {
    super();
    this.data = { ...weaponData }; // Deep copy to avoid shared reference
  }

  // Provide convenience methods
  getDamage(): number {
    return this.data.damage;
  }

  canFire(): boolean {
    return this.data.ammo > 0;
  }

  consumeAmmo(): boolean {
    if (this.data.ammo > 0) {
      this.data.ammo--;
      return true;
    }
    return false;
  }
}
```

### Tag Components

```typescript
// Tag components: No data, only for identification
@ECSComponent('Player')
class PlayerTag extends Component {}

@ECSComponent('Enemy')
class EnemyTag extends Component {}

@ECSComponent('Dead')
class DeadTag extends Component {}

// Use tags for querying
class EnemySystem extends EntitySystem {
  constructor() {
    super(Matcher.all(EnemyTag, Health).none(DeadTag));
  }
}
```

### Buffer Components

```typescript
// Event/command buffer component
@ECSComponent('DamageBuffer')
class DamageBuffer extends Component {
  damages: { amount: number; source: number; timestamp: number }[] = [];

  addDamage(amount: number, sourceId: number): void {
    this.damages.push({
      amount,
      source: sourceId,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.damages.length = 0;
  }

  getTotalDamage(): number {
    return this.damages.reduce((sum, d) => sum + d.amount, 0);
  }
}
```

## FAQ

### Q: How large should a component be?

**A**: Follow single responsibility principle. If a component contains unrelated data, split into multiple components.

### Q: Can components have methods?

**A**: Yes, but they should be data-related helper methods (like `isDead()`), not business logic. Business logic goes in Systems.

### Q: How to handle dependencies between components?

**A**: Handle inter-component interactions in Systems, don't directly access other components within a component.

### Q: When to use EntityRef?

**A**: Only when you need frequent access to referenced entity and the reference relationship is stable (like parent-child). Storing IDs is better for most cases.

---

Components are the data carriers of ECS architecture. Properly designing components makes your game code more modular, maintainable, and performant.
