---
title: "Plugin System"
---

The plugin system allows you to extend ECS Framework functionality in a modular way. Through plugins, you can encapsulate specific features (such as network synchronization, physics engines, debugging tools, etc.) and reuse them across multiple projects.

## Overview

### What is a Plugin

A plugin is a class that implements the `IPlugin` interface and can be dynamically installed into the framework at runtime. Plugins can:

- Register custom services to the service container
- Add systems to scenes
- Register custom components
- Extend framework functionality

### Advantages of Plugins

- **Modular**: Encapsulate functionality as independent modules, improving code maintainability
- **Reusable**: Same plugin can be used across multiple projects
- **Decoupled**: Core framework separated from extended functionality
- **Hot-swappable**: Dynamically install and uninstall plugins at runtime

## Quick Start

### Creating Your First Plugin

Create a simple debug plugin:

```typescript
import { IPlugin, Core, ServiceContainer } from '@esengine/ecs-framework';

class DebugPlugin implements IPlugin {
    readonly name = 'debug-plugin';
    readonly version = '1.0.0';

    install(core: Core, services: ServiceContainer): void {
        console.log('Debug plugin installed');

        // Can register services, add systems, etc. here
    }

    uninstall(): void {
        console.log('Debug plugin uninstalled');
        // Clean up resources
    }
}
```

### Installing a Plugin

Use `Core.installPlugin()` to install a plugin:

```typescript
import { Core } from '@esengine/ecs-framework';

// Initialize Core
Core.create({ debug: true });

// Install plugin
await Core.installPlugin(new DebugPlugin());

// Check if plugin is installed
if (Core.isPluginInstalled('debug-plugin')) {
    console.log('Debug plugin is running');
}
```

### Uninstalling a Plugin

```typescript
// Uninstall plugin
await Core.uninstallPlugin('debug-plugin');
```

### Getting Plugin Instance

```typescript
// Get installed plugin
const plugin = Core.getPlugin('debug-plugin');
if (plugin) {
    console.log(`Plugin version: ${plugin.version}`);
}
```

## Plugin Development

### IPlugin Interface

All plugins must implement the `IPlugin` interface:

```typescript
export interface IPlugin {
    // Unique plugin name
    readonly name: string;

    // Plugin version (semver recommended)
    readonly version: string;

    // Dependencies on other plugins (optional)
    readonly dependencies?: readonly string[];

    // Called when plugin is installed
    install(core: Core, services: ServiceContainer): void | Promise<void>;

    // Called when plugin is uninstalled
    uninstall(): void | Promise<void>;
}
```

### Plugin Lifecycle

#### install Method

Called when the plugin is installed, used to initialize the plugin:

```typescript
class MyPlugin implements IPlugin {
    readonly name = 'my-plugin';
    readonly version = '1.0.0';

    install(core: Core, services: ServiceContainer): void {
        // 1. Register services
        services.registerSingleton(MyService);

        // 2. Access current scene
        const scene = core.scene;
        if (scene) {
            // 3. Add systems
            scene.addSystem(new MySystem());
        }

        // 4. Other initialization logic
        console.log('Plugin initialized');
    }

    uninstall(): void {
        // Cleanup logic
    }
}
```

#### uninstall Method

Called when the plugin is uninstalled, used to clean up resources:

```typescript
class MyPlugin implements IPlugin {
    readonly name = 'my-plugin';
    readonly version = '1.0.0';
    private myService?: MyService;

    install(core: Core, services: ServiceContainer): void {
        this.myService = new MyService();
        services.registerInstance(MyService, this.myService);
    }

    uninstall(): void {
        // Clean up service
        if (this.myService) {
            this.myService.dispose();
            this.myService = undefined;
        }

        // Remove event listeners
        // Release other resources
    }
}
```

### Async Plugins

Plugin `install` and `uninstall` methods both support async:

```typescript
class AsyncPlugin implements IPlugin {
    readonly name = 'async-plugin';
    readonly version = '1.0.0';

    async install(core: Core, services: ServiceContainer): Promise<void> {
        // Async resource loading
        const config = await fetch('/plugin-config.json').then(r => r.json());

        // Initialize service with loaded config
        const service = new MyService(config);
        services.registerInstance(MyService, service);
    }

    async uninstall(): Promise<void> {
        // Async cleanup
        await this.saveState();
    }

    private async saveState() {
        // Save plugin state
    }
}

// Usage
await Core.installPlugin(new AsyncPlugin());
```

### Registering Services

