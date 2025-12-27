---
title: "Logging System"
description: "Multi-level logging with colors, prefixes, and flexible configuration"
---

The ECS framework provides a powerful hierarchical logging system supporting multiple log levels, color output, custom prefixes, and flexible configuration options.

## Basic Concepts

- **Log Levels**: Debug < Info < Warn < Error < Fatal < None
- **Logger**: Named log outputter, each module can have its own logger
- **Logger Manager**: Singleton managing all loggers globally
- **Color Config**: Supports console color output

## Log Levels

```typescript
import { LogLevel } from '@esengine/ecs-framework';

LogLevel.Debug   // 0 - Debug information
LogLevel.Info    // 1 - General information
LogLevel.Warn    // 2 - Warning information
LogLevel.Error   // 3 - Error information
LogLevel.Fatal   // 4 - Fatal errors
LogLevel.None    // 5 - No output
```

## Basic Usage

### Using Default Logger

```typescript
import { Logger } from '@esengine/ecs-framework';

class GameSystem extends EntitySystem {
  protected process(entities: readonly Entity[]): void {
    Logger.debug('Processing entities:', entities.length);
    Logger.info('System running normally');
    Logger.warn('Performance issue detected');
    Logger.error('Error during processing', new Error('Example'));
    Logger.fatal('Fatal error, system stopping');
  }
}
```

### Creating Named Logger

```typescript
import { createLogger } from '@esengine/ecs-framework';

class MovementSystem extends EntitySystem {
  private logger = createLogger('MovementSystem');

  protected process(entities: readonly Entity[]): void {
    this.logger.info(`Processing ${entities.length} moving entities`);

    for (const entity of entities) {
      const position = entity.getComponent(Position);
      this.logger.debug(`Entity ${entity.id} moved to (${position.x}, ${position.y})`);
    }
  }
}
```

## Log Configuration

### Set Global Log Level

```typescript
import { setGlobalLogLevel, LogLevel } from '@esengine/ecs-framework';

// Development: show all logs
setGlobalLogLevel(LogLevel.Debug);

// Production: show warnings and above
setGlobalLogLevel(LogLevel.Warn);

// Disable all logs
setGlobalLogLevel(LogLevel.None);
```

### Custom Logger Configuration

```typescript
import { ConsoleLogger, LogLevel } from '@esengine/ecs-framework';

// Development logger
const debugLogger = new ConsoleLogger({
  level: LogLevel.Debug,
  enableTimestamp: true,
  enableColors: true,
  prefix: 'DEV'
});

// Production logger
const productionLogger = new ConsoleLogger({
  level: LogLevel.Error,
  enableTimestamp: true,
  enableColors: false,
  prefix: 'PROD'
});
```

## Color Configuration

```typescript
import { Colors, setLoggerColors } from '@esengine/ecs-framework';

setLoggerColors({
  debug: Colors.BRIGHT_BLACK,
  info: Colors.BLUE,
  warn: Colors.YELLOW,
  error: Colors.RED,
  fatal: Colors.BRIGHT_RED
});
```

## Advanced Features

### Hierarchical Loggers

```typescript
import { LoggerManager } from '@esengine/ecs-framework';

const manager = LoggerManager.getInstance();

// Create child loggers
const movementLogger = manager.createChildLogger('GameSystems', 'Movement');
const renderLogger = manager.createChildLogger('GameSystems', 'Render');

// Child logger shows full path: [GameSystems.Movement]
movementLogger.debug('Movement system initialized');
```

### Third-Party Logger Integration

```typescript
import { setLoggerFactory } from '@esengine/ecs-framework';

// Integrate with Winston
setLoggerFactory((name?: string) => winston.createLogger({ /* ... */ }));

// Integrate with Pino
setLoggerFactory((name?: string) => pino({ name }));

// Integrate with NestJS Logger
setLoggerFactory((name?: string) => new Logger(name));
```

### Custom Output

```typescript
const fileLogger = new ConsoleLogger({
  level: LogLevel.Info,
  output: (level: LogLevel, message: string) => {
    this.writeToFile(LogLevel[level], message);
  }
});
```

## Best Practices

### 1. Choose Appropriate Log Levels

```typescript
// Debug - Detailed debug info
this.logger.debug('Variable values', { x: 10, y: 20 });

// Info - Important state changes
this.logger.info('System startup complete');

// Warn - Abnormal but non-fatal
this.logger.warn('Resource not found, using default');

// Error - Errors but program can continue
this.logger.error('Save failed, will retry', new Error('Network timeout'));

// Fatal - Fatal errors, program cannot continue
this.logger.fatal('Out of memory, exiting');
```

### 2. Structured Log Data

```typescript
this.logger.info('User action', {
  userId: 12345,
  action: 'move',
  position: { x: 100, y: 200 },
  timestamp: Date.now()
});
```

### 3. Avoid Performance Issues

```typescript
// ✅ Check log level before expensive computation
if (this.logger.debug) {
  const expensiveData = this.calculateExpensiveDebugInfo();
  this.logger.debug('Debug info', expensiveData);
}
```

### 4. Environment-Based Configuration

```typescript
class LoggingConfiguration {
  public static setupLogging(): void {
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      setGlobalLogLevel(LogLevel.Debug);
      setLoggerColors({
        debug: Colors.CYAN,
        info: Colors.GREEN,
        warn: Colors.YELLOW,
        error: Colors.RED,
        fatal: Colors.BRIGHT_RED
      });
    } else {
      setGlobalLogLevel(LogLevel.Warn);
      LoggerManager.getInstance().resetColors();
    }
  }
}
```
