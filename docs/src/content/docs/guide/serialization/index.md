---
title: "序列化系统"
description: "ECS 序列化系统概述和全量序列化"
---

序列化系统提供了完整的场景、实体和组件数据持久化方案，支持全量序列化和增量序列化两种模式，适用于游戏存档、网络同步、场景编辑器、时间回溯等场景。

## 基本概念

序列化系统分为两个层次：

- **全量序列化**：序列化完整的场景状态，包括所有实体、组件和场景数据
- **增量序列化**：只序列化相对于基础快照的变更部分，大幅减少数据量

### 支持的数据格式

- **JSON格式**：人类可读，便于调试和编辑
- **Binary格式**：使用MessagePack，体积更小，性能更高

> **v2.2.2 重要变更**
>
> 从 v2.2.2 开始，二进制序列化格式返回 `Uint8Array` 而非 Node.js 的 `Buffer`，以确保浏览器兼容性：
> - `serialize({ format: 'binary' })` 返回 `string | Uint8Array`（原为 `string | Buffer`）
> - `deserialize(data)` 接收 `string | Uint8Array`（原为 `string | Buffer`）
> - `applyIncremental(data)` 接收 `IncrementalSnapshot | string | Uint8Array`（原为包含 `Buffer`）
>
> **迁移影响**：
> - **运行时兼容**：Node.js 的 `Buffer` 继承自 `Uint8Array`，现有代码可直接运行
> - **类型检查**：如果你的 TypeScript 代码中显式使用了 `Buffer` 类型，需要改为 `Uint8Array`
> - **浏览器支持**：`Uint8Array` 是标准 JavaScript 类型，所有现代浏览器都支持

## 全量序列化

### 基础用法

#### 1. 标记可序列化组件

使用 `@Serializable` 和 `@Serialize` 装饰器标记需要序列化的组件和字段：

```typescript
import { Component, ECSComponent, Serializable, Serialize } from '@esengine/ecs-framework';

@ECSComponent('Player')
@Serializable({ version: 1 })
class PlayerComponent extends Component {
  @Serialize()
  public name: string = '';

  @Serialize()
  public level: number = 1;

  @Serialize()
  public experience: number = 0;

  @Serialize()
  public position: { x: number; y: number } = { x: 0, y: 0 };

  // 不使用 @Serialize() 的字段不会被序列化
  private tempData: any = null;
}
```

#### 2. 序列化场景

```typescript
// JSON格式序列化
const jsonData = scene.serialize({
  format: 'json',
  pretty: true  // 美化输出
});

// 保存到本地存储
localStorage.setItem('gameSave', jsonData);

// Binary格式序列化（更小的体积）
const binaryData = scene.serialize({
  format: 'binary'
});

// 保存为文件（Node.js环境）
// 注意：binaryData 是 Uint8Array 类型，Node.js 的 fs 可以直接写入
fs.writeFileSync('save.bin', binaryData);
```

#### 3. 反序列化场景

```typescript
// 从JSON恢复
const saveData = localStorage.getItem('gameSave');
if (saveData) {
  scene.deserialize(saveData, {
    strategy: 'replace'  // 替换当前场景内容
  });
}

// 从Binary恢复
const binaryData = fs.readFileSync('save.bin');
scene.deserialize(binaryData, {
  strategy: 'merge'  // 合并到现有场景
});
```

### 序列化选项

#### SerializationOptions

```typescript
interface SceneSerializationOptions {
  // 指定要序列化的组件类型（可选）
  components?: ComponentType[];

  // 序列化格式：'json' 或 'binary'
  format?: 'json' | 'binary';

  // JSON美化输出
  pretty?: boolean;

  // 包含元数据
  includeMetadata?: boolean;
}
```

示例：

```typescript
// 只序列化特定组件类型
const saveData = scene.serialize({
  format: 'json',
  components: [PlayerComponent, InventoryComponent],
  pretty: true,
  includeMetadata: true
});
```

#### DeserializationOptions

```typescript
interface SceneDeserializationOptions {
  // 反序列化策略
  strategy?: 'merge' | 'replace';

  // 组件类型注册表（可选，默认使用全局注册表）
  componentRegistry?: Map<string, ComponentType>;
}
```

### 场景自定义数据

除了实体和组件，还可以序列化场景级别的配置数据：

```typescript
// 设置场景数据
scene.sceneData.set('weather', 'rainy');
scene.sceneData.set('difficulty', 'hard');
scene.sceneData.set('checkpoint', { x: 100, y: 200 });

// 序列化时会自动包含场景数据
const saveData = scene.serialize({ format: 'json' });

// 反序列化后场景数据会恢复
scene.deserialize(saveData);
console.log(scene.sceneData.get('weather')); // 'rainy'
```

## 更多主题

- [装饰器与继承](/guide/serialization/decorators) - 高级装饰器用法和组件继承
- [增量序列化](/guide/serialization/incremental) - 只序列化变更部分
- [版本迁移](/guide/serialization/migration) - 处理数据结构变更
- [使用场景](/guide/serialization/use-cases) - 存档、网络同步、撤销重做等实例