Plugins can register their own services to the service container:

```typescript
import { IService } from '@esengine/ecs-framework';

class NetworkService implements IService {
    connect(url: string) {
        console.log(`Connecting to ${url}`);
    }

    dispose(): void {
        console.log('Network service disposed');
    }
}

class NetworkPlugin implements IPlugin {
    readonly name = 'network-plugin';
    readonly version = '1.0.0';

    install(core: Core, services: ServiceContainer): void {
        // Register network service
        services.registerSingleton(NetworkService);

        // Resolve and use service
        const network = services.resolve(NetworkService);
        network.connect('ws://localhost:8080');
    }

    uninstall(): void {
        // Service container automatically calls service's dispose method
    }
}
```

### Adding Systems

Plugins can add custom systems to scenes:

```typescript
import { EntitySystem, Matcher } from '@esengine/ecs-framework';

class PhysicsSystem extends EntitySystem {
    constructor() {
        super(Matcher.empty().all(PhysicsBody));
    }

    protected process(entities: readonly Entity[]): void {
        // Physics simulation logic
    }
}

class PhysicsPlugin implements IPlugin {
    readonly name = 'physics-plugin';
    readonly version = '1.0.0';
    private physicsSystem?: PhysicsSystem;

    install(core: Core, services: ServiceContainer): void {
        const scene = core.scene;
        if (scene) {
            this.physicsSystem = new PhysicsSystem();
            scene.addSystem(this.physicsSystem);
        }
    }

    uninstall(): void {
        // Remove system
        if (this.physicsSystem) {
            const scene = Core.scene;
            if (scene) {
                scene.removeSystem(this.physicsSystem);
            }
            this.physicsSystem = undefined;
        }
    }
}
```

## Dependency Management

### Declaring Dependencies

Plugins can declare dependencies on other plugins:

```typescript
class AdvancedPhysicsPlugin implements IPlugin {
    readonly name = 'advanced-physics';
    readonly version = '2.0.0';

    // Declare dependency on base physics plugin
    readonly dependencies = ['physics-plugin'] as const;

    install(core: Core, services: ServiceContainer): void {
        // Can safely use services provided by physics-plugin
        const physicsService = services.resolve(PhysicsService);
        // ...
    }

    uninstall(): void {
        // Cleanup
    }
}
```

### Dependency Checking

The framework automatically checks dependency relationships and throws errors if dependencies are unmet:

```typescript
// Error: physics-plugin not installed
try {
    await Core.installPlugin(new AdvancedPhysicsPlugin());
} catch (error) {
    console.error(error); // Plugin advanced-physics has unmet dependencies: physics-plugin
}

// Correct: Install dependency first
await Core.installPlugin(new PhysicsPlugin());
await Core.installPlugin(new AdvancedPhysicsPlugin());
```

### Uninstall Order

The framework checks dependency relationships, preventing uninstallation of plugins that other plugins depend on:

```typescript
await Core.installPlugin(new PhysicsPlugin());
await Core.installPlugin(new AdvancedPhysicsPlugin());

// Error: physics-plugin is required by advanced-physics
try {
    await Core.uninstallPlugin('physics-plugin');
} catch (error) {
    console.error(error); // Cannot uninstall plugin physics-plugin: it is required by advanced-physics
}

// Correct: Uninstall dependent plugin first
await Core.uninstallPlugin('advanced-physics');
await Core.uninstallPlugin('physics-plugin');
```

## Plugin Management

### Managing via Core

The Core class provides convenient plugin management methods:

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

### Managing via PluginManager

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

## Practical Plugin Examples

### Network Sync Plugin

```typescript
import { IPlugin, IService, Core, ServiceContainer } from '@esengine/ecs-framework';

class NetworkSyncService implements IService {
    private ws?: WebSocket;

    connect(url: string) {
        this.ws = new WebSocket(url);
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };
    }

    private handleMessage(data: any) {
        // Handle network messages
    }

    dispose(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = undefined;
        }
    }
}

class NetworkSyncPlugin implements IPlugin {
    readonly name = 'network-sync';
    readonly version = '1.0.0';

    install(core: Core, services: ServiceContainer): void {
        // Register network service
        services.registerSingleton(NetworkSyncService);

        // Auto connect
        const network = services.resolve(NetworkSyncService);
        network.connect('ws://localhost:8080');
    }

    uninstall(): void {
        // Service will auto dispose
    }
}
```

### Performance Analysis Plugin

