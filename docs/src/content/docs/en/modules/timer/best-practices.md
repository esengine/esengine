---
title: "Best Practices"
description: "Usage tips and ECS integration"
---

## Usage Tips

### 1. Use Meaningful IDs

Use descriptive IDs for easier debugging and management:

```typescript
// Good
timerService.startCooldown('skill_fireball', 5000);
timerService.schedule('explosion_wave_1', 1000, callback);

// Bad
timerService.startCooldown('cd1', 5000);
timerService.schedule('t1', 1000, callback);
```

### 2. Avoid Duplicate IDs

Timers with the same ID will overwrite previous ones. Use unique IDs:

```typescript
// Use unique IDs
const uniqueId = `explosion_${entity.id}_${Date.now()}`;
timerService.schedule(uniqueId, 1000, callback);

// Or use a counter
let timerCounter = 0;
const timerId = `timer_${++timerCounter}`;
```

### 3. Clean Up Promptly

Clean up timers and cooldowns at appropriate times:

```typescript
class Entity {
    private timerId: string;

    onDestroy(): void {
        // Clean up timer when entity is destroyed
        this.timerService.cancelById(this.timerId);
    }
}

class Scene {
    onUnload(): void {
        // Clear all when scene unloads
        this.timerService.clear();
    }
}
```

### 4. Configure Limits

Consider setting maximum limits in production:

```typescript
const timerService = createTimerService({
    maxTimers: 1000,
    maxCooldowns: 500
});
```

### 5. Batch Management

Use prefixes to manage related timers:

```typescript
// Use unified prefix for all timers of an entity
const prefix = `entity_${entityId}_`;

timerService.schedule(`${prefix}explosion`, 1000, callback1);
timerService.schedule(`${prefix}effect`, 2000, callback2);

// Clean up by iterating with prefix
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

## ECS Integration

### Timer Component

```typescript
import { Component, EntitySystem, Matcher } from '@esengine/ecs-framework';
import { createTimerService, type ITimerService } from '@esengine/timer';

// Timer component
class TimerComponent extends Component {
    timerService: ITimerService;

    constructor() {
        super();
        this.timerService = createTimerService();
    }
}

// Timer system
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

### Cooldown Component (Shared Cooldowns)

```typescript
// Cooldown component for shared cooldowns
class CooldownComponent extends Component {
    constructor(public timerService: ITimerService) {
        super();
    }
}

// Multiple entities share the same cooldown service
const sharedCooldowns = createTimerService();

entity1.addComponent(new CooldownComponent(sharedCooldowns));
entity2.addComponent(new CooldownComponent(sharedCooldowns));
```

### Global Timer Service

```typescript
// Use service container for global timer
import { TimerServiceToken, createTimerService } from '@esengine/timer';

// Register global service
services.register(TimerServiceToken, createTimerService());

// Use in systems
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

## Performance Optimization

### Consolidate Updates

If you have multiple independent timer services, consider merging them:

```typescript
// Not recommended: each entity has its own timer service
class BadEntity {
    private timerService = createTimerService(); // Memory waste
}

// Recommended: share timer service
class GoodSystem {
    private timerService = createTimerService();

    addTimer(entityId: number, callback: () => void): void {
        this.timerService.schedule(`entity_${entityId}`, 1000, callback);
    }
}
```

### Avoid Frequent Creation

Reuse timer IDs instead of creating new ones:

```typescript
// Not recommended: create new timer every time
function onHit(): void {
    timerService.schedule(`hit_${Date.now()}`, 100, showHitEffect);
}

// Recommended: cancel old timer and reuse ID
function onHit(): void {
    timerService.cancelById('hit_effect');
    timerService.schedule('hit_effect', 100, showHitEffect);
}
```

### Use Cooldowns Instead of Timers

For scenarios without callbacks, cooldowns are more efficient:

```typescript
// Use cooldown to limit attack frequency
if (timerService.isCooldownReady('attack')) {
    attack();
    timerService.startCooldown('attack', 1000);
}

// Instead of
timerService.schedule('attack_cooldown', 1000, () => {
    canAttack = true;
});
```
