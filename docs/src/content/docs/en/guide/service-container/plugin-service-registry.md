---
title: "PluginServiceRegistry"
description: "Type-safe plugin service registry"
---

`PluginServiceRegistry` is a type-safe service registry based on `ServiceToken`, designed for sharing services between plugins.

## Design Principles

1. **Type Safety** - Uses ServiceToken to carry type information
2. **Explicit Dependencies** - Express dependencies clearly by importing tokens
3. **Optional Dependencies** - `get` returns undefined, `require` throws
4. **Single Responsibility** - Only handles registration and lookup, not lifecycle
5. **Who Defines the Interface, Exports the Token** - Each module defines its own interfaces and tokens

## ServiceToken

Service tokens are used for type-safe service registration and retrieval:

```typescript
import { createServiceToken, ServiceToken } from '@esengine/ecs-framework';

// Define interface
interface IAssetManager {
    load(path: string): Promise<any>;
    unload(path: string): void;
}

// Create service token
const AssetManagerToken = createServiceToken<IAssetManager>('assetManager');
```

### Why Use ServiceToken

- **Cross-package Type Safety**: TypeScript preserves generic type information across packages
- **Globally Unique**: Uses `Symbol.for()` to ensure same-named tokens reference the same Symbol
- **Explicit Dependencies**: Clearly express inter-module dependencies by importing tokens

## Basic Usage

### Registering Services

```typescript
import { PluginServiceRegistry, createServiceToken } from '@esengine/ecs-framework';

// Create registry
const registry = new PluginServiceRegistry();

// Define token
interface ILogger {
    log(message: string): void;
}
const LoggerToken = createServiceToken<ILogger>('logger');

// Register service
const logger: ILogger = {
    log: (msg) => console.log(msg)
};
registry.register(LoggerToken, logger);
```

### Getting Services

```typescript
// Optional get (returns undefined if not exists)
const logger = registry.get(LoggerToken);
if (logger) {
    logger.log('Hello');
}

// Required get (throws if not exists)
try {
    const logger = registry.require(LoggerToken);
    logger.log('Hello');
} catch (e) {
    console.error('Logger not registered');
}
```

### Check and Unregister

```typescript
// Check if registered
if (registry.has(LoggerToken)) {
    // ...
}

// Unregister service
registry.unregister(LoggerToken);

// Clear all services
registry.clear();
```

## Usage in Plugins

### Define Module Service Tokens

Each module should define its interfaces and tokens in `tokens.ts`:

```typescript
// packages/asset-system/src/tokens.ts
import { createServiceToken } from '@esengine/ecs-framework';

export interface IAssetManager {
    load<T>(path: string): Promise<T>;
    unload(path: string): void;
    getCache(path: string): any | undefined;
}

export const AssetManagerToken = createServiceToken<IAssetManager>('assetManager');
```

### Register Service in Plugin

```typescript
// packages/asset-system/src/AssetSystemPlugin.ts
import { Core } from '@esengine/ecs-framework';
import { AssetManagerToken, IAssetManager } from './tokens';
import { AssetManager } from './AssetManager';

export function installAssetSystem() {
    const assetManager = new AssetManager();

    // Register to Core's plugin service registry
    Core.pluginServices.register(AssetManagerToken, assetManager);
}
```

### Use in Other Plugins

```typescript
// packages/sprite/src/SpriteSystem.ts
import { Core } from '@esengine/ecs-framework';
import { AssetManagerToken, IAssetManager } from '@esengine/asset-system';

class SpriteSystem extends EntitySystem {
    private assetManager!: IAssetManager;

    onInitialize(): void {
        // Get from plugin service registry
        this.assetManager = Core.pluginServices.require(AssetManagerToken);
    }

    async loadSprite(path: string) {
        const texture = await this.assetManager.load<Texture>(path);
        // ...
    }
}
```

## Difference from ServiceContainer

| Feature | ServiceContainer | PluginServiceRegistry |
|---------|------------------|----------------------|
| Purpose | General DI | Cross-plugin service sharing |
| Identifier | Class or Symbol | ServiceToken |
| Lifecycle | Singleton/Transient | None (caller managed) |
| Decorator Support | @Injectable, @InjectProperty | None |
| Type Safety | Requires generic assertion | Token carries type |

## API Reference

### createServiceToken

```typescript
function createServiceToken<T>(name: string): ServiceToken<T>
```

Creates a service token. Uses `Symbol.for()` to ensure cross-package sharing.

### PluginServiceRegistry

| Method | Description |
|--------|-------------|
| `register<T>(token, service)` | Register a service |
| `get<T>(token): T \| undefined` | Get service (optional) |
| `require<T>(token): T` | Get service (required, throws if missing) |
| `has<T>(token): boolean` | Check if registered |
| `unregister<T>(token): boolean` | Unregister service |
| `clear()` | Clear all services |
| `dispose()` | Dispose resources |
