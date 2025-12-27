---
title: "Plugin Management"
description: "Manage plugins via Core and PluginManager"
---

## Via Core

Core class provides convenient plugin management methods:

```typescript
// Install plugin
await Core.installPlugin(myPlugin);

// Uninstall plugin
await Core.uninstallPlugin('plugin-name');

// Check if plugin is installed
if (Core.isPluginInstalled('plugin-name')) {
  // ...
}

// Get plugin instance
const plugin = Core.getPlugin('plugin-name');
```

## Via PluginManager

You can also use the PluginManager service directly:

```typescript
const pluginManager = Core.services.resolve(PluginManager);

// Get all plugins
const allPlugins = pluginManager.getAllPlugins();
console.log(`Total plugins: ${allPlugins.length}`);

// Get plugin metadata
const metadata = pluginManager.getMetadata('my-plugin');
if (metadata) {
  console.log(`State: ${metadata.state}`);
  console.log(`Installed at: ${new Date(metadata.installedAt!)}`);
}

// Get all plugin metadata
const allMetadata = pluginManager.getAllMetadata();
for (const meta of allMetadata) {
  console.log(`${meta.name} v${meta.version} - ${meta.state}`);
}
```

## API Reference

### Core Static Methods

| Method | Description |
|--------|-------------|
| `installPlugin(plugin)` | Install plugin |
| `uninstallPlugin(name)` | Uninstall plugin |
| `isPluginInstalled(name)` | Check if installed |
| `getPlugin(name)` | Get plugin instance |

### PluginManager Methods

| Method | Description |
|--------|-------------|
| `getAllPlugins()` | Get all plugins |
| `getMetadata(name)` | Get plugin metadata |
| `getAllMetadata()` | Get all plugin metadata |

## Plugin States

```typescript
enum PluginState {
  Pending = 'pending',
  Installing = 'installing',
  Installed = 'installed',
  Uninstalling = 'uninstalling',
  Failed = 'failed'
}
```

## Metadata Information

```typescript
interface PluginMetadata {
  name: string;
  version: string;
  state: PluginState;
  dependencies?: string[];
  installedAt?: number;
  error?: Error;
}
```
