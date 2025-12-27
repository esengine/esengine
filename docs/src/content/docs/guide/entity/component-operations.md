---
title: "组件操作"
description: "实体的组件添加、获取、移除等操作详解"
---

实体通过添加组件来获得功能。本节详细介绍所有组件操作 API。

## 添加组件

### addComponent

添加已创建的组件实例：

```typescript
import { Component, ECSComponent } from '@esengine/ecs-framework';

@ECSComponent('Position')
class Position extends Component {
    x: number = 0;
    y: number = 0;

    constructor(x: number = 0, y: number = 0) {
        super();
        this.x = x;
        this.y = y;
    }
}

const player = scene.createEntity("Player");
const position = new Position(100, 200);
player.addComponent(position);
```

### createComponent

直接传入组件类型和构造参数，由实体创建组件实例（推荐方式）：

```typescript
// 创建并添加组件
const position = player.createComponent(Position, 100, 200);
const health = player.createComponent(Health, 150);

// 等价于
// const position = new Position(100, 200);
// player.addComponent(position);
```

### addComponents

批量添加多个组件：

```typescript
const components = player.addComponents([
    new Position(100, 200),
    new Health(150),
    new Velocity(0, 0)
]);
```

:::note[注意事项]
- 同一实体不能添加相同类型的组件两次，会抛出异常
- 实体必须已添加到场景后才能添加组件
:::

## 获取组件

### getComponent

获取指定类型的组件：

```typescript
// 返回 Position | null
const position = player.getComponent(Position);

if (position) {
    position.x += 10;
    position.y += 20;
}
```

### hasComponent

检查实体是否拥有指定类型的组件：

```typescript
if (player.hasComponent(Position)) {
    const position = player.getComponent(Position)!;
    // 使用 ! 因为我们已经确认存在
}
```

### getComponents

获取指定类型的所有组件（支持同类型多组件场景）：

```typescript
const allHealthComponents = player.getComponents(Health);
```

### getComponentByType

支持继承查找的组件获取，使用 `instanceof` 检查：

```typescript
// 查找 CompositeNodeComponent 或其任意子类
const composite = entity.getComponentByType(CompositeNodeComponent);
if (composite) {
    // composite 可能是 SequenceNode, SelectorNode 等
}
```

与 `getComponent()` 的区别：

| 方法 | 查找方式 | 性能 | 使用场景 |
|-----|---------|-----|---------|
| `getComponent` | 精确类型匹配（位掩码） | 高 | 知道确切类型 |
| `getComponentByType` | `instanceof` 检查 | 较低 | 需要支持继承 |

### getOrCreateComponent

获取或创建组件，如果不存在则自动创建：

```typescript
// 确保实体拥有 Position 组件
const position = player.getOrCreateComponent(Position, 0, 0);
position.x = 100;

// 如果已存在，返回现有组件
// 如果不存在，使用 (0, 0) 参数创建新组件
```

### components 属性

获取实体的所有组件（只读）：

```typescript
const allComponents = player.components;  // readonly Component[]

allComponents.forEach(component => {
    console.log(component.constructor.name);
});
```

## 移除组件

### removeComponent

通过组件实例移除：

```typescript
const healthComponent = player.getComponent(Health);
if (healthComponent) {
    player.removeComponent(healthComponent);
}
```

### removeComponentByType

通过组件类型移除：

```typescript
const removedHealth = player.removeComponentByType(Health);
if (removedHealth) {
    console.log("健康组件已被移除");
}
```

### removeComponentsByTypes

批量移除多种组件类型：

```typescript
const removedComponents = player.removeComponentsByTypes([
    Position,
    Health,
    Velocity
]);
```

### removeAllComponents

移除所有组件：

```typescript
player.removeAllComponents();
```

## 变更检测

### markDirty

标记组件为已修改，用于帧级变更检测系统：

```typescript
const pos = entity.getComponent(Position)!;
pos.x = 100;
entity.markDirty(pos);

// 或标记多个组件
const vel = entity.getComponent(Velocity)!;
entity.markDirty(pos, vel);
```

配合响应式查询使用：

```typescript
// 在系统中查询本帧修改过的组件
const changedQuery = scene.createReactiveQuery({
    all: [Position],
    changed: [Position]  // 只匹配本帧修改过的
});

for (const entity of changedQuery.getEntities()) {
    // 处理位置变化的实体
}
```

## 组件掩码

每个实体维护一个组件位掩码，用于高效的 `hasComponent` 检查：

```typescript
// 获取组件掩码（内部使用）
const mask = entity.componentMask;
```

## 完整示例

```typescript
import { Component, ECSComponent, Scene } from '@esengine/ecs-framework';

@ECSComponent('Position')
class Position extends Component {
    constructor(public x = 0, public y = 0) { super(); }
}

@ECSComponent('Health')
class Health extends Component {
    constructor(public current = 100, public max = 100) { super(); }
}

// 创建实体并添加组件
const player = scene.createEntity("Player");
player.createComponent(Position, 100, 200);
player.createComponent(Health, 150, 150);

// 获取并修改组件
const position = player.getComponent(Position);
if (position) {
    position.x += 10;
    player.markDirty(position);
}

// 获取或创建组件
const velocity = player.getOrCreateComponent(Velocity, 0, 0);

// 检查组件存在
if (player.hasComponent(Health)) {
    const health = player.getComponent(Health)!;
    health.current -= 10;
}

// 移除组件
player.removeComponentByType(Velocity);

// 列出所有组件
console.log(player.components.map(c => c.constructor.name));
```

## 下一步

- [实体句柄](/guide/entity/entity-handle/) - 安全的跨帧实体引用
- [组件系统](/guide/component/) - 组件的定义和生命周期
