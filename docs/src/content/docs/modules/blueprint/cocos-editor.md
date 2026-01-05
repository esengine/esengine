---
title: "Cocos Creator 蓝图编辑器"
description: "在 Cocos Creator 中使用蓝图可视化脚本系统"
---

本文档介绍如何在 Cocos Creator 项目中安装和使用蓝图可视化脚本编辑器扩展。

## 安装扩展

### 1. 复制扩展到项目

将 `cocos-node-editor` 扩展复制到你的 Cocos Creator 项目的 `extensions` 目录：

```
your-project/
├── assets/
├── extensions/
│   └── cocos-node-editor/    # 蓝图编辑器扩展
└── ...
```

### 2. 安装依赖

在扩展目录中安装依赖：

```bash
cd extensions/cocos-node-editor
npm install
```

### 3. 启用扩展

1. 打开 Cocos Creator
2. 进入 **扩展 → 扩展管理器**
3. 找到 `cocos-node-editor` 并启用

## 打开蓝图编辑器

通过菜单 **面板 → Node Editor** 打开蓝图编辑器面板。

## 编辑器界面

### 工具栏

| 按钮 | 快捷键 | 功能 |
|------|--------|------|
| 新建 | - | 创建空白蓝图 |
| 加载 | - | 从文件加载蓝图 |
| 保存 | `Ctrl+S` | 保存蓝图到文件 |
| 撤销 | `Ctrl+Z` | 撤销上一步操作 |
| 重做 | `Ctrl+Shift+Z` | 重做操作 |
| 剪切 | `Ctrl+X` | 剪切选中节点 |
| 复制 | `Ctrl+C` | 复制选中节点 |
| 粘贴 | `Ctrl+V` | 粘贴节点 |
| 删除 | `Delete` | 删除选中项 |
| 重新扫描 | - | 重新扫描项目中的蓝图节点 |

### 画布操作

- **右键单击画布**：打开节点添加菜单
- **拖拽节点**：移动节点位置
- **点击节点**：选中节点
- **Ctrl+点击**：多选节点
- **拖拽引脚到引脚**：创建连接
- **滚轮**：缩放画布
- **中键拖拽**：平移画布

### 节点菜单

右键单击画布后会显示节点菜单：

- 顶部搜索框可以快速搜索节点
- 节点按类别分组显示
- 按 `Enter` 快速添加第一个搜索结果
- 按 `Esc` 关闭菜单

## 蓝图文件格式

蓝图保存为 `.blueprint.json` 文件，格式与运行时完全兼容：

```json
{
  "version": 1,
  "type": "blueprint",
  "metadata": {
    "name": "My Blueprint",
    "createdAt": 1704307200000,
    "modifiedAt": 1704307200000
  },
  "variables": [],
  "nodes": [
    {
      "id": "node-1",
      "type": "PrintString",
      "position": { "x": 100, "y": 200 },
      "data": {}
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "fromNodeId": "node-1",
      "fromPin": "exec",
      "toNodeId": "node-2",
      "toPin": "exec"
    }
  ]
}
```

## 在游戏中运行蓝图

使用 ECS 系统方式管理和执行蓝图。

### 1. 定义蓝图组件

```typescript
import { Component, ECSComponent, Property, Serialize } from '@esengine/ecs-framework';
import type { BlueprintAsset } from '@esengine/blueprint';

@ECSComponent('Blueprint')
export class BlueprintComponent extends Component {
    @Serialize()
    @Property({ type: 'asset', label: 'Blueprint Asset' })
    blueprintPath: string = '';

    @Serialize()
    @Property({ type: 'boolean', label: 'Auto Start' })
    autoStart: boolean = true;

    // 运行时数据（不序列化）
    blueprintAsset: BlueprintAsset | null = null;
    vm: BlueprintVM | null = null;
    isStarted: boolean = false;
}
```

### 2. 创建蓝图执行系统

```typescript
import { EntitySystem, Matcher, Entity } from '@esengine/ecs-framework';
import {
    BlueprintVM,
    validateBlueprintAsset
} from '@esengine/blueprint';
import { BlueprintComponent } from './BlueprintComponent';

export class BlueprintExecutionSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(BlueprintComponent));
    }

    protected override process(entities: readonly Entity[]): void {
        const dt = Time.deltaTime;

        for (const entity of entities) {
            const bp = entity.getComponent(BlueprintComponent)!;

            // 跳过没有蓝图资产的实体
            if (!bp.blueprintAsset) continue;

            // 初始化 VM
            if (!bp.vm) {
                bp.vm = new BlueprintVM(bp.blueprintAsset, entity, this.scene!);
            }

            // 自动启动
            if (bp.autoStart && !bp.isStarted) {
                bp.vm.start();
                bp.isStarted = true;
            }

            // 更新蓝图
            if (bp.isStarted) {
                bp.vm.tick(dt);
            }
        }
    }

    protected override onRemoved(entity: Entity): void {
        const bp = entity.getComponent(BlueprintComponent);
        if (bp?.vm && bp.isStarted) {
            bp.vm.stop();
            bp.vm = null;
            bp.isStarted = false;
        }
    }
}
```

### 3. 加载蓝图并添加到实体

