---
title: "依赖管理"
description: "声明和检查插件依赖"
---

## 声明依赖

插件可以声明对其他插件的依赖：

```typescript
class AdvancedPhysicsPlugin implements IPlugin {
  readonly name = 'advanced-physics';
  readonly version = '2.0.0';

  // 声明依赖基础物理插件
  readonly dependencies = ['physics-plugin'] as const;

  install(core: Core, services: ServiceContainer): void {
    // 可以安全地使用physics-plugin提供的服务
    const physicsService = services.resolve(PhysicsService);
    // ...
  }

  uninstall(): void {
    // 清理
  }
}
```

## 依赖检查

框架会自动检查依赖关系，如果依赖未满足会抛出错误：

```typescript
// 错误：physics-plugin 未安装
try {
  await Core.installPlugin(new AdvancedPhysicsPlugin());
} catch (error) {
  console.error(error);
  // Plugin advanced-physics has unmet dependencies: physics-plugin
}

// 正确：先安装依赖
await Core.installPlugin(new PhysicsPlugin());
await Core.installPlugin(new AdvancedPhysicsPlugin());
```

## 卸载顺序

框架会检查依赖关系，防止卸载被其他插件依赖的插件：

```typescript
await Core.installPlugin(new PhysicsPlugin());
await Core.installPlugin(new AdvancedPhysicsPlugin());

// 错误：physics-plugin 被 advanced-physics 依赖
try {
  await Core.uninstallPlugin('physics-plugin');
} catch (error) {
  console.error(error);
  // Cannot uninstall plugin physics-plugin: it is required by advanced-physics
}

// 正确：先卸载依赖它的插件
await Core.uninstallPlugin('advanced-physics');
await Core.uninstallPlugin('physics-plugin');
```

## 依赖图示例

```
physics-plugin (基础)
    ↑
advanced-physics (依赖 physics-plugin)
    ↑
game-physics (依赖 advanced-physics)
```

安装顺序：`physics-plugin` → `advanced-physics` → `game-physics`

卸载顺序：`game-physics` → `advanced-physics` → `physics-plugin`

## 多依赖

```typescript
class GamePlugin implements IPlugin {
  readonly name = 'game';
  readonly version = '1.0.0';

  // 声明多个依赖
  readonly dependencies = [
    'physics-plugin',
    'network-plugin',
    'audio-plugin'
  ] as const;

  install(core: Core, services: ServiceContainer): void {
    // 所有依赖都已可用
    const physics = services.resolve(PhysicsService);
    const network = services.resolve(NetworkService);
    const audio = services.resolve(AudioService);
  }

  uninstall(): void {}
}
```
