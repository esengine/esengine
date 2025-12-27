---
title: "配置选项"
description: "Worker 系统配置和处理模式"
---

## 配置接口

```typescript
interface IWorkerSystemConfig {
  /** 是否启用 Worker 并行处理 */
  enableWorker?: boolean;

  /** Worker 数量，默认为 CPU 核心数 */
  workerCount?: number;

  /** 每个 Worker 处理的实体数量 */
  entitiesPerWorker?: number;

  /** 系统配置数据，传递给 Worker */
  systemConfig?: unknown;

  /** 是否使用 SharedArrayBuffer 优化 */
  useSharedArrayBuffer?: boolean;

  /** 每个实体占用的 Float32 数量 */
  entityDataSize?: number;

  /** 最大实体数量（预分配 SharedArrayBuffer） */
  maxEntities?: number;

  /** 预编译 Worker 脚本路径（微信小游戏必需） */
  workerScriptPath?: string;
}
```

## 配置示例

```typescript
constructor() {
  super(matcher, {
    enableWorker: true,
    workerCount: 8,              // 请求 8 个 Worker
    entitiesPerWorker: 200,      // 每个 Worker 处理 200 个实体
    useSharedArrayBuffer: true,
    entityDataSize: 8,
    maxEntities: 10000,
    systemConfig: {
      gravity: 9.8,
      friction: 0.95
    }
  });
}
```

## 处理模式

### 传统 Worker 模式

数据通过序列化在主线程和 Worker 间传递：

```typescript
constructor() {
  super(matcher, {
    enableWorker: true,
    useSharedArrayBuffer: false,
    workerCount: 2
  });
}

protected workerProcess(entities: EntityData[], dt: number): EntityData[] {
  return entities.map(entity => {
    // 复杂算法逻辑
    return this.complexAILogic(entity, dt);
  });
}
```

**适用场景**：复杂计算逻辑，实体数量适中

### SharedArrayBuffer 模式

零拷贝数据共享，适合大量简单计算：

```typescript
constructor() {
  super(matcher, {
    enableWorker: true,
    useSharedArrayBuffer: true,
    entityDataSize: 6,
    maxEntities: 10000
  });
}

protected getSharedArrayBufferProcessFunction(): SharedArrayBufferProcessFunction {
  return function(sharedFloatArray, startIndex, endIndex, dt, config) {
    const entitySize = 6;
    for (let i = startIndex; i < endIndex; i++) {
      const offset = i * entitySize;
      let vy = sharedFloatArray[offset + 3];
      vy += config.gravity * dt;
      sharedFloatArray[offset + 3] = vy;
    }
  };
}
```

**适用场景**：大量实体的简单计算

## 获取系统信息

```typescript
const info = this.getWorkerInfo();
console.log({
  enabled: info.enabled,
  workerCount: info.workerCount,
  maxSystemWorkerCount: info.maxSystemWorkerCount,
  currentMode: info.currentMode,
  sharedArrayBufferEnabled: info.sharedArrayBufferEnabled
});
```

## 动态更新配置

```typescript
// 运行时更新配置
this.updateConfig({
  workerCount: 4,
  entitiesPerWorker: 100
});
```
