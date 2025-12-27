---
title: "Service Container Overview"
description: "ECS Framework Dependency Injection Container"
---

The ServiceContainer is the dependency injection container of ECS Framework, responsible for managing the registration, resolution, and lifecycle of all services.

## What is a Service Container

The service container is a lightweight dependency injection (DI) container that provides:

- **Service Registration**: Register service types into the container
- **Service Resolution**: Retrieve service instances from the container
- **Lifecycle Management**: Automatically manage service instance creation and destruction
- **Dependency Injection**: Automatically resolve dependencies between services

## Core Concepts

### Service

A service is a class that implements the `IService` interface and must provide a `dispose()` method for resource cleanup:

```typescript
import { IService } from '@esengine/ecs-framework';

class MyService implements IService {
    constructor() {
        // Initialization logic
    }

    dispose(): void {
        // Cleanup resources
    }
}
```

### Service Identifier

Service identifiers are used to uniquely identify a service in the container. Two types are supported:

- **Class Constructor**: Use the service class directly as identifier
- **Symbol**: Use Symbol as identifier (recommended for interface abstractions)

```typescript
// Method 1: Using class as identifier
Core.services.registerSingleton(DataService);
const data = Core.services.resolve(DataService);

// Method 2: Using Symbol as identifier
const IFileSystem = Symbol.for('IFileSystem');
Core.services.registerInstance(IFileSystem, new TauriFileSystem());
const fs = Core.services.resolve<IFileSystem>(IFileSystem);
```

### Lifecycle

- **Singleton**: Only one instance throughout the application lifecycle
- **Transient**: Creates a new instance on each resolution

## Container Hierarchy

ECS Framework provides three levels of service containers:

```
Core.services (Application global)
  └─ World.services (World level)
      └─ Scene.services (Scene level)
```

```typescript
// Core level
const container = Core.services;

// World level
const worldContainer = world.services;

// Scene level
const sceneContainer = scene.services;
```

## Basic Usage

### Registering Services

```typescript
// Singleton service
Core.services.registerSingleton(DataService);

// Transient service
Core.services.registerTransient(CommandService);

// Register instance
Core.services.registerInstance(ConfigService, config);

// Factory function
Core.services.registerSingleton(LoggerService, (container) => {
    const logger = new LoggerService();
    logger.setLevel('debug');
    return logger;
});
```

### Resolving Services

```typescript
// Resolve service (throws if not registered)
const dataService = Core.services.resolve(DataService);

// Try resolve (returns null if not registered)
const optional = Core.services.tryResolve(OptionalService);

// Check if registered
if (Core.services.isRegistered(DataService)) {
    // ...
}
```

## Next Steps

- [Built-in Services](./built-in-services/) - Framework provided services
- [Dependency Injection](./dependency-injection/) - Decorators and auto-injection
- [PluginServiceRegistry](./plugin-service-registry/) - Plugin service registry
- [Advanced Usage](./advanced/) - Symbol patterns, best practices
