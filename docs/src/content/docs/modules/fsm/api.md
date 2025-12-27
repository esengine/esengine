---
title: "API 参考"
description: "状态机完整 API"
---

## createStateMachine

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

## 状态机属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `current` | `TState` | 当前状态 |
| `previous` | `TState \| null` | 上一个状态 |
| `context` | `TContext` | 上下文对象 |
| `isTransitioning` | `boolean` | 是否正在转换中 |
| `currentStateDuration` | `number` | 当前状态持续时间（毫秒） |

## 状态定义

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

## 转换操作

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

## 生命周期

```typescript
// 更新状态机（调用当前状态的 onUpdate）
fsm.update(deltaTime);

// 重置状态机
fsm.reset(); // 重置到当前状态
fsm.reset('idle'); // 重置到指定状态
```

## 事件监听

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

## 调试

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
