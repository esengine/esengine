# Timer System

`@esengine/timer` provides a flexible timer and cooldown system for delayed execution, repeating tasks, skill cooldowns, and more.

## Installation

```bash
npm install @esengine/timer
```

## Quick Start

```typescript
import { createTimerService } from '@esengine/timer';

// Create timer service
const timerService = createTimerService();

// One-time timer (executes after 1 second)
const handle = timerService.schedule('myTimer', 1000, () => {
    console.log('Timer fired!');
});

// Repeating timer (every 100ms)
timerService.scheduleRepeating('heartbeat', 100, () => {
    console.log('Tick');
});

// Cooldown system (5 second cooldown)
timerService.startCooldown('skill_fireball', 5000);

if (timerService.isCooldownReady('skill_fireball')) {
    useFireball();
    timerService.startCooldown('skill_fireball', 5000);
}

// Update in game loop
function gameLoop(deltaTime: number) {
    timerService.update(deltaTime);
}
```

## Core Concepts

### Timer vs Cooldown

| Feature | Timer | Cooldown |
|---------|-------|----------|
| Purpose | Delayed code execution | Rate limiting |
| Callback | Has callback function | No callback |
| Repeat | Supports repeating | One-time |
| Query | Query remaining time | Query progress/ready status |

### TimerHandle

Handle object returned when scheduling a timer:

```typescript
interface TimerHandle {
    readonly id: string;       // Timer ID
    readonly isValid: boolean; // Whether valid (not cancelled)
    cancel(): void;            // Cancel timer
}
```

### TimerInfo

Timer information object:

```typescript
interface TimerInfo {
    readonly id: string;         // Timer ID
    readonly remaining: number;  // Remaining time (ms)
    readonly repeating: boolean; // Whether repeating
    readonly interval?: number;  // Interval (repeating only)
}
```

### CooldownInfo

Cooldown information object:

```typescript
interface CooldownInfo {
    readonly id: string;        // Cooldown ID
    readonly duration: number;  // Total duration (ms)
    readonly remaining: number; // Remaining time (ms)
    readonly progress: number;  // Progress (0-1, 0=started, 1=finished)
    readonly isReady: boolean;  // Whether ready
}
```

## API Reference

### createTimerService

```typescript
function createTimerService(config?: TimerServiceConfig): ITimerService
```

**Configuration:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxTimers` | `number` | `0` | Maximum timer count (0 = unlimited) |
| `maxCooldowns` | `number` | `0` | Maximum cooldown count (0 = unlimited) |

### Timer API

#### schedule

Schedule a one-time timer:

```typescript
const handle = timerService.schedule('explosion', 2000, () => {
    createExplosion();
});

// Cancel early
handle.cancel();
```

#### scheduleRepeating

Schedule a repeating timer:

```typescript
// Execute every second
timerService.scheduleRepeating('regen', 1000, () => {
    player.hp += 5;
});

// Execute immediately once, then repeat every second
timerService.scheduleRepeating('tick', 1000, () => {
    console.log('Tick');
}, true); // immediate = true
```

#### cancel / cancelById

Cancel timers:

```typescript
// Cancel by handle
handle.cancel();
// or
timerService.cancel(handle);

// Cancel by ID
timerService.cancelById('regen');
```

#### hasTimer

Check if timer exists:

```typescript
if (timerService.hasTimer('explosion')) {
    console.log('Explosion is pending');
}
```

#### getTimerInfo

Get timer information:

```typescript
const info = timerService.getTimerInfo('explosion');
if (info) {
    console.log(`Remaining: ${info.remaining}ms`);
    console.log(`Repeating: ${info.repeating}`);
}
```

### Cooldown API

#### startCooldown

Start a cooldown:

```typescript
timerService.startCooldown('skill_fireball', 5000);
```

#### isCooldownReady / isOnCooldown

Check cooldown status:

```typescript
if (timerService.isCooldownReady('skill_fireball')) {
    castFireball();
    timerService.startCooldown('skill_fireball', 5000);
}

