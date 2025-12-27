---
title: "装饰器与继承"
description: "序列化装饰器高级用法和组件继承"
---

## 高级装饰器

### 字段序列化选项

```typescript
@ECSComponent('Advanced')
@Serializable({ version: 1 })
class AdvancedComponent extends Component {
  // 使用别名
  @Serialize({ alias: 'playerName' })
  public name: string = '';

  // 自定义序列化器
  @Serialize({
    serializer: (value: Date) => value.toISOString(),
    deserializer: (value: string) => new Date(value)
  })
  public createdAt: Date = new Date();

  // 忽略序列化
  @IgnoreSerialization()
  public cachedData: any = null;
}
```

### 集合类型序列化

```typescript
@ECSComponent('Collections')
@Serializable({ version: 1 })
class CollectionsComponent extends Component {
  // Map序列化
  @SerializeAsMap()
  public inventory: Map<string, number> = new Map();

  // Set序列化
  @SerializeAsSet()
  public acquiredSkills: Set<string> = new Set();

  constructor() {
    super();
    this.inventory.set('gold', 100);
    this.inventory.set('silver', 50);
    this.acquiredSkills.add('attack');
    this.acquiredSkills.add('defense');
  }
}
```

## 组件继承与序列化

框架完整支持组件类的继承，子类会自动继承父类的序列化字段，同时可以添加自己的字段。

### 基础继承

```typescript
// 基类组件
@ECSComponent('Collider2DBase')
@Serializable({ version: 1, typeId: 'Collider2DBase' })
abstract class Collider2DBase extends Component {
  @Serialize()
  public friction: number = 0.5;

  @Serialize()
  public restitution: number = 0.0;

  @Serialize()
  public isTrigger: boolean = false;
}

// 子类组件 - 自动继承父类的序列化字段
@ECSComponent('BoxCollider2D')
@Serializable({ version: 1, typeId: 'BoxCollider2D' })
class BoxCollider2DComponent extends Collider2DBase {
  @Serialize()
  public width: number = 1.0;

  @Serialize()
  public height: number = 1.0;
}

// 另一个子类组件
@ECSComponent('CircleCollider2D')
@Serializable({ version: 1, typeId: 'CircleCollider2D' })
class CircleCollider2DComponent extends Collider2DBase {
  @Serialize()
  public radius: number = 0.5;
}
```

### 继承规则

1. **字段继承**：子类自动继承父类所有被 `@Serialize()` 标记的字段
2. **独立元数据**：每个子类维护独立的序列化元数据，修改子类不会影响父类或其他子类
3. **typeId 区分**：使用 `typeId` 选项为每个类指定唯一标识，确保反序列化时能正确识别组件类型

### 使用 typeId 的重要性

当使用组件继承时，**强烈建议**为每个类设置唯一的 `typeId`：

```typescript
// ✅ 推荐：明确指定 typeId
@Serializable({ version: 1, typeId: 'BoxCollider2D' })
class BoxCollider2DComponent extends Collider2DBase { }

@Serializable({ version: 1, typeId: 'CircleCollider2D' })
class CircleCollider2DComponent extends Collider2DBase { }

// ⚠️ 不推荐：依赖类名作为 typeId
// 在代码压缩后类名可能变化，导致反序列化失败
@Serializable({ version: 1 })
class BoxCollider2DComponent extends Collider2DBase { }
```

### 子类覆盖父类字段

子类可以重新声明父类的字段以修改其序列化选项：

```typescript
@ECSComponent('SpecialCollider')
@Serializable({ version: 1, typeId: 'SpecialCollider' })
class SpecialColliderComponent extends Collider2DBase {
  // 覆盖父类字段，使用不同的别名
  @Serialize({ alias: 'fric' })
  public override friction: number = 0.8;

  @Serialize()
  public specialProperty: string = '';
}
```

### 忽略继承的字段

使用 `@IgnoreSerialization()` 可以在子类中忽略从父类继承的字段：

```typescript
@ECSComponent('TriggerOnly')
@Serializable({ version: 1, typeId: 'TriggerOnly' })
class TriggerOnlyCollider extends Collider2DBase {
  // 忽略父类的 friction 和 restitution 字段
  // 因为 Trigger 不需要物理材质属性
  @IgnoreSerialization()
  public override friction: number = 0;

  @IgnoreSerialization()
  public override restitution: number = 0;
}
```

## 装饰器参考

| 装饰器 | 说明 |
|--------|------|
| `@Serializable({ version, typeId })` | 标记组件为可序列化 |
| `@Serialize()` | 标记字段为可序列化 |
| `@Serialize({ alias })` | 使用别名序列化字段 |
| `@Serialize({ serializer, deserializer })` | 自定义序列化逻辑 |
| `@SerializeAsMap()` | 序列化 Map 类型 |
| `@SerializeAsSet()` | 序列化 Set 类型 |
| `@IgnoreSerialization()` | 忽略字段序列化 |
