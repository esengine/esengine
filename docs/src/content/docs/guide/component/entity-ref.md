---
title: "EntityRef 装饰器"
description: "安全的实体引用追踪机制"
---

框架提供了 `@EntityRef` 装饰器用于**特殊场景**下安全地存储实体引用。这是一个高级特性，一般情况下推荐使用存储ID的方式。

## 什么时候需要 EntityRef？

在以下场景中，`@EntityRef` 可以简化代码：

1. **父子关系**: 需要在组件中直接访问父实体或子实体
2. **复杂关联**: 实体之间有多个引用关系
3. **频繁访问**: 需要在多处访问引用的实体，使用ID查找会有性能开销

## 核心特性

`@EntityRef` 装饰器通过 **ReferenceTracker** 自动追踪引用关系：

- 当被引用的实体销毁时，所有指向它的 `@EntityRef` 属性自动设为 `null`
- 防止跨场景引用（会输出警告并拒绝设置）
- 防止引用已销毁的实体（会输出警告并设为 `null`）
- 使用 WeakRef 避免内存泄漏（自动GC支持）
- 组件移除时自动清理引用注册

## 基本用法

```typescript
import { Component, ECSComponent, EntityRef, Entity } from '@esengine/ecs-framework';

@ECSComponent('Parent')
class ParentComponent extends Component {
  @EntityRef()
  parent: Entity | null = null;
}

// 使用示例
const scene = new Scene();
const parent = scene.createEntity('Parent');
const child = scene.createEntity('Child');

const comp = child.addComponent(new ParentComponent());
comp.parent = parent;

console.log(comp.parent); // Entity { name: 'Parent' }

// 当 parent 被销毁时，comp.parent 自动变为 null
parent.destroy();
console.log(comp.parent); // null
```

## 多个引用属性

一个组件可以有多个 `@EntityRef` 属性：

```typescript
@ECSComponent('Combat')
class CombatComponent extends Component {
  @EntityRef()
  target: Entity | null = null;

  @EntityRef()
  ally: Entity | null = null;

  @EntityRef()
  lastAttacker: Entity | null = null;
}

// 使用示例
const player = scene.createEntity('Player');
const enemy = scene.createEntity('Enemy');
const npc = scene.createEntity('NPC');

const combat = player.addComponent(new CombatComponent());
combat.target = enemy;
combat.ally = npc;

// enemy 销毁后，只有 target 变为 null，ally 仍然有效
enemy.destroy();
console.log(combat.target); // null
console.log(combat.ally);   // Entity { name: 'NPC' }
```

## 安全检查

`@EntityRef` 提供了多重安全检查：

```typescript
const scene1 = new Scene();
const scene2 = new Scene();

const entity1 = scene1.createEntity('Entity1');
const entity2 = scene2.createEntity('Entity2');

const comp = entity1.addComponent(new ParentComponent());

// 跨场景引用会失败
comp.parent = entity2; // 输出错误日志，comp.parent 为 null
console.log(comp.parent); // null

// 引用已销毁的实体会失败
const entity3 = scene1.createEntity('Entity3');
entity3.destroy();
comp.parent = entity3; // 输出警告日志，comp.parent 为 null
console.log(comp.parent); // null
```

## 实现原理

`@EntityRef` 使用以下机制实现自动引用追踪：

1. **ReferenceTracker**: Scene 持有一个引用追踪器，记录所有实体引用关系
2. **WeakRef**: 使用弱引用存储组件，避免循环引用导致内存泄漏
3. **属性拦截**: 通过 `Object.defineProperty` 拦截 getter/setter
4. **自动清理**: 实体销毁时，ReferenceTracker 遍历所有引用并设为 null

```typescript
// 简化的实现原理
class ReferenceTracker {
  // entityId -> 引用该实体的所有组件记录
  private _references: Map<number, Set<{ component: WeakRef<Component>, propertyKey: string }>>;

  // 实体销毁时调用
  clearReferencesTo(entityId: number): void {
    const records = this._references.get(entityId);
    if (records) {
      for (const record of records) {
        const component = record.component.deref();
        if (component) {
          // 将组件的引用属性设为 null
          (component as any)[record.propertyKey] = null;
        }
      }
      this._references.delete(entityId);
    }
  }
}
```

## 性能考虑

`@EntityRef` 会带来一些性能开销：

- **写入开销**: 每次设置引用时需要更新 ReferenceTracker
- **内存开销**: ReferenceTracker 需要维护引用映射表
- **销毁开销**: 实体销毁时需要遍历所有引用并清理

对于大多数场景，这些开销是可以接受的。但如果有**大量实体和频繁的引用变更**，存储ID可能更高效。

## 调试支持

ReferenceTracker 提供了调试接口：

```typescript
// 查看某个实体被哪些组件引用
const references = scene.referenceTracker.getReferencesTo(entity.id);
console.log(`实体 ${entity.name} 被 ${references.length} 个组件引用`);

// 获取完整的调试信息
const debugInfo = scene.referenceTracker.getDebugInfo();
console.log(debugInfo);
```

## 与存储 ID 方式的对比

### 存储 ID（推荐大多数情况）

```typescript
@ECSComponent('Follower')
class Follower extends Component {
  targetId: number | null = null;
}

// 在 System 中查找
class FollowerSystem extends EntitySystem {
  process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      const follower = entity.getComponent(Follower)!;
      const target = entity.scene?.findEntityById(follower.targetId);
      if (target) {
        // 跟随逻辑
      }
    }
  }
}
```

### 使用 EntityRef（适合复杂关联）

```typescript
@ECSComponent('Transform')
class Transform extends Component {
  @EntityRef()
  parent: Entity | null = null;

  position: { x: number, y: number } = { x: 0, y: 0 };

  // 可以直接访问父实体的组件
  getWorldPosition(): { x: number, y: number } {
    if (!this.parent) {
      return { ...this.position };
    }

    const parentTransform = this.parent.getComponent(Transform);
    if (parentTransform) {
      const parentPos = parentTransform.getWorldPosition();
      return {
        x: parentPos.x + this.position.x,
        y: parentPos.y + this.position.y
      };
    }

    return { ...this.position };
  }
}
```

## 总结

| 方式 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| 存储 ID | 大多数情况 | 简单、无额外开销 | 需要在 System 中查找 |
| @EntityRef | 父子关系、复杂关联 | 自动清理、代码简洁 | 有性能开销 |

- **推荐做法**: 大部分情况使用存储ID + System查找的方式
- **EntityRef 适用场景**: 父子关系、复杂关联、组件内需要直接访问引用实体的场景
- **核心优势**: 自动清理、防止悬空引用、代码更简洁
- **注意事项**: 有性能开销，不适合大量动态引用的场景
