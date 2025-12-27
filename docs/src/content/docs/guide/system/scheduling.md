---
title: "系统调度"
description: "声明式系统调度和执行阶段"
---

> **v2.4.0+**

除了使用 `updateOrder` 手动控制执行顺序外，框架还提供了声明式的系统调度机制，让你可以通过依赖关系来定义系统的执行顺序。

## 调度装饰器

```typescript
import { EntitySystem, ECSSystem, Stage, Before, After, InSet } from '@esengine/ecs-framework';

// 使用装饰器声明系统调度
@ECSSystem('Movement')
@Stage('update')           // 在 update 阶段执行
@After('InputSystem')      // 在 InputSystem 之后执行
@Before('RenderSystem')    // 在 RenderSystem 之前执行
class MovementSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(Position, Velocity));
    }

    protected process(entities: readonly Entity[]): void {
        // 移动逻辑
    }
}

// 使用系统集合进行分组
@ECSSystem('Physics')
@Stage('update')
@InSet('CoreSystems')      // 属于 CoreSystems 集合
class PhysicsSystem extends EntitySystem {
    // ...
}

@ECSSystem('Collision')
@Stage('update')
@After('set:CoreSystems')  // 在 CoreSystems 集合的所有系统之后执行
class CollisionSystem extends EntitySystem {
    // ...
}
```

## 系统执行阶段

框架定义了以下系统执行阶段，按顺序执行：

| 阶段 | 说明 | 典型用途 |
|------|------|----------|
| `startup` | 启动阶段 | 一次性初始化 |
| `preUpdate` | 更新前阶段 | 输入处理、状态准备 |
| `update` | 主更新阶段（默认） | 核心游戏逻辑 |
| `postUpdate` | 更新后阶段 | 物理、碰撞检测 |
| `cleanup` | 清理阶段 | 资源清理、状态重置 |

### 阶段使用示例

```typescript
@ECSSystem('Input')
@Stage('preUpdate')  // 在更新前阶段处理输入
class InputSystem extends EntitySystem {
    protected process(entities: readonly Entity[]): void {
        // 读取输入，更新输入组件
    }
}

@ECSSystem('Movement')
@Stage('update')  // 在主更新阶段处理移动
class MovementSystem extends EntitySystem {
    protected process(entities: readonly Entity[]): void {
        // 根据输入移动实体
    }
}

@ECSSystem('Physics')
@Stage('postUpdate')  // 在更新后阶段处理物理
class PhysicsSystem extends EntitySystem {
    protected process(entities: readonly Entity[]): void {
        // 物理模拟和碰撞检测
    }
}

@ECSSystem('Cleanup')
@Stage('cleanup')  // 在清理阶段重置状态
class CleanupSystem extends EntitySystem {
    protected process(entities: readonly Entity[]): void {
        // 清理临时数据
    }
}
```

## Fluent API 配置

如果不想使用装饰器，也可以使用 Fluent API 在运行时配置调度：

```typescript
@ECSSystem('Movement')
class MovementSystem extends EntitySystem {
    constructor() {
        super(Matcher.all(Position, Velocity));

        // 使用 Fluent API 配置调度
        this.stage('update')
            .after('InputSystem')
            .before('RenderSystem')
            .inSet('CoreSystems');
    }
}
```

## 系统集合

系统集合允许你将相关系统分组，然后基于整个集合定义依赖：

```typescript
// 定义核心系统集合
@ECSSystem('Movement')
@InSet('CoreSystems')
class MovementSystem extends EntitySystem { }

@ECSSystem('Physics')
@InSet('CoreSystems')
class PhysicsSystem extends EntitySystem { }

@ECSSystem('AI')
@InSet('CoreSystems')
class AISystem extends EntitySystem { }

// 在核心系统集合之后执行
@ECSSystem('Render')
@After('set:CoreSystems')
class RenderSystem extends EntitySystem { }

// 在核心系统集合之前执行
@ECSSystem('Input')
@Before('set:CoreSystems')
class InputSystem extends EntitySystem { }
```

## 循环依赖检测

框架会自动检测循环依赖并抛出明确的错误：

```typescript
// 这会导致循环依赖错误
@ECSSystem('SystemA')
@Before('SystemB')
class SystemA extends EntitySystem { }

@ECSSystem('SystemB')
@Before('SystemA')  // 错误：A -> B -> A 形成循环
class SystemB extends EntitySystem { }

// 错误信息：Cyclic dependency detected: SystemA -> SystemB -> SystemA
```

## 调度装饰器参考

| 装饰器 | 说明 | 示例 |
|--------|------|------|
| `@Stage(name)` | 指定执行阶段 | `@Stage('update')` |
| `@Before(system)` | 在指定系统之前执行 | `@Before('RenderSystem')` |
| `@After(system)` | 在指定系统之后执行 | `@After('InputSystem')` |
| `@InSet(name)` | 加入系统集合 | `@InSet('CoreSystems')` |
| `@Before('set:name')` | 在集合之前执行 | `@Before('set:UI')` |
| `@After('set:name')` | 在集合之后执行 | `@After('set:Physics')` |

## updateOrder vs 声明式调度

| 特性 | updateOrder | 声明式调度 |
|------|-------------|------------|
| 配置方式 | 手动设置数值 | 声明依赖关系 |
| 可读性 | 需要记住数值含义 | 直接表达意图 |
| 循环检测 | 无 | 自动检测 |
| 重构友好 | 需要手动调整数值 | 自动处理顺序 |
| 适用场景 | 简单项目 | 复杂依赖关系 |

:::tip
对于小型项目，`updateOrder` 足够使用。当系统数量增多、依赖关系复杂时，推荐使用声明式调度。
:::
