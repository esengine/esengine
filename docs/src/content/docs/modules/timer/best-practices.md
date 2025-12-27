---
title: "最佳实践"
description: "使用建议和 ECS 集成"
---

## 使用建议

### 1. 使用有意义的 ID

使用描述性的 ID 便于调试和管理：

```typescript
// 好
timerService.startCooldown('skill_fireball', 5000);
timerService.schedule('explosion_wave_1', 1000, callback);

// 不好
timerService.startCooldown('cd1', 5000);
timerService.schedule('t1', 1000, callback);
```

### 2. 避免重复 ID

相同 ID 的定时器会覆盖之前的，使用唯一 ID：

```typescript
// 使用唯一 ID
const uniqueId = `explosion_${entity.id}_${Date.now()}`;
timerService.schedule(uniqueId, 1000, callback);

// 或使用计数器
let timerCounter = 0;
const timerId = `timer_${++timerCounter}`;
```

### 3. 及时清理

在适当时机清理不需要的定时器和冷却：

```typescript
class Entity {
    private timerId: string;

    onDestroy(): void {
        // 实体销毁时清理定时器
        this.timerService.cancelById(this.timerId);
    }
}

class Scene {
    onUnload(): void {
        // 场景卸载时清除所有
        this.timerService.clear();
    }
}
```

### 4. 配置限制

在生产环境考虑设置最大数量限制：

```typescript
const timerService = createTimerService({
    maxTimers: 1000,
    maxCooldowns: 500
});
```

### 5. 批量管理

使用前缀管理相关定时器：

```typescript
// 为某个实体的所有定时器使用统一前缀
const prefix = `entity_${entityId}_`;

timerService.schedule(`${prefix}explosion`, 1000, callback1);
timerService.schedule(`${prefix}effect`, 2000, callback2);

// 清理时可以遍历查找
function clearEntityTimers(entityId: number): void {
    const prefix = `entity_${entityId}_`;
    const ids = timerService.getActiveTimerIds();

    for (const id of ids) {
        if (id.startsWith(prefix)) {
            timerService.cancelById(id);
        }
    }
}
```

## 与 ECS 集成

### 定时器组件

```typescript
import { Component, EntitySystem, Matcher } from '@esengine/ecs-framework';
import { createTimerService, type ITimerService } from '@esengine/timer';

// 定时器组件
class TimerComponent extends Component {
    timerService: ITimerService;

    constructor() {
        super();
        this.timerService = createTimerService();
    }
}

// 定时器系统
class TimerSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(TimerComponent));
    }

    protected processEntity(entity: Entity, dt: number): void {
        const timer = entity.getComponent(TimerComponent);
        timer.timerService.update(dt);
    }
}
```

### 冷却组件（共享冷却）

```typescript
// 冷却组件（用于共享冷却）
class CooldownComponent extends Component {
    constructor(public timerService: ITimerService) {
        super();
    }
}

// 多个实体共享同一个冷却服务
const sharedCooldowns = createTimerService();

entity1.addComponent(new CooldownComponent(sharedCooldowns));
entity2.addComponent(new CooldownComponent(sharedCooldowns));
```

### 全局定时器服务

```typescript
// 使用服务容器管理全局定时器
import { TimerServiceToken, createTimerService } from '@esengine/timer';

// 注册全局服务
services.register(TimerServiceToken, createTimerService());

// 在系统中使用
class EffectSystem extends EntitySystem {
    private timerService: ITimerService;

    constructor(services: ServiceContainer) {
        super(Matcher.all(EffectComponent));
        this.timerService = services.get(TimerServiceToken);
    }

    applyEffect(entity: Entity, effect: Effect): void {
        const id = `effect_${entity.id}_${effect.id}`;

        this.timerService.schedule(id, effect.duration, () => {
            entity.removeComponent(effect);
        });
    }
}
```

## 性能优化

### 合并更新

如果有多个独立的定时器服务，考虑合并为一个：

```typescript
// 不推荐：每个实体有自己的定时器服务
class BadEntity {
    private timerService = createTimerService(); // 内存浪费
}

// 推荐：共享定时器服务
class GoodSystem {
    private timerService = createTimerService();

    addTimer(entityId: number, callback: () => void): void {
        this.timerService.schedule(`entity_${entityId}`, 1000, callback);
    }
}
```

### 避免频繁创建

重用定时器 ID 而不是创建新的：

```typescript
// 不推荐：每次都创建新定时器
function onHit(): void {
    timerService.schedule(`hit_${Date.now()}`, 100, showHitEffect);
}

// 推荐：取消旧定时器后复用 ID
function onHit(): void {
    timerService.cancelById('hit_effect');
    timerService.schedule('hit_effect', 100, showHitEffect);
}
```

### 使用冷却而不是定时器

对于不需要回调的场景，使用冷却更高效：

```typescript
// 使用冷却限制攻击频率
if (timerService.isCooldownReady('attack')) {
    attack();
    timerService.startCooldown('attack', 1000);
}

// 而不是
timerService.schedule('attack_cooldown', 1000, () => {
    canAttack = true;
});
```
