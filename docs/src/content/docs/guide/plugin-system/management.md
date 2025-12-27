---
title: "插件管理"
description: "通过 Core 和 PluginManager 管理插件"
---

## 通过 Core 管理

Core 类提供了便捷的插件管理方法：

```typescript
// 安装插件
await Core.installPlugin(myPlugin);

// 卸载插件
await Core.uninstallPlugin('plugin-name');

// 检查插件是否已安装
if (Core.isPluginInstalled('plugin-name')) {
  // ...
}

// 获取插件实例
const plugin = Core.getPlugin('plugin-name');
```

## 通过 PluginManager 管理

也可以直接使用 PluginManager 服务：

```typescript
const pluginManager = Core.services.resolve(PluginManager);

// 获取所有插件
const allPlugins = pluginManager.getAllPlugins();
console.log(`Total plugins: ${allPlugins.length}`);

// 获取插件元数据
const metadata = pluginManager.getMetadata('my-plugin');
if (metadata) {
  console.log(`State: ${metadata.state}`);
  console.log(`Installed at: ${new Date(metadata.installedAt!)}`);
}

// 获取所有插件元数据
const allMetadata = pluginManager.getAllMetadata();
for (const meta of allMetadata) {
  console.log(`${meta.name} v${meta.version} - ${meta.state}`);
}
```

## API 参考

### Core 静态方法

| 方法 | 说明 |
|------|------|
| `installPlugin(plugin)` | 安装插件 |
| `uninstallPlugin(name)` | 卸载插件 |
| `isPluginInstalled(name)` | 检查是否已安装 |
| `getPlugin(name)` | 获取插件实例 |

### PluginManager 方法

| 方法 | 说明 |
|------|------|
| `getAllPlugins()` | 获取所有插件 |
| `getMetadata(name)` | 获取插件元数据 |
| `getAllMetadata()` | 获取所有插件元数据 |

## 插件状态

```typescript
enum PluginState {
  Pending = 'pending',
  Installing = 'installing',
  Installed = 'installed',
  Uninstalling = 'uninstalling',
  Failed = 'failed'
}
```

## 元数据信息

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
