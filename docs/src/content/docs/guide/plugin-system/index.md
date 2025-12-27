---
title: "插件系统"
description: "以模块化方式扩展 ECS Framework"
---

插件系统允许你以模块化的方式扩展 ECS Framework 的功能。通过插件，你可以封装特定功能（如网络同步、物理引擎、调试工具等），并在多个项目中复用。

## 什么是插件

插件是实现了 `IPlugin` 接口的类，可以在运行时动态安装到框架中。插件可以：

- 注册自定义服务到服务容器
- 添加系统到场景
- 注册自定义组件
- 扩展框架功能

## 插件的优势

| 优势 | 说明 |
|------|------|
| **模块化** | 将功能封装为独立模块，提高代码可维护性 |
| **可复用** | 同一个插件可以在多个项目中使用 |
| **解耦** | 核心框架与扩展功能分离 |
| **热插拔** | 运行时动态安装和卸载插件 |

## 快速开始

### 创建插件

```typescript
import { IPlugin, Core, ServiceContainer } from '@esengine/ecs-framework';

class DebugPlugin implements IPlugin {
  readonly name = 'debug-plugin';
  readonly version = '1.0.0';

  install(core: Core, services: ServiceContainer): void {
    console.log('Debug plugin installed');
  }

  uninstall(): void {
    console.log('Debug plugin uninstalled');
  }
}
```

### 安装插件

```typescript
import { Core } from '@esengine/ecs-framework';

Core.create({ debug: true });

// 安装插件
await Core.installPlugin(new DebugPlugin());

// 检查插件是否已安装
if (Core.isPluginInstalled('debug-plugin')) {
  console.log('Debug plugin is running');
}
```

### 卸载插件

```typescript
await Core.uninstallPlugin('debug-plugin');
```

### 获取插件实例

```typescript
const plugin = Core.getPlugin('debug-plugin');
if (plugin) {
  console.log(`Plugin version: ${plugin.version}`);
}
```

## 下一步

- [插件开发](./development/) - IPlugin 接口和生命周期
- [服务与系统](./services-systems/) - 注册服务和添加系统
- [依赖管理](./dependencies/) - 声明和检查依赖
- [插件管理](./management/) - 通过 Core 和 PluginManager 管理
- [示例插件](./examples/) - 完整示例
- [最佳实践](./best-practices/) - 设计规范
