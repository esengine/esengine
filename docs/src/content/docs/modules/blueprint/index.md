---
title: "蓝图可视化脚本 (Blueprint)"
---

`@esengine/blueprint` 提供了一个功能完整的可视化脚本系统，支持节点式编程、事件驱动和蓝图组合。

## 安装

```bash
npm install @esengine/blueprint
```

## 快速开始

```typescript
import {
    createBlueprintSystem,
    createBlueprintComponentData,
    NodeRegistry,
    RegisterNode
} from '@esengine/blueprint';

// 创建蓝图系统
const blueprintSystem = createBlueprintSystem(scene);

// 加载蓝图资产
const blueprint = await loadBlueprintAsset('player.bp');

// 创建蓝图组件数据
const componentData = createBlueprintComponentData();
componentData.blueprintAsset = blueprint;

// 在游戏循环中更新
function gameLoop(dt: number) {
    blueprintSystem.process(entities, dt);
}
```

## 核心概念

### 蓝图资产结构

蓝图保存为 `.bp` 文件，包含以下结构：

```typescript
interface BlueprintAsset {
    version: number;           // 格式版本
    type: 'blueprint';         // 资产类型
    metadata: BlueprintMetadata; // 元数据
    variables: BlueprintVariable[]; // 变量定义
    nodes: BlueprintNode[];    // 节点实例
    connections: BlueprintConnection[]; // 连接
}
```

### 节点类型

节点按功能分为以下类别：

| 类别 | 说明 | 颜色 |
|------|------|------|
| `event` | 事件节点（入口点） | 红色 |
| `flow` | 流程控制 | 灰色 |
| `entity` | 实体操作 | 蓝色 |
| `component` | 组件访问 | 青色 |
| `math` | 数学运算 | 绿色 |
| `logic` | 逻辑运算 | 红色 |
| `variable` | 变量访问 | 紫色 |
| `time` | 时间工具 | 青色 |
| `debug` | 调试工具 | 灰色 |

### 引脚类型

节点通过引脚连接：

```typescript
interface BlueprintPinDefinition {
    name: string;        // 引脚名称
    type: PinDataType;   // 数据类型
    direction: 'input' | 'output';
    isExec?: boolean;    // 是否是执行引脚
    defaultValue?: unknown;
}

// 支持的数据类型
type PinDataType =
    | 'exec'      // 执行流
    | 'boolean'   // 布尔值
    | 'number'    // 数字
    | 'string'    // 字符串
    | 'vector2'   // 2D 向量
    | 'vector3'   // 3D 向量
    | 'entity'    // 实体引用
    | 'component' // 组件引用
    | 'any';      // 任意类型
```

### 变量作用域

```typescript
type VariableScope =
    | 'local'     // 每次执行独立
    | 'instance'  // 每个实体独立
    | 'global';   // 全局共享
```

## 虚拟机 API

### BlueprintVM

蓝图虚拟机负责执行蓝图图：

```typescript
import { BlueprintVM } from '@esengine/blueprint';

// 创建 VM
const vm = new BlueprintVM(blueprintAsset, entity, scene);

// 启动（触发 BeginPlay）
vm.start();

// 每帧更新（触发 Tick）
vm.tick(deltaTime);

// 停止（触发 EndPlay）
vm.stop();

// 暂停/恢复
vm.pause();
vm.resume();

// 触发事件
vm.triggerEvent('EventCollision', { other: otherEntity });
vm.triggerCustomEvent('OnDamage', { amount: 50 });

// 调试模式
vm.debug = true;
```

### 执行上下文

```typescript
interface ExecutionContext {
    blueprint: BlueprintAsset;  // 蓝图资产
    entity: Entity;             // 当前实体
    scene: IScene;              // 当前场景
    deltaTime: number;          // 帧间隔时间
    time: number;               // 总运行时间

    // 获取输入值
    getInput<T>(nodeId: string, pinName: string): T;

    // 设置输出值
    setOutput(nodeId: string, pinName: string, value: unknown): void;

    // 变量访问
    getVariable<T>(name: string): T;
    setVariable(name: string, value: unknown): void;
}
```

