---
title: "实际示例"
description: "ECS 集成和最佳实践"
---

## 玩家控制蓝图

```typescript
// 定义输入处理节点
const InputMoveTemplate: BlueprintNodeTemplate = {
    type: 'InputMove',
    title: 'Get Movement Input',
    category: 'input',
    inputs: [],
    outputs: [
        { name: 'direction', type: 'vector2', direction: 'output' }
    ],
    isPure: true
};

@RegisterNode(InputMoveTemplate)
class InputMoveExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const input = context.scene.services.get(InputServiceToken);
        const direction = {
            x: input.getAxis('horizontal'),
            y: input.getAxis('vertical')
        };
        return { outputs: { direction } };
    }
}
```

## 状态切换逻辑

```typescript
// 在蓝图中实现状态机逻辑
const stateBlueprint = createEmptyBlueprint('PlayerState');

// 添加状态变量
stateBlueprint.variables.push({
    name: 'currentState',
    type: 'string',
    defaultValue: 'idle',
    scope: 'instance'
});

// 在 Tick 事件中检查状态转换
// ... 通过节点连接实现
```

## 伤害处理系统

```typescript
// 自定义伤害节点
const ApplyDamageTemplate: BlueprintNodeTemplate = {
    type: 'ApplyDamage',
    title: 'Apply Damage',
    category: 'combat',
    inputs: [
        { name: 'exec', type: 'exec', direction: 'input', isExec: true },
        { name: 'target', type: 'entity', direction: 'input' },
        { name: 'amount', type: 'number', direction: 'input', defaultValue: 10 }
    ],
    outputs: [
        { name: 'exec', type: 'exec', direction: 'output', isExec: true },
        { name: 'killed', type: 'boolean', direction: 'output' }
    ]
};

@RegisterNode(ApplyDamageTemplate)
class ApplyDamageExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const target = context.getInput<Entity>(node.id, 'target');
        const amount = context.getInput<number>(node.id, 'amount');

        const health = target.getComponent(HealthComponent);
        if (health) {
            health.current -= amount;
            const killed = health.current <= 0;
            return {
                outputs: { killed },
                nextExec: 'exec'
            };
        }

        return { outputs: { killed: false }, nextExec: 'exec' };
    }
}
```

## 技能冷却系统

```typescript
// 冷却检查节点
const CheckCooldownTemplate: BlueprintNodeTemplate = {
    type: 'CheckCooldown',
    title: 'Check Cooldown',
    category: 'ability',
    inputs: [
        { name: 'skillId', type: 'string', direction: 'input' }
    ],
    outputs: [
        { name: 'ready', type: 'boolean', direction: 'output' },
        { name: 'remaining', type: 'number', direction: 'output' }
    ],
    isPure: true
};
```

## 最佳实践

### 1. 使用片段复用逻辑

```typescript
// 将通用逻辑封装为片段
const movementFragment = createFragment('Movement', {
    inputs: [{ name: 'speed', type: 'number', ... }],
    outputs: [{ name: 'position', type: 'vector2', ... }],
    graph: { ... }
});

// 通过组合器构建复杂蓝图
const composer = createComposer('Player');
composer.addFragment(movementFragment, 'movement');
composer.addFragment(combatFragment, 'combat');
```

### 2. 合理使用变量作用域

```typescript
// local: 临时计算结果
{ name: 'tempValue', scope: 'local' }

// instance: 实体状态（如生命值）
{ name: 'health', scope: 'instance' }

// global: 游戏全局状态
{ name: 'score', scope: 'global' }
```

### 3. 避免无限循环

```typescript
// VM 有每帧最大执行步数限制（默认 1000）
// 使用 Delay 节点打断长执行链
vm.maxStepsPerFrame = 1000;
```

### 4. 调试技巧

```typescript
// 启用调试模式查看执行日志
vm.debug = true;

// 使用 Print 节点输出中间值
// 在编辑器中设置断点
```

### 5. 性能优化

```typescript
// 纯节点的输出会被缓存
{ isPure: true }

// 避免在 Tick 中执行重计算
// 使用事件驱动而非轮询
```
