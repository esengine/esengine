---
title: "自定义节点"
description: "创建自定义蓝图节点"
---

## 蓝图装饰器

使用装饰器可以快速将 ECS 组件暴露为蓝图节点。

### @BlueprintComponent

将组件类标记为蓝图可用：

```typescript
import { BlueprintComponent, BlueprintProperty } from '@esengine/blueprint';

@BlueprintComponent({
    title: '玩家控制器',
    category: 'gameplay',
    color: '#4a90d9',
    description: '控制玩家移动和交互'
})
class PlayerController extends Component {
    @BlueprintProperty({ displayName: '移动速度' })
    speed: number = 100;

    @BlueprintProperty({ displayName: '跳跃高度' })
    jumpHeight: number = 200;
}
```

### @BlueprintProperty

将组件属性暴露为节点输入：

```typescript
@BlueprintProperty({
    displayName: '生命值',
    description: '当前生命值',
    isInput: true,
    isOutput: true
})
health: number = 100;
```

### @BlueprintArray

用于数组类型属性，支持复杂对象数组的编辑：

```typescript
import { BlueprintArray, Schema } from '@esengine/blueprint';

interface Waypoint {
    position: { x: number; y: number };
    waitTime: number;
    speed: number;
}

@BlueprintComponent({
    title: '巡逻路径',
    category: 'ai'
})
class PatrolPath extends Component {
    @BlueprintArray({
        displayName: '路径点',
        description: '巡逻路径的各个点',
        itemSchema: Schema.object({
            position: Schema.vector2({ defaultValue: { x: 0, y: 0 } }),
            waitTime: Schema.float({ min: 0, max: 10, defaultValue: 1.0 }),
            speed: Schema.float({ min: 0, max: 500, defaultValue: 100 })
        }),
        reorderable: true,
        exposeElementPorts: true,
        portNameTemplate: '路径点 {index1}'
    })
    waypoints: Waypoint[] = [];
}
```

## Schema 类型系统

Schema 用于定义复杂数据结构的类型信息，支持编辑器自动生成对应的 UI。

### 基础类型

```typescript
import { Schema } from '@esengine/blueprint';

// 数字类型
Schema.float({ min: 0, max: 100, defaultValue: 50, step: 0.1 })
Schema.int({ min: 0, max: 10, defaultValue: 5 })

// 字符串
Schema.string({ defaultValue: 'Hello', multiline: false, placeholder: '输入文本...' })

// 布尔
Schema.boolean({ defaultValue: true })

// 向量
Schema.vector2({ defaultValue: { x: 0, y: 0 } })
Schema.vector3({ defaultValue: { x: 0, y: 0, z: 0 } })
```

### 复合类型

```typescript
// 对象
Schema.object({
    name: Schema.string({ defaultValue: '' }),
    health: Schema.float({ min: 0, max: 100 }),
    position: Schema.vector2()
})

// 数组
Schema.array({
    items: Schema.float(),
    minItems: 0,
    maxItems: 10
})

// 枚举
Schema.enum({
    options: ['idle', 'walk', 'run', 'jump'],
    defaultValue: 'idle'
})

// 引用
Schema.ref({ refType: 'entity' })
Schema.ref({ refType: 'asset', assetType: 'texture' })
```

### 完整示例

```typescript
@BlueprintComponent({ title: '敌人配置', category: 'ai' })
class EnemyConfig extends Component {
    @BlueprintArray({
        displayName: '攻击模式',
        itemSchema: Schema.object({
            name: Schema.string({ defaultValue: '普通攻击' }),
            damage: Schema.float({ min: 0, max: 100, defaultValue: 10 }),
            cooldown: Schema.float({ min: 0, max: 10, defaultValue: 1 }),
            range: Schema.float({ min: 0, max: 500, defaultValue: 50 }),
            animation: Schema.string({ defaultValue: 'attack_01' })
        }),
        reorderable: true
    })
    attackPatterns: AttackPattern[] = [];

    @BlueprintProperty({
        displayName: '巡逻区域',
        schema: Schema.object({
            center: Schema.vector2(),
            radius: Schema.float({ min: 0, defaultValue: 100 })
        })
    })
    patrolArea: { center: { x: number; y: number }; radius: number } = {
        center: { x: 0, y: 0 },
        radius: 100
    };
}
```

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
import { INodeExecutor, RegisterNode, BlueprintNode, ExecutionContext, ExecutionResult } from '@esengine/blueprint';

@RegisterNode(MyNodeTemplate)
class MyNodeExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = context.evaluateInput(node.id, 'value', 0) as number;
        const result = value * 2;
        return {
            outputs: { result },
            nextExec: 'exec'
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

const registry = NodeRegistry.instance;
const allTemplates = registry.getAllTemplates();
const mathNodes = registry.getTemplatesByCategory('math');
const results = registry.searchTemplates('add');
if (registry.has('MyCustomNode')) { ... }
```

## 纯节点

纯节点没有副作用，其输出会被缓存：

```typescript
const PureNodeTemplate: BlueprintNodeTemplate = {
    type: 'GetDistance',
    title: 'Get Distance',
    category: 'math',
    isPure: true,
    inputs: [
        { name: 'a', type: 'vector2', direction: 'input' },
        { name: 'b', type: 'vector2', direction: 'input' }
    ],
    outputs: [
        { name: 'distance', type: 'number', direction: 'output' }
    ]
};
```
