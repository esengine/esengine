# 状态机 (FSM)

`@esengine/fsm` 提供了一个类型安全的有限状态机实现，用于角色、AI 或任何需要状态管理的场景。

## 安装

```bash
npm install @esengine/fsm
```

## 快速开始

```typescript
import { createStateMachine } from '@esengine/fsm';

// 定义状态类型
type PlayerState = 'idle' | 'walk' | 'run' | 'jump';

// 创建状态机
const fsm = createStateMachine<PlayerState>('idle');

// 定义状态和回调
fsm.defineState('idle', {
    onEnter: (ctx, from) => console.log(`从 ${from} 进入 idle`),
    onExit: (ctx, to) => console.log(`从 idle 退出到 ${to}`),
    onUpdate: (ctx, dt) => { /* 每帧更新 */ }
});

fsm.defineState('walk', {
    onEnter: () => console.log('开始行走')
});

// 手动切换状态
fsm.transition('walk');

console.log(fsm.current); // 'walk'
```

## 核心概念

### 状态配置

每个状态可以配置以下回调：

```typescript
interface StateConfig<TState, TContext> {
    name: TState;                                    // 状态名称
    onEnter?: (context: TContext, from: TState | null) => void;  // 进入回调
    onExit?: (context: TContext, to: TState) => void;            // 退出回调
    onUpdate?: (context: TContext, deltaTime: number) => void;   // 更新回调
    tags?: string[];                                 // 状态标签
    metadata?: Record<string, unknown>;              // 元数据
}
```

### 转换条件

可以定义带条件的状态转换：

```typescript
interface Context {
    isMoving: boolean;
    isRunning: boolean;
    isGrounded: boolean;
}

const fsm = createStateMachine<PlayerState, Context>('idle', {
    context: { isMoving: false, isRunning: false, isGrounded: true }
});

// 定义转换条件
fsm.defineTransition('idle', 'walk', (ctx) => ctx.isMoving);
fsm.defineTransition('walk', 'run', (ctx) => ctx.isRunning);
fsm.defineTransition('walk', 'idle', (ctx) => !ctx.isMoving);

// 自动评估并执行满足条件的转换
fsm.evaluateTransitions();
```

### 转换优先级

当多个转换条件同时满足时，优先级高的先执行：

```typescript
// 优先级数字越大越优先
fsm.defineTransition('idle', 'attack', (ctx) => ctx.isAttacking, 10);
fsm.defineTransition('idle', 'walk', (ctx) => ctx.isMoving, 1);

// 如果同时满足，会先尝试 attack（优先级 10）
```

## API 参考

### createStateMachine

```typescript
function createStateMachine<TState extends string, TContext = unknown>(
    initialState: TState,
    options?: StateMachineOptions<TContext>
): IStateMachine<TState, TContext>
```

**参数：**
- `initialState` - 初始状态
- `options.context` - 上下文对象，在回调中可访问
- `options.maxHistorySize` - 最大历史记录数（默认 100）
- `options.enableHistory` - 是否启用历史记录（默认 true）

### 状态机属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `current` | `TState` | 当前状态 |
| `previous` | `TState \| null` | 上一个状态 |
| `context` | `TContext` | 上下文对象 |
| `isTransitioning` | `boolean` | 是否正在转换中 |
| `currentStateDuration` | `number` | 当前状态持续时间（毫秒） |

### 状态机方法

#### 状态定义

```typescript
// 定义状态
fsm.defineState('idle', {
    onEnter: (ctx, from) => {},
    onExit: (ctx, to) => {},
    onUpdate: (ctx, dt) => {}
});

// 检查状态是否存在
fsm.hasState('idle'); // true

// 获取状态配置
fsm.getStateConfig('idle');

// 获取所有状态
fsm.getStates(); // ['idle', 'walk', ...]
```

#### 转换操作

```typescript
// 定义转换
fsm.defineTransition('idle', 'walk', condition, priority);

// 移除转换
fsm.removeTransition('idle', 'walk');

// 获取从某状态出发的所有转换
fsm.getTransitionsFrom('idle');

// 检查是否可以转换
fsm.canTransition('walk'); // true/false

// 手动转换
fsm.transition('walk');

// 强制转换（忽略条件）
fsm.transition('walk', true);

// 自动评估转换条件
fsm.evaluateTransitions();
```

#### 生命周期

```typescript
// 更新状态机（调用当前状态的 onUpdate）
fsm.update(deltaTime);

// 重置状态机
fsm.reset(); // 重置到当前状态
fsm.reset('idle'); // 重置到指定状态
```

