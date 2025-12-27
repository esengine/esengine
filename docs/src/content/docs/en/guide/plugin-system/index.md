---
title: "Plugin System"
description: "Extend ECS Framework in a modular way"
---

The plugin system allows you to extend ECS Framework functionality in a modular way. Through plugins, you can encapsulate specific features (like network sync, physics engines, debug tools) and reuse them across multiple projects.

## What is a Plugin

A plugin is a class that implements the `IPlugin` interface and can be dynamically installed into the framework at runtime. Plugins can:

- Register custom services to the service container
- Add systems to scenes
- Register custom components
- Extend framework functionality

## Plugin Benefits

| Benefit | Description |
|---------|-------------|
| **Modular** | Encapsulate functionality as independent modules |
| **Reusable** | Use the same plugin across multiple projects |
| **Decoupled** | Separate core framework from extensions |
| **Hot-swappable** | Dynamically install and uninstall at runtime |

## Quick Start

### Create a Plugin

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

### Install a Plugin

```typescript
import { Core } from '@esengine/ecs-framework';

Core.create({ debug: true });

// Install plugin
await Core.installPlugin(new DebugPlugin());

// Check if plugin is installed
if (Core.isPluginInstalled('debug-plugin')) {
  console.log('Debug plugin is running');
}
```

### Uninstall a Plugin

```typescript
await Core.uninstallPlugin('debug-plugin');
```

### Get Plugin Instance

```typescript
const plugin = Core.getPlugin('debug-plugin');
if (plugin) {
  console.log(`Plugin version: ${plugin.version}`);
}
```

## Next Steps

- [Development](./development/) - IPlugin interface and lifecycle
- [Services & Systems](./services-systems/) - Register services and add systems
- [Dependencies](./dependencies/) - Declare and check dependencies
- [Management](./management/) - Manage via Core and PluginManager
- [Examples](./examples/) - Complete examples
- [Best Practices](./best-practices/) - Design guidelines
