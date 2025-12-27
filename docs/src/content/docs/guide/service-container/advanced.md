---
title: "高级用法"
description: "Symbol 模式、最佳实践、常见问题"
---

## 接口与 Symbol 标识符模式

在大型项目或需要跨平台适配的游戏中，推荐使用"接口 + Symbol.for 标识符"模式。

### 为什么使用 Symbol.for

- **跨包共享**: `Symbol.for('key')` 在全局 Symbol 注册表中创建/获取 Symbol
- **接口解耦**: 消费者只依赖接口定义，不依赖具体实现类
- **可替换实现**: 可以在运行时注入不同的实现（如测试 Mock、不同平台适配）

### 定义接口和标识符

```typescript
// IAudioService.ts
export interface IAudioService {
    dispose(): void;
    playSound(id: string): void;
    playMusic(id: string, loop?: boolean): void;
    stopMusic(): void;
    setVolume(volume: number): void;
    preload(id: string, url: string): Promise<void>;
}

// 使用 Symbol.for 确保跨包共享
export const IAudioService = Symbol.for('IAudioService');
```

### 实现接口

```typescript
// WebAudioService.ts - Web 平台
export class WebAudioService implements IAudioService {
    private audioContext: AudioContext;

    constructor() {
        this.audioContext = new AudioContext();
    }

    playSound(id: string): void {
        // Web Audio API 实现
    }

    dispose(): void {
        this.audioContext.close();
    }
}

// WechatAudioService.ts - 微信小游戏平台
export class WechatAudioService implements IAudioService {
    playSound(id: string): void {
        // 微信小游戏 API 实现
    }

    dispose(): void {
        // 清理
    }
}
```

### 注册和使用

```typescript
// 根据平台注册不同实现
if (typeof wx !== 'undefined') {
    Core.services.registerInstance(IAudioService, new WechatAudioService());
} else {
    Core.services.registerInstance(IAudioService, new WebAudioService());
}

// 业务代码中使用 - 不关心具体实现
const audio = Core.services.resolve<IAudioService>(IAudioService);
audio.playSound('explosion');
```

### Symbol vs Symbol.for

```typescript
// Symbol() - 每次创建唯一的 Symbol
const sym1 = Symbol('test');
const sym2 = Symbol('test');
console.log(sym1 === sym2); // false

// Symbol.for() - 在全局注册表中共享
const sym3 = Symbol.for('test');
const sym4 = Symbol.for('test');
console.log(sym3 === sym4); // true
```

## 循环依赖检测

服务容器会自动检测循环依赖：

```typescript
// A 依赖 B，B 依赖 A
@Injectable()
class ServiceA implements IService {
    @InjectProperty(ServiceB)
    private b!: ServiceB;
    dispose(): void {}
}

@Injectable()
class ServiceB implements IService {
    @InjectProperty(ServiceA)
    private a!: ServiceA;
    dispose(): void {}
}

// 解析时会抛出错误
// Circular dependency detected: ServiceA -> ServiceB -> ServiceA
```

## 服务管理

```typescript
// 获取所有已注册的服务类型
const types = Core.services.getRegisteredServices();

// 获取所有已实例化的服务实例
const instances = Core.services.getAll();

// 注销单个服务
Core.services.unregister(MyService);

// 清空所有服务（会调用每个服务的dispose方法）
Core.services.clear();
```

## 最佳实践

### 服务命名

服务类名应该以 `Service` 或 `Manager` 结尾：

```typescript
class PlayerService implements IService {}
class AudioManager implements IService {}
class NetworkService implements IService {}
```

### 资源清理

始终在 `dispose()` 方法中清理资源：

```typescript
class ResourceService implements IService {
    private resources: Map<string, Resource> = new Map();

    dispose(): void {
        for (const resource of this.resources.values()) {
            resource.release();
        }
        this.resources.clear();
    }
}
```

### 避免过度使用

不要把所有类都注册为服务，服务应该是：

- 全局单例或需要共享状态
- 需要在多处使用
- 生命周期需要管理
- 需要依赖注入

### 依赖方向

保持清晰的依赖方向，避免循环依赖：

```
高层服务 -> 中层服务 -> 底层服务
GameLogic -> DataService -> ConfigService
```

### 何时使用单例 vs 瞬时

- **单例**: 管理器类、配置、缓存、状态管理
- **瞬时**: 命令对象、请求处理器、临时任务

## 常见问题

### 服务未注册错误

**问题**: `Error: Service MyService is not registered`

**解决**:
```typescript
// 确保服务已注册
Core.services.registerSingleton(MyService);

// 或者使用tryResolve
const service = Core.services.tryResolve(MyService);
if (!service) {
    console.log('Service not found');
}
```

### 循环依赖错误

**问题**: `Circular dependency detected`

**解决**: 重新设计服务依赖关系，引入中间服务或使用事件系统解耦。
