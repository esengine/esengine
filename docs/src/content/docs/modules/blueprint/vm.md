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
    getInput<T>(nodeId: string, pinName: string): T;

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