if (timerService.isOnCooldown('skill_fireball')) {
    console.log('On cooldown...');
}
```

#### getCooldownProgress / getCooldownRemaining

Get cooldown progress:

```typescript
// Progress 0-1 (0=started, 1=complete)
const progress = timerService.getCooldownProgress('skill_fireball');
console.log(`Progress: ${(progress * 100).toFixed(0)}%`);

// Remaining time (ms)
const remaining = timerService.getCooldownRemaining('skill_fireball');
console.log(`Remaining: ${(remaining / 1000).toFixed(1)}s`);
```

#### getCooldownInfo

Get complete cooldown info:

```typescript
const info = timerService.getCooldownInfo('skill_fireball');
if (info) {
    console.log(`Duration: ${info.duration}ms`);
    console.log(`Remaining: ${info.remaining}ms`);
    console.log(`Progress: ${info.progress}`);
    console.log(`Ready: ${info.isReady}`);
}
```

#### resetCooldown / clearAllCooldowns

Reset cooldowns:

```typescript
// Reset single cooldown
timerService.resetCooldown('skill_fireball');

// Clear all cooldowns (e.g., on respawn)
timerService.clearAllCooldowns();
```

### Lifecycle

#### update

Update timer service (call every frame):

```typescript
function gameLoop(deltaTime: number) {
    timerService.update(deltaTime); // deltaTime in ms
}
```

#### clear

Clear all timers and cooldowns:

```typescript
timerService.clear();
```

### Debug Properties

```typescript
console.log(timerService.activeTimerCount);
console.log(timerService.activeCooldownCount);
const timerIds = timerService.getActiveTimerIds();
const cooldownIds = timerService.getActiveCooldownIds();
```

## Practical Examples

### Skill Cooldown System

```typescript
import { createTimerService, type ITimerService } from '@esengine/timer';

class SkillSystem {
    private timerService: ITimerService;
    private skills: Map<string, SkillData> = new Map();

    constructor() {
        this.timerService = createTimerService();
    }

    useSkill(skillId: string): boolean {
        const skill = this.skills.get(skillId);
        if (!skill) return false;

        if (!this.timerService.isCooldownReady(skillId)) {
            const remaining = this.timerService.getCooldownRemaining(skillId);
            console.log(`Skill ${skillId} on cooldown, ${remaining}ms remaining`);
            return false;
        }

        this.executeSkill(skill);
        this.timerService.startCooldown(skillId, skill.cooldown);
        return true;
    }

    update(dt: number): void {
        this.timerService.update(dt);
    }
}
```

### DOT Effects

```typescript
class EffectSystem {
    private timerService: ITimerService;

    applyDOT(target: Entity, damage: number, duration: number): void {
        const dotId = `dot_${target.id}_${Date.now()}`;
        let elapsed = 0;

        this.timerService.scheduleRepeating(dotId, 1000, () => {
            elapsed += 1000;
            target.takeDamage(damage);

            if (elapsed >= duration) {
                this.timerService.cancelById(dotId);
            }
        });
    }
}
```

## Blueprint Nodes

### Cooldown Nodes

- `StartCooldown` - Start cooldown
- `IsCooldownReady` - Check if cooldown is ready
- `GetCooldownProgress` - Get cooldown progress
- `GetCooldownInfo` - Get cooldown info
- `ResetCooldown` - Reset cooldown

### Timer Nodes

- `HasTimer` - Check if timer exists
- `CancelTimer` - Cancel timer
- `GetTimerRemaining` - Get timer remaining time

## Service Token

For dependency injection:

```typescript
import { TimerServiceToken, createTimerService } from '@esengine/timer';

services.register(TimerServiceToken, createTimerService());
const timerService = services.get(TimerServiceToken);
```
