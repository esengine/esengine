---
title: "Matcher API"
description: "Matcher 完整 API 参考"
---

## 静态创建方法

| 方法 | 说明 | 示例 |
|------|------|------|
| `Matcher.all(...types)` | 必须包含所有指定组件 | `Matcher.all(Position, Velocity)` |
| `Matcher.any(...types)` | 至少包含一个指定组件 | `Matcher.any(Health, Shield)` |
| `Matcher.none(...types)` | 不能包含任何指定组件 | `Matcher.none(Dead)` |
| `Matcher.byTag(tag)` | 按标签查询 | `Matcher.byTag(1)` |
| `Matcher.byName(name)` | 按名称查询 | `Matcher.byName("Player")` |
| `Matcher.byComponent(type)` | 按单个组件查询 | `Matcher.byComponent(Health)` |
| `Matcher.empty()` | 创建空匹配器（匹配所有实体） | `Matcher.empty()` |
| `Matcher.nothing()` | 不匹配任何实体 | `Matcher.nothing()` |
| `Matcher.complex()` | 创建复杂查询构建器 | `Matcher.complex()` |

## 链式方法

| 方法 | 说明 | 示例 |
|------|------|------|
| `.all(...types)` | 添加必须包含的组件 | `.all(Position)` |
| `.any(...types)` | 添加可选组件（至少一个） | `.any(Weapon, Magic)` |
| `.none(...types)` | 添加排除的组件 | `.none(Dead)` |
| `.exclude(...types)` | `.none()` 的别名 | `.exclude(Disabled)` |
| `.one(...types)` | `.any()` 的别名 | `.one(Player, Enemy)` |
| `.withTag(tag)` | 添加标签条件 | `.withTag(1)` |
| `.withName(name)` | 添加名称条件 | `.withName("Boss")` |
| `.withComponent(type)` | 添加单组件条件 | `.withComponent(Health)` |

## 实用方法

| 方法 | 说明 |
|------|------|
| `.getCondition()` | 获取查询条件（只读） |
| `.isEmpty()` | 检查是否为空条件 |
| `.isNothing()` | 检查是否为 nothing 匹配器 |
| `.clone()` | 克隆匹配器 |
| `.reset()` | 重置所有条件 |
| `.toString()` | 获取字符串表示 |

## 常用组合示例

```typescript
// 基础移动系统
Matcher.all(Position, Velocity)

// 可攻击的活着的实体
Matcher.all(Position, Health)
    .any(Weapon, Magic)
    .none(Dead, Disabled)

// 所有带标签的敌人
Matcher.byTag(Tags.ENEMY)
    .all(AIComponent)

// 只需要生命周期的系统
Matcher.nothing()
```

## 按标签查询

```typescript
class PlayerSystem extends EntitySystem {
    constructor() {
        // 查询特定标签的实体
        super(Matcher.empty().withTag(Tags.PLAYER));
    }

    protected process(entities: readonly Entity[]): void {
        // 只处理玩家实体
    }
}
```

## 按名称查询

```typescript
class BossSystem extends EntitySystem {
    constructor() {
        // 查询特定名称的实体
        super(Matcher.empty().withName('Boss'));
    }

    protected process(entities: readonly Entity[]): void {
        // 只处理名为 'Boss' 的实体
    }
}
```

## 注意事项

### Matcher 是不可变的

```typescript
const matcher = Matcher.empty().all(PositionComponent);

// 链式调用返回新的 Matcher 实例
const matcher2 = matcher.any(VelocityComponent);

// matcher 本身不变
console.log(matcher === matcher2); // false
```

### 查询结果是只读的

```typescript
const result = querySystem.queryAll(PositionComponent);

// 不要修改返回的数组
result.entities.push(someEntity);  // 错误!

// 如果需要修改，先复制
const mutableArray = [...result.entities];
mutableArray.push(someEntity);  // 正确
```
