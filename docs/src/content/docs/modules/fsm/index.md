---
title: "状态机 (FSM)"
description: "类型安全的有限状态机实现"
---

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

## 文档导航

- [API 参考](./api) - 完整的状态机 API
- [实际示例](./examples) - 角色状态机、ECS 集成
