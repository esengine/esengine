---
title: "API 参考"
description: "定时器和冷却系统完整 API"
---

## createTimerService

```typescript
function createTimerService(config?: TimerServiceConfig): ITimerService
```

**配置选项：**

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `maxTimers` | `number` | `0` | 最大定时器数量（0 表示无限制） |
| `maxCooldowns` | `number` | `0` | 最大冷却数量（0 表示无限制） |

## 定时器 API

### schedule

调度一次性定时器：

```typescript
const handle = timerService.schedule('explosion', 2000, () => {
    createExplosion();
});

// 提前取消
handle.cancel();
```

### scheduleRepeating

调度重复定时器：

```typescript
// 每秒执行
timerService.scheduleRepeating('regen', 1000, () => {
    player.hp += 5;
});

// 立即执行一次，然后每秒重复
timerService.scheduleRepeating('tick', 1000, () => {
    console.log('Tick');
}, true); // immediate = true
```

### cancel / cancelById

取消定时器：

```typescript
// 通过句柄取消
handle.cancel();
// 或
timerService.cancel(handle);

// 通过 ID 取消
timerService.cancelById('regen');
```

### hasTimer

检查定时器是否存在：

```typescript
if (timerService.hasTimer('explosion')) {
    console.log('Explosion is pending');
}
```

### getTimerInfo

获取定时器信息：

```typescript
const info = timerService.getTimerInfo('explosion');
if (info) {
    console.log(`剩余时间: ${info.remaining}ms`);
    console.log(`是否重复: ${info.repeating}`);
}
```

## 冷却 API

### startCooldown

开始冷却：

```typescript
// 5秒冷却
timerService.startCooldown('skill_fireball', 5000);
```

### isCooldownReady / isOnCooldown

检查冷却状态：

```typescript
if (timerService.isCooldownReady('skill_fireball')) {
    // 可以使用技能
    castFireball();
    timerService.startCooldown('skill_fireball', 5000);
} else {
    console.log('技能还在冷却中');
}

// 或使用 isOnCooldown
if (timerService.isOnCooldown('skill_fireball')) {
    console.log('冷却中...');
}
```

### getCooldownProgress / getCooldownRemaining

获取冷却进度：

```typescript
// 进度 0-1（0=刚开始，1=完成）
const progress = timerService.getCooldownProgress('skill_fireball');
console.log(`冷却进度: ${(progress * 100).toFixed(0)}%`);

// 剩余时间（毫秒）
const remaining = timerService.getCooldownRemaining('skill_fireball');
console.log(`剩余时间: ${(remaining / 1000).toFixed(1)}s`);
```

### getCooldownInfo

获取完整冷却信息：

```typescript
const info = timerService.getCooldownInfo('skill_fireball');
if (info) {
    console.log(`总时长: ${info.duration}ms`);
    console.log(`剩余: ${info.remaining}ms`);
    console.log(`进度: ${info.progress}`);
    console.log(`就绪: ${info.isReady}`);
}
```

### resetCooldown / clearAllCooldowns

重置冷却：

```typescript
// 重置单个冷却
timerService.resetCooldown('skill_fireball');

// 清除所有冷却（例如角色复活时）
timerService.clearAllCooldowns();
```

## 生命周期

### update

更新定时器服务（需要每帧调用）：

```typescript
function gameLoop(deltaTime: number) {
    // deltaTime 单位是毫秒
    timerService.update(deltaTime);
}
```

### clear

清除所有定时器和冷却：

```typescript
timerService.clear();
```

## 调试属性

```typescript
// 获取活跃定时器数量
console.log(timerService.activeTimerCount);

// 获取活跃冷却数量
console.log(timerService.activeCooldownCount);

// 获取所有活跃定时器 ID
const timerIds = timerService.getActiveTimerIds();

// 获取所有活跃冷却 ID
const cooldownIds = timerService.getActiveCooldownIds();
```

## 蓝图节点

### 冷却节点

- `StartCooldown` - 开始冷却
- `IsCooldownReady` - 检查冷却是否就绪
- `GetCooldownProgress` - 获取冷却进度
- `GetCooldownInfo` - 获取详细冷却信息
- `ResetCooldown` - 重置冷却

### 定时器节点

- `HasTimer` - 检查定时器是否存在
- `CancelTimer` - 取消定时器
- `GetTimerRemaining` - 获取定时器剩余时间

## 服务令牌

在依赖注入场景中使用：

```typescript
import { TimerServiceToken, createTimerService } from '@esengine/timer';

// 注册服务
services.register(TimerServiceToken, createTimerService());

// 获取服务
const timerService = services.get(TimerServiceToken);
```
