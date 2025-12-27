---
title: "API Reference"
description: "Complete timer and cooldown system API"
---

## createTimerService

```typescript
function createTimerService(config?: TimerServiceConfig): ITimerService
```

**Configuration:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxTimers` | `number` | `0` | Maximum timer count (0 = unlimited) |
| `maxCooldowns` | `number` | `0` | Maximum cooldown count (0 = unlimited) |

## Timer API

### schedule

Schedule a one-time timer:

```typescript
const handle = timerService.schedule('explosion', 2000, () => {
    createExplosion();
});

// Cancel early
handle.cancel();
```

### scheduleRepeating

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

### cancel / cancelById

Cancel timers:

```typescript
// Cancel by handle
handle.cancel();
// or
timerService.cancel(handle);

// Cancel by ID
timerService.cancelById('regen');
```

### hasTimer

Check if timer exists:

```typescript
if (timerService.hasTimer('explosion')) {
    console.log('Explosion is pending');
}
```

### getTimerInfo

Get timer information:

```typescript
const info = timerService.getTimerInfo('explosion');
if (info) {
    console.log(`Remaining: ${info.remaining}ms`);
    console.log(`Repeating: ${info.repeating}`);
}
```

## Cooldown API

### startCooldown

Start a cooldown:

```typescript
timerService.startCooldown('skill_fireball', 5000);
```

### isCooldownReady / isOnCooldown

Check cooldown status:

```typescript
if (timerService.isCooldownReady('skill_fireball')) {
    castFireball();
    timerService.startCooldown('skill_fireball', 5000);
} else {
    console.log('Skill still on cooldown');
}

// or use isOnCooldown
if (timerService.isOnCooldown('skill_fireball')) {
    console.log('On cooldown...');
}
```

### getCooldownProgress / getCooldownRemaining

Get cooldown progress:

```typescript
// Progress 0-1 (0=started, 1=complete)
const progress = timerService.getCooldownProgress('skill_fireball');
console.log(`Progress: ${(progress * 100).toFixed(0)}%`);

// Remaining time (ms)
const remaining = timerService.getCooldownRemaining('skill_fireball');
console.log(`Remaining: ${(remaining / 1000).toFixed(1)}s`);
```

### getCooldownInfo

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

### resetCooldown / clearAllCooldowns

Reset cooldowns:

```typescript
// Reset single cooldown
timerService.resetCooldown('skill_fireball');

// Clear all cooldowns (e.g., on respawn)
timerService.clearAllCooldowns();
```

## Lifecycle

### update

Update timer service (call every frame):

```typescript
function gameLoop(deltaTime: number) {
    timerService.update(deltaTime); // deltaTime in ms
}
```

### clear

Clear all timers and cooldowns:

```typescript
timerService.clear();
```

## Debug Properties

```typescript
// Get active timer count
console.log(timerService.activeTimerCount);

// Get active cooldown count
console.log(timerService.activeCooldownCount);

// Get all active timer IDs
const timerIds = timerService.getActiveTimerIds();

// Get all active cooldown IDs
const cooldownIds = timerService.getActiveCooldownIds();
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

// Register service
services.register(TimerServiceToken, createTimerService());

// Get service
const timerService = services.get(TimerServiceToken);
```
