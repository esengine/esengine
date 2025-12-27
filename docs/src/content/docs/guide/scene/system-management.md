---
title: "系统管理"
description: "场景中的系统添加、移除和控制"
---

场景负责管理系统的注册、执行顺序和生命周期。

## 添加系统

```typescript
class SystemScene extends Scene {
  protected initialize(): void {
    // 添加系统
    const movementSystem = new MovementSystem();
    this.addSystem(movementSystem);

    // 设置系统更新顺序（数值越小越先执行）
    movementSystem.updateOrder = 1;

    // 添加更多系统
    this.addSystem(new PhysicsSystem());
    this.addSystem(new RenderSystem());
  }
}
```

## 获取系统

```typescript
// 获取指定类型的系统
const physicsSystem = this.getEntityProcessor(PhysicsSystem);

if (physicsSystem) {
  console.log("找到物理系统");
}
```

## 移除系统

```typescript
public removeUnnecessarySystems(): void {
  const physicsSystem = this.getEntityProcessor(PhysicsSystem);

  if (physicsSystem) {
    this.removeSystem(physicsSystem);
  }
}
```

## 控制系统

### 启用/禁用系统

```typescript
public pausePhysics(): void {
  const physicsSystem = this.getEntityProcessor(PhysicsSystem);
  if (physicsSystem) {
    physicsSystem.enabled = false; // 禁用系统
  }
}

public resumePhysics(): void {
  const physicsSystem = this.getEntityProcessor(PhysicsSystem);
  if (physicsSystem) {
    physicsSystem.enabled = true; // 启用系统
  }
}
```

### 获取所有系统

```typescript
public getAllSystems(): EntitySystem[] {
  return this.systems; // 获取所有已注册系统
}
```

## 系统组织最佳实践

按功能分组添加系统：

```typescript
class OrganizedScene extends Scene {
  protected initialize(): void {
    // 按功能和依赖关系添加系统
    this.addInputSystems();
    this.addLogicSystems();
    this.addRenderSystems();
  }

  private addInputSystems(): void {
    this.addSystem(new InputSystem());
  }

  private addLogicSystems(): void {
    this.addSystem(new MovementSystem());
    this.addSystem(new PhysicsSystem());
    this.addSystem(new CollisionSystem());
  }

  private addRenderSystems(): void {
    this.addSystem(new RenderSystem());
    this.addSystem(new UISystem());
  }
}
```

## API 参考

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `addSystem(system)` | `void` | 添加系统到场景 |
| `removeSystem(system)` | `void` | 从场景移除系统 |
| `getEntityProcessor(Type)` | `T \| undefined` | 获取指定类型的系统 |
| `systems` | `EntitySystem[]` | 获取所有系统 |
