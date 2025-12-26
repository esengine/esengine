# 定时器系统 (Timer)

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

定时器信息对象：

```typescript
interface TimerInfo {
    readonly id: string;        // 定时器 ID
    readonly remaining: number; // 剩余时间（毫秒）
    readonly repeating: boolean; // 是否重复执行
    readonly interval?: number;  // 间隔时间（仅重复定时器）
}
```

### CooldownInfo

冷却信息对象：

```typescript
interface CooldownInfo {
    readonly id: string;       // 冷却 ID
    readonly duration: number;  // 总持续时间（毫秒）
    readonly remaining: number; // 剩余时间（毫秒）
    readonly progress: number;  // 进度（0-1，0=刚开始，1=结束）
    readonly isReady: boolean;  // 是否已就绪
}
```

## API 参考

### createTimerService

```typescript
function createTimerService(config?: TimerServiceConfig): ITimerService
```

**配置选项：**

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `maxTimers` | `number` | `0` | 最大定时器数量（0 表示无限制） |
| `maxCooldowns` | `number` | `0` | 最大冷却数量（0 表示无限制） |

### 定时器 API

#### schedule

调度一次性定时器：

```typescript
const handle = timerService.schedule('explosion', 2000, () => {
    createExplosion();
});

// 提前取消
handle.cancel();
```

#### scheduleRepeating

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

#### cancel / cancelById

取消定时器：

```typescript
// 通过句柄取消
handle.cancel();
// 或
timerService.cancel(handle);

// 通过 ID 取消
timerService.cancelById('regen');
```

#### hasTimer

检查定时器是否存在：

```typescript
if (timerService.hasTimer('explosion')) {
    console.log('Explosion is pending');
}
```

#### getTimerInfo

获取定时器信息：

```typescript
const info = timerService.getTimerInfo('explosion');
if (info) {
    console.log(`剩余时间: ${info.remaining}ms`);
    console.log(`是否重复: ${info.repeating}`);
}
```

### 冷却 API

#### startCooldown

开始冷却：

```typescript
// 5秒冷却
timerService.startCooldown('skill_fireball', 5000);
```

#### isCooldownReady / isOnCooldown

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

#### getCooldownProgress / getCooldownRemaining

获取冷却进度：

```typescript
// 进度 0-1（0=刚开始，1=完成）
const progress = timerService.getCooldownProgress('skill_fireball');
console.log(`冷却进度: ${(progress * 100).toFixed(0)}%`);

// 剩余时间（毫秒）
const remaining = timerService.getCooldownRemaining('skill_fireball');
console.log(`剩余时间: ${(remaining / 1000).toFixed(1)}s`);
```

#### getCooldownInfo

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

#### resetCooldown / clearAllCooldowns

重置冷却：

```typescript
// 重置单个冷却
timerService.resetCooldown('skill_fireball');

// 清除所有冷却（例如角色复活时）
timerService.clearAllCooldowns();
```

### 生命周期

#### update

更新定时器服务（需要每帧调用）：

```typescript
function gameLoop(deltaTime: number) {
    // deltaTime 单位是毫秒
    timerService.update(deltaTime);
}
```

#### clear

清除所有定时器和冷却：

```typescript
timerService.clear();
```

### 调试属性

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

## 实际示例

### 技能冷却系统

```typescript
import { createTimerService, type ITimerService } from '@esengine/timer';

class SkillSystem {
    private timerService: ITimerService;
    private skills: Map<string, SkillData> = new Map();

    constructor() {
        this.timerService = createTimerService();
    }

    registerSkill(id: string, data: SkillData): void {
        this.skills.set(id, data);
    }

    useSkill(skillId: string): boolean {
        const skill = this.skills.get(skillId);
        if (!skill) return false;

        // 检查冷却
        if (!this.timerService.isCooldownReady(skillId)) {
            const remaining = this.timerService.getCooldownRemaining(skillId);
            console.log(`技能 ${skillId} 冷却中，剩余 ${remaining}ms`);
            return false;
        }

        // 使用技能
        this.executeSkill(skill);

        // 开始冷却
        this.timerService.startCooldown(skillId, skill.cooldown);
        return true;
    }

    getSkillCooldownProgress(skillId: string): number {
        return this.timerService.getCooldownProgress(skillId);
    }

    update(dt: number): void {
        this.timerService.update(dt);
    }
}

interface SkillData {
    cooldown: number;
    // ... other properties
}
```

### 延迟和定时效果

```typescript
class EffectSystem {
    private timerService: ITimerService;

    constructor(timerService: ITimerService) {
        this.timerService = timerService;
    }

    // 延迟爆炸
    scheduleExplosion(position: { x: number; y: number }, delay: number): void {
        this.timerService.schedule(`explosion_${Date.now()}`, delay, () => {
            this.createExplosion(position);
        });
    }

    // DOT 伤害（每秒造成伤害）
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

    // BUFF 效果（持续一段时间）
    applyBuff(target: Entity, buffId: string, duration: number): void {
        target.addBuff(buffId);

        this.timerService.schedule(`buff_expire_${buffId}`, duration, () => {
            target.removeBuff(buffId);
        });
    }
}
```

### 与 ECS 集成

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

// 冷却组件（用于共享冷却）
class CooldownComponent extends Component {
    constructor(public timerService: ITimerService) {
        super();
    }
}
```

## 蓝图节点

Timer 模块提供了可视化脚本支持的蓝图节点：

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

## 最佳实践

1. **使用有意义的 ID**：使用描述性的 ID 便于调试和管理
   ```typescript
   // 好
   timerService.startCooldown('skill_fireball', 5000);

   // 不好
   timerService.startCooldown('cd1', 5000);
   ```

2. **避免重复 ID**：相同 ID 的定时器会覆盖之前的
   ```typescript
   // 使用唯一 ID
   const uniqueId = `explosion_${entity.id}_${Date.now()}`;
   timerService.schedule(uniqueId, 1000, callback);
   ```

3. **及时清理**：在适当时机清理不需要的定时器和冷却
   ```typescript
   // 实体销毁时
   onDestroy() {
       this.timerService.cancelById(this.timerId);
   }
   ```

4. **配置限制**：在生产环境考虑设置最大数量限制
   ```typescript
   const timerService = createTimerService({
       maxTimers: 1000,
       maxCooldowns: 500
   });
   ```
