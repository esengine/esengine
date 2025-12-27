---
title: "服务容器概述"
description: "ECS Framework 依赖注入容器"
---

服务容器（ServiceContainer）是 ECS Framework 的依赖注入容器，负责管理框架中所有服务的注册、解析和生命周期。

## 什么是服务容器

服务容器是一个轻量级的依赖注入（DI）容器，它提供了：

- **服务注册**: 将服务类型注册到容器中
- **服务解析**: 从容器中获取服务实例
- **生命周期管理**: 自动管理服务实例的创建和销毁
- **依赖注入**: 自动解析服务之间的依赖关系

## 核心概念

### 服务（Service）

服务是实现了 `IService` 接口的类，必须提供 `dispose()` 方法用于资源清理：

```typescript
import { IService } from '@esengine/ecs-framework';

class MyService implements IService {
    constructor() {
        // 初始化逻辑
    }

    dispose(): void {
        // 清理资源
    }
}
```

### 服务标识符

服务标识符用于在容器中唯一标识一个服务，支持两种类型：

- **类构造函数**: 直接使用服务类作为标识符
- **Symbol**: 使用 Symbol 作为标识符（推荐用于接口抽象）

```typescript
// 方式1: 使用类作为标识符
Core.services.registerSingleton(DataService);
const data = Core.services.resolve(DataService);

// 方式2: 使用 Symbol 作为标识符
const IFileSystem = Symbol.for('IFileSystem');
Core.services.registerInstance(IFileSystem, new TauriFileSystem());
const fs = Core.services.resolve<IFileSystem>(IFileSystem);
```

### 生命周期

- **Singleton（单例）**: 整个应用生命周期内只有一个实例
- **Transient（瞬时）**: 每次解析都创建新的实例

## 容器层级

ECS Framework 提供了三级服务容器：

```
Core.services (应用程序全局)
  └─ World.services (World 级别)
      └─ Scene.services (Scene 级别)
```

```typescript
// Core 级别
const container = Core.services;

// World 级别
const worldContainer = world.services;

// Scene 级别
const sceneContainer = scene.services;
```

## 基础使用

### 注册服务

```typescript
// 单例服务
Core.services.registerSingleton(DataService);

// 瞬时服务
Core.services.registerTransient(CommandService);

// 注册实例
Core.services.registerInstance(ConfigService, config);

// 工厂函数
Core.services.registerSingleton(LoggerService, (container) => {
    const logger = new LoggerService();
    logger.setLevel('debug');
    return logger;
});
```

### 解析服务

```typescript
// 解析服务（未注册会抛异常）
const dataService = Core.services.resolve(DataService);

// 尝试解析（未注册返回 null）
const optional = Core.services.tryResolve(OptionalService);

// 检查是否已注册
if (Core.services.isRegistered(DataService)) {
    // ...
}
```

## 下一步

- [内置服务](./built-in-services/) - 框架提供的内置服务
- [依赖注入](./dependency-injection/) - 装饰器和自动注入
- [PluginServiceRegistry](./plugin-service-registry/) - 插件服务注册表
- [高级用法](./advanced/) - Symbol 模式、最佳实践
