---
title: "最佳实践"
description: "插件设计规范和常见问题"
---

## 命名规范

```typescript
class MyPlugin implements IPlugin {
  // 使用小写字母和连字符
  readonly name = 'my-awesome-plugin';  // ✅

  // 遵循语义化版本
  readonly version = '1.0.0';           // ✅
}
```

## 清理资源

始终在 `uninstall` 中清理插件创建的所有资源：

```typescript
class MyPlugin implements IPlugin {
  readonly name = 'my-plugin';
  readonly version = '1.0.0';
  private timerId?: number;
  private listener?: () => void;

  install(core: Core, services: ServiceContainer): void {
    // 添加定时器
    this.timerId = setInterval(() => {
      // ...
    }, 1000);

    // 添加事件监听
    this.listener = () => {};
    window.addEventListener('resize', this.listener);
  }

  uninstall(): void {
    // 清理定时器
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }

    // 移除事件监听
    if (this.listener) {
      window.removeEventListener('resize', this.listener);
      this.listener = undefined;
    }
  }
}
```

## 错误处理

```typescript
class MyPlugin implements IPlugin {
  readonly name = 'my-plugin';
  readonly version = '1.0.0';

  async install(core: Core, services: ServiceContainer): Promise<void> {
    try {
      await this.loadConfig();
    } catch (error) {
      console.error('Failed to load plugin config:', error);
      throw error; // 重新抛出，让框架知道安装失败
    }
  }

  async uninstall(): Promise<void> {
    try {
      await this.cleanup();
    } catch (error) {
      console.error('Failed to cleanup plugin:', error);
      // 即使清理失败也不应该阻止卸载
    }
  }

  private async loadConfig() { /* ... */ }
  private async cleanup() { /* ... */ }
}
```

## 配置化

允许用户配置插件行为：

```typescript
interface NetworkPluginConfig {
  serverUrl: string;
  autoReconnect: boolean;
  timeout: number;
}

class NetworkPlugin implements IPlugin {
  readonly name = 'network-plugin';
  readonly version = '1.0.0';

  constructor(private config: NetworkPluginConfig) {}

  install(core: Core, services: ServiceContainer): void {
    const network = new NetworkService(this.config);
    services.registerInstance(NetworkService, network);
  }

  uninstall(): void {}
}

// 使用
const plugin = new NetworkPlugin({
  serverUrl: 'ws://localhost:8080',
  autoReconnect: true,
  timeout: 5000
});

await Core.installPlugin(plugin);
```

## 常见问题

### 插件安装失败

**原因**:
- 依赖未满足
- install 方法中有异常
- 服务注册冲突

**解决**:
1. 检查依赖是否已安装
2. 查看错误日志
3. 确保服务名称不冲突

### 插件卸载后仍有副作用

**原因**: uninstall 方法中未正确清理资源

**解决**: 确保在 uninstall 中清理：
- 定时器
- 事件监听器
- WebSocket 连接
- 系统引用

### 何时使用插件

| 适合使用插件 | 不适合使用插件 |
|-------------|---------------|
| 可选功能（调试工具、性能分析） | 核心游戏逻辑 |
| 第三方集成（网络库、物理引擎） | 简单的工具类 |
| 跨项目复用的功能模块 | 项目特定的功能 |
