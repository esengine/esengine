---
title: "最佳实践"
description: "组件设计模式和复杂示例"
---

## 设计原则

### 1. 保持组件简单

```typescript
// ✅ 好的组件设计 - 单一职责
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

// ❌ 避免的组件设计 - 职责过多
@ECSComponent('GameObject')
class GameObject extends Component {
  x: number;
  y: number;
  dx: number;
  dy: number;
  health: number;
  damage: number;
  sprite: string;
  // 太多不相关的属性
}
```

### 2. 使用构造函数初始化

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

### 3. 明确的类型定义

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

### 4. 引用其他实体

当组件需要关联其他实体时（如父子关系、跟随目标等），**推荐方式是存储实体ID**，然后在 System 中查找：

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

// 在 System 中查找目标实体并处理逻辑
class FollowerSystem extends EntitySystem {
  constructor() {
    super(new Matcher().all(Follower, Position));
  }

  process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const follower = entity.getComponent(Follower)!;
      const position = entity.getComponent(Position)!;

      // 通过场景查找目标实体
      const target = entity.scene?.findEntityById(follower.targetId);
      if (target) {
        const targetPos = target.getComponent(Position);
        if (targetPos) {
          // 跟随逻辑
          const dx = targetPos.x - position.x;
          const dy = targetPos.y - position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > follower.followDistance) {
            // 移动靠近目标
          }
        }
      }
    }
  }
}
```

这种方式的优势：
- 组件保持简单，只存储基本数据类型
- 符合数据导向设计
- 在 System 中统一处理查找和逻辑
- 易于理解和维护

**避免在组件中直接存储实体引用**：

```typescript
// ❌ 错误示范：直接存储实体引用
@ECSComponent('BadFollower')
class BadFollower extends Component {
  target: Entity; // 实体销毁后仍持有引用，可能导致内存泄漏
}
```

## 复杂组件示例

### 状态机组件

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

### 配置数据组件

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
    this.data = { ...weaponData }; // 深拷贝避免共享引用
  }

  // 提供便捷的访问方法
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

### 标签组件

```typescript
// 标签组件：无数据，仅用于标识
@ECSComponent('Player')
class PlayerTag extends Component {}

@ECSComponent('Enemy')
class EnemyTag extends Component {}

@ECSComponent('Dead')
class DeadTag extends Component {}

// 使用标签进行查询
class EnemySystem extends EntitySystem {
  constructor() {
    super(Matcher.all(EnemyTag, Health).none(DeadTag));
  }
}
```

### 缓冲组件

```typescript
// 事件/命令缓冲组件
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

## 常见问题

### Q: 组件应该有多大？

**A**: 遵循单一职责原则。如果组件包含不相关的数据，拆分成多个组件。

### Q: 组件可以有方法吗？

**A**: 可以，但应该是数据相关的辅助方法（如 `isDead()`），而非业务逻辑。业务逻辑放在 System 中。

### Q: 如何处理组件间的依赖？

**A**: 在 System 中处理组件间交互，不要在组件内部直接访问其他组件。

### Q: 什么时候使用 EntityRef？

**A**: 仅在需要频繁访问引用实体且引用关系稳定时使用（如父子关系）。大多数情况存储 ID 更好。

---

组件是 ECS 架构的数据载体，正确设计组件能让你的游戏代码更模块化、可维护和高性能。
