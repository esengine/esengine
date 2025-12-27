---
title: "PluginServiceRegistry"
description: "类型安全的插件服务注册表"
---

`PluginServiceRegistry` 是基于 `ServiceToken` 的类型安全服务注册表，专门用于跨插件共享服务。

## 设计原则

1. **类型安全** - 使用 ServiceToken 携带类型信息
2. **显式依赖** - 通过导入 token 明确表达依赖关系
3. **可选依赖** - `get` 返回 undefined，`require` 抛异常
4. **单一职责** - 只负责服务注册和查询，不涉及生命周期管理
5. **谁定义接口，谁导出 Token** - 各模块定义自己的接口和 Token

## ServiceToken

服务令牌用于类型安全的服务注册和获取：

```typescript
import { createServiceToken, ServiceToken } from '@esengine/ecs-framework';

// 定义接口
interface IAssetManager {
    load(path: string): Promise<any>;
    unload(path: string): void;
}

// 创建服务令牌
const AssetManagerToken = createServiceToken<IAssetManager>('assetManager');
```

### 为什么使用 ServiceToken

- **跨包类型安全**: TypeScript 在跨包类型解析时保留泛型类型信息
- **全局唯一**: 使用 `Symbol.for()` 确保相同名称的令牌在不同模块中引用同一个 Symbol
- **显式依赖**: 通过导入 token 明确表达模块间的依赖关系

## 基础使用

### 注册服务

```typescript
import { PluginServiceRegistry, createServiceToken } from '@esengine/ecs-framework';

// 创建注册表
const registry = new PluginServiceRegistry();

// 定义令牌
interface ILogger {
    log(message: string): void;
}
const LoggerToken = createServiceToken<ILogger>('logger');

// 注册服务
const logger: ILogger = {
    log: (msg) => console.log(msg)
};
registry.register(LoggerToken, logger);
```

### 获取服务

```typescript
// 可选获取（返回 undefined 如果不存在）
const logger = registry.get(LoggerToken);
if (logger) {
    logger.log('Hello');
}

// 必需获取（抛异常如果不存在）
try {
    const logger = registry.require(LoggerToken);
    logger.log('Hello');
} catch (e) {
    console.error('Logger not registered');
}
```

### 检查和注销

```typescript
// 检查是否已注册
if (registry.has(LoggerToken)) {
    // ...
}

// 注销服务
registry.unregister(LoggerToken);

// 清空所有服务
registry.clear();
```

## 在插件中使用

### 定义模块的服务令牌

每个模块应在 `tokens.ts` 中定义自己的接口和令牌：

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

### 在插件中注册服务

```typescript
// packages/asset-system/src/AssetSystemPlugin.ts
import { Core } from '@esengine/ecs-framework';
import { AssetManagerToken, IAssetManager } from './tokens';
import { AssetManager } from './AssetManager';

export function installAssetSystem() {
    const assetManager = new AssetManager();

    // 注册到 Core 的插件服务注册表
    Core.pluginServices.register(AssetManagerToken, assetManager);
}
```

### 在其他插件中使用

```typescript
// packages/sprite/src/SpriteSystem.ts
import { Core } from '@esengine/ecs-framework';
import { AssetManagerToken, IAssetManager } from '@esengine/asset-system';

class SpriteSystem extends EntitySystem {
    private assetManager!: IAssetManager;

    onInitialize(): void {
        // 从插件服务注册表获取
        this.assetManager = Core.pluginServices.require(AssetManagerToken);
    }

    async loadSprite(path: string) {
        const texture = await this.assetManager.load<Texture>(path);
        // ...
    }
}
```

## 与 ServiceContainer 的区别

| 特性 | ServiceContainer | PluginServiceRegistry |
|------|------------------|----------------------|
| 用途 | 通用依赖注入 | 跨插件服务共享 |
| 标识符 | 类或 Symbol | ServiceToken |
| 生命周期 | Singleton/Transient | 无（由调用者管理） |
| 装饰器支持 | @Injectable, @InjectProperty | 无 |
| 类型安全 | 需要泛型断言 | Token 自带类型 |

## API 参考

### createServiceToken

```typescript
function createServiceToken<T>(name: string): ServiceToken<T>
```

创建服务令牌。使用 `Symbol.for()` 确保跨包共享。

### PluginServiceRegistry

| 方法 | 描述 |
|------|------|
| `register<T>(token, service)` | 注册服务 |
| `get<T>(token): T \| undefined` | 获取服务（可选） |
| `require<T>(token): T` | 获取服务（必需，不存在抛异常） |
| `has<T>(token): boolean` | 检查是否已注册 |
| `unregister<T>(token): boolean` | 注销服务 |
| `clear()` | 清空所有服务 |
| `dispose()` | 释放资源 |
