---
title: "Advanced Usage"
description: "Symbol patterns, best practices, common issues"
---

## Interface and Symbol Identifier Pattern

For large projects or games requiring cross-platform adaptation, the "Interface + Symbol.for identifier" pattern is recommended.

### Why Use Symbol.for

- **Cross-package Sharing**: `Symbol.for('key')` creates/retrieves Symbol from global registry
- **Interface Decoupling**: Consumers only depend on interface definitions, not concrete implementations
- **Replaceable Implementations**: Can inject different implementations at runtime (test mocks, platform adapters)

### Define Interface and Identifier

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

// Use Symbol.for to ensure cross-package sharing
export const IAudioService = Symbol.for('IAudioService');
```

### Implement Interface

```typescript
// WebAudioService.ts - Web platform
export class WebAudioService implements IAudioService {
    private audioContext: AudioContext;

    constructor() {
        this.audioContext = new AudioContext();
    }

    playSound(id: string): void {
        // Web Audio API implementation
    }

    dispose(): void {
        this.audioContext.close();
    }
}

// WechatAudioService.ts - WeChat Mini Game platform
export class WechatAudioService implements IAudioService {
    playSound(id: string): void {
        // WeChat Mini Game API implementation
    }

    dispose(): void {
        // Cleanup
    }
}
```

### Register and Use

```typescript
// Register different implementations based on platform
if (typeof wx !== 'undefined') {
    Core.services.registerInstance(IAudioService, new WechatAudioService());
} else {
    Core.services.registerInstance(IAudioService, new WebAudioService());
}

// Business code - doesn't care about concrete implementation
const audio = Core.services.resolve<IAudioService>(IAudioService);
audio.playSound('explosion');
```

### Symbol vs Symbol.for

```typescript
// Symbol() - Creates unique Symbol each time
const sym1 = Symbol('test');
const sym2 = Symbol('test');
console.log(sym1 === sym2); // false

// Symbol.for() - Shares in global registry
const sym3 = Symbol.for('test');
const sym4 = Symbol.for('test');
console.log(sym3 === sym4); // true
```

## Circular Dependency Detection

The service container automatically detects circular dependencies:

```typescript
// A depends on B, B depends on A
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

// Throws error on resolution
// Circular dependency detected: ServiceA -> ServiceB -> ServiceA
```

## Service Management

```typescript
// Get all registered service types
const types = Core.services.getRegisteredServices();

// Get all instantiated service instances
const instances = Core.services.getAll();

// Unregister single service
Core.services.unregister(MyService);

// Clear all services (calls dispose on each)
Core.services.clear();
```

## Best Practices

### Service Naming

Service class names should end with `Service` or `Manager`:

```typescript
class PlayerService implements IService {}
class AudioManager implements IService {}
class NetworkService implements IService {}
```

### Resource Cleanup

Always clean up resources in the `dispose()` method:

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

### Avoid Overuse

Don't register every class as a service. Services should be:

- Global singletons or need shared state
- Used in multiple places
- Need lifecycle management
- Require dependency injection

### Dependency Direction

Maintain clear dependency direction, avoid circular dependencies:

```
High-level services -> Mid-level services -> Low-level services
GameLogic -> DataService -> ConfigService
```

### When to Use Singleton vs Transient

- **Singleton**: Manager classes, config, cache, state management
- **Transient**: Command objects, request handlers, temporary tasks

## Common Issues

### Service Not Registered Error

**Problem**: `Error: Service MyService is not registered`

**Solution**:
```typescript
// Ensure service is registered
Core.services.registerSingleton(MyService);

// Or use tryResolve
const service = Core.services.tryResolve(MyService);
if (!service) {
    console.log('Service not found');
}
```

### Circular Dependency Error

**Problem**: `Circular dependency detected`

**Solution**: Redesign service dependencies, introduce intermediate services or use event system for decoupling.
