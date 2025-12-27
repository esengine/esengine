---
title: "依赖注入"
description: "装饰器和自动依赖注入"
---

ECS Framework 提供了装饰器来简化依赖注入。

## @Injectable 装饰器

标记类为可注入的服务：

```typescript
import { Injectable, IService } from '@esengine/ecs-framework';

@Injectable()
class GameService implements IService {
    constructor() {
        console.log('GameService created');
    }

    dispose(): void {
        console.log('GameService disposed');
    }
}
```

## @InjectProperty 装饰器

通过属性装饰器注入依赖。注入时机是在构造函数执行后、`onInitialize()` 调用前完成：

```typescript
import { Injectable, InjectProperty, IService } from '@esengine/ecs-framework';

@Injectable()
class PlayerService implements IService {
    @InjectProperty(DataService)
    private data!: DataService;

    @InjectProperty(GameService)
    private game!: GameService;

    dispose(): void {
        // 清理资源
    }
}
```

### 在 EntitySystem 中使用

```typescript
@Injectable()
class CombatSystem extends EntitySystem {
    @InjectProperty(TimeService)
    private timeService!: TimeService;

    @InjectProperty(AudioService)
    private audio!: AudioService;

    constructor() {
        super(Matcher.all(Health, Attack));
    }

    onInitialize(): void {
        // 此时属性已注入完成，可以安全使用
        console.log('Delta time:', this.timeService.getDeltaTime());
    }

    processEntity(entity: Entity): void {
        this.audio.playSound('attack');
    }
}
```

> **注意**: 属性声明时使用 `!` 断言（如 `private data!: DataService`），表示该属性会在使用前被注入。

## 注册可注入服务

使用 `registerInjectable` 自动处理依赖注入：

```typescript
import { registerInjectable } from '@esengine/ecs-framework';

// 注册服务（会自动解析 @InjectProperty 依赖）
registerInjectable(Core.services, PlayerService);

// 解析时会自动注入属性依赖
const player = Core.services.resolve(PlayerService);
```

## @Updatable 装饰器

标记服务为可更新的，使其在每帧自动被调用：

```typescript
import { Injectable, Updatable, IService, IUpdatable } from '@esengine/ecs-framework';

@Injectable()
@Updatable()  // 默认优先级为0
class PhysicsService implements IService, IUpdatable {
    update(deltaTime?: number): void {
        // 每帧更新物理模拟
    }

    dispose(): void {}
}

// 指定更新优先级（数值越小越先执行）
@Injectable()
@Updatable(10)
class RenderService implements IService, IUpdatable {
    update(deltaTime?: number): void {
        // 每帧渲染
    }

    dispose(): void {}
}
```

使用 `@Updatable` 装饰器的服务会被 Core 自动调用：

```typescript
function gameLoop(deltaTime: number) {
    Core.update(deltaTime);  // 自动更新所有可更新服务
}
```

## 服务间依赖

推荐使用 `@InjectProperty` 进行服务间依赖注入：

```typescript
@Injectable()
class ConfigService implements IService {
    private config: any = {};

    get(key: string) {
        return this.config[key];
    }

    dispose(): void {
        this.config = {};
    }
}

@Injectable()
class NetworkService implements IService {
    @InjectProperty(ConfigService)
    private config!: ConfigService;

    onInitialize(): void {
        // 在 onInitialize 中使用注入的服务
        const apiUrl = this.config.get('apiUrl');
    }

    dispose(): void {}
}

// 注册服务（按依赖顺序）
registerInjectable(Core.services, ConfigService);
registerInjectable(Core.services, NetworkService);
```

## @Inject 构造函数装饰器

:::caution[兼容性警告]
`@Inject` 构造函数参数装饰器在 **Cocos Creator** 和 **LayaAir** 中可能不被支持，因为这些引擎的打包工具对构造函数参数装饰器的处理可能存在问题。

**推荐**: 始终使用 `@InjectProperty` 属性装饰器，它在所有平台上都能正常工作。
:::

```typescript
// ⚠️ 不推荐：构造函数注入（Cocos/Laya 可能不支持）
@Injectable()
class NetworkService implements IService {
    constructor(
        @Inject(ConfigService) private config: ConfigService
    ) {}
}

// ✅ 推荐：属性注入（所有平台兼容）
@Injectable()
class NetworkService implements IService {
    @InjectProperty(ConfigService)
    private config!: ConfigService;

    onInitialize(): void {
        // 在这里使用注入的服务
    }
}
```
