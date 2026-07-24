---
title: "虚拟机 API"
description: "BlueprintVM 执行和上下文"
---

## BlueprintVM

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

## 在普通组件上运行（无需 ECS）

如果承载蓝图的类不是 ECS 组件（例如 Cocos 的 `cc.Component`），用 `BlueprintRunner` 把蓝图直接跑在该实例上，无需 Scene / 实体 / `BlueprintSystem`：

```typescript
import { BlueprintRunner, registerAllComponentNodes } from '@esengine/blueprint';

@ccclass('Playground')
@BlueprintExpose({ displayName: 'Playground' })
export class Playground extends Component {
    @property(JsonAsset) bluePrintJson: JsonAsset = null!;

    @BlueprintProperty({ displayName: '当前生命值', type: 'float' })
    current = 100;

    @BlueprintMethod({ displayName: '治疗', params: [{ name: 'amount', type: 'float' }] })
    heal(amount: number) { this.current += amount; }

    private runner: BlueprintRunner | null = null;

    onLoad() {
        registerAllComponentNodes();                 // 生成组件节点（进程内一次即可）
        this.runner = new BlueprintRunner(this.bluePrintJson!.json as any, { self: this });
        this.runner.start();
    }
    update(dt: number) { this.runner?.tick(dt); }
    onDestroy() { this.runner?.stop(); }
}
```

- **Target 默认 = Self**：组件方法/属性节点的 `component` 引脚未连线时，默认作用于 `self`（这里就是这个 `Playground` 实例），所以 `Heal` 节点什么都不用连就会调用 `this.heal(amount)`，参数走 `amount` 引脚传入。
- `entity` / `scene` 在 `BlueprintRunner` 下为 `null`，纯 ECS 节点（Create Entity、Add Component 等）不可用；方法调用、属性读写、事件、流程、数学节点均正常工作。
- 需要 ECS 集成时仍用 `BlueprintComponent` + `BlueprintSystem`。

## 执行上下文

```typescript
interface ExecutionContext {
    blueprint: BlueprintAsset;  // 蓝图资产
    entity: Entity | null;      // 当前实体（BlueprintRunner 下为 null）
    scene: IScene | null;       // 当前场景（BlueprintRunner 下为 null）
    self: object | null;        // 蓝图所绑定的宿主实例（方法/属性节点未连线时默认作用于它）
    deltaTime: number;          // 帧间隔时间
    time: number;               // 总运行时间

    // 获取输入值
    evaluateInput(nodeId: string, pinName: string, defaultValue: unknown): unknown;

    // 设置输出值
    setOutput(nodeId: string, pinName: string, value: unknown): void;

    // 变量访问
    getVariable<T>(name: string): T;
    setVariable(name: string, value: unknown): void;
}
```

## 执行结果

```typescript
interface ExecutionResult {
    outputs?: Record<string, unknown>; // 输出值
    nextExec?: string | null;          // 下一个执行引脚
    delay?: number;                    // 延迟执行（毫秒）
    yield?: boolean;                   // 暂停到下一帧
    error?: string;                    // 错误信息
}
```

## 与 ECS 集成

### 使用内置蓝图系统

```typescript
import { Scene, Core } from '@esengine/ecs-framework';
import { BlueprintSystem, BlueprintComponent } from '@esengine/blueprint';

// 添加蓝图系统到场景
const scene = new Scene();
scene.addSystem(new BlueprintSystem());
Core.setScene(scene);

// 为实体添加蓝图
const entity = scene.createEntity('Player');
const blueprint = new BlueprintComponent();
blueprint.blueprintAsset = await loadBlueprintAsset('player.blueprint.json');
entity.addComponent(blueprint);
```

### 触发蓝图事件

```typescript
// 从实体获取蓝图组件并触发事件
const blueprint = entity.getComponent(BlueprintComponent);
if (blueprint?.vm) {
    blueprint.vm.triggerEvent('EventCollision', { other: otherEntity });
    blueprint.vm.triggerCustomEvent('OnPickup', { item: itemEntity });
}
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
