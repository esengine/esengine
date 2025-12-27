---
title: "Debugging & Monitoring"
description: "Scene statistics, performance monitoring and debugging"
---

Scene includes complete debugging and performance monitoring features.

## Scene Statistics

```typescript
class StatsScene extends Scene {
  public showStats(): void {
    const stats = this.getStats();
    console.log(`Entity count: ${stats.entityCount}`);
    console.log(`System count: ${stats.processorCount}`);
    console.log('Component storage stats:', stats.componentStorageStats);
  }
}
```

## Debug Information

```typescript
public showDebugInfo(): void {
  const debugInfo = this.getDebugInfo();
  console.log('Scene debug info:', debugInfo);

  // Display all entity info
  debugInfo.entities.forEach(entity => {
    console.log(`Entity ${entity.name}(${entity.id}): ${entity.componentCount} components`);
    console.log('Component types:', entity.componentTypes);
  });

  // Display all system info
  debugInfo.processors.forEach(processor => {
    console.log(`System ${processor.name}: processing ${processor.entityCount} entities`);
  });
}
```

## Performance Monitoring

```typescript
class PerformanceScene extends Scene {
  public showPerformance(): void {
    // Get performance data
    const perfData = this.performanceMonitor?.getPerformanceData();
    if (perfData) {
      console.log('FPS:', perfData.fps);
      console.log('Frame time:', perfData.frameTime);
      console.log('Entity update time:', perfData.entityUpdateTime);
      console.log('System update time:', perfData.systemUpdateTime);
    }

    // Get performance report
    const report = this.performanceMonitor?.generateReport();
    if (report) {
      console.log('Performance report:', report);
    }
  }
}
```

## API Reference

### getStats()

Returns scene statistics:

```typescript
interface SceneStats {
  entityCount: number;
  processorCount: number;
  componentStorageStats: ComponentStorageStats;
}
```

### getDebugInfo()

Returns detailed debug information:

```typescript
interface DebugInfo {
  entities: EntityDebugInfo[];
  processors: ProcessorDebugInfo[];
}

interface EntityDebugInfo {
  id: number;
  name: string;
  componentCount: number;
  componentTypes: string[];
}

interface ProcessorDebugInfo {
  name: string;
  entityCount: number;
}
```

### performanceMonitor

Performance monitor interface:

```typescript
interface PerformanceMonitor {
  getPerformanceData(): PerformanceData;
  generateReport(): string;
}

interface PerformanceData {
  fps: number;
  frameTime: number;
  entityUpdateTime: number;
  systemUpdateTime: number;
}
```

## Debugging Tips

1. **Debug mode** - Enable with `Core.create({ debug: true })`
2. **Performance analysis** - Call `getStats()` periodically
3. **Memory monitoring** - Check `componentStorageStats` for issues
4. **System performance** - Use `performanceMonitor` to identify slow systems
