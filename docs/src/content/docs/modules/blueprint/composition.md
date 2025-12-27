---
title: "蓝图组合"
description: "片段、组合器和触发器"
---

## 蓝图片段

将可复用的逻辑封装为片段：

```typescript
import { createFragment } from '@esengine/blueprint';

const healthFragment = createFragment('HealthSystem', {
    inputs: [
        { name: 'damage', type: 'number', internalNodeId: 'input1', internalPinName: 'value' }
    ],
    outputs: [
        { name: 'isDead', type: 'boolean', internalNodeId: 'output1', internalPinName: 'value' }
    ],
    graph: {
        nodes: [...],
        connections: [...],
        variables: [...]
    }
});
```

## 组合蓝图

```typescript
import { createComposer, FragmentRegistry } from '@esengine/blueprint';

// 注册片段
FragmentRegistry.instance.register('health', healthFragment);
FragmentRegistry.instance.register('movement', movementFragment);

// 创建组合器
const composer = createComposer('PlayerBlueprint');

// 添加片段到槽位
composer.addFragment(healthFragment, 'slot1', { position: { x: 0, y: 0 } });
composer.addFragment(movementFragment, 'slot2', { position: { x: 400, y: 0 } });

// 连接槽位
composer.connect('slot1', 'onDeath', 'slot2', 'disable');

// 验证
const validation = composer.validate();
if (!validation.isValid) {
    console.error(validation.errors);
}

// 编译成蓝图
const blueprint = composer.compile();
```

## 片段注册表

```typescript
import { FragmentRegistry } from '@esengine/blueprint';

const registry = FragmentRegistry.instance;

// 注册片段
registry.register('health', healthFragment);

// 获取片段
const fragment = registry.get('health');

// 获取所有片段
const allFragments = registry.getAll();

// 按类别获取
const combatFragments = registry.getByCategory('combat');
```

## 触发器系统

### 定义触发条件

```typescript
import { TriggerCondition, TriggerDispatcher } from '@esengine/blueprint';

const lowHealthCondition: TriggerCondition = {
    type: 'comparison',
    left: { type: 'variable', name: 'health' },
    operator: '<',
    right: { type: 'constant', value: 20 }
};
```

### 使用触发器分发器

```typescript
const dispatcher = new TriggerDispatcher();

// 注册触发器
dispatcher.register('lowHealth', lowHealthCondition, (context) => {
    context.triggerEvent('OnLowHealth');
});

// 每帧评估
dispatcher.evaluate(context);
```

### 复合条件

```typescript
const complexCondition: TriggerCondition = {
    type: 'and',
    conditions: [
        {
            type: 'comparison',
            left: { type: 'variable', name: 'health' },
            operator: '<',
            right: { type: 'constant', value: 50 }
        },
        {
            type: 'comparison',
            left: { type: 'variable', name: 'inCombat' },
            operator: '==',
            right: { type: 'constant', value: true }
        }
    ]
};
```

## 片段最佳实践

1. **单一职责** - 每个片段只做一件事
2. **清晰接口** - 输入输出引脚命名明确
3. **文档注释** - 为片段添加描述和使用示例
4. **版本控制** - 更新片段时注意向后兼容