```typescript
import { resources, JsonAsset } from 'cc';
import { validateBlueprintAsset } from '@esengine/blueprint';

// 加载蓝图资产
async function loadBlueprint(path: string): Promise<BlueprintAsset | null> {
    return new Promise((resolve) => {
        resources.load(path, JsonAsset, (err, asset) => {
            if (err || !asset) {
                console.error('Failed to load blueprint:', err);
                resolve(null);
                return;
            }

            const data = asset.json;
            if (validateBlueprintAsset(data)) {
                resolve(data as BlueprintAsset);
            } else {
                console.error('Invalid blueprint format');
                resolve(null);
            }
        });
    });
}

// 创建带蓝图的实体
async function createBlueprintEntity(scene: IScene, blueprintPath: string): Promise<Entity> {
    const entity = scene.createEntity('BlueprintEntity');

    const bpComponent = entity.addComponent(BlueprintComponent);
    bpComponent.blueprintPath = blueprintPath;
    bpComponent.blueprintAsset = await loadBlueprint(blueprintPath);

    return entity;
}
```

### 4. 注册系统到场景

```typescript
// 在场景初始化时
scene.addSystem(new BlueprintExecutionSystem());
```

## 创建自定义节点

### 使用装饰器标记组件

推荐使用装饰器让组件自动生成蓝图节点：

```typescript
import { Component, ECSComponent } from '@esengine/ecs-framework';
import { BlueprintExpose, BlueprintProperty, BlueprintMethod } from '@esengine/blueprint';

@ECSComponent('Health')
@BlueprintExpose({ displayName: '生命值组件' })
export class HealthComponent extends Component {
    @BlueprintProperty({ displayName: '当前生命值', category: 'number' })
    current: number = 100;

    @BlueprintProperty({ displayName: '最大生命值', category: 'number' })
    max: number = 100;

    @BlueprintMethod({ displayName: '治疗', isExec: true })
    heal(amount: number): void {
        this.current = Math.min(this.current + amount, this.max);
    }

    @BlueprintMethod({ displayName: '受伤', isExec: true })
    takeDamage(amount: number): void {
        this.current = Math.max(this.current - amount, 0);
    }

    @BlueprintMethod({ displayName: '是否死亡' })
    isDead(): boolean {
        return this.current <= 0;
    }
}
```

### 注册组件节点

```typescript
import { registerAllComponentNodes } from '@esengine/blueprint';

// 在应用启动时注册所有标记的组件
registerAllComponentNodes();
```

### 手动定义节点（高级）

如需完全自定义节点逻辑：

```typescript
import {
    BlueprintNodeTemplate,
    INodeExecutor,
    RegisterNode,
    ExecutionContext,
    ExecutionResult
} from '@esengine/blueprint';

const MyNodeTemplate: BlueprintNodeTemplate = {
    type: 'MyCustomNode',
    title: '我的自定义节点',
    category: 'custom',
    description: '自定义节点示例',
    inputs: [
        { name: 'exec', type: 'exec', direction: 'input', isExec: true },
        { name: 'value', type: 'number', direction: 'input', defaultValue: 0 }
    ],
    outputs: [
        { name: 'exec', type: 'exec', direction: 'output', isExec: true },
        { name: 'result', type: 'number', direction: 'output' }
    ]
};

@RegisterNode(MyNodeTemplate)
class MyNodeExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const value = context.getInput<number>(node.id, 'value');
        return {
            outputs: { result: value * 2 },
            nextExec: 'exec'
        };
    }
}
```

## 节点类别

| 类别 | 说明 | 颜色 |
|------|------|------|
| `event` | 事件节点 | 红色 |
| `flow` | 流程控制 | 灰色 |
| `entity` | 实体操作 | 蓝色 |
| `component` | 组件访问 | 青色 |
| `math` | 数学运算 | 绿色 |
| `logic` | 逻辑运算 | 红色 |
| `variable` | 变量访问 | 紫色 |
| `time` | 时间工具 | 青色 |
| `debug` | 调试工具 | 灰色 |
| `custom` | 自定义节点 | 蓝灰色 |

## 最佳实践

1. **文件组织**
   - 将蓝图文件放在 `assets/blueprints/` 目录下
   - 使用有意义的文件名，如 `player-controller.blueprint.json`

2. **组件设计**
   - 使用 `@BlueprintExpose` 标记需要暴露给蓝图的组件
   - 为属性和方法提供清晰的 `displayName`
   - 将执行方法标记为 `isExec: true`

3. **性能考虑**
   - 避免在 Tick 事件中执行重计算
   - 使用变量缓存中间结果
   - 纯函数节点会自动缓存输出

4. **调试技巧**
   - 使用 Print 节点输出中间值
   - 启用 `vm.debug = true` 查看执行日志

## 常见问题

### Q: 节点菜单是空的？

A: 点击 **重新扫描** 按钮扫描项目中的蓝图节点类。确保已调用 `registerAllComponentNodes()`。

### Q: 蓝图不执行？

A: 检查：
1. 实体是否添加了 `BlueprintComponent`
2. `BlueprintExecutionSystem` 是否注册到场景
3. `blueprintAsset` 是否正确加载
4. `autoStart` 是否为 `true`

### Q: 如何触发自定义事件？

A: 通过 VM 触发：
```typescript
const bp = entity.getComponent(BlueprintComponent);
bp.vm?.triggerCustomEvent('OnPickup', { item: itemEntity });
```

## 相关文档

- [蓝图运行时 API](/modules/blueprint/) - BlueprintVM 和核心 API
- [自定义节点](/modules/blueprint/custom-nodes) - 详细的节点创建指南
- [内置节点](/modules/blueprint/nodes) - 内置节点参考
