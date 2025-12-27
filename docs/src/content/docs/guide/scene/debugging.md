---
title: "调试与监控"
description: "场景统计、性能监控和调试信息"
---

Scene 内置了完整的调试和性能监控功能。

## 获取场景统计

```typescript
class StatsScene extends Scene {
  public showStats(): void {
    const stats = this.getStats();
    console.log(`实体数量: ${stats.entityCount}`);
    console.log(`系统数量: ${stats.processorCount}`);
    console.log('组件存储统计:', stats.componentStorageStats);
  }
}
```

## 调试信息

```typescript
public showDebugInfo(): void {
  const debugInfo = this.getDebugInfo();
  console.log('场景调试信息:', debugInfo);

  // 显示所有实体信息
  debugInfo.entities.forEach(entity => {
    console.log(`实体 ${entity.name}(${entity.id}): ${entity.componentCount} 个组件`);
    console.log('组件类型:', entity.componentTypes);
  });

  // 显示所有系统信息
  debugInfo.processors.forEach(processor => {
    console.log(`系统 ${processor.name}: 处理 ${processor.entityCount} 个实体`);
  });
}
```

## 性能监控

```typescript
class PerformanceScene extends Scene {
  public showPerformance(): void {
    // 获取性能数据
    const perfData = this.performanceMonitor?.getPerformanceData();
    if (perfData) {
      console.log('FPS:', perfData.fps);
      console.log('帧时间:', perfData.frameTime);
      console.log('实体更新时间:', perfData.entityUpdateTime);
      console.log('系统更新时间:', perfData.systemUpdateTime);
    }

    // 获取性能报告
    const report = this.performanceMonitor?.generateReport();
    if (report) {
      console.log('性能报告:', report);
    }
  }
}
```

## API 参考

### getStats()

返回场景统计信息：

```typescript
interface SceneStats {
  entityCount: number;
  processorCount: number;
  componentStorageStats: ComponentStorageStats;
}
```

### getDebugInfo()

返回详细调试信息：

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

性能监控器接口：

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

## 调试技巧

1. **开发模式** - 在 `Core.create({ debug: true })` 启用调试模式
2. **性能分析** - 定期调用 `getStats()` 监控实体和系统数量
3. **内存监控** - 检查 `componentStorageStats` 发现内存问题
4. **系统性能** - 使用 `performanceMonitor` 识别慢系统
