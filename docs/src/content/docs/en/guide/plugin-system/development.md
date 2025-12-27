---
title: "Plugin Development"
description: "IPlugin interface and lifecycle"
---

## IPlugin Interface

All plugins must implement the `IPlugin` interface:

```typescript
export interface IPlugin {
  // Unique plugin name
  readonly name: string;

  // Plugin version (semver recommended)
  readonly version: string;

  // Dependencies on other plugins (optional)
  readonly dependencies?: readonly string[];

  // Called when plugin is installed
  install(core: Core, services: ServiceContainer): void | Promise<void>;

  // Called when plugin is uninstalled
  uninstall(): void | Promise<void>;
}
```

## Lifecycle Methods

### install Method

Called when the plugin is installed, used for initialization:

```typescript
class MyPlugin implements IPlugin {
  readonly name = 'my-plugin';
  readonly version = '1.0.0';

  install(core: Core, services: ServiceContainer): void {
    // 1. Register services
    services.registerSingleton(MyService);

    // 2. Access current scene
    const scene = core.scene;
    if (scene) {
      // 3. Add systems
      scene.addSystem(new MySystem());
    }

    // 4. Other initialization
    console.log('Plugin initialized');
  }

  uninstall(): void {
    // Cleanup logic
  }
}
```

### uninstall Method

Called when the plugin is uninstalled, used for cleanup:

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
    // Cleanup service
    if (this.myService) {
      this.myService.dispose();
      this.myService = undefined;
    }

    // Remove event listeners
    // Release other resources
  }
}
```

## Async Plugins

Both `install` and `uninstall` methods support async:

```typescript
class AsyncPlugin implements IPlugin {
  readonly name = 'async-plugin';
  readonly version = '1.0.0';

  async install(core: Core, services: ServiceContainer): Promise<void> {
    // Async load resources
    const config = await fetch('/plugin-config.json').then(r => r.json());

    // Initialize service with loaded config
    const service = new MyService(config);
    services.registerInstance(MyService, service);
  }

  async uninstall(): Promise<void> {
    // Async cleanup
    await this.saveState();
  }

  private async saveState() {
    // Save plugin state
  }
}

// Usage
await Core.installPlugin(new AsyncPlugin());
```

## Lifecycle Flow

```
Install: Core.installPlugin(plugin)
  ↓
Dependency check: Verify dependencies are satisfied
  ↓
Call install(): Register services, add systems
  ↓
State update: Mark as installed

Uninstall: Core.uninstallPlugin(name)
  ↓
Dependency check: Verify not required by other plugins
  ↓
Call uninstall(): Cleanup resources
  ↓
State update: Remove from plugin list
```
