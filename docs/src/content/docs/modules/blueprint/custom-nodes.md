---
title: "自定义节点"
description: "创建自定义蓝图节点"
---

## 定义节点模板

```typescript
import { BlueprintNodeTemplate } from '@esengine/blueprint';

const MyNodeTemplate: BlueprintNodeTemplate = {
    type: 'MyCustomNode',
    title: 'My Custom Node',
    category: 'custom',
    description: 'A custom node example',
    keywords: ['custom', 'example'],
    inputs: [
        { name: 'exec', type: 'exec', direction: 'input', isExec: true },
        { name: 'value', type: 'number', direction: 'input', defaultValue: 0 }
    ],
    outputs: [
        { name: 'exec', type: 'exec', direction: 'output', isExec: true },
        { name: 'result', type: 'number', direction: 'output' }
    ]
};
```

## 实现节点执行器

```typescript
import { INodeExecutor, RegisterNode } from '@esengine/blueprint';

@RegisterNode(MyNodeTemplate)
class MyNodeExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        // 获取输入
        const value = context.getInput<number>(node.id, 'value');

        // 执行逻辑
        const result = value * 2;

        // 返回结果
        return {
            outputs: { result },
            nextExec: 'exec'  // 继续执行
        };
    }
}
```

## 注册方式

```typescript
// 方式 1: 使用装饰器
@RegisterNode(MyNodeTemplate)
class MyNodeExecutor implements INodeExecutor { ... }

// 方式 2: 手动注册
NodeRegistry.instance.register(MyNodeTemplate, new MyNodeExecutor());
```

## 节点注册表

```typescript
import { NodeRegistry } from '@esengine/blueprint';

// 获取单例
const registry = NodeRegistry.instance;

// 获取所有模板
const allTemplates = registry.getAllTemplates();

// 按类别获取
const mathNodes = registry.getTemplatesByCategory('math');

// 搜索节点
const results = registry.searchTemplates('add');

// 检查是否存在
if (registry.has('MyCustomNode')) { ... }
```

## 纯节点

纯节点没有副作用，其输出会被缓存：

```typescript
const PureNodeTemplate: BlueprintNodeTemplate = {
    type: 'GetDistance',
    title: 'Get Distance',
    category: 'math',
    isPure: true,  // 标记为纯节点
    inputs: [
        { name: 'a', type: 'vector2', direction: 'input' },
        { name: 'b', type: 'vector2', direction: 'input' }
    ],
    outputs: [
        { name: 'distance', type: 'number', direction: 'output' }
    ]
};
```

## 实际示例：输入处理节点

```typescript
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
