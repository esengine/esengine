---
title: "示例插件"
description: "完整的插件实现示例"
---

## 网络同步插件

```typescript
import { IPlugin, IService, Core, ServiceContainer } from '@esengine/ecs-framework';

class NetworkSyncService implements IService {
  private ws?: WebSocket;

  connect(url: string) {
    this.ws = new WebSocket(url);
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
  }

  private handleMessage(data: any) {
    // 处理网络消息
  }

  dispose(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }
}

class NetworkSyncPlugin implements IPlugin {
  readonly name = 'network-sync';
  readonly version = '1.0.0';

  install(core: Core, services: ServiceContainer): void {
    // 注册网络服务
    services.registerSingleton(NetworkSyncService);

    // 自动连接
    const network = services.resolve(NetworkSyncService);
    network.connect('ws://localhost:8080');
  }

  uninstall(): void {
    // 服务会自动dispose
  }
}
```

## 性能分析插件

```typescript
class PerformanceAnalysisPlugin implements IPlugin {
  readonly name = 'performance-analysis';
  readonly version = '1.0.0';
  private frameCount = 0;
  private totalTime = 0;

  install(core: Core, services: ServiceContainer): void {
    const monitor = services.resolve(PerformanceMonitor);
    monitor.enable();

    // 定期输出性能报告
    const timer = services.resolve(TimerManager);
    timer.schedule(5.0, true, null, () => {
      this.printReport(monitor);
    });
  }

  uninstall(): void {
    // 清理
  }

  private printReport(monitor: PerformanceMonitor) {
    console.log('=== Performance Report ===');
    console.log(`FPS: ${monitor.getFPS()}`);
    console.log(`Memory: ${monitor.getMemoryUsage()} MB`);
  }
}
```

## 调试工具插件

```typescript
class DebugToolsPlugin implements IPlugin {
  readonly name = 'debug-tools';
  readonly version = '1.0.0';
  private debugUI?: DebugUI;

  install(core: Core, services: ServiceContainer): void {
    // 创建调试UI
    this.debugUI = new DebugUI();
    this.debugUI.mount(document.body);

    // 注册快捷键
    window.addEventListener('keydown', this.handleKeyDown);

    // 添加调试系统
    const scene = core.scene;
    if (scene) {
      scene.addSystem(new DebugRenderSystem());
    }
  }

  uninstall(): void {
    // 移除UI
    if (this.debugUI) {
      this.debugUI.unmount();
      this.debugUI = undefined;
    }

    // 移除事件监听
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'F12') {
      this.debugUI?.toggle();
    }
  };
}
```

## 音频插件

```typescript
class AudioPlugin implements IPlugin {
  readonly name = 'audio';
  readonly version = '1.0.0';

  constructor(private config: { volume: number }) {}

  install(core: Core, services: ServiceContainer): void {
    const audioService = new AudioService(this.config);
    services.registerInstance(AudioService, audioService);

    // 添加音频系统
    const scene = core.scene;
    if (scene) {
      scene.addSystem(new AudioSystem());
    }
  }

  uninstall(): void {
    // 停止所有音频
    const audio = Core.services.resolve(AudioService);
    audio.stopAll();
  }
}

// 使用
await Core.installPlugin(new AudioPlugin({ volume: 0.8 }));
```

## 输入管理插件

```typescript
class InputPlugin implements IPlugin {
  readonly name = 'input';
  readonly version = '1.0.0';
  private inputManager?: InputManager;

  install(core: Core, services: ServiceContainer): void {
    this.inputManager = new InputManager();
    services.registerInstance(InputManager, this.inputManager);

    // 绑定默认按键
    this.inputManager.bind('jump', ['Space', 'KeyW']);
    this.inputManager.bind('attack', ['MouseLeft', 'KeyJ']);

    // 添加输入系统
    const scene = core.scene;
    if (scene) {
      scene.addSystem(new InputSystem());
    }
  }

  uninstall(): void {
    if (this.inputManager) {
      this.inputManager.dispose();
      this.inputManager = undefined;
    }
  }
}
```
