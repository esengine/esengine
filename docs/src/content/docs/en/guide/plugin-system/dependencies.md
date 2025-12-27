---
title: "Dependency Management"
description: "Declare and check plugin dependencies"
---

## Declaring Dependencies

Plugins can declare dependencies on other plugins:

```typescript
class AdvancedPhysicsPlugin implements IPlugin {
  readonly name = 'advanced-physics';
  readonly version = '2.0.0';

  // Declare dependency on base physics plugin
  readonly dependencies = ['physics-plugin'] as const;

  install(core: Core, services: ServiceContainer): void {
    // Can safely use services from physics-plugin
    const physicsService = services.resolve(PhysicsService);
    // ...
  }

  uninstall(): void {
    // Cleanup
  }
}
```

## Dependency Checking

The framework automatically checks dependencies and throws an error if not satisfied:

```typescript
// Error: physics-plugin not installed
try {
  await Core.installPlugin(new AdvancedPhysicsPlugin());
} catch (error) {
  console.error(error);
  // Plugin advanced-physics has unmet dependencies: physics-plugin
}

// Correct: install dependency first
await Core.installPlugin(new PhysicsPlugin());
await Core.installPlugin(new AdvancedPhysicsPlugin());
```

## Uninstall Order

The framework checks dependencies to prevent uninstalling plugins required by others:

```typescript
await Core.installPlugin(new PhysicsPlugin());
await Core.installPlugin(new AdvancedPhysicsPlugin());

// Error: physics-plugin is required by advanced-physics
try {
  await Core.uninstallPlugin('physics-plugin');
} catch (error) {
  console.error(error);
  // Cannot uninstall plugin physics-plugin: it is required by advanced-physics
}

// Correct: uninstall dependent plugin first
await Core.uninstallPlugin('advanced-physics');
await Core.uninstallPlugin('physics-plugin');
```

## Dependency Graph Example

```
physics-plugin (base)
    ↑
advanced-physics (depends on physics-plugin)
    ↑
game-physics (depends on advanced-physics)
```

Install order: `physics-plugin` → `advanced-physics` → `game-physics`

Uninstall order: `game-physics` → `advanced-physics` → `physics-plugin`

## Multiple Dependencies

```typescript
class GamePlugin implements IPlugin {
  readonly name = 'game';
  readonly version = '1.0.0';

  // Declare multiple dependencies
  readonly dependencies = [
    'physics-plugin',
    'network-plugin',
    'audio-plugin'
  ] as const;

  install(core: Core, services: ServiceContainer): void {
    // All dependencies are available
    const physics = services.resolve(PhysicsService);
    const network = services.resolve(NetworkService);
    const audio = services.resolve(AudioService);
  }

  uninstall(): void {}
}
```
