---
title: "Timer System"
description: "Flexible timer and cooldown system"
---

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

```typescript
interface TimerInfo {
    readonly id: string;         // Timer ID
    readonly remaining: number;  // Remaining time (ms)
    readonly repeating: boolean; // Whether repeating
    readonly interval?: number;  // Interval (repeating only)
}
```

### CooldownInfo

```typescript
interface CooldownInfo {
    readonly id: string;        // Cooldown ID
    readonly duration: number;  // Total duration (ms)
    readonly remaining: number; // Remaining time (ms)
    readonly progress: number;  // Progress (0-1, 0=started, 1=finished)
    readonly isReady: boolean;  // Whether ready
}
```

## Documentation

- [API Reference](./api) - Complete timer and cooldown API
- [Examples](./examples) - Skill cooldowns, DOT effects, buff systems
- [Best Practices](./best-practices) - Usage tips and ECS integration
