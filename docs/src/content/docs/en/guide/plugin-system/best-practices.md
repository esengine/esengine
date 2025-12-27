---
title: "Best Practices"
description: "Plugin design guidelines and common issues"
---

## Naming Convention

```typescript
class MyPlugin implements IPlugin {
  // Use lowercase letters and hyphens
  readonly name = 'my-awesome-plugin';  // OK

  // Follow semantic versioning
  readonly version = '1.0.0';           // OK
}
```

## Resource Cleanup

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
    // Clear timer
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

## Error Handling

```typescript
class MyPlugin implements IPlugin {
  readonly name = 'my-plugin';
  readonly version = '1.0.0';

  async install(core: Core, services: ServiceContainer): Promise<void> {
    try {
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
      // Don't block uninstall even if cleanup fails
    }
  }

  private async loadConfig() { /* ... */ }
  private async cleanup() { /* ... */ }
}
```

## Configuration

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

  uninstall(): void {}
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

**Causes**:
- Dependencies not satisfied
- Exception in install method
- Service registration conflict

**Solutions**:
1. Check if dependencies are installed
2. Review error logs
3. Ensure service names don't conflict

### Side Effects After Uninstall

**Cause**: Resources not properly cleaned in uninstall

**Solution**: Ensure uninstall cleans up:
- Timers
- Event listeners
- WebSocket connections
- System references

### When to Use Plugins

| Good for Plugins | Not Good for Plugins |
|------------------|---------------------|
| Optional features (debug tools, profiling) | Core game logic |
| Third-party integration (network libs, physics) | Simple utilities |
| Cross-project reusable modules | Project-specific features |
