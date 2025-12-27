---
title: "最佳实践"
description: "Worker 系统性能优化建议"
---

## Worker 函数要求

```typescript
// ✅ 推荐：纯函数，只使用参数和标准 API
protected workerProcess(entities: PhysicsData[], dt: number, config: any): PhysicsData[] {
  return entities.map(entity => {
    entity.y += entity.velocity * dt;
    return entity;
  });
}

// ❌ 避免：使用 this 或外部变量
protected workerProcess(entities: PhysicsData[], dt: number): PhysicsData[] {
  return entities.map(entity => {
    entity.y += this.someProperty; // ❌ Worker 中无法访问 this
    return entity;
  });
}
```

## 数据设计

```typescript
// ✅ 推荐：简单扁平的数据结构
interface SimplePhysicsData {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// ❌ 避免：复杂嵌套对象
interface ComplexData {
  transform: {
    position: { x: number; y: number };
    rotation: { angle: number };
  };
  // 嵌套结构增加序列化开销
}
```

## Worker 数量控制

```typescript
constructor() {
  super(matcher, {
    workerCount: 8,                    // 系统自动限制在 CPU 核心数内
    entitiesPerWorker: 100,            // 精确控制负载分布
    enableWorker: this.shouldUseWorker(),
  });
}

private shouldUseWorker(): boolean {
  return this.expectedEntityCount > 100;
}

// 获取实际配置
checkConfig() {
  const info = this.getWorkerInfo();
  console.log(`实际 Worker 数量: ${info.workerCount}/${info.maxSystemWorkerCount}`);
}
```

## 性能优化建议

### 1. 计算密集度评估

只对计算密集型任务使用 Worker，避免简单计算的线程开销。

### 2. 数据传输优化

- 使用 SharedArrayBuffer 减少序列化开销
- 保持数据结构简单扁平
- 避免频繁大数据传输

### 3. 降级策略

始终提供主线程回退方案：

```typescript
protected processSynchronously(entities: readonly Entity[]): void {
  // 当 Worker 不可用时执行
}
```

### 4. 内存管理

及时清理 Worker 池和共享缓冲区，避免内存泄漏。

### 5. 负载均衡

使用 `entitiesPerWorker` 精确控制，避免部分 Worker 空闲。

## 何时使用 Worker

| 场景 | 建议 |
|------|------|
| 实体数量 < 100 | 不推荐使用 Worker |
| 100 < 实体 < 1000 | 传统 Worker 模式 |
| 实体 > 1000 | SharedArrayBuffer 模式 |
| 复杂 AI 逻辑 | 传统 Worker 模式 |
| 简单物理计算 | SharedArrayBuffer 模式 |

## 调试技巧

```typescript
// 获取完整系统信息
const info = this.getWorkerInfo();
console.log({
  enabled: info.enabled,
  workerCount: info.workerCount,
  currentMode: info.currentMode,
  isProcessing: info.isProcessing
});
```
