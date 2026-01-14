---
title: "实际示例"
description: "ECS 集成和最佳实践"
---

## 完整游戏集成示例

```typescript
import { Scene, Core, Component, ECSComponent } from '@esengine/ecs-framework';
import {
    BlueprintSystem,
    BlueprintComponent,
    BlueprintExpose,
    BlueprintProperty,
    BlueprintMethod
} from '@esengine/blueprint';

// 1. 定义游戏组件
@ECSComponent('Player')
@BlueprintExpose({ displayName: '玩家', category: 'gameplay' })
export class PlayerComponent extends Component {
    @BlueprintProperty({ displayName: '移动速度', type: 'float' })
    moveSpeed: number = 5;

    @BlueprintProperty({ displayName: '分数', type: 'int' })
    score: number = 0;

    @BlueprintMethod({ displayName: '增加分数' })
    addScore(points: number): void {
        this.score += points;
    }
}

@ECSComponent('Health')
@BlueprintExpose({ displayName: '生命值', category: 'gameplay' })
export class HealthComponent extends Component {
    @BlueprintProperty({ displayName: '当前生命值' })
    current: number = 100;

    @BlueprintProperty({ displayName: '最大生命值' })
    max: number = 100;

    @BlueprintMethod({ displayName: '治疗' })
    heal(amount: number): void {
        this.current = Math.min(this.current + amount, this.max);
    }

    @BlueprintMethod({ displayName: '受伤' })
    takeDamage(amount: number): boolean {
        this.current -= amount;
        return this.current <= 0;
    }
}

// 2. 初始化游戏
async function initGame() {
    const scene = new Scene();

    // 添加蓝图系统
    scene.addSystem(new BlueprintSystem());

    Core.setScene(scene);

    // 3. 创建玩家
    const player = scene.createEntity('Player');
    player.addComponent(new PlayerComponent());
    player.addComponent(new HealthComponent());

    // 添加蓝图控制
    const blueprint = new BlueprintComponent();
    blueprint.blueprintAsset = await loadBlueprintAsset('player.blueprint.json');
    player.addComponent(blueprint);
}
```

## 自定义节点示例

```typescript
import type { Entity } from '@esengine/ecs-framework';
import {
    BlueprintNodeTemplate,
    BlueprintNode,
    ExecutionContext,
    ExecutionResult,
    INodeExecutor,
    RegisterNode
} from '@esengine/blueprint';

// 自定义伤害节点
const ApplyDamageTemplate: BlueprintNodeTemplate = {
    type: 'ApplyDamage',
    title: 'Apply Damage',
    category: 'combat',
    color: '#aa2222',
    description: '对带有 Health 组件的实体造成伤害',
    keywords: ['damage', 'hurt', 'attack'],
    menuPath: ['Combat', 'Apply Damage'],
    inputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'target', type: 'entity', displayName: '目标' },
        { name: 'amount', type: 'float', displayName: '伤害量', defaultValue: 10 }
    ],
    outputs: [
        { name: 'exec', type: 'exec', displayName: '' },
        { name: 'killed', type: 'bool', displayName: '已击杀' }
    ]
};

@RegisterNode(ApplyDamageTemplate)
class ApplyDamageExecutor implements INodeExecutor {
    execute(node: BlueprintNode, context: ExecutionContext): ExecutionResult {
        const target = context.evaluateInput(node.id, 'target', context.entity) as Entity;
        const amount = context.evaluateInput(node.id, 'amount', 10) as number;

        if (!target || target.isDestroyed) {
            return { outputs: { killed: false }, nextExec: 'exec' };
        }

        const health = target.components.find(c =>
            (c.constructor as any).__componentName__ === 'Health'
        ) as any;

        if (health) {
            health.current -= amount;
            const killed = health.current <= 0;
            return { outputs: { killed }, nextExec: 'exec' };
        }

        return { outputs: { killed: false }, nextExec: 'exec' };
    }
}
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
const blueprint = entity.getComponent(BlueprintComponent);
blueprint.debug = true;

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
