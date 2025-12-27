---
title: "实体概述"
description: "ECS 架构中实体的基本概念和使用方式"
---

在 ECS 架构中，实体（Entity）是游戏世界中的基本对象。实体本身不包含游戏逻辑或数据，它只是一个容器，用来组合不同的组件来实现各种功能。

## 基本概念

实体是一个轻量级的对象，主要用于：
- 作为组件的容器
- 提供唯一标识（ID 和 persistentId）
- 管理组件的生命周期

:::tip[关于父子层级关系]
实体间的父子层级关系通过 `HierarchyComponent` 和 `HierarchySystem` 管理，而非 Entity 内置属性。这种设计遵循 ECS 组合原则 —— 只有需要层级关系的实体才添加此组件。

详见 [层级系统](/guide/hierarchy/) 文档。
:::

## 创建实体

**实体必须通过场景创建，不支持手动创建。**

```typescript
// 正确的方式：通过场景创建实体
const player = scene.createEntity("Player");

// ❌ 错误的方式：手动创建实体
// const entity = new Entity("MyEntity", 1);
```

通过场景创建可以确保：
- 实体被正确添加到场景的实体管理系统中
- 实体被添加到查询系统中，供系统使用
- 实体获得正确的场景引用
- 触发相关的生命周期事件

### 批量创建

框架提供了高性能的批量创建方法：

```typescript
// 批量创建 100 个子弹实体
const bullets = scene.createEntities(100, "Bullet");

bullets.forEach((bullet, index) => {
    bullet.createComponent(Position, Math.random() * 800, Math.random() * 600);
    bullet.createComponent(Velocity, Math.random() * 100, Math.random() * 100);
});
```

`createEntities()` 会批量分配 ID、优化查询系统更新，减少系统缓存清理次数。

## 实体标识

每个实体有三种标识符：

| 属性 | 类型 | 说明 |
|-----|------|-----|
| `id` | `number` | 运行时唯一标识符，用于快速查找 |
| `persistentId` | `string` | GUID，序列化时保持引用一致性 |
| `handle` | `EntityHandle` | 轻量级句柄，详见[实体句柄](/guide/entity/entity-handle/) |

```typescript
const entity = scene.createEntity("Player");

console.log(entity.id);           // 1
console.log(entity.persistentId); // "a1b2c3d4-..."
console.log(entity.handle);       // 数字类型句柄
```

## 实体属性

### 名称和标签

```typescript
// 名称 - 用于调试和查找
entity.name = "Player";

// 标签 - 用于快速分类和查询
entity.tag = 1;  // 玩家标签
enemy.tag = 2;   // 敌人标签
```

### 状态控制

```typescript
// 启用/禁用状态
entity.enabled = false;

// 激活状态
entity.active = false;

// 更新顺序（数值越小越优先）
entity.updateOrder = 10;
```

## 实体查找

场景提供了多种查找方式：

```typescript
// 通过名称查找
const player = scene.findEntity("Player");
// 或别名
const player2 = scene.getEntityByName("Player");

// 通过 ID 查找
const entity = scene.findEntityById(123);

// 通过标签查找所有相关实体
const enemies = scene.findEntitiesByTag(2);
// 或别名
const allEnemies = scene.getEntitiesByTag(2);

// 通过句柄查找
const entity = scene.findEntityByHandle(handle);
```

## 实体事件

实体的变化会触发事件：

```typescript
// 监听组件添加
scene.eventSystem.on('component:added', (data) => {
    console.log(`${data.entityName} 添加了 ${data.componentType}`);
});

// 监听组件移除
scene.eventSystem.on('component:removed', (data) => {
    console.log(`${data.entityName} 移除了 ${data.componentType}`);
});

// 监听实体创建
scene.eventSystem.on('entity:created', (data) => {
    console.log(`实体已创建: ${data.entityName}`);
});

// 监听激活状态变化
scene.eventSystem.on('entity:activeChanged', (data) => {
    console.log(`${data.entity.name} 激活状态: ${data.active}`);
});
```

## 调试

```typescript
// 获取实体调试信息
const debugInfo = entity.getDebugInfo();
console.log(debugInfo);
// {
//   name: "Player",
//   id: 1,
//   persistentId: "a1b2c3d4-...",
//   enabled: true,
//   active: true,
//   destroyed: false,
//   componentCount: 3,
//   componentTypes: ["Position", "Health", "Velocity"],
//   ...
// }

// 实体字符串表示
console.log(entity.toString());
// "Entity[Player:1:a1b2c3d4]"
```

## 下一步

- [组件操作](/guide/entity/component-operations/) - 添加、获取、移除组件
- [实体句柄](/guide/entity/entity-handle/) - 安全的实体引用方式
- [生命周期](/guide/entity/lifecycle/) - 销毁和持久化
