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

## 执行上下文

```typescript
interface ExecutionContext {
    blueprint: BlueprintAsset;  // 蓝图资产
    entity: Entity;             // 当前实体
    scene: IScene;              // 当前场景
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
blueprint.blueprintAsset = await loadBlueprintAsset('player.bp');
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