#### 事件监听

```typescript
// 监听进入特定状态
const unsubscribe = fsm.onEnter('walk', (from) => {
    console.log(`从 ${from} 进入 walk`);
});

// 监听退出特定状态
fsm.onExit('walk', (to) => {
    console.log(`从 walk 退出到 ${to}`);
});

// 监听任意状态变化
fsm.onChange((event) => {
    console.log(`${event.from} -> ${event.to} at ${event.timestamp}`);
});

// 取消订阅
unsubscribe();
```

#### 调试

```typescript
// 获取状态历史
const history = fsm.getHistory();
// [{ from: 'idle', to: 'walk', timestamp: 1234567890 }, ...]

// 清除历史
fsm.clearHistory();

// 获取调试信息
const info = fsm.getDebugInfo();
// { current, previous, duration, stateCount, transitionCount, historySize }
```

## 实际示例

### 角色状态机

```typescript
import { createStateMachine } from '@esengine/fsm';

type CharacterState = 'idle' | 'walk' | 'run' | 'jump' | 'fall' | 'attack';

interface CharacterContext {
    velocity: { x: number; y: number };
    isGrounded: boolean;
    isAttacking: boolean;
    speed: number;
}

const characterFSM = createStateMachine<CharacterState, CharacterContext>('idle', {
    context: {
        velocity: { x: 0, y: 0 },
        isGrounded: true,
        isAttacking: false,
        speed: 0
    }
});

// 定义状态
characterFSM.defineState('idle', {
    onEnter: (ctx) => {
        ctx.speed = 0;
    },
    onUpdate: (ctx, dt) => {
        // 播放待机动画
    }
});

characterFSM.defineState('walk', {
    onEnter: (ctx) => {
        ctx.speed = 100;
    }
});

characterFSM.defineState('run', {
    onEnter: (ctx) => {
        ctx.speed = 200;
    }
});

characterFSM.defineState('jump', {
    onEnter: (ctx) => {
        ctx.velocity.y = -300;
        ctx.isGrounded = false;
    }
});

// 定义转换
characterFSM.defineTransition('idle', 'walk', (ctx) => Math.abs(ctx.velocity.x) > 0);
characterFSM.defineTransition('walk', 'idle', (ctx) => ctx.velocity.x === 0);
characterFSM.defineTransition('walk', 'run', (ctx) => Math.abs(ctx.velocity.x) > 150);
characterFSM.defineTransition('run', 'walk', (ctx) => Math.abs(ctx.velocity.x) <= 150);

// 跳跃有最高优先级
characterFSM.defineTransition('idle', 'jump', (ctx) => !ctx.isGrounded, 10);
characterFSM.defineTransition('walk', 'jump', (ctx) => !ctx.isGrounded, 10);
characterFSM.defineTransition('run', 'jump', (ctx) => !ctx.isGrounded, 10);

characterFSM.defineTransition('jump', 'fall', (ctx) => ctx.velocity.y > 0);
characterFSM.defineTransition('fall', 'idle', (ctx) => ctx.isGrounded);

// 游戏循环中使用
function gameUpdate(dt: number) {
    // 更新上下文
    characterFSM.context.velocity.x = getInputVelocity();
    characterFSM.context.isGrounded = checkGrounded();

    // 评估状态转换
    characterFSM.evaluateTransitions();

    // 更新当前状态
    characterFSM.update(dt);
}
```

### 与 ECS 集成

```typescript
import { Component, EntitySystem, Matcher } from '@esengine/ecs-framework';
import { createStateMachine, type IStateMachine } from '@esengine/fsm';

// 状态机组件
class FSMComponent extends Component {
    fsm: IStateMachine<string>;

    constructor(initialState: string) {
        super();
        this.fsm = createStateMachine(initialState);
    }
}

// 状态机系统
class FSMSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(FSMComponent));
    }

    protected processEntity(entity: Entity, dt: number): void {
        const fsmComp = entity.getComponent(FSMComponent);
        fsmComp.fsm.evaluateTransitions();
        fsmComp.fsm.update(dt);
    }
}
```

## 蓝图节点

FSM 模块提供了可视化脚本支持的蓝图节点：

- `GetCurrentState` - 获取当前状态
- `TransitionTo` - 转换到指定状态
- `CanTransition` - 检查是否可以转换
- `IsInState` - 检查是否在指定状态
- `WasInState` - 检查是否曾在指定状态
- `GetStateDuration` - 获取状态持续时间
- `EvaluateTransitions` - 评估转换条件
- `ResetStateMachine` - 重置状态机
