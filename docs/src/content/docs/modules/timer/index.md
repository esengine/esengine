---
title: "定时器系统 (Timer)"
description: "灵活的定时器和冷却系统"
---

`@esengine/timer` 提供了一个灵活的定时器和冷却系统，用于游戏中的延迟执行、重复任务、技能冷却等场景。

## 安装

```bash
npm install @esengine/timer
```

## 快速开始

```typescript
import { createTimerService } from '@esengine/timer';

// 创建定时器服务
const timerService = createTimerService();

// 一次性定时器（1秒后执行）
const handle = timerService.schedule('myTimer', 1000, () => {
    console.log('Timer fired!');
});

// 重复定时器（每100毫秒执行）
timerService.scheduleRepeating('heartbeat', 100, () => {
    console.log('Tick');
});

// 冷却系统（5秒冷却）
timerService.startCooldown('skill_fireball', 5000);

if (timerService.isCooldownReady('skill_fireball')) {
    // 可以使用技能
    useFireball();
    timerService.startCooldown('skill_fireball', 5000);
}

// 游戏循环中更新
function gameLoop(deltaTime: number) {
    timerService.update(deltaTime);
}
```

## 核心概念

### 定时器 vs 冷却

| 特性 | 定时器 (Timer) | 冷却 (Cooldown) |
|------|---------------|-----------------|
| 用途 | 延迟执行代码 | 限制操作频率 |
| 回调 | 有回调函数 | 无回调函数 |
| 重复 | 支持重复执行 | 一次性 |
| 查询 | 查询剩余时间 | 查询进度/是否就绪 |

### TimerHandle

调度定时器后返回的句柄对象，用于控制定时器：

```typescript
interface TimerHandle {
    readonly id: string;      // 定时器 ID
    readonly isValid: boolean; // 是否有效（未被取消）
    cancel(): void;            // 取消定时器
}
```

### TimerInfo

```typescript
interface TimerInfo {
    readonly id: string;        // 定时器 ID
    readonly remaining: number; // 剩余时间（毫秒）
    readonly repeating: boolean; // 是否重复执行
    readonly interval?: number;  // 间隔时间（仅重复定时器）
}
```

### CooldownInfo

```typescript
interface CooldownInfo {
    readonly id: string;       // 冷却 ID
    readonly duration: number;  // 总持续时间（毫秒）
    readonly remaining: number; // 剩余时间（毫秒）
    readonly progress: number;  // 进度（0-1，0=刚开始，1=结束）
    readonly isReady: boolean;  // 是否已就绪
}
```

## 文档导航

- [API 参考](./api) - 完整的定时器和冷却 API
- [实际示例](./examples) - 技能冷却、DOT 效果、BUFF 系统
- [最佳实践](./best-practices) - 使用建议和 ECS 集成
