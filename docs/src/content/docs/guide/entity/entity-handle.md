---
title: "实体句柄"
description: "使用 EntityHandle 安全地引用实体，避免引用已销毁实体的问题"
---

实体句柄（EntityHandle）是一种安全的实体引用方式，用于解决"引用已销毁实体"的问题。

## 问题场景

假设你的 AI 系统需要追踪一个目标敌人：

```typescript
// ❌ 错误做法：直接存储实体引用
class AISystem extends EntitySystem {
    private targetEnemy: Entity | null = null;

    setTarget(enemy: Entity) {
        this.targetEnemy = enemy;
    }

    process() {
        if (this.targetEnemy) {
            // 危险！敌人可能已被销毁，但引用还在
            // 更糟糕：这个内存位置可能被新实体复用了
            const health = this.targetEnemy.getComponent(Health);
            // 可能操作了错误的实体！
        }
    }
}
```

## 什么是 EntityHandle

EntityHandle 是一个数值类型的实体标识符，包含：
- **索引（Index）**：实体在数组中的位置
- **代数（Generation）**：实体被复用的次数

当实体被销毁后，即使其索引被新实体复用，代数也会增加，使得旧句柄失效。

```typescript
import { EntityHandle, NULL_HANDLE, isValidHandle } from '@esengine/ecs-framework';

// 每个实体创建时会自动分配句柄
const handle: EntityHandle = entity.handle;

// 空句柄常量
const emptyHandle = NULL_HANDLE;

// 检查句柄是否非空
if (isValidHandle(handle)) {
    // 句柄有效
}
```

## 使用句柄的正确做法

```typescript
import { EntityHandle, NULL_HANDLE, isValidHandle } from '@esengine/ecs-framework';

class AISystem extends EntitySystem {
    // ✅ 存储句柄而非实体引用
    private targetHandle: EntityHandle = NULL_HANDLE;

    setTarget(enemy: Entity) {
        this.targetHandle = enemy.handle;
    }

    process() {
        if (!isValidHandle(this.targetHandle)) {
            return; // 没有目标
        }

        // 通过句柄获取实体（自动检测是否有效）
        const enemy = this.scene.findEntityByHandle(this.targetHandle);

        if (!enemy) {
            // 敌人已被销毁，清空引用
            this.targetHandle = NULL_HANDLE;
            return;
        }

        // 安全操作
        const health = enemy.getComponent(Health);
        if (health) {
            // 对敌人造成伤害
        }
    }
}
```

## API 参考

### 获取句柄

```typescript
// 从实体获取句柄
const handle = entity.handle;
```

### 验证句柄

```typescript
import { isValidHandle, NULL_HANDLE } from '@esengine/ecs-framework';

// 检查句柄是否非空
if (isValidHandle(handle)) {
    // ...
}

// 检查实体是否存活
const alive = scene.handleManager.isAlive(handle);
```

### 通过句柄获取实体

```typescript
// 返回 Entity | null
const entity = scene.findEntityByHandle(handle);

if (entity) {
    // 实体存在且有效
}
```

## 完整示例：技能目标锁定

```typescript
import {
    EntitySystem,
    Entity,
    EntityHandle,
    NULL_HANDLE,
    isValidHandle
} from '@esengine/ecs-framework';

@ECSSystem('SkillTargeting')
class SkillTargetingSystem extends EntitySystem {
    // 存储多个目标的句柄
    private lockedTargets: Map<number, EntityHandle> = new Map();

    // 锁定目标
    lockTarget(casterId: number, target: Entity) {
        this.lockedTargets.set(casterId, target.handle);
    }

    // 获取锁定的目标
    getLockedTarget(casterId: number): Entity | null {
        const handle = this.lockedTargets.get(casterId);

        if (!handle || !isValidHandle(handle)) {
            return null;
        }

        const target = this.scene.findEntityByHandle(handle);

        if (!target) {
            // 目标已死亡，清除锁定
            this.lockedTargets.delete(casterId);
        }

        return target;
    }

    // 释放技能
    castSkill(caster: Entity) {
        const target = this.getLockedTarget(caster.id);

        if (!target) {
            console.log('目标丢失，技能取消');
            return;
        }

        const health = target.getComponent(Health);
        if (health) {
            health.current -= 10;
        }
    }

    // 清除指定施法者的目标
    clearTarget(casterId: number) {
        this.lockedTargets.delete(casterId);
    }
}
```

## 使用场景指南

| 场景 | 推荐方式 |
|-----|---------|
| 同一帧内临时使用 | 直接用 `Entity` 引用 |
| 跨帧存储（AI 目标、技能目标） | 使用 `EntityHandle` |
| 需要序列化保存 | 使用 `EntityHandle`（数字类型） |
| 网络同步 | 使用 `EntityHandle`（可直接传输） |

## 性能考虑

- EntityHandle 是数字类型，内存占用小
- `findEntityByHandle` 是 O(1) 操作
- 比每帧检查 `entity.isDestroyed` 更安全可靠

## 常见模式

### 可选目标引用

```typescript
class FollowComponent extends Component {
    private _targetHandle: EntityHandle = NULL_HANDLE;

    setTarget(target: Entity | null) {
        this._targetHandle = target?.handle ?? NULL_HANDLE;
    }

    getTarget(scene: IScene): Entity | null {
        if (!isValidHandle(this._targetHandle)) {
            return null;
        }
        return scene.findEntityByHandle(this._targetHandle);
    }

    hasTarget(): boolean {
        return isValidHandle(this._targetHandle);
    }
}
```

### 多目标追踪

```typescript
class MultiTargetComponent extends Component {
    private targets: EntityHandle[] = [];

    addTarget(target: Entity) {
        this.targets.push(target.handle);
    }

    removeTarget(target: Entity) {
        const index = this.targets.indexOf(target.handle);
        if (index >= 0) {
            this.targets.splice(index, 1);
        }
    }

    getValidTargets(scene: IScene): Entity[] {
        const valid: Entity[] = [];
        const stillValid: EntityHandle[] = [];

        for (const handle of this.targets) {
            const entity = scene.findEntityByHandle(handle);
            if (entity) {
                valid.push(entity);
                stillValid.push(handle);
            }
        }

        // 清理无效句柄
        this.targets = stillValid;
        return valid;
    }
}
```

## 下一步

- [生命周期](/guide/entity/lifecycle/) - 实体的销毁和持久化
- [组件引用](/guide/component/entity-ref/) - 组件中的实体引用装饰器