```typescript
class PerformanceAnalysisPlugin implements IPlugin {
    readonly name = 'performance-analysis';
    readonly version = '1.0.0';
    private frameCount = 0;
    private totalTime = 0;

    install(core: Core, services: ServiceContainer): void {
        const monitor = services.resolve(PerformanceMonitor);
        monitor.enable();

        // Periodically output performance report
        const timer = services.resolve(TimerManager);
        timer.schedule(5.0, true, null, () => {
            this.printReport(monitor);
        });
    }

    uninstall(): void {
        // Cleanup
    }

    private printReport(monitor: PerformanceMonitor) {
        console.log('=== Performance Report ===');
        console.log(`FPS: ${monitor.getFPS()}`);
        console.log(`Memory: ${monitor.getMemoryUsage()} MB`);
    }
}
```

## Best Practices

### Naming Convention

- Plugin names use lowercase letters and hyphens: `my-awesome-plugin`
- Version numbers follow semantic versioning: `1.0.0`

```typescript
class MyPlugin implements IPlugin {
    readonly name = 'my-awesome-plugin';  // Good
    readonly version = '1.0.0';           // Good
}
```

### Resource Cleanup

Always clean up all resources created by the plugin in `uninstall`:

```typescript
class MyPlugin implements IPlugin {
    readonly name = 'my-plugin';
    readonly version = '1.0.0';
    private timerId?: number;
    private listener?: () => void;

    install(core: Core, services: ServiceContainer): void {
        // Add timer
        this.timerId = setInterval(() => {
            // ...
        }, 1000);

        // Add event listener
        this.listener = () => {};
        window.addEventListener('resize', this.listener);
    }

    uninstall(): void {
        // Clean up timer
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = undefined;
        }

        // Remove event listener
        if (this.listener) {
            window.removeEventListener('resize', this.listener);
            this.listener = undefined;
        }
    }
}
```

### Error Handling

Handle errors properly in plugins to avoid affecting the entire application:

```typescript
class MyPlugin implements IPlugin {
    readonly name = 'my-plugin';
    readonly version = '1.0.0';

    async install(core: Core, services: ServiceContainer): Promise<void> {
        try {
            // Operation that might fail
            await this.loadConfig();
        } catch (error) {
            console.error('Failed to load plugin config:', error);
            throw error; // Re-throw to let framework know installation failed
        }
    }

    async uninstall(): Promise<void> {
        try {
            await this.cleanup();
        } catch (error) {
            console.error('Failed to cleanup plugin:', error);
            // Cleanup failure shouldn't block uninstall
        }
    }

    private async loadConfig() {
        // Load configuration
    }

    private async cleanup() {
        // Cleanup
    }
}
```

### Configuration

Allow users to configure plugin behavior:

```typescript
interface NetworkPluginConfig {
    serverUrl: string;
    autoReconnect: boolean;
    timeout: number;
}

class NetworkPlugin implements IPlugin {
    readonly name = 'network-plugin';
    readonly version = '1.0.0';

    constructor(private config: NetworkPluginConfig) {}

    install(core: Core, services: ServiceContainer): void {
        const network = new NetworkService(this.config);
        services.registerInstance(NetworkService, network);
    }

    uninstall(): void {
        // Cleanup
    }
}

// Usage
const plugin = new NetworkPlugin({
    serverUrl: 'ws://localhost:8080',
    autoReconnect: true,
    timeout: 5000
});

await Core.installPlugin(plugin);
```

## Common Issues

### Plugin Installation Failed

**Problem**: Plugin throws error during installation

**Causes**:
- Dependencies not met
- Exception in install method
- Service registration conflict

**Solutions**:
1. Check if dependencies are installed
2. Check error logs
3. Ensure service names don't conflict

### Plugin Still Has Side Effects After Uninstall

**Problem**: After uninstalling plugin, plugin functionality is still running

**Cause**: Resources not properly cleaned up in uninstall method

**Solution**: Ensure cleanup in uninstall:
- Timers
- Event listeners
- WebSocket connections
- System references

### When to Use Plugins

**Good for plugins**:
- Optional features (debug tools, performance analysis)
- Third-party integrations (network libraries, physics engines)
- Functionality modules reused across projects

**Not suitable for plugins**:
- Core game logic
- Simple utility classes
- Project-specific features

## Related Links

- [Service Container](./service-container/) - Using service container in plugins
- [System Architecture](./system/) - Adding systems in plugins
- [Quick Start](./getting-started/) - Core initialization and basic usage
