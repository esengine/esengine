---
title: "插件开发"
description: "IPlugin 接口和生命周期"
---

## IPlugin 接口

所有插件必须实现 `IPlugin` 接口：

```typescript
export interface IPlugin {
  // 插件唯一名称
  readonly name: string;

  // 插件版本（建议遵循semver规范）
  readonly version: string;

  // 依赖的其他插件（可选）
  readonly dependencies?: readonly string[];

  // 安装插件时调用
  install(core: Core, services: ServiceContainer): void | Promise<void>;

  // 卸载插件时调用
  uninstall(): void | Promise<void>;
}
```

## 生命周期方法

### install 方法

在插件安装时调用，用于初始化插件：

```typescript
class MyPlugin implements IPlugin {
  readonly name = 'my-plugin';
  readonly version = '1.0.0';

  install(core: Core, services: ServiceContainer): void {
    // 1. 注册服务
    services.registerSingleton(MyService);

    // 2. 访问当前场景
    const scene = core.scene;
    if (scene) {
      // 3. 添加系统
      scene.addSystem(new MySystem());
    }

    // 4. 其他初始化逻辑
    console.log('Plugin initialized');
  }

  uninstall(): void {
    // 清理逻辑
  }
}
```

### uninstall 方法

在插件卸载时调用，用于清理资源：

```typescript
class MyPlugin implements IPlugin {
  readonly name = 'my-plugin';
  readonly version = '1.0.0';
  private myService?: MyService;

  install(core: Core, services: ServiceContainer): void {
    this.myService = new MyService();
    services.registerInstance(MyService, this.myService);
  }

  uninstall(): void {
    // 清理服务
    if (this.myService) {
      this.myService.dispose();
      this.myService = undefined;
    }

    // 移除事件监听器
    // 释放其他资源
  }
}
```

## 异步插件

插件的 `install` 和 `uninstall` 方法都支持异步：

```typescript
class AsyncPlugin implements IPlugin {
  readonly name = 'async-plugin';
  readonly version = '1.0.0';

  async install(core: Core, services: ServiceContainer): Promise<void> {
    // 异步加载资源
    const config = await fetch('/plugin-config.json').then(r => r.json());

    // 使用加载的配置初始化服务
    const service = new MyService(config);
    services.registerInstance(MyService, service);
  }

  async uninstall(): Promise<void> {
    // 异步清理
    await this.saveState();
  }

  private async saveState() {
    // 保存插件状态
  }
}

// 使用
await Core.installPlugin(new AsyncPlugin());
```

## 生命周期流程

```
安装: Core.installPlugin(plugin)
  ↓
依赖检查: 检查 dependencies 是否满足
  ↓
调用 install(): 注册服务、添加系统
  ↓
状态更新: 标记为已安装

卸载: Core.uninstallPlugin(name)
  ↓
依赖检查: 检查是否被其他插件依赖
  ↓
调用 uninstall(): 清理资源
  ↓
状态更新: 从插件列表移除
```