### 执行结果

```typescript
interface ExecutionResult {
    outputs?: Record<string, unknown>; // 输出值
    nextExec?: string | null;          // 下一个执行引脚
    delay?: number;                    // 延迟执行（毫秒）
    yield?: boolean;                   // 暂停到下一帧
    error?: string;                    // 错误信息
}
```

## 自定义节点

### 定义节点模板

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

### 实现节点执行器

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

### 使用装饰器注册

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

## 内置节点

### 事件节点

| 节点 | 说明 |
|------|------|
| `EventBeginPlay` | 蓝图启动时触发 |
| `EventTick` | 每帧触发 |
| `EventEndPlay` | 蓝图停止时触发 |
| `EventCollision` | 碰撞时触发 |
| `EventInput` | 输入事件触发 |
| `EventTimer` | 定时器触发 |
| `EventMessage` | 自定义消息触发 |

### 时间节点

| 节点 | 说明 |
|------|------|
| `Delay` | 延迟执行 |
| `GetDeltaTime` | 获取帧间隔 |
| `GetTime` | 获取运行时间 |

### 数学节点

| 节点 | 说明 |
|------|------|
| `Add` | 加法 |
| `Subtract` | 减法 |
| `Multiply` | 乘法 |
| `Divide` | 除法 |
| `Abs` | 绝对值 |
| `Clamp` | 限制范围 |
| `Lerp` | 线性插值 |
| `Min` / `Max` | 最小/最大值 |

### 调试节点

| 节点 | 说明 |
|------|------|
| `Print` | 打印到控制台 |

## 蓝图组合

### 蓝图片段

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

### 组合蓝图

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

## 与 ECS 集成

### 使用蓝图系统

```typescript
import { createBlueprintSystem } from '@esengine/blueprint';

class GameScene {
    private blueprintSystem: BlueprintSystem;

    initialize() {
        this.blueprintSystem = createBlueprintSystem(this.scene);
    }

    update(dt: number) {
        // 处理所有带蓝图组件的实体
        this.blueprintSystem.process(this.entities, dt);
    }
}
```

### 触发蓝图事件

```typescript
import { triggerBlueprintEvent, triggerCustomBlueprintEvent } from '@esengine/blueprint';

// 触发内置事件
triggerBlueprintEvent(entity, 'Collision', { other: otherEntity });

// 触发自定义事件
triggerCustomBlueprintEvent(entity, 'OnPickup', { item: itemEntity });
```

## 实际示例

### 玩家控制蓝图

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

### 状态切换逻辑

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

## 序列化

### 保存蓝图

```typescript
import { validateBlueprintAsset } from '@esengine/blueprint';

function saveBlueprint(blueprint: BlueprintAsset, path: string): void {
    if (!validateBlueprintAsset(blueprint)) {
        throw new Error('Invalid blueprint structure');
    }
    const json = JSON.stringify(blueprint, null, 2);
    fs.writeFileSync(path, json);
}
```

### 加载蓝图

```typescript
async function loadBlueprint(path: string): Promise<BlueprintAsset> {
    const json = await fs.readFile(path, 'utf-8');
    const asset = JSON.parse(json);

    if (!validateBlueprintAsset(asset)) {
        throw new Error('Invalid blueprint file');
    }

    return asset;
}
```

## 最佳实践

1. **使用片段复用逻辑**
   - 将通用逻辑封装为片段
   - 通过组合器构建复杂蓝图

2. **合理使用变量作用域**
   - `local`: 临时计算结果
   - `instance`: 实体状态（如生命值）
   - `global`: 游戏全局状态

3. **避免无限循环**
   - VM 有每帧最大执行步数限制（默认 1000）
   - 使用 Delay 节点打断长执行链

4. **调试技巧**
   - 启用 `vm.debug = true` 查看执行日志
   - 使用 Print 节点输出中间值

5. **性能优化**
   - 纯节点（`isPure: true`）的输出会被缓存
   - 避免在 Tick 中执行重计算
